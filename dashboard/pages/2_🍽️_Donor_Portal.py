"""Page 2: Donor Portal — Post Surplus Food"""

import streamlit as st
import requests
import os
from datetime import datetime, timedelta, timezone

st.set_page_config(page_title="NourishNet AI — Donor Portal", page_icon="🍽️", layout="wide")

BACKEND_URL = os.environ.get("BACKEND_URL", "http://localhost:8000")

# City coordinates for easy location selection
CITIES = {
    "Mumbai": (19.0760, 72.8777),
    "Delhi": (28.6139, 77.2090),
    "Bangalore": (12.9716, 77.5946),
    "Hyderabad": (17.3850, 78.4867),
    "Chennai": (13.0827, 80.2707),
    "Kolkata": (22.5726, 88.3639),
    "Pune": (18.5204, 73.8567),
    "Ahmedabad": (23.0225, 72.5714),
    "Jaipur": (26.9124, 75.7873),
    "Lucknow": (26.8467, 80.9462),
}

FOOD_CATEGORIES = {
    "Cooked Hot Meals": "cooked_hot_meals",
    "Fresh Dairy": "fresh_dairy",
    "Leafy Greens / Salads": "leafy_greens",
    "Bakery / Bread": "bakery_bread",
    "Canned / Packaged": "canned_packaged",
    "Fruits": "fruits",
    "Frozen Items": "frozen_items",
}

PACKAGING_TYPES = {
    "Open": "open",
    "Sealed": "sealed",
    "Vacuum Packed": "vacuum",
    "Frozen": "frozen",
}

st.markdown("# 🍽️ Donor Portal — Post Surplus Food")
st.markdown("*Register surplus food for intelligent rescue matching*")
st.markdown("---")

# ── Donation Form ─────────────────────────────────────────────────────────
col_form, col_preview = st.columns([3, 2])

with col_form:
    st.markdown("### 📝 New Donation")

    with st.form("donation_form"):
        donor_name = st.text_input("👤 Donor Name", placeholder="e.g., Taj Hotel Mumbai")

        fc1, fc2 = st.columns(2)
        with fc1:
            food_display = st.selectbox("🍲 Food Category", list(FOOD_CATEGORIES.keys()))
        with fc2:
            quantity = st.number_input("⚖️ Quantity (kg)", min_value=0.5, max_value=1000.0, value=20.0, step=0.5)

        fc3, fc4 = st.columns(2)
        with fc3:
            hours_ago = st.slider("🕐 Prepared (hours ago)", min_value=0.0, max_value=12.0, value=1.0, step=0.5)
        with fc4:
            packaging_display = st.selectbox("📦 Packaging", list(PACKAGING_TYPES.keys()))

        fc5, fc6 = st.columns(2)
        with fc5:
            temp = st.slider("🌡️ Current Temperature (°C)", min_value=-20, max_value=50, value=25)
        with fc6:
            humidity = st.slider("💧 Humidity (%)", min_value=20, max_value=100, value=55)

        city = st.selectbox("📍 City", list(CITIES.keys()))
        notes = st.text_area("📝 Notes (optional)", placeholder="Any special handling instructions...")

        submitted = st.form_submit_button("🚀 Submit Donation", use_container_width=True)

