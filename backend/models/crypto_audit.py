"""
Engine D: Cryptographic Chain-of-Custody Audit Trail
=====================================================
Creates a blockchain-like linked list of rescue receipts where each
receipt's SHA-256 hash includes the previous receipt's hash, making
tampering detectable.

Provides:
  - Deterministic JSON canonicalization
  - SHA-256 hash chaining
  - Chain integrity verification
  - Styled HTML certificate generation
  - Temperature-chain liability compliance checks
"""

import hashlib
import json
from datetime import datetime, timezone
from typing import Optional


def canonicalize_transaction(data: dict) -> str:
    """Produce a deterministic JSON string (sorted keys, no whitespace)."""
    return json.dumps(data, sort_keys=True, separators=(",", ":"), default=str)


def compute_hash(data_string: str) -> str:
    """SHA-256 hex digest of a string."""
    return hashlib.sha256(data_string.encode("utf-8")).hexdigest()


def compute_chain_hash(current_data: dict, previous_hash: str) -> str:
    """Hash of (canonicalized current data + previous hash) → chain link."""
    canonical = canonicalize_transaction(current_data)
    combined = canonical + "|" + previous_hash
    return compute_hash(combined)


def create_rescue_receipt(
    donation: dict,
    ngo: dict,
    match: dict,
    pickup_temp: float,
    delivery_temp: float,
    previous_hash: str = "GENESIS",
) -> dict:
    """
    Create a full rescue receipt with cryptographic hash.

    Returns a dict containing all transaction details and the chain hash.
    """
    timestamp = datetime.now(timezone.utc).isoformat()

    transaction_data = {
        "type": "FOOD_RESCUE",
        "donation": {
            "id": donation.get("id"),
            "donor": donation.get("donor_name", "Unknown"),
            "food_category": donation.get("food_category", ""),
            "quantity_kg": donation.get("quantity_kg", 0),
            "prep_time": donation.get("prep_time", ""),
            "location": {
                "lat": donation.get("latitude", 0),
                "lng": donation.get("longitude", 0),
            },
        },
        "recipient": {
            "id": ngo.get("id"),
            "name": ngo.get("name", "Unknown"),
            "org_type": ngo.get("org_type", ""),
            "beneficiary_count": ngo.get("beneficiary_count", 0),
            "location": {
                "lat": ngo.get("latitude", 0),
                "lng": ngo.get("longitude", 0),
            },
        },
        "match": {
            "id": match.get("id"),
            "composite_score": match.get("composite_score", 0),
            "distance_km": match.get("distance_km", 0),
            "eta_minutes": match.get("eta_minutes", 0),
        },
        "temperature_chain": {
            "pickup_celsius": pickup_temp,
            "delivery_celsius": delivery_temp,
            "chain_maintained": abs(pickup_temp - delivery_temp) < 10,
        },
        "timestamp": timestamp,
    }

    chain_hash = compute_chain_hash(transaction_data, previous_hash)

    return {
        "match_id": match.get("id"),
        "donation_summary": f"{donation.get('quantity_kg', 0)}kg {donation.get('food_category', '')} from {donation.get('donor_name', 'Unknown')}",
        "ngo_summary": f"{ngo.get('name', 'Unknown')} ({ngo.get('org_type', '')})",
        "pickup_temp": pickup_temp,
        "delivery_temp": delivery_temp,
        "chain_hash": chain_hash,
        "previous_hash": previous_hash,
        "timestamp": timestamp,
        "transaction_data": transaction_data,
        "is_valid": True,
    }


def verify_single_receipt(receipt: dict) -> bool:
    """Recompute hash and verify it matches the stored hash."""
    expected = compute_chain_hash(receipt["transaction_data"], receipt["previous_hash"])
    return expected == receipt["chain_hash"]


def verify_chain_integrity(chain: list[dict]) -> dict:
    """
    Verify the full audit chain.

    Returns dict with is_valid, total_records, broken_at_index, message.
    """
    if not chain:
        return {
            "total_records": 0,
            "valid": True,
            "broken_at_index": None,
            "message": "Empty chain — no records to verify.",
        }

    for i, record in enumerate(chain):
        # Verify hash
        if not verify_single_receipt(record):
            return {
                "total_records": len(chain),
                "valid": False,
                "broken_at_index": i,
                "message": f"Chain integrity BROKEN at record index {i} (ID: {record.get('id', '?')}). Hash mismatch detected.",
            }

        # Verify chain linkage (except first record)
        if i > 0:
            if record.get("previous_hash") != chain[i - 1].get("chain_hash"):
                return {
                    "total_records": len(chain),
                    "valid": False,
                    "broken_at_index": i,
                    "message": f"Chain linkage BROKEN at record index {i}. Previous hash does not match.",
                }

    return {
        "total_records": len(chain),
        "valid": True,
        "broken_at_index": None,
        "message": f"✅ Chain integrity verified. All {len(chain)} records are valid and properly linked.",
    }


