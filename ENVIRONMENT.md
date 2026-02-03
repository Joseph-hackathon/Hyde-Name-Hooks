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

# Arc settlement (testnet)
ARC_NETWORK=arc-testnet
ARC_SETTLEMENT_MODE=mock
CIRCLE_API_BASE=https://api.circle.com
CIRCLE_API_KEY=your_circle_test_api_key
CIRCLE_WALLET_ID=your_circle_wallet_id
CIRCLE_ENTITY_SECRET_CIPHERTEXT=your_entity_secret_ciphertext
CIRCLE_ENTITY_SECRET=your_entity_secret
CIRCLE_RECOVERY_FILE_PATH=./circle-recovery.json
CIRCLE_WALLET_SET_NAME=Hyde Arc WalletSet
CIRCLE_WALLET_ACCOUNT_TYPE=EOA
CIRCLE_WALLET_BLOCKCHAINS=ARC-TESTNET
CIRCLE_WALLET_COUNT=1
ARC_USDC_TOKEN_ADDRESS=your_arc_testnet_usdc_token_address
ARC_BLOCKCHAIN=ARC-TESTNET
ARC_TRANSFER_FEE_LEVEL=MEDIUM

# Circle Gateway (optional)
CIRCLE_GATEWAY_API_BASE=https://gateway-api-testnet.circle.com/v1

# Optional: additional chain RPCs for future expansion
BASE_SEPOLIA_RPC_URL=https://base-sepolia.g.alchemy.com/v2/YOUR_KEY
UNICHAIN_SEPOLIA_RPC_URL=https://unichain-sepolia.g.alchemy.com/v2/YOUR_KEY
```

## Frontend (Vercel)
```
VITE_API_URL=https://your-railway-backend.up.railway.app
VITE_ARC_EXPLORER_BASE=https://testnet.arcscan.app
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
