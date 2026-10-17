"""Page 5: Impact Dashboard — ESG Analytics & Environmental Impact"""

import streamlit as st
import requests
import os

st.set_page_config(page_title="NourishNet AI — Impact Dashboard", page_icon="📊", layout="wide")

BACKEND_URL = os.environ.get("BACKEND_URL", "http://localhost:8000")

st.markdown("# 📊 Impact Dashboard — ESG Analytics")
st.markdown("*Measuring the real-world impact of every food rescue*")
st.markdown("---")

# ── Fetch Data ────────────────────────────────────────────────────────────
impact = {}
donations = []
try:
    impact = requests.get(f"{BACKEND_URL}/api/impact", timeout=5).json()
    donations = requests.get(f"{BACKEND_URL}/api/donations", timeout=5).json()
except requests.exceptions.ConnectionError:
    st.error("❌ Backend not connected. Start with: `python run_backend.py`")
except Exception as e:
    st.warning(f"Error fetching data: {e}")

# ═══════════════════════════════════════════════════════════════════════════
#  KPI Cards
# ═══════════════════════════════════════════════════════════════════════════
st.markdown("### 🎯 Key Performance Indicators")

c1, c2, c3, c4 = st.columns(4)
with c1:
    kg = impact.get("total_kg_rescued", 0)
    st.markdown(f"""
    <div style="background:#161b22; border:2px solid #4ECDC4; border-radius:12px; padding:20px; text-align:center;">
        <div style="font-size:14px; color:#888;">🥘 Food Rescued</div>
        <div style="font-size:36px; font-weight:bold; color:#4ECDC4;">{kg:.1f}</div>
        <div style="font-size:14px; color:#aaa;">kilograms</div>
    </div>
    """, unsafe_allow_html=True)

with c2:
    meals = impact.get("total_meals_served", 0)
    st.markdown(f"""
    <div style="background:#161b22; border:2px solid #FF6B6B; border-radius:12px; padding:20px; text-align:center;">
        <div style="font-size:14px; color:#888;">🍽️ Meals Served</div>
        <div style="font-size:36px; font-weight:bold; color:#FF6B6B;">{meals:.0f}</div>
        <div style="font-size:14px; color:#aaa;">meals</div>
    </div>
    """, unsafe_allow_html=True)

with c3:
    co2 = impact.get("total_co2_avoided_kg", 0)
    st.markdown(f"""
    <div style="background:#161b22; border:2px solid #44BB44; border-radius:12px; padding:20px; text-align:center;">
        <div style="font-size:14px; color:#888;">🌿 CO₂ Avoided</div>
        <div style="font-size:36px; font-weight:bold; color:#44BB44;">{co2:.1f}</div>
        <div style="font-size:14px; color:#aaa;">kg CO₂e</div>
    </div>
    """, unsafe_allow_html=True)

with c4:
    water = impact.get("total_water_saved_liters", 0)
    st.markdown(f"""
    <div style="background:#161b22; border:2px solid #45B7D1; border-radius:12px; padding:20px; text-align:center;">
        <div style="font-size:14px; color:#888;">💧 Water Saved</div>
        <div style="font-size:36px; font-weight:bold; color:#45B7D1;">{water:.0f}</div>
        <div style="font-size:14px; color:#aaa;">litres</div>
    </div>
    """, unsafe_allow_html=True)

st.markdown("")

# ── Secondary Metrics ────────────────────────────────────────────────────
c5, c6, c7, c8, c9 = st.columns(5)
with c5:
    st.metric("📦 Total Donations", impact.get("total_donations", 0))
with c6:
    st.metric("🤝 Total Dispatches", impact.get("total_matches", 0))
with c7:
    st.metric("✅ Completed Rescues", impact.get("completed_rescues", 0))
with c8:
    st.metric("🟢 Tier 1 (Human)", impact.get("tier1_human_rescues", 0))
with c9:
    st.metric("🔄 Tier 2 (Bio-Energy)", impact.get("tier2_bio_upcycled", 0))

st.markdown("---")

# ═══════════════════════════════════════════════════════════════════════════
#  Charts
# ═══════════════════════════════════════════════════════════════════════════

