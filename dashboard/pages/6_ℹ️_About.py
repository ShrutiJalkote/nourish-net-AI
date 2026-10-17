"""Page 6: About & Architecture"""

import streamlit as st
import requests
import os

st.set_page_config(page_title="NourishNet AI — About", page_icon="ℹ️", layout="wide")

BACKEND_URL = os.environ.get("BACKEND_URL", "http://localhost:8000")

st.markdown("# ℹ️ About NourishNet AI")
st.markdown("---")

# ── Architecture ──────────────────────────────────────────────────────────
st.markdown("## 🏗️ System Architecture")

st.markdown("""
```
                    ┌──────────────────────────────────────────────────┐
                    │              NourishNet AI Platform              │
                    │         IBM LinuxONE (s390x) Deployment          │
                    ├──────────────────────────────────────────────────┤
                    │                                                  │
    ┌──────────┐    │  ┌────────────────────────────────────────────┐  │    ┌──────────┐
    │  Donors  │───▶│  │           FastAPI Backend (:8000)          │  │◀───│   NGOs   │
    │Restaurant│    │  │                                            │  │    │ Shelters │
    │  Hotel   │    │  │  ┌──────────┐ ┌──────────┐ ┌──────────┐  │  │    │ Kitchens │
    │  Market  │    │  │  │Engine A  │ │Engine B  │ │Engine C  │  │  │    │Food Banks│
    └──────────┘    │  │  │Spoilage  │ │Matcher   │ │SHAP XAI  │  │  │    └──────────┘
                    │  │  │Arrhenius │ │Hungarian │ │TreeSHAP  │  │  │
                    │  │  └──────────┘ └──────────┘ └──────────┘  │  │
                    │  │                                            │  │
                    │  │  ┌──────────┐ ┌──────────┐ ┌──────────┐  │  │
                    │  │  │Engine D  │ │SQLite DB │ │ Impact   │  │  │
                    │  │  │Crypto    │ │Audit     │ │ ESG      │  │  │
                    │  │  │SHA-256   │ │Trail     │ │ Analytics│  │  │
                    │  │  └──────────┘ └──────────┘ └──────────┘  │  │
                    │  └────────────────────────────────────────────┘  │
                    │                                                  │
                    │  ┌────────────────────────────────────────────┐  │
                    │  │        Streamlit Dashboard (:8501)         │  │
                    │  │  Home │ Donor │ AI Dispatch │ Audit │ ESG  │  │
                    │  │       │Portal │   Center    │ Trail │ Dash │  │
                    │  └────────────────────────────────────────────┘  │
                    └──────────────────────────────────────────────────┘
```
""")

st.markdown("---")

# ── Why IBM LinuxONE ──────────────────────────────────────────────────────
st.markdown("## 🖥️ Why IBM LinuxONE?")

c1, c2, c3 = st.columns(3)

with c1:
    st.markdown("""
    ### 🔒 Security
    - **Pervasive encryption** — all data encrypted at rest and in transit
    - **Tamper-proof hardware** — EAL5+ certified cryptographic modules
    - **Secure boot** — verified firmware and OS integrity
    - Perfect for **food safety compliance** and **liability protection**
    """)

with c2:
    st.markdown("""
    ### ⚡ Availability
    - **99.999% uptime** — 5.26 minutes downtime/year
    - **Vertical scaling** — up to 190 cores, 40TB memory
    - **Real-time processing** — critical for perishable food decisions
    - **Mission-critical** — food rescue can't afford downtime
    """)

with c3:
    st.markdown("""
    ### 🌱 Sustainability
    - **Most energy-efficient** enterprise server per workload
    - **75% less energy** than comparable x86 deployments
    - **Reduced carbon footprint** aligns with ESG goals
    - **Walking the talk** — sustainable platform for sustainable mission
    """)

st.markdown("---")

# ── Tech Stack ────────────────────────────────────────────────────────────
st.markdown("## 🛠️ Technology Stack")

st.markdown("""
| Layer | Technology | Purpose |
|:---|:---|:---|
| **Backend** | FastAPI + Uvicorn | Async REST API server |
| **Frontend** | Streamlit | Interactive multi-page dashboard |
| **AI/ML** | Scikit-Learn + SciPy | GBM classifier, Hungarian optimizer |
| **XAI** | SHAP (TreeExplainer) | Decision explainability |
| **Maps** | Folium + Leaflet.js | Interactive geospatial visualization |
| **Charts** | Plotly Express | Interactive data visualizations |
| **Database** | SQLite + In-Memory | Zero-config data storage |
| **Crypto** | hashlib (SHA-256) | Chain-of-custody audit trail |
| **Geospatial** | Geopy + Haversine | Distance & ETA calculations |
| **Deployment** | IBM LinuxONE (s390x) | Enterprise-grade infrastructure |
""")

st.markdown("---")

# ── Platform Info ─────────────────────────────────────────────────────────
st.markdown("## 📡 Live Platform Info")

try:
    health = requests.get(f"{BACKEND_URL}/api/health", timeout=3).json()
    c1, c2, c3, c4 = st.columns(4)
    with c1:
        st.metric("Platform", health.get("platform", "unknown"))
    with c2:
        st.metric("Python", health.get("python_version", "unknown"))
    with c3:
        st.metric("Uptime", f"{health.get('uptime_seconds', 0):.0f}s")
    with c4:
        st.metric("Status", health.get("status", "unknown"))
except Exception:
    st.warning("Backend not connected.")

st.markdown("---")

# ── Team ──────────────────────────────────────────────────────────────────
st.markdown("## 👥 Team")
st.markdown("""
| Role | Member |
|:---|:---|
| 🎯 Project Lead & AI Engineer | Team Member 1 |
| ⚙️ Backend Developer | Team Member 2 |
| 🎨 Frontend & Visualization | Team Member 3 |
| 📊 Data & Deployment | Team Member 4 |
""")

st.markdown("---")

# ── Links ─────────────────────────────────────────────────────────────────
st.markdown("## 🔗 Links")
st.markdown("""
- 📂 **GitHub Repository**: [github.com/team/NourishNet-AI](https://github.com)
- 🎥 **Demo Video**: [YouTube Link](https://youtube.com)
- 📑 **Pitch Deck**: Available in /docs/
- 🏆 **Hackathon**: [IBM Z Datathon 2026](https://hack2skill.com/event/datathon-2026)
""")

st.markdown("---")
st.caption("© 2026 NourishNet AI | IBM Z Datathon 2026 | Track 1: Real-Time AI for Critical Decisions")
