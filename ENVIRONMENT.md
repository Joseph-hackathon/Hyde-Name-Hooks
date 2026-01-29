# Chain-specific environment format

Use this as a reference for configuring per-chain values. The backend currently
uses a single active RPC and registry address at runtime, so pick one chain per
backend instance. Frontend can stay chain-agnostic and only needs the API base.

## Backend (Railway)
```
PORT=3001
FRONTEND_URL=https://your-frontend.vercel.app
BACKEND_PRIVATE_KEY=0x...

# Active chain (choose one)
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY
REGISTRY_CONTRACT_ADDRESS=0x...
HOOK_CONTRACT_ADDRESS=0x...

# Optional: additional chain RPCs for future expansion
BASE_SEPOLIA_RPC_URL=https://base-sepolia.g.alchemy.com/v2/YOUR_KEY
UNICHAIN_SEPOLIA_RPC_URL=https://unichain-sepolia.g.alchemy.com/v2/YOUR_KEY
```

## Frontend (Vercel)
```
VITE_API_URL=https://your-railway-backend.up.railway.app
```

## Chain registry references
```
SEPOLIA_REGISTRY=0x00427E39E353182d5595F8762Aa3559514615eCe
SEPOLIA_HOOK=0x12a20919684Fe8C1625CCC816bD0e6801C49d371

BASE_SEPOLIA_REGISTRY=0xb5f1772159bCe5f2137492bf6f68F83e4aA0B005
BASE_SEPOLIA_HOOK=0x00427E39E353182d5595F8762Aa3559514615eCe

UNICHAIN_SEPOLIA_REGISTRY=0xb5f1772159bCe5f2137492bf6f68F83e4aA0B005
UNICHAIN_SEPOLIA_HOOK=0x00427E39E353182d5595F8762Aa3559514615eCe
```
