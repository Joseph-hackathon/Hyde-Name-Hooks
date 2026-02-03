# Hyde - Smart Contracts

Solidity smart contracts for Hyde's Selective Disclosure Execution Privacy platform.

## Contracts

### ENSContextRegistry.sol
- Stores ENS tier information with selective disclosure
- Only stores tier (0-2), not raw scores for privacy
- Backend oracle updates tiers based on context calculation
- Supports tier-based access control

### HydeHook.sol
- Uniswap v4 Hook for privacy-enhanced execution
- Enforces tier requirements before swaps
- Implements cooldown mechanisms for anti-bot protection
- Pool-specific configuration

## Setup

```bash
# Install dependencies
npm install

# Compile contracts
npm run compile

# Run tests
npm test
```

## Environment Variables

Create a `.env` file:

```env
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY
PRIVATE_KEY=your_private_key_here
```

## Architecture

```
User → Frontend → Backend API → ENSContextRegistry
                                      ↓
User → Frontend → HydeHook (beforeSwap) → Check Tier → Allow/Deny
```

## Testing

```bash
# Run all tests
npx hardhat test

# Run with gas reporting
REPORT_GAS=true npx hardhat test

# Run coverage
npx hardhat coverage
```

## License

MIT
