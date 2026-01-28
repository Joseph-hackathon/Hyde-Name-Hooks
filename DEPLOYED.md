# 🎉 Hyde 컨트랙트 배포 완료!

## ✅ 배포된 컨트랙트

### Sepolia Testnet

| 컨트랙트 | 주소 |
|---------|------|
| **ENSContextRegistry** | `0x00427E39E353182d5595F8762Aa3559514615eCe` |
| **HydeHook** | `0x12a20919684Fe8C1625CCC816bD0e6801C49d371` |

**Deployer**: `0x110c6Eb93CD95b9b180220ae3796221D860309c7`  
**Balance**: 0.124 ETH

---

## 📋 다음 단계

### 1. Backend 설정 업데이트

파일: `c:\Users\PC_1M\Desktop\HNH Test\backend\.env`

```env
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/BU56jBVBvxunrNMtZ1KIY
BACKEND_PRIVATE_KEY=bb3e5f51dad7216718306f64830c862e78b83d50c1683d3dd25c603b0b270679
REGISTRY_CONTRACT_ADDRESS=0x00427E39E353182d5595F8762Aa3559514615eCe
HOOK_CONTRACT_ADDRESS=0x12a20919684Fe8C1625CCC816bD0e6801C49d371
FRONTEND_URL=http://localhost:5173
```

### 2. Frontend 설정 생성

파일: `c:\Users\PC_1M\Desktop\HNH Test\frontend\src\config\contracts.ts` (새로 생성)

```typescript
export const CONTRACTS = {
  registry: "0x00427E39E353182d5595F8762Aa3559514615eCe",
  hook: "0x12a20919684Fe8C1625CCC816bD0e6801C49d371",
  chainId: 11155111, // Sepolia
} as const;
```

---

## 🔍 Etherscan에서 확인

- [ENSContextRegistry](https://sepolia.etherscan.io/address/0x00427E39E353182d5595F8762Aa3559514615eCe)
- [HydeHook](https://sepolia.etherscan.io/address/0x12a20919684Fe8C1625CCC816bD0e6801C49d371)

---

## 🚀 백엔드 실행

```bash
# Backend .env 업데이트 후
cd backend
npm run dev
```

예상 출력:
```
🚀 Hyde Backend API
📡 Server running on http://localhost:3001
✅ Services initialized with contract: 0x00427E39E353182d5595F8762Aa3559514615eCe
```

---

## 📝 컨트랙트 검증 (선택사항)

Etherscan에 소스코드 검증:

```bash
cd contracts

# ENSContextRegistry 검증
npx hardhat verify --network sepolia 0x00427E39E353182d5595F8762Aa3559514615eCe "0x110c6Eb93CD95b9b180220ae3796221D860309c7"

# HydeHook 검증
npx hardhat verify --network sepolia 0x12a20919684Fe8C1625CCC816bD0e6801C49d371 0x00427E39E353182d5595F8762Aa3559514615eCe
```

---

## ✅ 체크리스트

- [x] 컨트랙트 Sepolia에 배포 완료
- [ ] backend/.env 업데이트
- [ ] frontend/src/config/contracts.ts 생성
- [ ] 백엔드 실행 테스트
- [ ] 프론트엔드 연동 테스트

---

## 🎯 테스트 방법

1. **백엔드 API 테스트**
   ```bash
   curl http://localhost:3001/api/health
   ```

2. **ENS 검증 테스트** (백엔드 실행 후)
   ```bash
   curl -X POST http://localhost:3001/api/verify-ens \
     -H "Content-Type: application/json" \
     -d '{"ensName":"vitalik.eth","address":"0x742d35Cc6634C0532925a3b844Bc454e4438f44e"}'
   ```

3. **프론트엔드 연결**
   - MetaMask에서 Sepolia 네트워크 선택
   - 프론트엔드 접속
   - ENS 검증 시도

---

배포 완료! 🎊
