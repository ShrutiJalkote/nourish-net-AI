"""
Page 3: AI Dispatch Center — THE STAR PAGE FOR DEMO
Real-time AI matching, interactive map, SHAP explanations.
"""

import streamlit as st
import requests
import os
import time
import json
import base64
from datetime import datetime

st.set_page_config(page_title="NourishNet AI — AI Dispatch", page_icon="🤖", layout="wide")

BACKEND_URL = os.environ.get("BACKEND_URL", "http://localhost:8000")

st.markdown("# 🤖 AI Dispatch Center")
st.markdown("*Real-time intelligent food rescue matching powered by AI*")
st.markdown("---")

# ── Sidebar Demo & Admin Tools ─────────────────────────────────────────────
with st.sidebar.expander("🛠️ Admin & Demo Quick-Actions", expanded=True):
    if st.button("🔄 Reseed / Reset Demo Data", use_container_width=True):
        try:
            requests.get(f"{BACKEND_URL}/api/seed", timeout=5)
            st.session_state.pop("last_matches", None)
            st.session_state.pop("match_lines", None)
            st.success("✅ Demo reseeded with 5 fresh surpluses!")
            st.rerun()
        except Exception as e:
            st.error(f"Error: {e}")

    st.caption("⚡ Quick-Inject Surplus Scenarios:")
    if st.button("🍛 Inject 40kg Mumbai Biryani (Critical)", use_container_width=True):
        try:
            from datetime import timedelta
            now_iso = (datetime.now() - timedelta(hours=1.5)).isoformat()
            payload = {
                "donor_name": "Taj Lands End Mumbai",
                "food_category": "cooked_hot_meals",
                "quantity_kg": 40.0,
                "prep_time": now_iso,
                "ambient_temp_celsius": 38.0,
                "humidity_percent": 65.0,
                "packaging_type": "sealed",
                "latitude": 19.0434,
                "longitude": 72.8194,
                "notes": "Emergency banquet surplus",
            }
            requests.post(f"{BACKEND_URL}/api/donations", json=payload, timeout=5)
            st.success("Injected Mumbai Biryani!")
            st.rerun()
        except Exception as e:
            st.error(f"Injection error: {e}")

    if st.button("🍞 Inject 60kg Bangalore Bakery (Stable)", use_container_width=True):
        try:
            now_iso = datetime.now().isoformat()
            payload = {
                "donor_name": "Thom's Bakery Bangalore",
                "food_category": "bakery_bread",
                "quantity_kg": 60.0,
                "prep_time": now_iso,
                "ambient_temp_celsius": 22.0,
                "humidity_percent": 50.0,
                "packaging_type": "sealed",
                "latitude": 12.9866,
                "longitude": 77.6186,
                "notes": "End of day artisanal loaves",
            }
            requests.post(f"{BACKEND_URL}/api/donations", json=payload, timeout=5)
            st.success("Injected Bangalore Bakery!")
            st.rerun()
        except Exception as e:
            st.error(f"Injection error: {e}")

# ═══════════════════════════════════════════════════════════════════════════
#  Section 1: Active Donations with Live Status
# ═══════════════════════════════════════════════════════════════════════════
st.markdown("### 📡 Active Donations — Live Status")

donations = []
ngos = []
try:
    donations = requests.get(f"{BACKEND_URL}/api/donations", timeout=5).json()
    ngos = requests.get(f"{BACKEND_URL}/api/ngos", timeout=5).json()
except requests.exceptions.ConnectionError:
    st.error("❌ Backend not connected. Start with: `python run_backend.py`")
except Exception as e:
    st.error(f"Error: {e}")

active_donations = [d for d in donations if d.get("status") == "active"]