def get_liability_shield_status(receipt: dict) -> dict:
    """
    Check if temperature chain was maintained for liability protection.

    Returns compliance status for Safe Haven defence.
    """
    tx = receipt.get("transaction_data", {})
    temp_chain = tx.get("temperature_chain", {})
    maintained = temp_chain.get("chain_maintained", False)
    pickup = temp_chain.get("pickup_celsius", 0)
    delivery = temp_chain.get("delivery_celsius", 0)
    delta = abs(pickup - delivery)

    if maintained:
        status = "COMPLIANT"
        badge = "✅ Safe Haven Compliance — Liability Shield Active"
        detail = f"Temperature chain maintained (Δ={delta:.1f}°C < 10°C). Donor is protected under Good Samaritan provisions."
    else:
        status = "WARNING"
        badge = "⚠️ Temperature Chain Broken — Review Required"
        detail = f"Temperature variation detected (Δ={delta:.1f}°C ≥ 10°C). Manual review recommended."

    return {
        "status": status,
        "badge": badge,
        "detail": detail,
        "pickup_temp": pickup,
        "delivery_temp": delivery,
        "delta_celsius": round(delta, 1),
    }


def generate_certificate_html(receipt: dict) -> str:
    """
    Generate a styled HTML certificate for a rescue receipt.
    """
    tx = receipt.get("transaction_data", {})
    donation_info = tx.get("donation", {})
    recipient_info = tx.get("recipient", {})
    match_info = tx.get("match", {})
    temp_info = tx.get("temperature_chain", {})
    liability = get_liability_shield_status(receipt)

    hash_display = receipt.get("chain_hash", "N/A")

    return f"""
    <div style="
        font-family: 'IBM Plex Sans', 'Segoe UI', sans-serif;
        background: linear-gradient(135deg, #0d1b2a 0%, #1b2838 100%);
        color: #e0e0e0;
        border: 2px solid #0f62fe;
        border-radius: 12px;
        padding: 30px;
        max-width: 700px;
        margin: 20px auto;
        box-shadow: 0 8px 32px rgba(15, 98, 254, 0.15);
    ">
        <div style="text-align: center; margin-bottom: 20px;">
            <h1 style="color: #0f62fe; margin: 0; font-size: 24px;">🍽️ NourishNet AI</h1>
            <h2 style="color: #78a9ff; margin: 5px 0; font-size: 16px;">FOOD RESCUE CERTIFICATE</h2>
            <p style="color: #888; font-size: 12px;">Chain-of-Custody Audit Record</p>
        </div>

        <hr style="border: 1px solid #333;">

        <table style="width: 100%; border-collapse: collapse; margin: 15px 0;">
            <tr>
                <td style="padding: 8px; color: #888; width: 35%;">Transaction ID</td>
                <td style="padding: 8px; font-weight: bold;">RESCUE-{match_info.get('id', 'N/A')}</td>
            </tr>
            <tr>
                <td style="padding: 8px; color: #888;">Timestamp</td>
                <td style="padding: 8px;">{receipt.get('timestamp', 'N/A')}</td>
            </tr>
            <tr>
                <td style="padding: 8px; color: #888;">Donor</td>
                <td style="padding: 8px;">{donation_info.get('donor', 'N/A')}</td>
            </tr>
            <tr>
                <td style="padding: 8px; color: #888;">Food Item</td>
                <td style="padding: 8px;">{donation_info.get('quantity_kg', 0)} kg — {donation_info.get('food_category', 'N/A')}</td>
            </tr>
            <tr>
                <td style="padding: 8px; color: #888;">Recipient NGO</td>
                <td style="padding: 8px;">{recipient_info.get('name', 'N/A')}</td>
            </tr>
            <tr>
                <td style="padding: 8px; color: #888;">Match Score</td>
                <td style="padding: 8px;">{match_info.get('composite_score', 0):.2%}</td>
            </tr>
            <tr>
                <td style="padding: 8px; color: #888;">Distance / ETA</td>
                <td style="padding: 8px;">{match_info.get('distance_km', 0):.1f} km / {match_info.get('eta_minutes', 0):.0f} min</td>
            </tr>
        </table>

        <hr style="border: 1px solid #333;">

        <h3 style="color: #78a9ff; font-size: 14px;">🌡️ Temperature Chain</h3>
        <table style="width: 100%; border-collapse: collapse;">
            <tr>
                <td style="padding: 6px; color: #888;">Pickup Temp</td>
                <td style="padding: 6px;">{temp_info.get('pickup_celsius', 'N/A')}°C</td>
                <td style="padding: 6px; color: #888;">Delivery Temp</td>
                <td style="padding: 6px;">{temp_info.get('delivery_celsius', 'N/A')}°C</td>
            </tr>
        </table>

        <div style="
            margin: 15px 0;
            padding: 12px;
            border-radius: 8px;
            background: {'#0a3622' if liability['status'] == 'COMPLIANT' else '#3a2200'};
            border: 1px solid {'#198754' if liability['status'] == 'COMPLIANT' else '#ff8c00'};
            text-align: center;
        ">
            <strong>{liability['badge']}</strong>
            <p style="font-size: 12px; margin: 5px 0 0; color: #aaa;">{liability['detail']}</p>
        </div>

        <hr style="border: 1px solid #333;">

        <h3 style="color: #78a9ff; font-size: 14px;">🔐 SHA-256 Hash</h3>
        <div style="
            background: #0a0a1a;
            border: 1px solid #333;
            border-radius: 6px;
            padding: 10px;
            font-family: 'Courier New', monospace;
            font-size: 11px;
            word-break: break-all;
            color: #00ff88;
        ">{hash_display}</div>

        <p style="text-align: center; font-size: 11px; color: #666; margin-top: 20px;">
            Generated by NourishNet AI • IBM Z Datathon 2026 • Powered by IBM LinuxONE
        </p>
    </div>
    """
