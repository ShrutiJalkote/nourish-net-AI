# 🎬 NourishNet AI — 3-Minute Demo Video Script
### IBM Z Datathon 2026 | Track 1: Real-Time AI for Critical Decisions

> **Target Duration:** Exactly 3 minutes (180 seconds)  
> **Format:** Screen recording with voiceover + webcam in corner  
> **Resolution:** 1080p 60fps  

---

## ⏱️ Video Breakdown

```
00:00 - 00:30 (30s) │ Hook & The Perishable Food Crisis
00:30 - 01:15 (45s) │ Core Innovation: 4 AI Engines in Real-Time
01:15 - 02:00 (45s) │ Live Interactive Demo: Donor → Match → Map → SHAP
02:00 - 02:30 (30s) │ Cryptographic Audit & Good Samaritan Liability Shield
02:30 - 03:00 (30s) │ IBM LinuxONE s390x Justification, ESG Impact & Closing
```

---

## 🎙️ Second-by-Second Script

### 🎬 Part 1: Hook & The Crisis (00:00 – 00:30)
* **Visual:** [Slide 1 / Video Intro + Title screen `NourishNet AI`] transitioning to statistics graphic.
* **Speaker:**
  > "1.3 billion tons of food is discarded every single year while 828 million people go hungry. In commercial kitchens and banquet halls, surplus cooked meals have a ticking countdown: usually less than 4 hours before microbial spoilage makes them unsafe.
  > 
  > When food expires, lives lose nourishment and donors fear liability.
  > 
  > Welcome to **NourishNet AI** — an enterprise-grade real-time food rescue platform built on **IBM LinuxONE** that turns perishable surplus into immediate human impact."

---

### 🎬 Part 2: The Architecture & 4 AI Engines (00:30 – 01:15)
* **Visual:** Screen switches to the Streamlit Home Page / Architecture diagram showing the 4 AI engines.
* **Speaker:**
  > "NourishNet AI solves this critical decision problem with four specialized AI engines:
  > 
  > 1. **Engine A: Spoilage Decay Predictor** — uses a modified Arrhenius kinetic formula incorporating real-time ambient temperature, humidity, and packaging to compute the dynamic safe window $t_{safe}$.
  > 2. **Engine B: Bipartite Matcher** — runs the Hungarian optimization algorithm across 5 weighted factors: urgency, capacity fit, community need, proximity, and dietary constraints, rejecting infeasible routes in sub-5ms latency.
  > 3. **Engine C: Explainable AI with TreeSHAP** — provides complete transparency with waterfall charts showing exactly *why* a particular shelter was selected.
  > 4. **Engine D: Cryptographic Chain-of-Custody** — creates immutable SHA-256 linked receipts safeguarding donors under Good Samaritan food donation laws."

---

### 🎬 Part 3: Live Walkthrough — From Surplus to Rescue (01:15 – 02:00)
* **Visual:** Screen switches to the live app (`localhost:8501`).
  1. Click **Donor Portal**: Fill out Taj Hotel Mumbai, Cooked Hot Meals, 25 kg, 35°C ambient temp.
  2. Watch the live **Arrhenius preview** badge turn **CRITICAL (< 60 min)**.
  3. Click **AI Dispatch Center**: Show the interactive Folium map with active donors (🔴) and NGOs (🟢).
  4. Click **Execute AI Match**: Show the match animation and latency badge: *"Matched in 2.9ms on IBM LinuxONE"*.
  5. Expand the match card: Show the **SHAP Waterfall Plot** explaining feature contributions (Urgency +97%, Proximity +68%).
* **Speaker:**
  > "Let's see it live. A banquet manager registers 25 kilos of hot meals. The engine instantly computes ambient thermal decay: 64 minutes remaining before unsafe bacterial proliferation.
  > 
  > In the AI Dispatch Center, we click 'Execute AI Match'. In just **2.9 milliseconds**, the Hungarian optimizer pairs the donor with Akshaya Patra just 5.1 kilometers away, with an ETA of 20 minutes — well inside the safety buffer.
  > 
  > Crucially, our TreeSHAP explainability engine generates an instant waterfall chart showing judges and coordinators exactly why this NGO was chosen: urgency and transit feasibility contributed over 85% to the decision."

---

### 🎬 Part 4: Cryptographic Audit & Liability Shield (02:00 – 02:30)
* **Visual:** Switch to **Audit Trail** page.
  1. Click *"Verify Chain Integrity"* — shows green checkmark `✅ Chain Valid: All records verified`.
  2. Click *"View Certificate"* — displays the official, styled HTML Food Rescue Certificate with SHA-256 hash and temperature chain metrics.
* **Speaker:**
  > "The biggest barrier to corporate food donation is legal liability. NourishNet AI introduces an immutable chain-of-custody. 
  > 
  > Every transaction records verified pickup and delivery temperatures into a SHA-256 cryptographic hash chain. With one click, auditors verify chain integrity.
  > 
  > The system automatically outputs a compliant Food Rescue Certificate proving the thermal chain remained unbroken, legally shielding donors under Safe Haven regulations."

---

### 🎬 Part 5: IBM LinuxONE Justification & Impact (02:30 – 03:00)
* **Visual:** Switch to **Impact Dashboard** (showing live ESG metrics: 160 kg rescued, 400 meals served, 400 kg CO₂ avoided) and final slide highlighting IBM LinuxONE.
* **Speaker:**
  > "Why IBM LinuxONE? Perishable food rescue is a mission-critical zero-downtime operation. LinuxONE's **99.999% availability** ensures food is never lost due to server outages. Its pervasive encryption secures sensitive community beneficiary data, and its **75% lower energy consumption** directly aligns with our environmental mission.
  > 
  > In this single demo session, NourishNet AI has orchestrated the rescue of 160 kg of food, delivering 400 hot meals and eliminating 400 kg of greenhouse gas emissions.
  > 
  > Real-time decisions. Proven food safety. Zero waste. That is NourishNet AI on IBM Z."

---

## 💡 Recording Tips
1. Use **OBS Studio** or Windows Game Bar (`Win + G`) to record.
2. Keep the backend running in a terminal so you can point out `uname -m` or the fast sub-5ms latency logs if asked.
3. Speak with confidence and clear pacing.
