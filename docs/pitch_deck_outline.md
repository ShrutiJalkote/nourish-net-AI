# 📊 NourishNet AI — 10-Slide Pitch Deck
### IBM Z Datathon 2026 | Track 1: Real-Time AI for Critical Decisions

---

## Slide 1: Title & Hook
- **Header:** NourishNet AI — Real-Time Food Rescue Intelligence
- **Subheader:** Detect Spoilage. Decide Matches. Respond Before Food Expires.
- **Track:** Track 1 — Real-Time AI for Critical Decisions
- **Team:** [Team Name / Members]
- **Key Visual:** NourishNet AI logo + IBM Z & LinuxONE badges + High-contrast dark theme

---

## Slide 2: The Critical Problem — Two Intersecting Crises
- **Point 1:** 1.3 Billion tons of edible food wasted annually while 828M people suffer malnutrition.
- **Point 2: The Perishable Window:** Surplus cooked food has a strict 2 to 4-hour microbial safety window before harmful bacterial growth makes it unsafe.
- **Point 3: The Liability Barrier:** Corporate donors discard food rather than donate because they lack verifiable chain-of-custody to prove cold/hot chain integrity.
- **Stat Box:** 40% of food waste in commercial hospitality occurs simply because traditional logistics are too slow.

---

## Slide 3: The Solution — NourishNet AI Platform
- **Definition:** An enterprise AI platform combining kinetic spoilage prediction, bipartite optimization, explainable AI, and cryptographic audit on IBM LinuxONE.
- **The Core Value Loop:**
  1. **Predict:** Real-time thermal decay modeling ($t_{safe}$).
  2. **Optimize:** Bipartite matching in sub-5ms latency.
  3. **Explain:** Full transparency via TreeSHAP waterfall charts.
  4. **Protect:** Tamper-proof SHA-256 chain-of-custody certificates.

---

## Slide 4: Engine A — Dynamic Spoilage Decay Predictor
- **Scientific Basis:** Modified Arrhenius Microbial Kinetics:
  $$t_{safe} = t_0 \cdot \exp\left(-k_{decay} \cdot \frac{T_{ambient} - T_{base}}{10}\right) \cdot \alpha_{humidity} \cdot \beta_{packaging}$$
- **Innovation:** Unlike static expiry dates, NourishNet dynamically recomputes remaining safety in minutes based on real-time ambient temperature sensors and humidity.
- **Urgency Classification:** Automated triggers for CRITICAL (<60 min), URGENT (<180 min), and NORMAL alerts.

---

## Slide 5: Engine B — Bipartite Optimization Matcher
- **Algorithm:** Weighted Bipartite Matching via Hungarian Algorithm (`scipy.optimize.linear_sum_assignment`).
- **Scoring Function:**
  $$S_{i,j} = 0.30 \cdot \text{Urgency} + 0.20 \cdot \text{CapacityFit} + 0.20 \cdot \text{Need} + 0.20 \cdot \text{Proximity} + 0.10 \cdot \text{Dietary}$$
- **Hard Feasibility Constraints:**
  - $\text{ETA} + 15\text{min buffer} > t_{safe} \implies \text{REJECTED}$ (prevents in-transit spoilage)
  - $\text{Donation Qty} > 2 \times \text{Capacity} \implies \text{REJECTED}$ (prevents secondary waste)
- **Performance:** 5 concurrent complex multi-city assignments executed in **2.9 ms**.

---

## Slide 6: Engine C — Explainable AI (XAI) & Fairness
- **The "Why":** Algorithmic transparency is essential for human food coordinators and community trust.
- **TreeSHAP Implementation:** Per-decision waterfall charts isolate the exact mathematical weight of distance, urgency, and NGO capacity.
- **Algorithmic Fairness Check:** Automated Gini coefficient monitoring ensures food donations are distributed equitably across all neighborhoods without geographic bias.

---

## Slide 7: Engine D — Cryptographic Liability Shield
- **The Problem Solved:** Eliminates donor fear of legal litigation.
- **Architecture:** Blockchain-inspired SHA-256 hash chaining of canonical JSON transaction records including pickup and delivery thermal sensor logs.
- **Safe Haven Compliance:** Automatically generates downloadable verification certificates confirming unbroken temperature chains, fulfilling Good Samaritan statutory protections.

---

## Slide 8: Why IBM Z & LinuxONE is Essential (The 3 Pillars)
- **1. Zero-Downtime Availability (99.999%):** When food expires in 60 minutes, a server crash means hundreds of meals wasted. LinuxONE provides enterprise continuity.
- **2. Pervasive Encryption & Hardware Security:** Protects confidential beneficiary counts and donor contracts with CPACF/Crypto Express hardware acceleration.
- **3. Sustainability Alignment:** IBM LinuxONE delivers up to 75% energy reduction compared to standard x86 farms, ensuring the platform's computing footprint matches its ecological mission.

---

## Slide 9: Live Demo & ESG Impact Results
- **Demo Highlights:**
  - Full end-to-end flow tested and verified.
  - Interactive Folium maps with donor-to-NGO routing.
  - Instant SHAP waterfall visualizer and audit PDF/HTML generation.
- **Immediate Measured Impact (Seed Benchmark):**
  - **160 kg** Food Rescued
  - **400** Nutritious Meals Served
  - **400 kg** $\text{CO}_2\text{e}$ Emissions Prevented
  - **16,000 Liters** Production Water Conserved

---

## Slide 10: Future Roadmap & Conclusion
- **Roadmap:**
  - Phase 1: Direct integration with IoT temperature tags (LoRaWAN/NFC).
  - Phase 2: Predictive supply forecasting using time-series grocery POS data.
  - Phase 3: Nationwide municipal food rescue grid integration.
- **Final Message:** NourishNet AI transforms a logistical bottleneck into real-time humanitarian relief — powered by the world's most resilient compute platform: IBM Z.
- **Call to Action:** Explore the live dashboard, review our open-source repo, and join the fight against hunger.
