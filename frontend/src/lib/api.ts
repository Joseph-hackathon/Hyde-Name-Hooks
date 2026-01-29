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
