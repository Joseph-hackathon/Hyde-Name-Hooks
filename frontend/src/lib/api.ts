const rawBase = import.meta.env.VITE_API_URL || 'http://localhost:3001';
const API_BASE = rawBase.startsWith('http://') || rawBase.startsWith('https://')
  ? rawBase
  : `https://${rawBase}`;

type ApiSuccess<T> = {
  success: true;
  data: T;
};

type ApiError = {
  error: string;
};

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const normalizedBase = API_BASE.endsWith('/') ? API_BASE.slice(0, -1) : API_BASE;
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const response = await fetch(`${normalizedBase}${normalizedPath}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers || {}),
    },
    ...options,
  });

  const raw = await response.text();
  if (!raw) {
    throw new Error('Empty response from server');
  }

  let payload: ApiSuccess<T> | ApiError;
  try {
    payload = JSON.parse(raw) as ApiSuccess<T> | ApiError;
  } catch {
    throw new Error(`Invalid JSON response (${response.status})`);
  }

  if (!response.ok) {
    const message = 'error' in payload ? payload.error : 'Request failed';
    throw new Error(message);
  }

  if ('success' in payload) {
    return payload.data;
  }

  throw new Error('Unexpected API response');
}

export async function verifyEns(ensName: string, address: string) {
  return request<{
    ensName: string;
    address: string;
    tier: number;
    tierName: string;
    totalScore?: number;
    breakdown?: {
      transactionHistory: number;
      tokenHoldings: number;
      defiActivity: number;
      daoParticipation: number;
    };
    txHash: string;
  }>('/api/verify-ens', {
    method: 'POST',
    body: JSON.stringify({ ensName, address }),
  });
}

export async function getTier(address: string) {
  return request<{
    address: string;
    tier: number;
    tierName: string;
  }>(`/api/tier/${address}`);
}

export async function checkAccess(address: string, minTier: number) {
  return request<{
    address: string;
    minTier: number;
    hasAccess: boolean;
  }>(`/api/check-access/${address}/${minTier}`);
}

export async function getEnsName(address: string) {
  return request<{
    address: string;
    ensName: string | null;
  }>(`/api/ens-name/${address}`);
}

export async function createArcSettlement(payload: {
  userAddress: string;
  swapTxHash?: string;
  inputToken: string;
  outputToken: string;
  inputAmount: string;
  outputAmount: string;
  sourceChainId: number;
}) {
  return request<{
    settlementId: string;
    network: string;
    usdcAmount: string;
    status: 'ready' | 'submitted';
    settlementAsset: 'USDC';
    createdAt: string;
    circleTransactionId?: string;
    circleTransactionState?: string;
    metadata: {
      swapTxHash?: string;
      sourceChainId: number;
      inputToken: string;
      outputToken: string;
      inputAmount: string;
      outputAmount: string;
    };
  }>('/api/arc/settlement', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function getArcSettlementStatus(transactionId: string) {
  return request<{
    id: string;
    state: string;
    txHash?: string;
    updateDate?: string;
    errorReason?: string;
  }>(`/api/arc/settlement/${transactionId}`);
}

export async function getGatewayInfo() {
  return request<Record<string, unknown>>('/api/gateway/info');
}

export async function getGatewayDomains() {
  return request<Array<{ domain: number; name: string }>>('/api/gateway/domains');
}

export type BurnIntentMessage = {
  maxBlockHeight: string;
  maxFee: string;
  spec: {
    version: number;
    sourceDomain: number;
    destinationDomain: number;
    sourceContract: string;
    destinationContract: string;
    sourceToken: string;
    destinationToken: string;
    sourceDepositor: string;
    destinationRecipient: string;
    sourceSigner: string;
    destinationCaller: string;
    value: string;
    salt: string;
    hookData: string;
  };
};

export async function buildBurnIntent(payload: {
  sourceDomain: number;
  destinationDomain: number;
  amount: string;
  sourceDepositor: string;
  destinationRecipient: string;
  maxFee?: string;
}) {
  return request<{ burnIntent: BurnIntentMessage }>('/api/gateway/build-burn-intent', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function getGatewayBalances(payload: {
  token: string;
  depositor: string;
  domains?: number[];
}) {
  return request<{
    balances: Array<{
      domain: number;
      balance: string;
    }>;
  }>('/api/gateway/balances', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

/** Submit signed burn intents: array of { burnIntent, signature } */
export async function transferGatewayBalance(requests: Array<{ burnIntent: BurnIntentMessage; signature: string }>) {
  return request<{
    transferId?: string;
    attestation?: string;
    signature?: string;
    fees?: { total?: string; token?: string; perIntent?: unknown[] };
    expirationBlock?: string;
  }>('/api/gateway/transfer', {
    method: 'POST',
    body: JSON.stringify(requests),
  });
}

export async function getBridgeChains() {
  return request<Array<{
    chain: string;
    name: string;
    type: string;
    chainId?: number;
    usdcAddress?: string;
  }>>('/api/bridge/chains');
}

export async function getBridgeSourceBalance(chain: string, address: string) {
  const params = new URLSearchParams({ chain, address });
  return request<{ balance: string; symbol: string }>(`/api/bridge/source-balance?${params}`);
}

export async function estimateBridgeTransfer(payload: {
  fromChain: string;
  toChain: string;
  amount: string;
  /** Wallet address (required for developer-controlled adapters). */
  address?: string;
  recipientAddress?: string;
  config?: {
    transferSpeed?: 'FAST' | 'SLOW';
    maxFee?: string;
  };
}) {
  return request<Record<string, unknown>>('/api/bridge/estimate', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function executeBridgeTransfer(payload: {
  fromChain: string;
  toChain: string;
  amount: string;
  /** Wallet address (required for developer-controlled adapters). */
  address?: string;
  recipientAddress?: string;
  config?: {
    transferSpeed?: 'FAST' | 'SLOW';
    maxFee?: string;
  };
}) {
  return request<Record<string, unknown>>('/api/bridge/transfer', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}
