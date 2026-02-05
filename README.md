# Hyde Name Hooks

## Overview

Hyde Name Hooks is a privacy-preserving Uniswap v4 Hook framework that enables **selective disclosure execution**.

By bridging the gap between decentralized identity (ENS) and private execution, Hyde allows users to prove their reputation and eligibility without revealing their full wallet history, balances, or precise trading strategies. This creates a new primitive in DeFi: **verifiable privacy with contextual trust**.

---

## Background & Vision

Hyde Name Hooks was born from the realization that transparency in DeFi, while foundational, has become a double-edged sword. As the ecosystem moves toward global financial infrastructure, the lack of selective privacy leads to:

- **Information Leakage**: Institutional and professional traders cannot execute strategies without tipping their hand.
- **Surveillance Risk**: Retail users are exposed to constant on-chain tracking and data harvesting.
- **Accountability Gaps**: Current "privacy" tools often prioritize total anonymity, which can lead to Sybil abuse and reduced protocol integrity.

Our vision is to make **privacy programmable**. Hyde ensures that privacy is not a binary choice but a spectrum gated by reputation and intent.

---

## Market Research & Macro Trends

The development of Hyde aligns with critical shifts in the Ethereum ecosystem for 2026:

### 1. Privacy as a Public Good
Ethereum’s roadmap increasingly treats privacy as a core requirement. Vitalik Buterin has emphasized the need for **privacy-preserving mechanisms with legitimacy**, where identity and privacy coexist.
- *Source: [Ethereum Roadmap — Privacy as a Public Good](https://ethereum.org/en/roadmap/privacy/)*

### 2. Programmable Identity & Trust
Major investors like **a16z Crypto** and **Coinbase Ventures** highlight that the next wave of DeFi will be built on "Trust Infrastructure." ENS is evolving from a mere domain system into a composable credential layer that anchors reputation on-chain.
- *Source: [a16z Crypto — Big Ideas for 2026](https://a16zcrypto.com/posts/article/big-ideas-things-excited-about-crypto-2026/)*

### 3. Execution Quality over Transparency
With Uniswap v4, the focus has shifted from simple liquidity to **customizable execution logic via Hooks**. The market is demanding hooks that reduce extractive dynamics like toast MEV and strategy leakage while maintaining verifiability.

---

## The Problem

Current DEX architectures face a fundamental friction:
- **Anyone can trade**, which invites Sybil-spam and toxic order flow.
- **Everyone can see everything**, which makes execution privacy impossible for serious players.
- **Privacy pools lack gating**, making them susceptible to abuse and regulatory scrutiny.

---

## The Solution: Selective Disclosure Execution

Hyde Name Hooks introduces two combined primitives that solve the "Privacy vs. Accountability" dilemma:

### 1. Context-Gated Privacy
Instead of allowing any address to enter a private pool, Hyde uses **ENS Reputation Tiers**. Only addresses with a proven history (reputation score ≥ X) are allowed to execute private swaps.

### 2. Selective Disclosure Proofs
Users prove they belong to a specific tier (Standard, Trusted, or Elite) without revealing their raw score, wallet balance, or identifying metadata. The pool knows you are "verified," but not "who" you are in detail.

---

## Key Features

- **🛡️ Selective Disclosure Privacy**: Prove eligibility without revealing raw data.
- **🆔 ENS Reputation Anchors**: Leverage human-readable names as programmable trust signals.
- **🤖 MEV Resistance**: Tier-based gating and hook-level cooldowns reduce sandwich attack surface.
- **🔄 Syncronized Settlement**: Integration with **Arc USDC** for post-swap payment-ready balances.
- **🏗️ Uniswap v4 Native**: Built directly on the most advanced liquidity primitive in DeFi.

---

## Technology Integration

### 🔹 ENS (Ethereum Name Service) & Context Scoring
Hyde leverages ENS as a programmable truth anchor. Our backend scoring engine computes a **Context Score (0-1000)** based on real-time on-chain signals:

- **Transaction History (0-300 pts)**: Weighted by TX count and ETH balance consistency.
- **Token Holdings (0-300 pts)**: Analyzes balances of key ecosystem tokens (USDC, WETH, etc.).
- **DeFi Activity (0-200 pts)**: Measures interaction frequency with major protocols.
- **DAO Participation (0-200 pts)**: Credits ENS name ownership and governance history.

**Tier Mapping:**
- 🏆 **Elite** (900+): Premium pools with lowest fees and best execution.
- 🎖️ **Trusted** (800-899): Privacy-enhanced execution for professional traders.
- 👤 **Standard** (<800): Baseline access for public liquidity pools.

**GitHub Code:**
- [ENS verification flow (frontend)](https://github.com/Joseph-hackathon/Hyde-Name-Hooks/blob/main/frontend/src/pages/VerifyPage.tsx)
- [ENS context scoring + ownership checks (backend)](https://github.com/Joseph-hackathon/Hyde-Name-Hooks/blob/main/backend/src/services/ensContextService.ts)
- [Verify + register API (backend)](https://github.com/Joseph-hackathon/Hyde-Name-Hooks/blob/main/backend/src/routes/api.ts)

### 🔹 Uniswap v4 Hooks (Execution Gating)
The `HydeHook` contract integrates directly into the Uniswap v4 lifecycle via the `beforeSwap` hook. Every swap request undergoes a multi-stage validation pipeline:

1. **Active Pool Check**: Ensures the specific pool ID is configured and active.
2. **Registration Verification**: Queries the `ENSContextRegistry` to confirm the user has a verified status.
3. **Tier Requirement Check**: Validates that the user's tier meets or exceeds the specific pool's requirement.
4. **Anti-Bot Cooldown**: Enforces a protocol-defined time interval between swaps to mitigate bot-driven MEV.

**GitHub Code:**
- [HydeHook gating logic (contracts)](https://github.com/Joseph-hackathon/Hyde-Name-Hooks/blob/main/contracts/src/HydeHook.sol)
- [Swap UI implementation (frontend)](https://github.com/Joseph-hackathon/Hyde-Name-Hooks/blob/main/frontend/src/pages/AppPage.tsx)

### 🔹 Arc & Circle (USDC Settlement Layer)
Hyde uses **Arc** as a high-fidelity settlement layer. When a swap output consists of USDC, Hyde triggers a settlement flow powered by **Circle’s Developer-Controlled Programmable Wallets (W3S)**:

- **Idempotent Settlement**: Each settlement is tracked via `idempotencyKey` to prevent double-spending.
- **Circle W3S Integration**: Uses Circle’s `transfer` API for secure, post-execution mobility.
- **Unified USDC Balance**: Through **Circle Gateway**, users maintain a cross-chain view of their settlement funds.

**GitHub Code:**
- [Arc settlement service (backend)](https://github.com/Joseph-hackathon/Hyde-Name-Hooks/blob/main/backend/src/services/arcSettlementService.ts)
- [Circle Gateway & Bridge services (backend)](https://github.com/Joseph-hackathon/Hyde-Name-Hooks/blob/main/backend/src/services/circleGatewayService.ts)
- [Settlement & Mobility API (backend)](https://github.com/Joseph-hackathon/Hyde-Name-Hooks/blob/main/backend/src/routes/api.ts)

---

## Deployment & Contract Addresses

The Hyde Name Hooks protocol is deployed on the following testnets:

| Network | ENSContextRegistry | HydeHook |
| :--- | :--- | :--- |
| **Sepolia** | `0x00427E39E353182d5595F8762Aa3559514615eCe` | `0x12a20919684Fe8C1625CCC816bD0e6801C49d371` |
| **Base Sepolia** | `0xb5f1772159bCe5f2137492bf6f68F83e4aA0B005` | `0x00427E39E353182d5595F8762Aa3559514615eCe` |
| **Unichain Sepolia** | `0xb5f1772159bCe5f2137492bf6f68F83e4aA0B005` | `0x00427E39E353182d5595F8762Aa3559514615eCe` |

---

## Use Cases

### 1. Professional LP Protection
Liquidity providers can create "Institutional Pools" where only "Trusted" tier traders can swap. This filters out bot-driven toxic flow and improves execution quality for real users.

### 2. Privacy-First Professional Trading
Hedge funds or large-scale traders can execute swaps without revealing their strategy to the public mempool, provided they maintain a high reputation score.

### 3. Sybil-Resistant Privacy Pools
Privacy pools often struggle with "Trash Traffic." By requiring an ENS name with a minimum age or activity score, Hyde ensures that participants are unique and reputable.

---

## Roadmap

### Phase 1: Foundation (Current)
- [x] Uniswap v4 Hook Prototype
- [x] ENS Context Gating Core
- [x] Arc USDC Settlement Integration

### Phase 2: Privacy Scaling
- [ ] Implementation of zk-SNARKs for tier proofs
- [ ] Integration with Circle Gateway for cross-chain USDC mobility
- [ ] Public Beta for "Trusted" tier pools

### Phase 3: Governance & Decentralization
- [ ] DAO-governed reputation scoring parameters
- [ ] Decentralized Oracle network for context calculation
- [ ] Expansion to Unichain and Base Mainnet

---

## License

Hyde Name Hooks is released under the **MIT License**.

---

## Contact

Built for the **HNH Hackathon** — *Selective Disclosure Execution Privacy.*
