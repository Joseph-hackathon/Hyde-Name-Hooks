# Hyde-Name-Hooks

Hyde enables selective-disclosure execution privacy for DEX trading by gating access with ENS context tiers and a Uniswap v4 hook.

**Core concept:** _Hide the trade. Anchor the name._

## Background & Market Research

We referenced the ENS and Uniswap ecosystems to define the UX pattern, naming layer, and swap execution surface:
- [ENS main site](https://ens.domains/) and the [ENS Manager (Sepolia)](https://sepolia.app.ens.domains/) for the profile UX and context framing.
- [ENS documentation](https://docs.ens.domains/) for reverse resolution and name ownership flow.
- [Uniswap v4](https://docs.uniswap.org/contracts/v4/overview) and [v4 Hooks](https://docs.uniswap.org/contracts/v4/concepts/hooks) to validate the hook-based gating model.

## Problem

DEX swaps expose user intent and history, enabling MEV and copy-trading. At the same time, most privacy tools are UX-heavy and break composability. Users need a way to prove eligibility (e.g., reputation, activity tier) without revealing raw scores or wallet history.

## Solution

Hyde uses ENS-linked context tiers to enable selective disclosure. Users prove they are Standard/Trusted/Elite via on-chain registration without exposing the underlying scoring data. A Uniswap v4 hook enforces tier gating and cooldowns at execution time.

## Key Features

- **Selective disclosure tiering** (Standard/Trusted/Elite)
- **ENS-backed identity anchoring**
- **On-chain registry + hook gating**
- **Privacy-focused swap experience**
- **Multi-chain readiness** (Sepolia, Base Sepolia, Unichain Sepolia)

## Platform Architecture

```
┌─────────────┐
│  Frontend   │ ← React + TypeScript UI
└─────┬───────┘
      │
      ├─────────────────┐
      │                 │
┌─────▼──────┐   ┌─────▼──────────┐
│  Backend   │   │ Smart Contract │
│   API      │   │ (Registry/Hook)│
│            │   │                │
│ • ENS      │   │ • ENS Registry │
│   Scoring  │   │ • Hyde Hook    │
│ • Tier     │   └────────────────┘
│   Calc     │
└────────────┘
```

## User Flow

1. Connect wallet and enter ENS name.
2. Backend verifies ENS ownership and computes score breakdown.
3. Tier is registered on-chain in `ENSContextRegistry`.
4. User swaps through UI; hook enforces tier + cooldown rules.

## ENS Integration

- ENS ownership is verified via on-chain reverse resolution.
- ENS name is hashed and stored on-chain (selective disclosure).
- Tier is stored in `ENSContextRegistry` and used for gating.

## Uniswap Integration

Hyde integrates as a Uniswap v4 hook that runs in the swap lifecycle:
- **beforeSwap**: checks registry tier and cooldown
- **afterSwap**: reserved for post-swap privacy signals

References:
- [Uniswap v4 overview](https://docs.uniswap.org/contracts/v4/overview)
- [Hooks concept](https://docs.uniswap.org/contracts/v4/concepts/hooks)

## Components

### 1. Frontend (`/frontend`)
- React + TypeScript + TailwindCSS
- Wallet connection (wagmi + viem)
- ENS verification flow and tier UI
- Privacy-aware swap interface

### 2. Smart Contracts (`/contracts`)
- **ENSContextRegistry**: tier storage with selective disclosure
- **HydeHook**: v4 hook for tier-gated execution
- Hardhat development environment

### 3. Backend API (`/backend`)
- Express + TypeScript
- ENS context scoring (0-1000 points)
- Contract interaction layer
- RESTful API for frontend

## Quick Start

### Prerequisites
- Node.js 18+
- MetaMask or compatible wallet
- Alchemy/Infura API key (for ENS data)

### 1. Install Dependencies

```bash
# Frontend
cd frontend
npm install

# Contracts
cd ../contracts
npm install

# Backend
cd ../backend
npm install
```

### 2. Deploy Contracts

```bash
cd contracts

# Start local Hardhat node
npx hardhat node

# Deploy (in another terminal)
npm run deploy:local
```

Copy the deployed contract addresses.

### 3. Configure Backend

```bash
cd backend
cp .env.example .env
```

Edit `.env`:
```env
PORT=3001
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY
REGISTRY_CONTRACT_ADDRESS=<from deployment>
BACKEND_PRIVATE_KEY=<your backend wallet>
FRONTEND_URL=http://localhost:5173
```

Start backend:
```bash
npm run dev
```

### 4. Run Frontend

```bash
cd frontend
npm run dev
```

Visit `http://localhost:5173`

## Features

### ✨ Selective Disclosure
- Prove tier (Standard/Trusted/Elite) without revealing exact score
- On-chain context tied to ENS names
- Privacy-preserving event logs

### 🔐 Tier-Based Access
- **Standard** (0-799): Open pools
- **Trusted** (800-899): Privacy-enhanced pools
- **Elite** (900-1000): Premium pools with best execution

### 🎯 ENS Context Scoring
Factors (0-1000 points):
1. Transaction history (0-300)
2. Token holdings (0-300)
3. DeFi activity (0-200)
4. DAO participation (0-200)

### 🛡️ MEV Protection
- Tier gating reduces sandwich attacks
- Cooldown mechanisms prevent bot abuse
- Execution privacy via Hook layer

## Project Structure

```
HNH Test/
├── frontend/          # React app
│   ├── src/
│   │   ├── pages/     # LandingPage, VerifyPage, etc.
│   │   ├── components/
│   │   └── contexts/
│   └── package.json
│
├── contracts/         # Solidity contracts
│   ├── src/
│   │   ├── ENSContextRegistry.sol
│   │   └── HydeHook.sol
│   ├── test/
│   └── scripts/
│
└── backend/           # Express API
    ├── src/
    │   ├── services/  # ENS scoring, contract calls
    │   ├── routes/    # API endpoints
    │   └── index.ts
    └── package.json
```

## Testing

### Smart Contracts
```bash
cd contracts
npx hardhat test
npx hardhat coverage
```

### Backend
```bash
cd backend
npm test
```

### Frontend
```bash
cd frontend
npm test
```

## Deployment

### Testnet (Sepolia)
```bash
cd contracts
npm run deploy:sepolia
```

### Backend
```bash
cd backend
npm run build
npm start
```

### Frontend
```bash
cd frontend
npm run build
# Deploy /dist to Vercel, Netlify, etc.
```

## Security Considerations

- ✅ Tier storage uses hashed ENS names for privacy
- ✅ Only backend oracle can update tiers
- ✅ Cooldown periods prevent abuse
- ✅ No raw scores exposed in UI or events
- ⚠️ Backend private key must be secured
- ⚠️ Oracle centralization (future: decentralize via DAO)

## Roadmap

- [ ] Deploy to Sepolia testnet
- [ ] Complete Uniswap v4 Hook integration
- [ ] Implement zkProofs for tier verification
- [ ] Add liquidity incentives for privacy pools
- [ ] DAO governance for tier thresholds
- [ ] Mainnet launch

## License

MIT

## Contact

Built for the HNH Hackathon - Selective Disclosure Execution Privacy
