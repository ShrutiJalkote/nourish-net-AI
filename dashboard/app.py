"""
NourishNet AI — Main Streamlit Dashboard Entry Point
Multi-page app with IBM Carbon Design-inspired dark theme.
"""

import streamlit as st
import os
import sys
import requests

# Add parent directory for imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

st.set_page_config(
    page_title="NourishNet AI — Food Rescue Intelligence",
    page_icon="🍽️",
    layout="wide",
    initial_sidebar_state="expanded",
)

# Load custom CSS
css_path = os.path.join(os.path.dirname(__file__), "assets", "custom.css")
if os.path.exists(css_path):
    with open(css_path) as f:
        st.markdown(f"<style>{f.read()}</style>", unsafe_allow_html=True)

BACKEND_URL = os.environ.get("BACKEND_URL", "http://localhost:8000")

# ── Sidebar ───────────────────────────────────────────────────────────────
st.sidebar.markdown("# 🍽️ NourishNet AI")
st.sidebar.markdown("*Real-Time Food Rescue Intelligence*")
st.sidebar.markdown("---")
st.sidebar.markdown("### 🏆 IBM Z Datathon 2026")
st.sidebar.markdown("**Track 1:** Real-Time AI for Critical Decisions")
st.sidebar.markdown("---")

# Backend status
try:
    health = requests.get(f"{BACKEND_URL}/api/health", timeout=3).json()
    st.sidebar.success(f"✅ Backend: `{health.get('platform', '?')}`")
except Exception:
    st.sidebar.error("❌ Backend offline")

st.sidebar.caption("Powered by IBM LinuxONE (s390x)")

# ── Main Content ──────────────────────────────────────────────────────────
st.markdown("# 🍽️ Welcome to NourishNet AI")
st.markdown("### Real-Time Food Rescue & Intelligent Redistribution Platform")
st.markdown("> *Detect Spoilage. Decide Matches. Respond Before Food Expires.*")
st.markdown("---")

# ── Live Impact Stats ────────────────────────────────────────────────────
try:
    impact = requests.get(f"{BACKEND_URL}/api/impact", timeout=3).json()
except Exception:
    impact = {}

col1, col2, col3, col4 = st.columns(4)
with col1:
    st.metric("🥘 Food Rescued", f"{impact.get('total_kg_rescued', 0):.1f} kg")
with col2:
    st.metric("🍽️ Meals Served", f"{impact.get('total_meals_served', 0):.0f}")
with col3:
    st.metric("🌿 CO₂ Avoided", f"{impact.get('total_co2_avoided_kg', 0):.1f} kg")
with col4:
    st.metric("💧 Water Saved", f"{impact.get('total_water_saved_liters', 0):.0f} L")

st.markdown("---")

# ── How It Works ──────────────────────────────────────────────────────────
st.markdown("## 🔄 How It Works")
c1, c2, c3, c4 = st.columns(4)
with c1:
    st.markdown("### 1️⃣ Detect")
    st.markdown("Donors post surplus food. Our **Spoilage Engine** instantly predicts the safe window using modified Arrhenius kinetics.")
with c2:
    st.markdown("### 2️⃣ Decide")
    st.markdown("**AI Matcher** uses the Hungarian Algorithm to find the optimal NGO based on urgency, proximity, capacity, and need.")
with c3:
    st.markdown("### 3️⃣ Deliver")
    st.markdown("Real-time route optimization ensures food reaches communities **before it expires**, with live tracking.")
with c4:
    st.markdown("### 4️⃣ Document")
    st.markdown("Every rescue is sealed with a **SHA-256 cryptographic certificate**, creating an immutable audit trail.")

st.markdown("---")

# ── Four AI Engines ───────────────────────────────────────────────────────
st.markdown("## 🧠 Four AI Engines Powering NourishNet")
c1, c2 = st.columns(2)
with c1:
    st.info("**🧪 Engine A: Spoilage Decay Predictor**\n\nModified Arrhenius model predicts dynamic food safety windows based on temperature, humidity, and packaging.")
    st.info("**🤖 Engine B: Bipartite Matcher**\n\nHungarian Algorithm optimizes donation-to-NGO matching across 5 factors: urgency, capacity, need, proximity, dietary fit.")
with c2:
    st.info("**🔍 Engine C: SHAP Explainer**\n\nEvery AI decision is transparent. SHAP waterfall charts show exactly WHY each match was made.")
    st.info("**🔐 Engine D: Crypto Audit Trail**\n\nSHA-256 chain-of-custody creates legally defensible, tamper-proof records for liability protection.")

st.markdown("---")

# ── Platform Info ─────────────────────────────────────────────────────────
st.markdown("### 🖥️ Running on IBM LinuxONE")
st.markdown("This platform is deployed on **IBM LinuxONE** (s390x architecture) — the world's most secure, available, and sustainable enterprise server.")

try:
    health = requests.get(f"{BACKEND_URL}/api/health", timeout=3).json()
    st.success(f"✅ Backend connected | Platform: `{health.get('platform', 'unknown')}` | Python: `{health.get('python_version', 'unknown')}` | Uptime: {health.get('uptime_seconds', 0):.0f}s")
except Exception:
    st.warning("⚠️ Backend not connected. Start the FastAPI server: `python run_backend.py`")

st.markdown("---")
st.caption("© 2026 NourishNet AI | IBM Z Datathon 2026 | Track 1: Real-Time AI for Critical Decisions")