if active_donations:
    cols = st.columns(min(len(active_donations), 4))
    for i, d in enumerate(active_donations[:8]):
        urg = d.get("urgency_level", "UNKNOWN")
        color = {"CRITICAL": "#FF4444", "URGENT": "#FFB020", "NORMAL": "#44BB44", "STABLE": "#4488FF"}.get(urg, "#888")
        emoji = {"CRITICAL": "🔴", "URGENT": "🟡", "NORMAL": "🟢", "STABLE": "🔵"}.get(urg, "⚪")
        remaining = max(0, d.get("remaining_minutes", 0))

        with cols[i % len(cols)]:
            st.markdown(f"""
            <div style="background:#161b22; border:2px solid {color}; border-radius:10px; padding:15px; margin:5px 0; text-align:center;">
                <div style="font-size:12px; color:#888;">#{d['id']} • {d.get('food_category','').replace('_',' ').title()}</div>
                <div style="font-size:24px; font-weight:bold; color:{color};">{emoji} {urg}</div>
                <div style="font-size:20px; color:white; font-weight:bold;">{remaining:.0f} min</div>
                <div style="font-size:12px; color:#aaa;">{d.get('quantity_kg',0)} kg from {d.get('donor_name','?')[:20]}</div>
                <div style="font-size:11px; color:#666;">Freshness: {d.get('freshness_pct',0):.1f}%</div>
            </div>
            """, unsafe_allow_html=True)
else:
    c_info, c_reseed = st.columns([3, 1])
    with c_info:
        st.info("No active donations waiting to be matched. All donations have been optimally dispatched!")
    with c_reseed:
        if st.button("🔄 Reload 5 Surpluses", type="primary", use_container_width=True):
            try:
                requests.get(f"{BACKEND_URL}/api/seed", timeout=5)
                st.session_state.pop("last_matches", None)
                st.session_state.pop("match_lines", None)
                st.rerun()
            except Exception as e:
                st.error(f"Error: {e}")

st.markdown("---")

# ═══════════════════════════════════════════════════════════════════════════
#  Section 2: Interactive Map
# ═══════════════════════════════════════════════════════════════════════════
st.markdown("### 🗺️ Live Map — Donors & NGOs")

try:
    import folium
    from streamlit_folium import st_folium

    m = folium.Map(location=[20.5937, 78.9629], zoom_start=5, tiles="CartoDB dark_matter")

    # Plot donors (red markers)
    for d in donations:
        lat = d.get("latitude", 0)
        lng = d.get("longitude", 0)
        if lat and lng:
            urg = d.get("urgency_level", "UNKNOWN")
            icon_color = {"CRITICAL": "red", "URGENT": "orange", "NORMAL": "green", "STABLE": "blue"}.get(urg, "gray")
            popup_html = f"""
            <b>🍲 {d.get('donor_name','Unknown')}</b><br>
            Food: {d.get('food_category','').replace('_',' ').title()}<br>
            Qty: {d.get('quantity_kg',0)} kg<br>
            Urgency: <b>{urg}</b><br>
            Status: {d.get('status','?')}
            """
            folium.Marker(
                [lat, lng],
                popup=folium.Popup(popup_html, max_width=250),
                tooltip=f"Donor: {d.get('donor_name','')}",
                icon=folium.Icon(color=icon_color, icon="cutlery", prefix="fa"),
            ).add_to(m)

    # Plot NGOs (green markers)
    for n in ngos:
        lat = n.get("latitude", 0)
        lng = n.get("longitude", 0)
        if lat and lng:
            popup_html = f"""
            <b>🏥 {n.get('name','Unknown')}</b><br>
            Type: {n.get('org_type','')}<br>
            Capacity: {n.get('capacity_kg',0)} kg<br>
            Beneficiaries: {n.get('beneficiary_count',0)}<br>
            Refrigeration: {'✅' if n.get('has_refrigeration') else '❌'}
            """
            folium.Marker(
                [lat, lng],
                popup=folium.Popup(popup_html, max_width=250),
                tooltip=f"NGO: {n.get('name','')}",
                icon=folium.Icon(color="green", icon="heart", prefix="fa"),
            ).add_to(m)

    # Draw match lines (if any matches exist)
    try:
        matches_data = requests.get(f"{BACKEND_URL}/api/audit/chain", timeout=5).json()
        match_list = db_matches = requests.get(f"{BACKEND_URL}/api/donations", timeout=3).json()
    except Exception:
        pass

    # Check session state for match lines
    if "match_lines" in st.session_state:
        for line in st.session_state.match_lines:
            folium.PolyLine(
                line["coords"],
                color="#0f62fe",
                weight=3,
                opacity=0.8,
                tooltip=line.get("tooltip", ""),
                dash_array="10",
            ).add_to(m)

    st_folium(m, width=None, height=450, use_container_width=True)