try:
    import plotly.express as px
    import plotly.graph_objects as go
    import pandas as pd

    if donations:
        df = pd.DataFrame(donations)

        chart_col1, chart_col2 = st.columns(2)

        # Category Breakdown (Pie)
        with chart_col1:
            st.markdown("### 🍲 Food Category Breakdown")
            if "food_category" in df.columns:
                cat_counts = df["food_category"].value_counts().reset_index()
                cat_counts.columns = ["Category", "Count"]
                cat_counts["Category"] = cat_counts["Category"].str.replace("_", " ").str.title()

                fig = px.pie(
                    cat_counts, values="Count", names="Category",
                    color_discrete_sequence=px.colors.qualitative.Set2,
                    hole=0.4,
                )
                fig.update_layout(
                    template="plotly_dark",
                    paper_bgcolor="#0d1117",
                    plot_bgcolor="#0d1117",
                    height=350,
                    margin=dict(l=20, r=20, t=30, b=20),
                )
                st.plotly_chart(fig, use_container_width=True)

        # Urgency Distribution (Bar)
        with chart_col2:
            st.markdown("### ⚡ Urgency Distribution")
            if "urgency_level" in df.columns:
                urg_counts = df["urgency_level"].value_counts().reset_index()
                urg_counts.columns = ["Urgency", "Count"]
                color_map = {"CRITICAL": "#FF4444", "URGENT": "#FFB020", "NORMAL": "#44BB44", "STABLE": "#4488FF"}

                fig = px.bar(
                    urg_counts, x="Urgency", y="Count",
                    color="Urgency",
                    color_discrete_map=color_map,
                )
                fig.update_layout(
                    template="plotly_dark",
                    paper_bgcolor="#0d1117",
                    plot_bgcolor="#161b22",
                    height=350,
                    margin=dict(l=20, r=20, t=30, b=20),
                    showlegend=False,
                )
                st.plotly_chart(fig, use_container_width=True)

        # Quantity by Category (Horizontal Bar)
        st.markdown("### 📦 Quantity by Food Category")
        if "food_category" in df.columns and "quantity_kg" in df.columns:
            qty_by_cat = df.groupby("food_category")["quantity_kg"].sum().reset_index()
            qty_by_cat.columns = ["Category", "Total_kg"]
            qty_by_cat["Category"] = qty_by_cat["Category"].str.replace("_", " ").str.title()
            qty_by_cat = qty_by_cat.sort_values("Total_kg", ascending=True)

            fig = px.bar(
                qty_by_cat, x="Total_kg", y="Category",
                orientation="h",
                color="Total_kg",
                color_continuous_scale="Viridis",
            )
            fig.update_layout(
                template="plotly_dark",
                paper_bgcolor="#0d1117",
                plot_bgcolor="#161b22",
                height=300,
                margin=dict(l=20, r=20, t=10, b=20),
                xaxis_title="Total Quantity (kg)",
                yaxis_title="",
            )
            st.plotly_chart(fig, use_container_width=True)

    else:
        st.info("No donation data available for charts.")

except ImportError:
    st.warning("Install plotly and pandas for charts: `pip install plotly pandas`")

st.markdown("---")

# ═══════════════════════════════════════════════════════════════════════════
#  Environmental Equivalences
# ═══════════════════════════════════════════════════════════════════════════
st.markdown("### 🌍 Environmental Impact Equivalences")

co2 = impact.get("total_co2_avoided_kg", 0)
water = impact.get("total_water_saved_liters", 0)
meals = impact.get("total_meals_served", 0)

eq1, eq2, eq3 = st.columns(3)

with eq1:
    trees = co2 / 22.0  # ~22 kg CO2 per tree per year
    st.markdown(f"""
    <div style="background:#0a3622; border:1px solid #198754; border-radius:12px; padding:20px; text-align:center;">
        <div style="font-size:48px;">🌳</div>
        <div style="font-size:28px; font-weight:bold; color:#44BB44;">{trees:.1f}</div>
        <div style="color:#aaa;">trees planted for a year</div>
    </div>
    """, unsafe_allow_html=True)

with eq2:
    bathtubs = water / 300.0
    st.markdown(f"""
    <div style="background:#0a2233; border:1px solid #0d6efd; border-radius:12px; padding:20px; text-align:center;">
        <div style="font-size:48px;">🛁</div>
        <div style="font-size:28px; font-weight:bold; color:#45B7D1;">{bathtubs:.1f}</div>
        <div style="color:#aaa;">bathtubs of water saved</div>
    </div>
    """, unsafe_allow_html=True)

with eq3:
    families = meals / 12.0  # ~12 meals per family per day
    st.markdown(f"""
    <div style="background:#3a2200; border:1px solid #ff8c00; border-radius:12px; padding:20px; text-align:center;">
        <div style="font-size:48px;">👨‍👩‍👧‍👦</div>
        <div style="font-size:28px; font-weight:bold; color:#FFB020;">{families:.1f}</div>
        <div style="color:#aaa;">families fed for a day</div>
    </div>
    """, unsafe_allow_html=True)

st.markdown("---")

# ESG Summary
st.markdown("### 📄 ESG Impact Summary")
st.success(f"""
**NourishNet AI Environmental Impact Report**

Through intelligent food rescue operations, NourishNet AI has facilitated the rescue of
**{impact.get('total_kg_rescued', 0):.1f} kg** of surplus food, translating to approximately
**{impact.get('total_meals_served', 0):.0f} meals** served to communities in need.

This effort has avoided an estimated **{co2:.1f} kg of CO₂ equivalent** emissions —
comparable to planting **{co2/22:.0f} trees** for a year — and conserved approximately
**{water:.0f} litres** of water that would have been wasted in food production.

*Powered by IBM LinuxONE — the world's most sustainable enterprise server.*
""")

# Fairness Report
st.markdown("---")
st.markdown("### ⚖️ Distribution Fairness Report")
try:
    fairness = requests.get(f"{BACKEND_URL}/api/fairness", timeout=5).json()
    if fairness.get("is_fair"):
        st.success(f"✅ Distribution is **equitable** | Gini coefficient: {fairness.get('gini_coefficient', 0):.3f}")
    else:
        st.warning(f"⚠️ Distribution imbalance detected | Gini: {fairness.get('gini_coefficient', 0):.3f} | {fairness.get('details', '')}")
        underserved = fairness.get("underserved_ngos", [])
        if underserved:
            for u in underserved:
                st.markdown(f"  - **{u.get('ngo_name', '?')}** — only {u.get('allocations', 0)} allocation(s)")
except Exception:
    st.info("Fairness report will appear after matches are made.")

st.markdown("---")
st.caption("© 2026 NourishNet AI | ESG Impact Analytics | IBM Z Datathon 2026")
