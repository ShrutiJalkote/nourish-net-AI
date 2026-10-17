"""
NourishNet AI — Enterprise Database Layer
Single Source of Truth: Unified SQLite with WAL (Write-Ahead Logging) Mode.
Zero in-memory volatility. ACID-compliant durability across restarts.
"""

import sqlite3
import threading
import json
import os
from datetime import datetime, timezone
from typing import Optional

# ── Thread-safe re-entrant lock ───────────────────────────────────────────
_lock = threading.RLock()

_db_path: str = "./data/nourishnet.db"
_conn: Optional[sqlite3.Connection] = None


def init_db(db_path: Optional[str] = None) -> None:
    """
    Initialize SQLite database, enable WAL mode, and ensure all tables exist.
    """
    global _db_path, _conn

    if db_path is None:
        try:
            from backend.config import DATABASE_PATH
            db_path = DATABASE_PATH
        except Exception:
            db_path = "./data/nourishnet.db"

    _db_path = db_path

    if db_path != ":memory:":
        os.makedirs(os.path.dirname(os.path.abspath(db_path)) or ".", exist_ok=True)

    with _lock:
        _conn = sqlite3.connect(_db_path, check_same_thread=False)
        _conn.row_factory = sqlite3.Row

        # Mainframe-grade WAL mode for high-throughput concurrent read/write
        if _db_path != ":memory:":
            _conn.execute("PRAGMA journal_mode=WAL;")
            _conn.execute("PRAGMA synchronous=NORMAL;")

        # 1. Donations Table
        _conn.execute("""
            CREATE TABLE IF NOT EXISTS donations (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                donor_name TEXT NOT NULL,
                food_category TEXT NOT NULL,
                quantity_kg REAL NOT NULL,
                prep_time TEXT NOT NULL,
                ambient_temp_celsius REAL NOT NULL,
                humidity_percent REAL DEFAULT 50.0,
                packaging_type TEXT DEFAULT 'sealed',
                latitude REAL NOT NULL,
                longitude REAL NOT NULL,
                notes TEXT,
                created_at TEXT NOT NULL,
                spoilage_deadline TEXT NOT NULL,
                status TEXT DEFAULT 'active'
            )
        """)

        # 2. NGOs Table
        _conn.execute("""
            CREATE TABLE IF NOT EXISTS ngos (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                org_type TEXT NOT NULL,
                capacity_kg REAL NOT NULL,
                current_load_kg REAL DEFAULT 0.0,
                latitude REAL NOT NULL,
                longitude REAL NOT NULL,
                dietary_prefs TEXT NOT NULL,
                beneficiary_count INTEGER DEFAULT 100,
                has_refrigeration INTEGER DEFAULT 0,
                contact_phone TEXT,
                contact_email TEXT,
                created_at TEXT NOT NULL
            )
        """)

        # 3. Matches Table
        _conn.execute("""
            CREATE TABLE IF NOT EXISTS matches (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                donation_id INTEGER NOT NULL,
                ngo_id INTEGER NOT NULL,
                donor_name TEXT,
                ngo_name TEXT,
                food_category TEXT,
                quantity_kg REAL,
                composite_score REAL NOT NULL,
                urgency_score REAL NOT NULL,
                capacity_fit_score REAL NOT NULL,
                need_score REAL NOT NULL,
                proximity_score REAL NOT NULL,
                dietary_match_score REAL NOT NULL,
                distance_km REAL NOT NULL,
                eta_minutes REAL NOT NULL,
                matched_at TEXT NOT NULL,
                status TEXT DEFAULT 'matched',
                tier INTEGER DEFAULT 1,
                tier_name TEXT DEFAULT 'Human Relief',
                shap_explanation TEXT
            )
        """)

        # 4. Audit Trail Table (Immutable Hash Chain)
        _conn.execute("""
            CREATE TABLE IF NOT EXISTS audit_trail (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                match_id INTEGER NOT NULL,
                donation_summary TEXT,
                ngo_summary TEXT,
                pickup_temp REAL,
                delivery_temp REAL,
                chain_hash TEXT NOT NULL,
                previous_hash TEXT NOT NULL,
                timestamp TEXT NOT NULL,
                transaction_data TEXT NOT NULL,
                is_valid INTEGER DEFAULT 1
            )
        """)

        _conn.commit()


# ═══════════════════════════════════════════════════════════════════════════
#  DONATIONS (SQLite Persisted)
# ═══════════════════════════════════════════════════════════════════════════

