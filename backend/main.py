"""
NourishNet AI — FastAPI Backend Application
============================================
Central API server wiring together all 4 AI engines.
IBM Z Datathon 2026 | Track 1: Real-Time AI for Critical Decisions
"""

import json
import logging
import os
import platform
import time
from datetime import datetime, timedelta, timezone
from typing import Optional

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.staticfiles import StaticFiles

from backend import database as db
from backend.config import (
    APP_DESCRIPTION,
    APP_NAME,
    APP_VERSION,
    FOOD_PARAMS,
)
from backend.models import (
    crypto_audit,
    explainer_engine,
    matcher_engine,
    spoilage_engine,
)
from backend.schemas.audit import (
    AuditCertificate,
    AuditGenerateRequest,
    ChainIntegrityResponse,
)
from backend.schemas.donation import DonationCreate, DonationResponse
from backend.schemas.match import MatchRequest, MatchResult
from backend.schemas.ngo import NGOCreate, NGOResponse

# ── Logging ───────────────────────────────────────────────────────────────
logging.basicConfig(level=logging.INFO, format="%(asctime)s | %(levelname)s | %(message)s")
logger = logging.getLogger("nourishnet")

# ── App ───────────────────────────────────────────────────────────────────
app = FastAPI(
    title=APP_NAME,
    description=APP_DESCRIPTION,
    version=APP_VERSION,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

_start_time = time.time()

# ── Startup ───────────────────────────────────────────────────────────────

@app.on_event("startup")
async def startup():
    logger.info("Initializing NourishNet AI backend …")
    db.init_db()
    _load_seed_data()
    # Pre-train SHAP explainer model with synthetic data
    model, explainer = explainer_engine.train_explainer_model()
    app.state.xai_model = model
    app.state.xai_explainer = explainer
    logger.info("SHAP explainer model trained ✓")
    logger.info(f"Platform: {platform.machine()} | Python: {platform.python_version()}")
    logger.info("NourishNet AI backend ready ✓")


def _data_path(filename: str) -> str:
    return os.path.join(os.path.dirname(__file__), "data", filename)


def _load_seed_data():
    """Load NGOs and sample donations from seed JSON files if tables are empty."""
    # Load NGOs if empty
    existing_ngos = db.list_ngos()
    if not existing_ngos:
        try:
            with open(_data_path("seed_ngos.json"), encoding="utf-8") as f:
                ngos = json.load(f)
            for ngo in ngos:
                db.add_ngo(ngo)
            logger.info(f"Loaded {len(ngos)} seed NGOs ✓")
        except FileNotFoundError:
            logger.warning("seed_ngos.json not found — skipping")
    else:
        logger.info(f"Using {len(existing_ngos)} existing persisted NGOs ✓")

    # Create sample donations if empty
    existing_donations = db.list_donations()
    if not existing_donations:
        try:
            with open(_data_path("seed_donors.json"), encoding="utf-8") as f:
                donors = json.load(f)

            sample_donations = [
                {"idx": 0, "food": "cooked_hot_meals", "qty": 25, "temp": 35, "hours_ago": 1.5},
                {"idx": 1, "food": "fresh_dairy", "qty": 40, "temp": 12, "hours_ago": 2.0},
                {"idx": 2, "food": "leafy_greens", "qty": 15, "temp": 28, "hours_ago": 0.5},
                {"idx": 3, "food": "bakery_bread", "qty": 50, "temp": 25, "hours_ago": 3.0},
                {"idx": 4, "food": "fruits", "qty": 30, "temp": 22, "hours_ago": 1.0},
            ]

            now = datetime.now(timezone.utc)
            for s in sample_donations:
                if s["idx"] >= len(donors):
                    break
                donor = donors[s["idx"]]
                prep = (now - timedelta(hours=s["hours_ago"])).isoformat()
                data = {
                    "donor_name": donor["donor_name"],
                    "food_category": s["food"],
                    "quantity_kg": s["qty"],
                    "prep_time": prep,
                    "ambient_temp_celsius": s["temp"],
                    "humidity_percent": 55.0,
                    "packaging_type": "sealed",
                    "latitude": donor["latitude"],
                    "longitude": donor["longitude"],
                    "notes": f"Auto-generated sample from {donor['donor_type']}",
                }
                # Compute spoilage
                deadline = spoilage_engine.get_spoilage_deadline(
                    s["food"],
                    datetime.fromisoformat(prep),
                    s["temp"],
                    55.0,
                    "sealed",
                )
                data["spoilage_deadline"] = deadline.isoformat()
                db.add_donation(data)

            logger.info(f"Created {len(sample_donations)} sample donations ✓")
        except FileNotFoundError:
            logger.warning("seed_donors.json not found — skipping")
    else:
        logger.info(f"Using {len(existing_donations)} existing persisted donations ✓")


# ═══════════════════════════════════════════════════════════════════════════
#  HEALTH
# ═══════════════════════════════════════════════════════════════════════════

@app.get("/api/health")
async def health():
    return {
        "status": "healthy",
        "app_name": APP_NAME,
        "version": APP_VERSION,
        "platform": platform.machine(),
        "python_version": platform.python_version(),
        "uptime_seconds": round(time.time() - _start_time, 1),
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }


# ═══════════════════════════════════════════════════════════════════════════
#  DONATIONS
# ═══════════════════════════════════════════════════════════════════════════

def _enrich_donation(d: dict) -> dict:
    """Recompute live spoilage fields for a donation."""
    now = datetime.now(timezone.utc)
    try:
        prep = datetime.fromisoformat(d["prep_time"])
        if prep.tzinfo is None:
            prep = prep.replace(tzinfo=timezone.utc)
    except (ValueError, KeyError):
        prep = now - timedelta(hours=1)

    cat = d.get("food_category", "cooked_hot_meals")
    temp = d.get("ambient_temp_celsius", 25)
    hum = d.get("humidity_percent", 50)
    pkg = d.get("packaging_type", "sealed")

    elapsed = (now - prep).total_seconds() / 60.0
    remaining = spoilage_engine.get_remaining_minutes(cat, prep, temp, hum, pkg, now)
    freshness = spoilage_engine.get_freshness_percentage(cat, elapsed, temp, hum, pkg)
    urgency = spoilage_engine.get_urgency_level(remaining)

    deadline = spoilage_engine.get_spoilage_deadline(cat, prep, temp, hum, pkg)

    return {
        **d,
        "spoilage_deadline": deadline.isoformat(),
        "urgency_level": urgency,
        "freshness_pct": freshness,
        "remaining_minutes": round(remaining, 1),
    }


@app.post("/api/donations", response_model=DonationResponse)
async def create_donation(body: DonationCreate):
    data = body.model_dump()
    data["food_category"] = body.food_category.value
    data["packaging_type"] = body.packaging_type.value

    # Compute spoilage deadline
    try:
        prep = datetime.fromisoformat(data["prep_time"])
        if prep.tzinfo is None:
            prep = prep.replace(tzinfo=timezone.utc)
    except ValueError:
        raise HTTPException(400, "Invalid prep_time format — use ISO-8601")

    deadline = spoilage_engine.get_spoilage_deadline(
        data["food_category"], prep, data["ambient_temp_celsius"],
        data["humidity_percent"], data["packaging_type"],
    )
    data["spoilage_deadline"] = deadline.isoformat()

    record = db.add_donation(data)
    enriched = _enrich_donation(record)
    logger.info(f"Donation #{enriched['id']} created: {data['quantity_kg']}kg {data['food_category']} — urgency={enriched['urgency_level']}")
    return enriched


@app.get("/api/donations")
async def list_donations(status: Optional[str] = None):
    donations = db.list_donations(status)
    return [_enrich_donation(d) for d in donations]


@app.get("/api/donations/{donation_id}", response_model=DonationResponse)
async def get_donation(donation_id: int):
    d = db.get_donation(donation_id)
    if not d:
        raise HTTPException(404, f"Donation #{donation_id} not found")
    return _enrich_donation(d)


# ═══════════════════════════════════════════════════════════════════════════
#  NGOs
# ═══════════════════════════════════════════════════════════════════════════

def _enrich_ngo(n: dict) -> dict:
    cap = n.get("capacity_kg", 100)
    load = n.get("current_load_kg", 0)
    return {**n, "available_capacity_kg": round(cap - load, 2)}


@app.post("/api/ngos", response_model=NGOResponse)
async def create_ngo(body: NGOCreate):
    data = body.model_dump()
    data["org_type"] = body.org_type.value
    record = db.add_ngo(data)
    logger.info(f"NGO #{record['id']} registered: {data['name']}")
    return _enrich_ngo(record)


@app.get("/api/ngos")
async def list_ngos():
    return [_enrich_ngo(n) for n in db.list_ngos()]


@app.get("/api/ngos/{ngo_id}", response_model=NGOResponse)
async def get_ngo(ngo_id: int):
    n = db.get_ngo(ngo_id)
    if not n:
        raise HTTPException(404, f"NGO #{ngo_id} not found")
    return _enrich_ngo(n)


# ═══════════════════════════════════════════════════════════════════════════
#  AI MATCHING
# ═══════════════════════════════════════════════════════════════════════════

@app.post("/api/match")
async def execute_match(body: MatchRequest):
    t0 = time.time()
    ngos = db.list_ngos()
    if not ngos:
        raise HTTPException(400, "No NGOs registered. Load seed data first.")

    # Get donations to match
    if body.donation_id:
        donation = db.get_donation(body.donation_id)
        if not donation:
            raise HTTPException(404, f"Donation #{body.donation_id} not found")
        if donation.get("status") != "active":
            raise HTTPException(400, f"Donation #{body.donation_id} is already {donation.get('status')}")
        donations = [_enrich_donation(donation)]
    else:
        donations = [_enrich_donation(d) for d in db.list_donations("active")]

    if not donations:
        return {"matches": [], "elapsed_ms": 0, "message": "No active donations to match."}

    # Run matching engine
    match_results = matcher_engine.solve_optimal_matching(donations, ngos)

    # Enrich with SHAP explanations and store
    stored_matches = []
    for mr in match_results:
        don = db.get_donation(mr["donation_id"])
        ngo_rec = db.get_ngo(mr["ngo_id"])

        # Build feature vector for SHAP
        features = [
            mr.get("urgency_score", 0),
            mr.get("capacity_fit_score", 0),
            mr.get("need_score", 0),
            mr.get("proximity_score", 0),
            mr.get("dietary_match_score", 0),
            don.get("freshness_pct", 50) if don else 50,
            mr.get("eta_minutes", 30),
        ]

        try:
            explanation = explainer_engine.explain_match(
                app.state.xai_model, app.state.xai_explainer, features,
            )
            mr["shap_explanation"] = explanation
        except Exception as e:
            logger.warning(f"SHAP explanation failed: {e}")
            mr["shap_explanation"] = None

        record = db.add_match(mr)
        # Update donation status
        db.update_donation(mr["donation_id"], {"status": "matched"})
        stored_matches.append(record)

    elapsed = round((time.time() - t0) * 1000, 1)
    logger.info(f"Matched {len(stored_matches)} donations in {elapsed}ms")

    return {
        "matches": stored_matches,
        "elapsed_ms": elapsed,
        "platform": platform.machine(),
        "message": f"✅ {len(stored_matches)} match(es) completed in {elapsed}ms on {platform.machine()}",
    }


@app.get("/api/match/{match_id}/explain")
async def explain_match(match_id: int):
    match = db.get_match(match_id)
    if not match:
        raise HTTPException(404, f"Match #{match_id} not found")

    explanation = match.get("shap_explanation")
    if not explanation:
        return {"error": "No SHAP explanation available for this match."}

    # Generate waterfall plot
    try:
        plot_b64 = explainer_engine.generate_shap_waterfall_plot(
            explanation["shap_values"],
            explanation["feature_names"],
            explanation["base_value"],
            explanation.get("prediction"),
        )
    except Exception as e:
        logger.warning(f"Plot generation failed: {e}")
        plot_b64 = None

    return {
        **explanation,
        "match_id": match_id,
        "waterfall_plot_base64": plot_b64,
    }


# ═══════════════════════════════════════════════════════════════════════════
#  AUDIT TRAIL
# ═══════════════════════════════════════════════════════════════════════════

@app.post("/api/audit/generate")
async def generate_audit(body: AuditGenerateRequest):
    match = db.get_match(body.match_id)
    if not match:
        raise HTTPException(404, f"Match #{body.match_id} not found")

    donation = db.get_donation(match.get("donation_id"))
    ngo = db.get_ngo(match.get("ngo_id"))
    if not donation or not ngo:
        raise HTTPException(404, "Donation or NGO not found for this match")

    previous_hash = db.get_last_audit_hash()
    receipt = crypto_audit.create_rescue_receipt(
        donation, ngo, match,
        body.pickup_temp_celsius, body.delivery_temp_celsius,
        previous_hash,
    )

    stored = db.insert_audit_record(receipt)

    # 4-Stage Lifecycle State Machine Transition:
    # Once pickup and delivery temperatures are verified and cryptographic certificate is sealed,
    # transition both match and donation to 'delivered' and update recipient NGO's current load.
    db.update_match(body.match_id, {"status": "delivered"})
    db.update_donation(match.get("donation_id"), {"status": "delivered"})
    new_load = ngo.get("current_load_kg", 0.0) + donation.get("quantity_kg", 0.0)
    db.update_ngo(match.get("ngo_id"), {"current_load_kg": round(new_load, 2)})

    logger.info(f"Audit #{stored['id']} generated for match #{body.match_id} — transitioned to DELIVERED. Hash: {stored['chain_hash'][:16]}…")
    return stored


@app.get("/api/audit/chain")
async def get_audit_chain():
    chain = db.get_audit_chain()
    verification = crypto_audit.verify_chain_integrity(chain)
    return {**verification, "chain": chain}


@app.get("/api/audit/{audit_id}/certificate", response_class=HTMLResponse)
async def get_certificate(audit_id: int):
    record = db.get_audit_by_id(audit_id)
    if not record:
        raise HTTPException(404, f"Audit #{audit_id} not found")
    html = crypto_audit.generate_certificate_html(record)
    return HTMLResponse(content=html)


# ═══════════════════════════════════════════════════════════════════════════
#  IMPACT METRICS
# ═══════════════════════════════════════════════════════════════════════════

@app.get("/api/impact")
async def get_impact():
    return db.get_impact_metrics()


# ═══════════════════════════════════════════════════════════════════════════
#  SEED DATA RELOAD
# ═══════════════════════════════════════════════════════════════════════════

@app.get("/api/seed")
async def reload_seed():
    db.reset_all()
    _load_seed_data()
    return {"message": "Seed data reloaded", "donations": len(db.list_donations()), "ngos": len(db.list_ngos())}


@app.get("/api/matches")
async def list_matches():
    return db.list_matches()


# ═══════════════════════════════════════════════════════════════════════════
#  FAIRNESS REPORT
# ═══════════════════════════════════════════════════════════════════════════

@app.get("/api/fairness")
async def fairness_report():
    matches = db.list_matches()
    ngos = db.list_ngos()
    return explainer_engine.check_distribution_fairness(matches, ngos)


# ═══════════════════════════════════════════════════════════════════════════
#  SERVE COMPILED REACT FRONTEND (SINGLE-PROCESS LINUXONE ARCHITECTURE)
# ═══════════════════════════════════════════════════════════════════════════
frontend_dist = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "frontend", "dist")
if os.path.exists(frontend_dist):
    app.mount("/", StaticFiles(directory=frontend_dist, html=True), name="frontend")

