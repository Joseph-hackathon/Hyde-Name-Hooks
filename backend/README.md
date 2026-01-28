# Hyde - Backend API

Backend service for ENS context scoring and tier management.

## Features

- 🔍 **ENS Context Scoring**: Analyze on-chain activity to calculate user tiers
- 🔐 **Selective Disclosure**: Only expose tier levels, never raw scores
- 📊 **Multi-Factor Analysis**: Transaction history, token holdings, DeFi activity, DAO participation
- ⛓️ **On-Chain Integration**: Direct interaction with ENSContextRegistry contract

## API Endpoints

### POST /api/verify-ens
Verify ENS ownership and register context

**Request:**
```json
{
  "ensName": "vitalik.eth",
  "address": "0x742d35Cc6634C0532925a3b844Bc454e4438f44e"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "ensName": "vitalik.eth",
    "address": "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
    "tier": 2,
    "tierName": "Elite",
    "txHash": "0x..."
  }
}
```

### GET /api/context-score/:address
Get context tier for an address

**Response:**
```json
{
  "success": true,
  "data": {
    "address": "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
    "tier": 2,
    "tierName": "Elite"
  }
}
```

### GET /api/tier/:address
Get tier from on-chain registry

### GET /api/check-access/:address/:minTier
Check if user meets minimum tier requirement

### GET /api/health
Health check endpoint

## Setup

```bash
# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your values

# Run development server
npm run dev

# Build for production
npm run build

# Run production server
npm start
```

## Environment Variables

```env
PORT=3001
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY
REGISTRY_CONTRACT_ADDRESS=0x...
BACKEND_PRIVATE_KEY=your_backend_wallet_private_key
FRONTEND_URL=http://localhost:5173
```

## Context Scoring Algorithm

**Total Score: 0-1000 points**

1. **Transaction History** (0-300 points)
   - Transaction count
   - ETH balance
   
2. **Token Holdings** (0-300 points)
   - ERC20 diversity
   - Blue-chip holdings

3. **DeFi Activity** (0-200 points)
   - DEX interactions
   - Lending protocol usage

4. **DAO Participation** (0-200 points)
   - ENS ownership
   - Governance activity

**Tier Mapping:**
- 0-799: Standard
- 800-899: Trusted
- 900-1000: Elite

## Development

```bash
# Run in development mode with auto-reload
npm run dev

# Test API endpoints
curl http://localhost:3001/api/health
```

## License

MIT
