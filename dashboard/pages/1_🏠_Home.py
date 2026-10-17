"""Page 1: Home — Project Overview & Problem Statement"""

import streamlit as st

st.set_page_config(page_title="NourishNet AI — Home", page_icon="🏠", layout="wide")

st.markdown("# 🏠 About NourishNet AI")
st.markdown("---")

st.markdown("""
## 🌍 The Problem: A Global Food Crisis in Two Parts

**1.3 billion tons** of food is wasted globally every year — that's **one-third** of all food produced
for human consumption. Meanwhile, **828 million people** go to bed hungry every night.

The paradox is stark: we have more than enough food, but it doesn't reach the right people in time.

### 🕐 The Perishable Window Challenge

Surplus food from restaurants, hotels, and supermarkets has a **narrow safety window** — often just
2-4 hours for cooked meals. Traditional food banks can't respond fast enough.

### ⚖️ The Liability Barrier

Donors fear legal consequences if donated food causes illness. Without a verifiable chain-of-custody,
Good Samaritan protections remain theoretical.
""")

st.markdown("---")

st.markdown("""
## 💡 Our Solution: NourishNet AI

NourishNet AI is an **AI-powered food rescue and intelligent redistribution platform** that:

| Challenge | NourishNet AI Solution |
|:---|:---|
| Food spoils before it can be rescued | **Spoilage Engine** predicts exact safe windows using Arrhenius kinetics |
| Manual matching is slow and suboptimal | **AI Matcher** uses Hungarian Algorithm for optimal donor→NGO pairing in <100ms |
| Donors fear liability | **Crypto Audit Trail** creates tamper-proof SHA-256 chain-of-custody certificates |
| "Black box" AI distrust | **SHAP Explainer** shows exactly WHY each match was made |
| No environmental accounting | **ESG Dashboard** tracks meals, CO₂, and water impact in real-time |

### 🏗️ System Architecture

```
┌─────────────┐     ┌──────────────────┐     ┌──────────────────┐
│   Donors    │────▶│  FastAPI Backend  │────▶│  Streamlit UI    │
│ (Restaurants│     │  ┌──────────────┐ │     │  ┌────────────┐  │
│  Hotels,    │     │  │ Spoilage     │ │     │  │ Map View   │  │
│  Markets)   │     │  │ Engine (A)   │ │     │  │ Dashboard  │  │
└─────────────┘     │  ├──────────────┤ │     │  │ SHAP Chart │  │
                    │  │ Matcher      │ │     │  │ Audit Cert │  │
┌─────────────┐     │  │ Engine (B)   │ │     │  └────────────┘  │
│    NGOs     │◀────│  ├──────────────┤ │     └──────────────────┘
│ (Shelters,  │     │  │ SHAP         │ │
│  Kitchens,  │     │  │ Explainer(C) │ │     ┌──────────────────┐
│  Food Banks)│     │  ├──────────────┤ │     │  IBM LinuxONE    │
└─────────────┘     │  │ Crypto       │ │     │  (s390x)         │
                    │  │ Audit (D)    │ │     │  Secure, 99.999% │
                    │  └──────────────┘ │     │  Sustainable     │
                    │  SQLite + Memory  │     └──────────────────┘
                    └──────────────────┘
```
""")

st.markdown("---")

st.markdown("""
## 🏆 Track 1: Real-Time AI for Critical Decisions

NourishNet AI is built for IBM Z Datathon 2026 **Track 1** because:

1. **Real-Time Decisions**: Every minute matters when food is expiring. Our AI matches in <100ms.
2. **Critical Impact**: Wrong matches mean food waste; right matches mean lives fed.
3. **Enterprise-Grade**: IBM LinuxONE's 99.999% availability ensures the platform never goes down.

## 👥 Team

| Role | Member |
|:---|:---|
| Project Lead & AI Engineer | Team Member 1 |
| Backend Developer | Team Member 2 |
| Frontend & Visualization | Team Member 3 |
| Data & Deployment | Team Member 4 |
""")

st.markdown("---")
st.caption("© 2026 NourishNet AI | IBM Z Datathon 2026")
