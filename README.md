# Hyde-Name-Hooks

# Hyde - Selective Disclosure Execution Privacy

Privacy-enhanced DEX execution on Uniswap v4 using ENS context-gated access.

## Overview

**Hyde** implements selective disclosure for DeFi trading. Users prove their tier eligibility without revealing transaction history or exact scores.

**Core Concept:** "Hide the trade. Anchor the name."

## Architecture

```
┌─────────────┐
│  Frontend   │ ← User Interface (React + TypeScript)
└─────┬───────┘
      │
      ├─────────────────┐
      │                 │
┌─────▼──────┐   ┌─────▼──────────┐
│  Backend   │   │ Smart Contract │
│   API      │   │   (Sepolia)    │
│            │   │                │
│ • ENS      │   │ • Registry     │
│   Scoring  │   │ • Hook         │
│ • Tier     │   └────────────────┘
│   Calc     │
└────────────┘
```

## Components

### 1. Frontend (`/frontend`)
- React + TypeScript + TailwindCSS
- Wallet connection (wagmi + viem)
- ENS verification flow
- Privacy-aware swap interface

### 2. Smart Contracts (`/contracts`)
- **ENSContextRegistry**: Tier storage with selective disclosure
- **HydeHook**: Uniswap v4 Hook for tier-gated execution
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
>>>>>>> 8d5f7c8 (feat: Complete Hyde implementation with smart contracts and backend API)