except ImportError:
    st.warning("Install folium and streamlit-folium: `pip install folium streamlit-folium`")
except Exception as e:
    st.warning(f"Map rendering error: {e}")

st.markdown("---")

# ═══════════════════════════════════════════════════════════════════════════
#  Section 3: AI Match Controls
# ═══════════════════════════════════════════════════════════════════════════
st.markdown("### ⚡ Execute AI Matching")

col_single, col_batch = st.columns(2)

with col_single:
    st.markdown("#### Match Single Donation")
    if active_donations:
        options = {f"#{d['id']} — {d.get('quantity_kg',0)}kg {d.get('food_category','').replace('_',' ').title()}": d['id'] for d in active_donations}
        selected = st.selectbox("Select donation:", list(options.keys()))
        if st.button("🎯 Match This Donation", use_container_width=True):
            try:
                t0 = time.time()
                resp = requests.post(f"{BACKEND_URL}/api/match", json={"donation_id": options[selected]}, timeout=30)
                elapsed = (time.time() - t0) * 1000

                if resp.status_code == 200:
                    result = resp.json()
                    server_ms = result.get("elapsed_ms", elapsed)
                    st.success(f"✅ {result.get('message', 'Matched!')} | Response: {server_ms:.1f}ms")
                    st.session_state["last_matches"] = result.get("matches", [])

                    # Store match lines for map
                    lines = []
                    for match in result.get("matches", []):
                        don = next((d for d in donations if d["id"] == match.get("donation_id")), None)
                        ngo = next((n for n in ngos if n["id"] == match.get("ngo_id")), None)
                        if don and ngo:
                            lines.append({
                                "coords": [[don["latitude"], don["longitude"]], [ngo["latitude"], ngo["longitude"]]],
                                "tooltip": f"{don.get('donor_name','')} → {ngo.get('name','')}",
                            })
                    st.session_state["match_lines"] = lines
                    st.rerun()
                else:
                    st.error(f"Error: {resp.text}")
            except requests.exceptions.ConnectionError:
                st.error("❌ Backend not connected.")
    else:
        st.info("No active donations to match.")

with col_batch:
    st.markdown("#### Batch Match All Unmatched")
    st.markdown(f"**{len(active_donations)}** active donations waiting")
    if st.button("🚀 Batch Match All", use_container_width=True, disabled=len(active_donations) == 0):
        try:
            t0 = time.time()
            resp = requests.post(f"{BACKEND_URL}/api/match", json={}, timeout=30)
            elapsed = (time.time() - t0) * 1000

            if resp.status_code == 200:
                result = resp.json()
                server_ms = result.get("elapsed_ms", elapsed)
                st.success(f"✅ {result.get('message', 'Batch matched!')} | Response: {server_ms:.1f}ms")
                st.session_state["last_matches"] = result.get("matches", [])

                lines = []
                for match in result.get("matches", []):
                    don = next((d for d in donations if d["id"] == match.get("donation_id")), None)
                    ngo = next((n for n in ngos if n["id"] == match.get("ngo_id")), None)
                    if don and ngo:
                        lines.append({
                            "coords": [[don["latitude"], don["longitude"]], [ngo["latitude"], ngo["longitude"]]],
                            "tooltip": f"{don.get('donor_name','')} → {ngo.get('name','')}",
                        })
                st.session_state["match_lines"] = lines
                st.rerun()
            else:
                st.error(f"Error: {resp.text}")
        except requests.exceptions.ConnectionError:
            st.error("❌ Backend not connected.")

st.markdown("---")

# ═══════════════════════════════════════════════════════════════════════════
#  Section 4: Match Results with SHAP
# ═══════════════════════════════════════════════════════════════════════════
st.markdown("### 📊 Match Results & AI Explanations")

last_matches = st.session_state.get("last_matches", [])

