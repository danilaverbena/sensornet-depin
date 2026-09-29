# 🎬 SensorNet — 3-Minute Demo Video Script

**Title:** SensorNet: Crowd-sourced Mobile DePIN on Solana Seeker  
**Length:** 2 minutes 50 seconds (Meets the strict 3-minute hackathon limit)  
**Target Audience:** Clock In Hackathon Judges, Anatoly Yakovenko, RadiantsDAO, Solana Mobile Community.

---

### [0:00 - 0:30] Hook & Introduction
* **Visual:** Close-up of Solana Seeker smartphone booting into the SensorNet mobile application with cyberpunk neon-green HUD.
* **Speaker:** "Hi everyone! This is **SensorNet**, the first crowd-sourced mobile DePIN built specifically for the Solana Seeker smartphone.
Every day, telecom carriers and city planners spend billions trying to understand where mobile coverage drops and where roads are falling apart. But the sensors needed to map this already exist inside every pocket. With SensorNet, simply carrying your Seeker maps cellular quality, Wi-Fi density, and road surface vibration in real-time, streaming on-chain micro-rewards directly into your wallet."

---

### [0:30 - 1:15] Live Mobile App & Sensor Telemetry
* **Visual:** Screen recording of the **Dashboard Screen**. The toggle switch flips to "DEPIN TELEMETRY ACTIVE". Numbers animate.
* **Speaker:** "Let's take a look inside the app.
SensorNet runs as a battery-efficient Android foreground service. Notice our live hardware monitors:
1. **Cellular Radio:** It captures carrier data, network type (5G/LTE), and precise signal strength in dBm.
2. **Wi-Fi Mesh:** It maps surrounding node density. To protect user privacy, MAC addresses are hashed with a daily cryptographic salt — completely irreversible.
3. **Road Roughness Index:** Using the Seeker's internal accelerometer, our peak detection algorithm isolates high-frequency road vibrations and pothole impacts, grading pavement quality from smooth to severe.
All observations are quantized into **Uber H3 hexagonal tiles**, meaning your private routes are never recorded."

---

### [1:15 - 1:55] Seed Vault, MWA & $SKR Staking
* **Visual:** Switching to the **Boost & SKR Screen**. User types in 5,000 $SKR and presses "STAKE". Mobile Wallet Adapter bottom sheet opens with Seed Vault confirmation.
* **Speaker:** "Under the hood, SensorNet integrates the **Solana Mobile Stack (SMS)** and **Mobile Wallet Adapter 2.0**.
To give our Seeker community an unfair advantage, physical Seeker devices receive an innate **+20% hardware multiplier**.
Furthermore, we've integrated **$SKR token staking**: users can stake their Radiants $SKR to level up from Bronze to Gold tiers, unlocking up to a 2.0x reward multiplier.
Additionally, when plugged in overnight, the app runs background **ORE Proof-of-Work verifiers**, eliminating sybil emulator attacks while earning additional yield."

---

### [1:55 - 2:30] Interactive Hex Map & Claiming Earnings
* **Visual:** Navigating to the Hex Map showing colored tiles across San Francisco. Then opening the **Earnings Screen** and tapping "CLAIM VIA SEED VAULT".
* **Speaker:** "Here is our live Hexagonal Coverage Map. Green tiles represent strong 5G connectivity, yellow represents moderate 4G, and red highlights dead zones. City road crews can also toggle to the Pavement IRI layer to immediately see street damage.
When you're ready to collect your earnings, head to the Earnings tab. One tap triggers a Seed Vault hardware signature, transferring accrued $SNTR tokens directly from our Anchor on-chain reward vault to your address."

---

### [2:30 - 2:50] Conclusion & Call to Action
* **Visual:** Return to hero screen with daily streak flame (🔥 7 Days).
* **Speaker:** "With daily streaks driving retention and habit formation, SensorNet turns routine commutes into a global physical intelligence layer.
Built with native Android Kotlin, React Native, Anchor, and Solana Mobile Stack.
Thank you, and clock in to the future of mobile DePIN with SensorNet!"