# ── Live Preview ──────────────────────────────────────────────────────────
with col_preview:
    st.markdown("### ⏱️ Live Spoilage Preview")

    food_cat = FOOD_CATEGORIES[food_display]
    pkg = PACKAGING_TYPES[packaging_display]

    # Quick local estimate (same formula as backend)
    import math
    FOOD_PARAMS = {
        "cooked_hot_meals": {"t0": 4.0, "k": 0.18, "tb": 60},
        "fresh_dairy": {"t0": 6.0, "k": 0.22, "tb": 4},
        "leafy_greens": {"t0": 3.0, "k": 0.25, "tb": 4},
        "bakery_bread": {"t0": 24.0, "k": 0.08, "tb": 22},
        "canned_packaged": {"t0": 720.0, "k": 0.01, "tb": 22},
        "fruits": {"t0": 12.0, "k": 0.12, "tb": 8},
        "frozen_items": {"t0": 168.0, "k": 0.03, "tb": -18},
    }
    PKG_BETA = {"open": 0.7, "sealed": 1.0, "vacuum": 1.5, "frozen": 3.0}

    fp = FOOD_PARAMS.get(food_cat, {"t0": 4, "k": 0.18, "tb": 25})
    alpha = max(0.1, 1.0 - 0.003 * max(0, humidity - 40))
    beta = PKG_BETA.get(pkg, 1.0)
    t_safe_hrs = fp["t0"] * math.exp(-fp["k"] * (temp - fp["tb"]) / 10.0) * alpha * beta
    t_safe_min = max(1, t_safe_hrs * 60)
    remaining_min = t_safe_min - (hours_ago * 60)

    if remaining_min <= 0:
        urgency = "EXPIRED"
        color = "#888"
    elif remaining_min < 60:
        urgency = "CRITICAL"
        color = "#FF4444"
    elif remaining_min < 180:
        urgency = "URGENT"
        color = "#FFB020"
    elif remaining_min < 480:
        urgency = "NORMAL"
        color = "#44BB44"
    else:
        urgency = "STABLE"
        color = "#4488FF"

    st.markdown(f"""
    <div style="background: #161b22; border: 2px solid {color}; border-radius: 12px; padding: 20px; text-align: center;">
        <h2 style="color: {color}; margin: 0;">{urgency}</h2>
        <h1 style="color: white; margin: 10px 0;">{max(0, remaining_min):.0f} min</h1>
        <p style="color: #888;">remaining safe window</p>
        <hr style="border-color: #333;">
        <p style="color: #aaa;">Total safe time: <strong>{t_safe_min:.0f} min</strong> ({t_safe_hrs:.1f} hrs)</p>
        <p style="color: #aaa;">Freshness: <strong>{max(0, 100 * (1 - hours_ago * 60 / t_safe_min)):.1f}%</strong></p>
    </div>
    """, unsafe_allow_html=True)

    if remaining_min < 60 and remaining_min > 0:
        st.error("⚡ CRITICAL: This food needs to be rescued immediately!")
    elif remaining_min <= 0:
        st.error("❌ This food has likely expired and may not be safe for donation.")

# ── Submit Handler ────────────────────────────────────────────────────────
if submitted:
    if not donor_name.strip():
        st.error("Please enter a donor name.")
    else:
        lat, lng = CITIES[city]
        now_utc = datetime.now(timezone.utc)
        prep_time = (now_utc - timedelta(hours=hours_ago)).isoformat()

        payload = {
            "donor_name": donor_name,
            "food_category": food_cat,
            "quantity_kg": quantity,
            "prep_time": prep_time,
            "ambient_temp_celsius": temp,
            "humidity_percent": humidity,
            "packaging_type": pkg,
            "latitude": lat,
            "longitude": lng,
            "notes": notes or None,
        }

        try:
            resp = requests.post(f"{BACKEND_URL}/api/donations", json=payload, timeout=10)
            if resp.status_code == 200:
                data = resp.json()
                st.success(f"✅ Donation #{data['id']} registered! Urgency: **{data['urgency_level']}** | Freshness: **{data['freshness_pct']}%**")
                st.balloons()
            else:
                st.error(f"Error: {resp.text}")
        except requests.exceptions.ConnectionError:
            st.error("❌ Cannot connect to backend. Start it with: `python run_backend.py`")
        except Exception as e:
            st.error(f"Error: {e}")

st.markdown("---")

# ── Active Donations Table ────────────────────────────────────────────────
st.markdown("### 📋 Active Donations")
try:
    resp = requests.get(f"{BACKEND_URL}/api/donations", timeout=5)
    if resp.status_code == 200:
        donations = resp.json()
        if donations:
            for d in donations:
                urg = d.get("urgency_level", "UNKNOWN")
                badge_class = f"badge-{urg.lower()}"
                remaining = d.get("remaining_minutes", 0)
                freshness = d.get("freshness_pct", 0)
                status = d.get("status", "active")

                emoji = {"CRITICAL": "🔴", "URGENT": "🟡", "NORMAL": "🟢", "STABLE": "🔵"}.get(urg, "⚪")

                with st.expander(f"{emoji} #{d['id']} — {d.get('quantity_kg', 0)}kg {d.get('food_category', '')} from {d.get('donor_name', 'Unknown')} [{status.upper()}]"):
                    c1, c2, c3, c4 = st.columns(4)
                    with c1:
                        st.metric("Urgency", urg)
                    with c2:
                        st.metric("Remaining", f"{max(0, remaining):.0f} min")
                    with c3:
                        st.metric("Freshness", f"{freshness:.1f}%")
                    with c4:
                        st.metric("Quantity", f"{d.get('quantity_kg', 0)} kg")
        else:
            st.info("No donations yet. Use the form above to post surplus food.")
except requests.exceptions.ConnectionError:
    st.warning("⚠️ Backend not connected.")
except Exception as e:
    st.warning(f"Could not load donations: {e}")