def _row_to_donation(row: sqlite3.Row) -> dict:
    return {
        "id": row["id"],
        "donor_name": row["donor_name"],
        "food_category": row["food_category"],
        "quantity_kg": row["quantity_kg"],
        "prep_time": row["prep_time"],
        "ambient_temp_celsius": row["ambient_temp_celsius"],
        "humidity_percent": row["humidity_percent"],
        "packaging_type": row["packaging_type"],
        "latitude": row["latitude"],
        "longitude": row["longitude"],
        "notes": row["notes"],
        "created_at": row["created_at"],
        "spoilage_deadline": row["spoilage_deadline"],
        "status": row["status"],
    }


def add_donation(data: dict) -> dict:
    """Add a donation record to persistent SQLite storage."""
    created_at = datetime.now(timezone.utc).isoformat()
    status = data.get("status", "active")
    with _lock:
        cursor = _conn.execute(
            """INSERT INTO donations (
                donor_name, food_category, quantity_kg, prep_time,
                ambient_temp_celsius, humidity_percent, packaging_type,
                latitude, longitude, notes, created_at, spoilage_deadline, status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            (
                data["donor_name"],
                data["food_category"],
                float(data["quantity_kg"]),
                data["prep_time"],
                float(data["ambient_temp_celsius"]),
                float(data.get("humidity_percent", 50.0)),
                data.get("packaging_type", "sealed"),
                float(data["latitude"]),
                float(data["longitude"]),
                data.get("notes"),
                created_at,
                data.get("spoilage_deadline", created_at),
                status,
            ),
        )
        _conn.commit()
        record_id = cursor.lastrowid

    return get_donation(record_id)


def get_donation(donation_id: int) -> Optional[dict]:
    with _lock:
        row = _conn.execute("SELECT * FROM donations WHERE id = ?", (donation_id,)).fetchone()
    return _row_to_donation(row) if row else None


def list_donations(status: Optional[str] = None) -> list[dict]:
    with _lock:
        if status:
            rows = _conn.execute("SELECT * FROM donations WHERE status = ? ORDER BY id ASC", (status,)).fetchall()
        else:
            rows = _conn.execute("SELECT * FROM donations ORDER BY id ASC").fetchall()
    return [_row_to_donation(r) for r in rows]


def update_donation(donation_id: int, updates: dict) -> Optional[dict]:
    if not updates:
        return get_donation(donation_id)
    fields = []
    values = []
    for k, v in updates.items():
        fields.append(f"{k} = ?")
        values.append(v)
    values.append(donation_id)
    query = f"UPDATE donations SET {', '.join(fields)} WHERE id = ?"
    with _lock:
        _conn.execute(query, tuple(values))
        _conn.commit()
    return get_donation(donation_id)


# ═══════════════════════════════════════════════════════════════════════════
#  NGOs (SQLite Persisted)
# ═══════════════════════════════════════════════════════════════════════════

def _row_to_ngo(row: sqlite3.Row) -> dict:
    diet = row["dietary_prefs"]
    try:
        diet_list = json.loads(diet) if isinstance(diet, str) and diet.startswith("[") else [d.strip() for d in diet.split(",")]
    except Exception:
        diet_list = ["vegetarian"]

    return {
        "id": row["id"],
        "name": row["name"],
        "org_type": row["org_type"],
        "capacity_kg": row["capacity_kg"],
        "current_load_kg": row["current_load_kg"],
        "latitude": row["latitude"],
        "longitude": row["longitude"],
        "dietary_prefs": diet_list,
        "beneficiary_count": row["beneficiary_count"],
        "has_refrigeration": bool(row["has_refrigeration"]),
        "contact_phone": row["contact_phone"],
        "contact_email": row["contact_email"],
        "created_at": row["created_at"],
    }


def add_ngo(data: dict) -> dict:
    created_at = datetime.now(timezone.utc).isoformat()
    prefs = data.get("dietary_prefs", ["vegetarian"])
    prefs_str = json.dumps(prefs) if isinstance(prefs, list) else str(prefs)

    with _lock:
        cursor = _conn.execute(
            """INSERT INTO ngos (
                name, org_type, capacity_kg, current_load_kg, latitude, longitude,
                dietary_prefs, beneficiary_count, has_refrigeration, contact_phone, contact_email, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            (
                data["name"],
                data.get("org_type", "kitchen"),
                float(data["capacity_kg"]),
                float(data.get("current_load_kg", 0.0)),
                float(data["latitude"]),
                float(data["longitude"]),
                prefs_str,
                int(data.get("beneficiary_count", 100)),
                1 if data.get("has_refrigeration") else 0,
                data.get("contact_phone"),
                data.get("contact_email"),
                created_at,
            ),
        )
        _conn.commit()
        record_id = cursor.lastrowid

    return get_ngo(record_id)


def get_ngo(ngo_id: int) -> Optional[dict]:
    with _lock:
        row = _conn.execute("SELECT * FROM ngos WHERE id = ?", (ngo_id,)).fetchone()
    return _row_to_ngo(row) if row else None


def list_ngos() -> list[dict]:
    with _lock:
        rows = _conn.execute("SELECT * FROM ngos ORDER BY id ASC").fetchall()
    return [_row_to_ngo(r) for r in rows]


def update_ngo(ngo_id: int, updates: dict) -> Optional[dict]:
    if not updates:
        return get_ngo(ngo_id)
    fields = []
    values = []
    for k, v in updates.items():
        if k == "dietary_prefs" and isinstance(v, list):
            v = json.dumps(v)
        fields.append(f"{k} = ?")
        values.append(v)
    values.append(ngo_id)
    query = f"UPDATE ngos SET {', '.join(fields)} WHERE id = ?"
    with _lock:
        _conn.execute(query, tuple(values))
        _conn.commit()
    return get_ngo(ngo_id)


# ═══════════════════════════════════════════════════════════════════════════
#  MATCHES (SQLite Persisted with Tier Fallback Support)
# ═══════════════════════════════════════════════════════════════════════════

def _row_to_match(row: sqlite3.Row) -> dict:
    shap = row["shap_explanation"]
    shap_dict = None
    if shap:
        try:
            shap_dict = json.loads(shap)
        except Exception:
            shap_dict = None

    return {
        "id": row["id"],
        "donation_id": row["donation_id"],
        "ngo_id": row["ngo_id"],
        "donor_name": row["donor_name"],
        "ngo_name": row["ngo_name"],
        "food_category": row["food_category"],
        "quantity_kg": row["quantity_kg"],
        "composite_score": row["composite_score"],
        "urgency_score": row["urgency_score"],
        "capacity_fit_score": row["capacity_fit_score"],
        "need_score": row["need_score"],
        "proximity_score": row["proximity_score"],
        "dietary_match_score": row["dietary_match_score"],
        "distance_km": row["distance_km"],
        "eta_minutes": row["eta_minutes"],
        "matched_at": row["matched_at"],
        "status": row["status"],
        "tier": row["tier"],
        "tier_name": row["tier_name"],
        "shap_explanation": shap_dict,
    }


def add_match(data: dict) -> dict:
    matched_at = data.get("matched_at", datetime.now(timezone.utc).isoformat())
    shap_str = json.dumps(data.get("shap_explanation")) if data.get("shap_explanation") else None

    with _lock:
        cursor = _conn.execute(
            """INSERT INTO matches (
                donation_id, ngo_id, donor_name, ngo_name, food_category, quantity_kg,
                composite_score, urgency_score, capacity_fit_score, need_score,
                proximity_score, dietary_match_score, distance_km, eta_minutes,
                matched_at, status, tier, tier_name, shap_explanation
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            (
                data["donation_id"],
                data["ngo_id"],
                data.get("donor_name", "Unknown"),
                data.get("ngo_name", "Unknown"),
                data.get("food_category", ""),
                float(data.get("quantity_kg", 0.0)),
                float(data.get("composite_score", 0.0)),
                float(data.get("urgency_score", 0.0)),
                float(data.get("capacity_fit_score", 0.0)),
                float(data.get("need_score", 0.0)),
                float(data.get("proximity_score", 0.0)),
                float(data.get("dietary_match_score", 0.0)),
                float(data.get("distance_km", 0.0)),
                float(data.get("eta_minutes", 0.0)),
                matched_at,
                data.get("status", "matched"),
                int(data.get("tier", 1)),
                data.get("tier_name", "Human Relief"),
                shap_str,
            ),
        )
        _conn.commit()
        record_id = cursor.lastrowid

    return get_match(record_id)


def get_match(match_id: int) -> Optional[dict]:
    with _lock:
        row = _conn.execute("SELECT * FROM matches WHERE id = ?", (match_id,)).fetchone()
    return _row_to_match(row) if row else None


def list_matches(status: Optional[str] = None) -> list[dict]:
    with _lock:
        if status:
            rows = _conn.execute("SELECT * FROM matches WHERE status = ? ORDER BY id ASC", (status,)).fetchall()
        else:
            rows = _conn.execute("SELECT * FROM matches ORDER BY id ASC").fetchall()
    return [_row_to_match(r) for r in rows]


def update_match(match_id: int, updates: dict) -> Optional[dict]:
    if not updates:
        return get_match(match_id)
    fields = []
    values = []
    for k, v in updates.items():
        if k == "shap_explanation" and isinstance(v, dict):
            v = json.dumps(v)
        fields.append(f"{k} = ?")
        values.append(v)
    values.append(match_id)
    query = f"UPDATE matches SET {', '.join(fields)} WHERE id = ?"
    with _lock:
        _conn.execute(query, tuple(values))
        _conn.commit()
    return get_match(match_id)


# ═══════════════════════════════════════════════════════════════════════════
#  AUDIT TRAIL (SQLite SHA-256 Ledger)
# ═══════════════════════════════════════════════════════════════════════════

def insert_audit_record(record: dict) -> dict:
    """Insert an audit record into the SQLite chain."""
    with _lock:
        cursor = _conn.execute(
            """INSERT INTO audit_trail
               (match_id, donation_summary, ngo_summary, pickup_temp,
                delivery_temp, chain_hash, previous_hash, timestamp,
                transaction_data, is_valid)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            (
                record["match_id"],
                record.get("donation_summary", ""),
                record.get("ngo_summary", ""),
                float(record.get("pickup_temp", 0.0)),
                float(record.get("delivery_temp", 0.0)),
                record["chain_hash"],
                record["previous_hash"],
                record["timestamp"],
                json.dumps(record.get("transaction_data", {})),
                1,
            ),
        )
        _conn.commit()
        record["id"] = cursor.lastrowid
        return record


def get_audit_chain() -> list[dict]:
    """Retrieve the full audit chain ordered by id."""
    with _lock:
        rows = _conn.execute(
            "SELECT * FROM audit_trail ORDER BY id ASC"
        ).fetchall()
    results = []
    for r in rows:
        results.append({
            "id": r["id"],
            "match_id": r["match_id"],
            "donation_summary": r["donation_summary"],
            "ngo_summary": r["ngo_summary"],
            "pickup_temp": r["pickup_temp"],
            "delivery_temp": r["delivery_temp"],
            "chain_hash": r["chain_hash"],
            "previous_hash": r["previous_hash"],
            "timestamp": r["timestamp"],
            "transaction_data": json.loads(r["transaction_data"]),
            "is_valid": bool(r["is_valid"]),
        })
    return results


def get_audit_by_id(audit_id: int) -> Optional[dict]:
    with _lock:
        row = _conn.execute(
            "SELECT * FROM audit_trail WHERE id = ?", (audit_id,)
        ).fetchone()
    if not row:
        return None
    return {
        "id": row["id"],
        "match_id": row["match_id"],
        "donation_summary": row["donation_summary"],
        "ngo_summary": row["ngo_summary"],
        "pickup_temp": row["pickup_temp"],
        "delivery_temp": row["delivery_temp"],
        "chain_hash": row["chain_hash"],
        "previous_hash": row["previous_hash"],
        "timestamp": row["timestamp"],
        "transaction_data": json.loads(row["transaction_data"]),
        "is_valid": bool(row["is_valid"]),
    }


def get_last_audit_hash() -> str:
    """Get the hash of the last audit record, or 'GENESIS' if chain is empty."""
    with _lock:
        row = _conn.execute(
            "SELECT chain_hash FROM audit_trail ORDER BY id DESC LIMIT 1"
        ).fetchone()
    return row["chain_hash"] if row else "GENESIS"


# ═══════════════════════════════════════════════════════════════════════════
#  IMPACT METRICS (Dynamically Aggregated from SQLite)
# ═══════════════════════════════════════════════════════════════════════════

def get_impact_metrics() -> dict:
    """Aggregate live ESG impact metrics from completed matches."""
    from backend.config import ESG_FACTORS

    with _lock:
        matches = list_matches()
        donations = list_donations()
        ngos = list_ngos()

    don_map = {d["id"]: d for d in donations}

    completed = [m for m in matches if m.get("status") in ("matched", "delivered")]
    total_kg = 0.0
    for m in completed:
        don = don_map.get(m.get("donation_id"))
        if don:
            total_kg += don.get("quantity_kg", 0.0)

    delivered_count = len([m for m in matches if m.get("status") == "delivered"])
    tier1_count = len([m for m in completed if m.get("tier", 1) == 1])
    tier2_count = len([m for m in completed if m.get("tier", 1) == 2])

    return {
        "total_kg_rescued": round(total_kg, 2),
        "total_meals_served": round(total_kg * ESG_FACTORS["meals_per_kg"], 0),
        "total_co2_avoided_kg": round(total_kg * ESG_FACTORS["co2_per_kg"], 2),
        "total_water_saved_liters": round(total_kg * ESG_FACTORS["water_per_kg"], 0),
        "total_donations": len(donations),
        "total_matches": len(completed),
        "total_ngos": len(ngos),
        "active_donations": len([d for d in donations if d.get("status") == "active"]),
        "completed_rescues": delivered_count,
        "tier1_human_rescues": tier1_count,
        "tier2_bio_upcycled": tier2_count,
    }


def reset_all() -> None:
    """Reset all tables (for clean demo resets)."""
    with _lock:
        if _conn:
            _conn.execute("DELETE FROM donations")
            _conn.execute("DELETE FROM ngos")
            _conn.execute("DELETE FROM matches")
            _conn.execute("DELETE FROM audit_trail")
            _conn.commit()
