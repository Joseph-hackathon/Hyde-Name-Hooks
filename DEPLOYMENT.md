# Hyde 배포 가이드

## 🚀 배포 준비

### 1. RPC URL 받기

**Alchemy 사용 (추천)**:
1. [Alchemy](https://www.alchemy.com/) 가입
2. "Create App" → Network: Ethereum Sepolia
3. API Key 복사

**또는 Infura**:
1. [Infura](https://www.infura.io/) 가입
2. Project 생성 → Sepolia endpoint 복사

### 2. 지갑에 테스트넷 ETH 받기

**지갑 주소**: `0x110c6Eb93CD95b9b180220ae3796221D860309c7`

**Sepolia Faucet** (중 하나 선택):
- https://sepoliafaucet.com/
- https://www.alchemy.com/faucets/ethereum-sepolia
- https://faucet.quicknode.com/ethereum/sepolia

필요한 ETH: 약 0.05 ETH (배포 + 테스트)

---

## 📝 Step 1: contracts/.env 설정

파일: `c:\Users\PC_1M\Desktop\HNH Test\contracts\.env`

이미 생성되어 있습니다. **RPC URL만 업데이트하세요**:

```env
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_ALCHEMY_API_KEY
PRIVATE_KEY=bb3e5f51dad7216718306f64830c862e78b83d50c1683d3dd25c603b0b270679
```

---

## 🔨 Step 2: 로컬 테스트 배포 (선택사항)

로컬에서 먼저 테스트해볼 수 있습니다:

```bash
cd contracts

# Terminal 1: Hardhat 로컬 노드 시작
npx hardhat node

# Terminal 2: 로컬에 배포
npm run deploy:local
```

성공하면 컨트랙트 주소가 출력됩니다.

---

## 🌐 Step 3: Sepolia 테스트넷 배포

### 배포 명령어

```bash
cd contracts
npm run deploy:sepolia
```

### 예상 출력

```
🚀 Deploying Hyde Contracts...

Deploying contracts with account: 0x110c6Eb93CD95b9b180220ae3796221D860309c7
Account balance: 50000000000000000

📝 Deploying ENSContextRegistry...
✅ ENSContextRegistry deployed to: 0xAbC123...

📝 Deploying HydeHook...
✅ HydeHook deployed to: 0xDeF456...

⚙️  Configuring sample pool...
✅ Sample pool configured (ETH-USDC, Tier: Trusted, Cooldown: 5min)

📄 Deployment Summary:
{
  "network": "sepolia",
  "chainId": 11155111,
  "deployer": "0x110c6Eb93CD95b9b180220ae3796221D860309c7",
  "contracts": {
    "ENSContextRegistry": "0xAbC123...",
    "HydeHook": "0xDeF456..."
  },
  "samplePools": {
    "ETH-USDC": "0x..."
  },
  "timestamp": "2026-01-28T..."
}

✨ Deployment complete!
```

---

## 📋 Step 4: 배포된 주소 저장

배포 후 출력된 주소를 복사하여:

### 4.1 Backend .env 업데이트

파일: `c:\Users\PC_1M\Desktop\HNH Test\backend\.env`

```env
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY
BACKEND_PRIVATE_KEY=bb3e5f51dad7216718306f64830c862e78b83d50c1683d3dd25c603b0b270679
REGISTRY_CONTRACT_ADDRESS=0xAbC123...  # 여기에 Registry 주소
HOOK_CONTRACT_ADDRESS=0xDeF456...      # 여기에 Hook 주소
FRONTEND_URL=http://localhost:5173
```

### 4.2 Frontend 설정 파일 생성

파일: `c:\Users\PC_1M\Desktop\HNH Test\frontend\src\config\contracts.ts`

```typescript
export const CONTRACTS = {
  registry: "0xAbC123...", // ENSContextRegistry 주소
  hook: "0xDeF456...",     // HydeHook 주소
  chainId: 11155111,       // Sepolia
};
```

---

## ✅ Step 5: 배포 확인

### Etherscan에서 확인

1. [Sepolia Etherscan](https://sepolia.etherscan.io/) 접속
2. 컨트랙트 주소 검색
3. 트랜잭션 확인

### 컨트랙트 검증 (선택사항)

```bash
npx hardhat verify --network sepolia <REGISTRY_ADDRESS> "0x110c6Eb93CD95b9b180220ae3796221D860309c7"
npx hardhat verify --network sepolia <HOOK_ADDRESS> <REGISTRY_ADDRESS>
```

---

## 🚀 Step 6: 백엔드 시작

```bash
cd backend
npm install  # 아직 안 했다면
npm run dev
```

출력:
```
🚀 Hyde Backend API
📡 Server running on http://localhost:3001
✅ Services initialized with contract: 0xAbC123...
```

---

## 🎨 Step 7: 프론트엔드 연결

### Frontend config 파일 생성 필요

프론트엔드가 컨트랙트와 통신하려면 설정이 필요합니다.
다음 단계에서 프론트엔드 통합을 진행할 수 있습니다.

---

## 🔐 보안 주의사항

> ⚠️ **중요**: 제공하신 프라이빗 키는 공개되었습니다!
> 
> - 이 키는 **테스트 전용**으로만 사용하세요
> - 절대 메인넷에서 사용하지 마세요
> - 실제 자금을 이 주소로 보내지 마세요
> - 프로덕션 배포 시 새로운 키를 생성하세요

---

## 📊 배포 체크리스트

- [ ] Sepolia testnet ETH 받음 (0.05 ETH)
- [ ] Alchemy/Infura API Key 받음
- [ ] contracts/.env 설정 완료
- [ ] `npm run deploy:sepolia` 실행
- [ ] 배포 성공 확인
- [ ] 컨트랙트 주소 복사
- [ ] backend/.env에 주소 업데이트
- [ ] Backend 실행 확인 (`npm run dev`)
- [ ] Etherscan에서 컨트랙트 확인

---

## 🆘 문제 해결

### "Insufficient funds" 에러

→ 지갑에 Sepolia ETH가 충분한지 확인하세요. Faucet에서 더 받으세요.

### "network does not support ENS" 에러

→ SEPOLIA_RPC_URL이 올바른지 확인하세요.

### "nonce too low" 에러

```bash
# Hardhat 캐시 삭제
rm -rf cache artifacts
npx hardhat clean
```

---

## 다음 단계

1. ✅ 컨트랙트 배포 완료
2. ✅ 백엔드 실행
3. ⏳ 프론트엔드 연동 (다음 단계)
4. ⏳ End-to-end 테스트

배포가 완료되면 알려주세요!