if last_matches:
    for match in last_matches:
        donor_name = match.get("donor_name", "Unknown")
        ngo_name = match.get("ngo_name", "Unknown")
        score = match.get("composite_score", 0)
        match_id = match.get("id", "?")

        tier = match.get("tier", 1)
        tier_name = match.get("tier_name", "Human Relief")
        tier_icon = "🟢 Tier 1: Direct Human Relief" if tier == 1 else f"🔄 Tier 2: {tier_name} (Landfill Avoided)"

        with st.expander(f"✅ #{match_id}: {donor_name} → {ngo_name} | [{tier_icon}] (Score: {score:.2%})", expanded=True):
            if tier == 2:
                st.warning(f"🔄 **Circular Bio-Economy Upcycling:** Food was nearing safe thermal window or local shelters full. Diverted to bio-methanation / animal feed to eliminate 100% of landfill methane emissions.")

            # Score breakdown
            c1, c2, c3, c4, c5 = st.columns(5)
            with c1:
                st.metric("Urgency", f"{match.get('urgency_score', 0):.2f}")
            with c2:
                st.metric("Capacity Fit", f"{match.get('capacity_fit_score', 0):.2f}")
            with c3:
                st.metric("Community Need", f"{match.get('need_score', 0):.2f}")
            with c4:
                st.metric("Proximity", f"{match.get('proximity_score', 0):.2f}")
            with c5:
                st.metric("Dietary Match", f"{match.get('dietary_match_score', 0):.2f}")

            mc1, mc2 = st.columns(2)
            with mc1:
                st.info(f"📏 Distance: **{match.get('distance_km', 0):.1f} km** | ETA: **{match.get('eta_minutes', 0):.0f} min**")
            with mc2:
                st.info(f"🍲 {match.get('quantity_kg', 0)} kg {match.get('food_category', '').replace('_', ' ').title()} • Tier: **{tier_name}**")

            # Score bar chart
            try:
                import plotly.graph_objects as go
                fig = go.Figure(go.Bar(
                    x=[match.get("urgency_score", 0), match.get("capacity_fit_score", 0),
                       match.get("need_score", 0), match.get("proximity_score", 0),
                       match.get("dietary_match_score", 0)],
                    y=["Urgency (30%)", "Capacity (20%)", "Need (20%)", "Proximity (20%)", "Dietary (10%)"],
                    orientation="h",
                    marker_color=["#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEAA7"],
                ))
                fig.update_layout(
                    title="Score Breakdown",
                    xaxis_title="Score (0-1)",
                    template="plotly_dark",
                    height=250,
                    margin=dict(l=0, r=0, t=40, b=0),
                    paper_bgcolor="#0d1117",
                    plot_bgcolor="#161b22",
                )
                st.plotly_chart(fig, use_container_width=True)
            except ImportError:
                st.warning("Install plotly for charts: `pip install plotly`")

            # SHAP Waterfall
            try:
                explain_resp = requests.get(f"{BACKEND_URL}/api/match/{match_id}/explain", timeout=10)
                if explain_resp.status_code == 200:
                    explain_data = explain_resp.json()
                    plot_b64 = explain_data.get("waterfall_plot_base64")
                    if plot_b64:
                        st.markdown("#### 🔍 SHAP Explanation — Why This Match?")
                        st.image(base64.b64decode(plot_b64), use_container_width=True)
                        st.caption(f"Prediction confidence: {explain_data.get('prediction', 0):.2%}")
            except Exception as e:
                st.caption(f"SHAP chart unavailable: {e}")

            # Audit certificate button
            ac1, ac2 = st.columns([1, 3])
            with ac1:
                if st.button(f"🔐 Verify & Seal Delivery", key=f"audit_{match_id}"):
                    try:
                        audit_resp = requests.post(
                            f"{BACKEND_URL}/api/audit/generate",
                            json={"match_id": match_id, "pickup_temp_celsius": 25.0, "delivery_temp_celsius": 23.0},
                            timeout=10,
                        )
                        if audit_resp.status_code == 200:
                            aud = audit_resp.json()
                            st.success(f"🔐 Delivery verified & sealed! Status transitioned to DELIVERED. Hash: `{aud.get('chain_hash', '')[:24]}…`")
                        else:
                            st.error(f"Audit error: {audit_resp.text}")
                    except Exception as e:
                        st.error(f"Error: {e}")
else:
    st.info("No matches yet. Use the controls above to execute AI matching.")
    # Show any previously stored matches
    try:
        all_matches = requests.get(f"{BACKEND_URL}/api/impact", timeout=3).json()
        total = all_matches.get("total_matches", 0)
        if total > 0:
            st.success(f"📊 {total} matches have been completed previously. Reload seed data or create new donations to match again.")
    except Exception:
        pass
