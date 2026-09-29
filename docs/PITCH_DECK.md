# 📊 SensorNet — Pitch Deck (10-Slide Hackathon Presentation)

## Slide 1: Cover
* **Title:** SensorNet — Mobile DePIN for Solana Seeker
* **Tagline:** Turning every smartphone step into high-fidelity physical world intelligence.
* **Category:** Mobile DePIN / Solana dApp Store
* **Event:** Clock In — Solana Mobile Hackathon 2026
* **Website:** https://sensornet.network | **GitHub:** github.com/Alicepoltora/sensornet-depin

---

## Slide 2: The Problem
* **Telcos & Smart Cities fly blind:**
  * Telecom carriers spend billions on dedicated "drive-test" vans to measure cellular dead zones, 5G signal degradation, and Wi-Fi interference.
  * Municipalities inspect roads manually, missing 80% of potholes until costly pavement failure occurs.
* **Existing DePIN hardware is clunky and expensive:**
  * Dedicated hardware hotspots ($300 - $1,000) require home setup, antennas, and static placement.
  * The average person doesn't buy a dedicated IoT antenna, but **everyone carries a pocket supercomputer** with cellular radios, IMU accelerometers, and GPS: the **Solana Seeker**.

---

## Slide 3: The Solution — SensorNet
* **Passive, zero-friction mobile DePIN:**
  * Users install the SensorNet APK from the Solana dApp Store.
  * Runs quietly in the background as a battery-efficient foreground service.
  * Measures 3 critical physical data vectors continuously:
    1. **5G/LTE Cellular Coverage & Dead Zones** (RSRP, RSRQ, dBm).
    2. **Public Wi-Fi Density & Frequency Congestion** (Salted SHA-256).
    3. **Road Quality & Pavement Roughness** (Accelerometer Z-axis IRI Index).
  * Automatically earns daily **$SNTR** micro-rewards settled on Solana.

---

## Slide 4: Product Experience & Mobile-First UX
* **Sleek Cyberpunk Interface:** Styled with Dark Obsidian, Neon Emerald, and Cyan accents matching Seeker's hardware personality.
* **Interactive Hex Map:** Visualizes real-time coverage heatmaps across city blocks using Uber H3 hexagonal spatial binning.
* **Seed Vault & MWA 2.0 Integration:** Instant, biometric-approved transaction signing from Seeker's secure enclave with zero private key exposure.

---

## Slide 5: Cryptography & Privacy by Design
* **Zero Location Tracking:** We do **not** record user trajectories or movement paths.
* **Spatial Hex Binning (H3 Res 8):** Data points are quantized into discrete ~460m hexagonal cells.
* **Rotating Daily Salt:** All Wi-Fi BSSID and SSID identifiers are irreversibly hashed, protecting home and private networks while proving network density.

---

## Slide 6: Tokenomics & Economic Flywheel
* **Dual-Token Model:**
  * **$SNTR (Utility & Micro-Reward):** Minted per verified spatial tile mapped. Burned by telecom enterprises and smart city planners purchasing coverage API access.
  * **$SKR Staking Multipliers (Radiants Partnership):**
    * Tier 1 (1,000 SKR) $\rightarrow$ **+25% Multiplier (1.25x)**
    * Tier 2 (5,000 SKR) $\rightarrow$ **+50% Multiplier (1.50x)**
    * Tier 3 (20,000 SKR) $\rightarrow$ **+100% Multiplier (2.00x)**
  * **Seeker Hardware Innate Boost:** Seed Vault attested devices receive a permanent **+20% bonus**.

---

## Slide 7: ORE Protocol Anti-Sybil Integration
* **Matched Prize Bounty Feature:**
* SensorNet integrates lightweight background Proof-of-Work hash verification using the ORE protocol.
* When the Seeker phone is charging overnight or on idle, it solves micro-PoW challenges.
* **Double Benefit:** Eliminates spoofed emulator bot farms (Sybil resistance) while distributing additional ORE rewards to active contributors.

---

## Slide 8: Market Opportunity & Enterprise Data Buyers
* **Global Telecom Network Optimization Market:** $8.2 Billion
* **Civic Infrastructure & Pavement Maintenance:** $14.5 Billion
* **Customers:**
  * Mobile Virtual Network Operators (MVNOs) and 5G Carriers optimizing cell tower placement.
  * Autonomous Vehicle & Navigation mapping companies seeking real-time road surface roughness.
  * Smart City municipal road repair crews targeting potholes proactively.

---

## Slide 9: Traction & Hackathon Milestones
* **Native Android Engine:** 100% completed Kotlin background service, telephony listeners, and IMU peak filter.
* **Solana Anchor Program:** Deployed on Devnet (`SensNet111111...`), supporting batch verification, $SKR staking, and ORE PoW verification.
* **MWA 2.0 Ready:** Verified compatibility with Phantom, Solflare, and Seeker Seed Vault.
* **Solana dApp Store Launch Plan:** Submission scheduled within 30 days post-hackathon.

---

## Slide 10: The Team & Vision
* **Vision:** The world's largest crowd-sourced physical telecommunications and infrastructure dataset, governed and rewarded on Solana.
* **Built by:** Autonomous DePIN & Mobile Web3 Engineers.
* **Call to Action:** Download the APK, install on Seeker, and start clocking in physical observations today!
