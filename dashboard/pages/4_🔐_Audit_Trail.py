"""Page 4: Audit Trail & Liability Shield — Cryptographic Certificate Viewer"""

import streamlit as st
import requests
import os
import json

st.set_page_config(page_title="NourishNet AI — Audit Trail", page_icon="🔐", layout="wide")

BACKEND_URL = os.environ.get("BACKEND_URL", "http://localhost:8000")

st.markdown("# 🔐 Audit Trail & Liability Shield")
st.markdown("*Cryptographic chain-of-custody — every rescue, tamper-proof*")
st.markdown("---")

# ═══════════════════════════════════════════════════════════════════════════
#  Chain Integrity Verification
# ═══════════════════════════════════════════════════════════════════════════
st.markdown("### 🔗 Chain Integrity Verification")

chain_data = None
col_btn, col_result = st.columns([1, 3])

with col_btn:
    verify_clicked = st.button("🔍 Verify Chain Integrity", use_container_width=True)

if verify_clicked:
    try:
        resp = requests.get(f"{BACKEND_URL}/api/audit/chain", timeout=10)
        if resp.status_code == 200:
            chain_data = resp.json()
            is_valid = chain_data.get("valid", False)
            total = chain_data.get("total_records", 0)
            message = chain_data.get("message", "")

            if is_valid:
                st.success(f"✅ **Chain Valid** — {total} records verified. {message}")
            else:
                broken = chain_data.get("broken_at_index", "?")
                st.error(f"❌ **Chain Broken** at index {broken}. {message}")
        else:
            st.error(f"Error: {resp.text}")
    except requests.exceptions.ConnectionError:
        st.error("❌ Backend not connected.")
    except Exception as e:
        st.error(f"Error: {e}")

st.markdown("---")

# ═══════════════════════════════════════════════════════════════════════════
#  Audit Records
# ═══════════════════════════════════════════════════════════════════════════
st.markdown("### 📋 Rescue Audit Records")

try:
    resp = requests.get(f"{BACKEND_URL}/api/audit/chain", timeout=10)
    if resp.status_code == 200:
        data = resp.json()
        chain = data.get("chain", [])

        if chain:
            for record in chain:
                rid = record.get("id", "?")
                mid = record.get("match_id", "?")
                don_summary = record.get("donation_summary", "N/A")
                ngo_summary = record.get("ngo_summary", "N/A")
                ts = record.get("timestamp", "N/A")
                chain_hash = record.get("chain_hash", "N/A")

                with st.expander(f"📜 Audit #{rid} — Match #{mid} | {don_summary[:50]}"):
                    c1, c2 = st.columns(2)
                    with c1:
                        st.markdown(f"**Donation:** {don_summary}")
                        st.markdown(f"**NGO:** {ngo_summary}")
                        st.markdown(f"**Timestamp:** `{ts}`")
                    with c2:
                        pickup = record.get("pickup_temp", 0)
                        delivery = record.get("delivery_temp", 0)
                        delta = abs(pickup - delivery)
                        compliant = delta < 10

                        st.metric("Pickup Temp", f"{pickup}°C")
                        st.metric("Delivery Temp", f"{delivery}°C")
                        if compliant:
                            st.success("✅ Temperature chain maintained")
                        else:
                            st.warning(f"⚠️ Temp variation: {delta:.1f}°C")

                    st.markdown("**SHA-256 Hash:**")
                    st.code(chain_hash, language=None)

                    st.markdown("**Previous Hash:**")
                    prev = record.get("previous_hash", "GENESIS")
                    st.code(prev, language=None)

                    st.markdown("**Transaction Data:**")
                    tx = record.get("transaction_data", {})
                    st.json(tx)

                    # Certificate viewer
                    if st.button(f"📄 View Certificate", key=f"cert_{rid}"):
                        try:
                            cert_resp = requests.get(f"{BACKEND_URL}/api/audit/{rid}/certificate", timeout=10)
                            if cert_resp.status_code == 200:
                                st.components.v1.html(cert_resp.text, height=650, scrolling=True)
                        except Exception as e:
                            st.error(f"Certificate error: {e}")
        else:
            st.info("No audit records yet. Generate audit certificates from the **AI Dispatch Center** after matching.")
    else:
        st.warning(f"Could not load audit chain: {resp.status_code}")
except requests.exceptions.ConnectionError:
    st.warning("⚠️ Backend not connected. Start with: `python run_backend.py`")
except Exception as e:
    st.warning(f"Error: {e}")

st.markdown("---")

# ═══════════════════════════════════════════════════════════════════════════
#  Certificate Download
# ═══════════════════════════════════════════════════════════════════════════
st.markdown("### 📄 Download Certificate")
st.markdown("Select an audit record to download its certificate.")

try:
    resp = requests.get(f"{BACKEND_URL}/api/audit/chain", timeout=5)
    if resp.status_code == 200:
        chain = resp.json().get("chain", [])
        if chain:
            options = {f"Audit #{r['id']} — Match #{r['match_id']}": r["id"] for r in chain}
            selected = st.selectbox("Select audit record:", list(options.keys()))
            audit_id = options[selected]

            if st.button("📥 Download HTML Certificate"):
                try:
                    cert_resp = requests.get(f"{BACKEND_URL}/api/audit/{audit_id}/certificate", timeout=10)
                    if cert_resp.status_code == 200:
                        st.download_button(
                            "💾 Save Certificate",
                            data=cert_resp.text,
                            file_name=f"NourishNet_Certificate_Audit_{audit_id}.html",
                            mime="text/html",
                        )
                        st.components.v1.html(cert_resp.text, height=650, scrolling=True)
                except Exception as e:
                    st.error(f"Error: {e}")
except Exception:
    pass

st.markdown("---")
st.caption("© 2026 NourishNet AI | Cryptographic Chain-of-Custody powered by SHA-256")
