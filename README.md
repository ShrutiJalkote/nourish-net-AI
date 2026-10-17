# 🍽️ NourishNet AI — Real-Time Food Rescue Intelligence Platform

> **Detect Spoilage. Decide Matches. Respond Before Food Expires.**

[![IBM Z Datathon 2026](https://img.shields.io/badge/IBM%20Z-Datathon%202026-blue)](https://hack2skill.com/event/datathon-2026)
[![Track 1](https://img.shields.io/badge/Track-Real--Time%20AI%20for%20Critical%20Decisions-green)]()
[![Python 3.11+](https://img.shields.io/badge/Python-3.11+-yellow)]()
[![Platform](https://img.shields.io/badge/Platform-IBM%20LinuxONE%20(s390x)-red)]()

---

## 🎯 Problem

**1.3 billion tons** of food is wasted globally every year while **828 million people** go hungry. The core challenge: surplus food from restaurants, hotels, and supermarkets has a **narrow perishable window** — often just 2–4 hours for cooked meals. Traditional food banks can't respond fast enough, and donors fear legal liability without verifiable chain-of-custody.

## 💡 Solution

**NourishNet AI** is an AI-powered food rescue platform that connects surplus food donors with nearby NGOs in real-time, ensuring food reaches communities before it expires.

### Four AI Engines:

| Engine | Technology | What It Does |
|:---|:---|:---|
| 🧪 **Spoilage Predictor** | Modified Arrhenius Kinetics | Predicts dynamic food safety windows based on temperature, humidity, packaging |
| 🤖 **Intelligent Matcher** | Hungarian Algorithm (SciPy) | Optimally matches donations to NGOs across 5 weighted factors |
| 🔍 **SHAP Explainer** | TreeSHAP + GBM | Makes every AI decision transparent with waterfall explanations |
| 🔐 **Crypto Audit** | SHA-256 Chain | Creates tamper-proof chain-of-custody certificates for liability protection |

---

## 🏗️ Architecture

```
┌──────────┐     ┌────────────────────────────────────────────────────────┐
│  Donors  │────▶│               Unified Server (:8000)                   │
│  & NGOs  │     │  ┌─────────────────────────┐  ┌─────────────────────┐  │
└──────────┘     │  │   React 18 SPA (Vite)   │  │   FastAPI ASGI Core │  │
                 │  │   Tailwind + Leaflet    │  │   4 Native AI Tier  │  │
                 │  │   (Served at /)         │  │   (Served at /api)  │  │
                 │  └─────────────────────────┘  └─────────────────────┘  │
                 │            │                             │             │
                 │            └──────────────┬──────────────┘             │
                 │                           ▼                            │
                 │                  SQLite WAL Durability                 │
                 └────────────────────────────────────────────────────────┘
                      Deployed on IBM LinuxONE (s390x Mainframe)
```

---

## 🚀 Quick Start

### Prerequisites
- Python 3.9+
- pip
- Node.js 18+ (only needed if recompiling the React frontend; pre-compiled assets are included in `frontend/dist`)

### Local Launch (1-Command Unified Server)

```bash
# Clone the repository
git clone https://github.com/<team>/NourishNet-AI.git
cd NourishNet-AI

# Install dependencies
pip install -r requirements.txt

# Start the unified server (serves React frontend & AI REST backend together on port 8000)
python run_backend.py
# Or on Windows, double click:
# start_local.bat
```

Open your browser at: **`http://localhost:8000`**

### Deploy on IBM LinuxONE (s390x)

```bash
# One-command deployment
chmod +x deploy_linuxone.sh
./deploy_linuxone.sh
```

---

## 🖥️ Dashboard Pages

| Page | Description |
|:---|:---|
| 🏠 **Home** | Project overview, live impact stats, architecture |
| 🍽️ **Donor Portal** | Post surplus food with live spoilage preview |
| 🤖 **AI Dispatch Center** | Real-time matching, interactive map, SHAP charts |
| 🔐 **Audit Trail** | Cryptographic certificates, chain verification |
| 📊 **Impact Dashboard** | ESG metrics, charts, environmental equivalences |
| ℹ️ **About** | Architecture, IBM Z justification, tech stack |

---

## 🧠 AI & ML Features

### Spoilage Prediction (Modified Arrhenius Model)
$$t_{safe} = t_0 \cdot e^{-k_{decay} \cdot \frac{T_{ambient} - T_{base}}{10}} \cdot \alpha_{humidity} \cdot \beta_{packaging}$$

### Multi-Factor Matching Score
$$S_{i,j} = 0.30 \cdot Urgency + 0.20 \cdot Capacity + 0.20 \cdot Need + 0.20 \cdot Proximity + 0.10 \cdot Dietary$$

### SHAP Explainability
Every match decision is decomposed into feature contributions using TreeSHAP, rendered as interactive waterfall charts.

### Cryptographic Audit Trail
SHA-256 chained receipts create a blockchain-like immutable record of every food rescue transaction.

---

## 🛠️ Tech Stack

| Layer | Technology |
|:---|:---|
| Backend | FastAPI + Uvicorn |
| Frontend | Streamlit (multi-page) |
| AI/ML | Scikit-Learn, SciPy, SHAP |
| Maps | Folium + Leaflet.js |
| Charts | Plotly Express |
| Database | SQLite + In-Memory |
| Crypto | hashlib SHA-256 |
| Deployment | IBM LinuxONE (s390x) |

---

## 📊 ESG Impact Metrics

- **1 kg food rescued** = 2.5 meals served
- **1 kg food waste avoided** = 2.5 kg CO₂e emissions prevented
- **1 kg food** = 100L water footprint saved

---

## 📂 Project Structure

```
NourishNet-AI/
├── backend/
│   ├── main.py              # FastAPI application
│   ├── config.py             # Configuration
│   ├── database.py           # Data layer
│   ├── models/               # 4 AI engines
│   │   ├── spoilage_engine.py
│   │   ├── matcher_engine.py
│   │   ├── explainer_engine.py
│   │   └── crypto_audit.py
│   ├── schemas/              # Pydantic models
│   └── data/                 # Seed data
├── dashboard/
│   ├── app.py                # Streamlit entry
│   ├── pages/                # 6 dashboard pages
│   └── assets/               # CSS, images
├── tests/                    # Unit tests
├── requirements.txt
├── deploy_linuxone.sh
└── README.md
```

---

## 👥 Team

| Role | Member |
|:---|:---|
| Project Lead & AI Engineer | Team Member 1 |
| Backend Developer | Team Member 2 |
| Frontend & Visualization | Team Member 3 |
| Data & Deployment | Team Member 4 |

---

## 📄 License

MIT License

---

*Built with ❤️ for IBM Z Datathon 2026 | Track 1: Real-Time AI for Critical Decisions*
