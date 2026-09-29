# 📜 SensorNet Protocol & Telemetry Specification

## 1. Mathematical Model for Spatial Quantization
SensorNet eliminates user location tracking by binning all observations into **Uber H3 Resolution 8** hexagonal cells.
An H3 Resolution 8 hexagon has an average area of approximately $0.737 \text{ km}^2$ and an edge length of $\sim 461 \text{ meters}$.

$$
\text{Observation} = \{ \text{H3Index}, \mathcal{H}(\text{BSSID} \parallel \text{Salt}), \text{RSRP}_{\text{avg}}, \text{IRI}_{\text{rms}}, \text{Timestamp} \}
$$

Where:
* $\mathcal{H}(x)$ is SHA-256 truncated to 64 bits.
* $\text{Salt} = \text{DateEpoch} \parallel \text{DomainKey}$, rotated daily at 00:00 UTC.
* $\text{IRI}_{\text{rms}}$ is the dynamic road vibration computed from the linear accelerometer:

$$
\text{RMS} = \sqrt{\frac{1}{N} \sum_{i=1}^N (a_z[i] - g)^2}
$$

$$
\text{IRI} = \min\left(10.0, \, 1.0 + \frac{\text{RMS}}{4.0} \times 9.0\right)
$$

---

## 2. On-Chain Reward Multiplier Formulation

The total rewards credited to a device account per submitted observation batch is governed by:

$$
\mathcal{R}_{\text{batch}} = N_{\text{tiles}} \times \mathcal{R}_{\text{base}} \times \left( \frac{\mathcal{M}_{\text{hardware}} + \mathcal{M}_{\text{streak}} + \mathcal{M}_{\text{SKR}} + \mathcal{M}_{\text{ORE}}}{10000} \right)
$$

Where:
* $\mathcal{R}_{\text{base}} = 1.0 \text{ \$SNTR}$
* $\mathcal{M}_{\text{hardware}} = 12000$ (1.20x for Solana Seeker Seed Vault verified devices)
* $\mathcal{M}_{\text{streak}} = \min(3000, \, \text{StreakDays} \times 200)$ (up to +30% for 15-day streak)
* $\mathcal{M}_{\text{SKR}} = \begin{cases} 10000 & \text{if } \text{StakedSKR} \ge 20,000 \\ 5000 & \text{if } \text{StakedSKR} \ge 5,000 \\ 2500 & \text{if } \text{StakedSKR} \ge 1,000 \\ 0 & \text{otherwise} \end{cases}$
* $\mathcal{M}_{\text{ORE}} = 500$ (if valid ORE proof-of-work solution is submitted in current epoch)
