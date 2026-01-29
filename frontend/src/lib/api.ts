const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

type ApiSuccess<T> = {
  success: true;
  data: T;
};

type ApiError = {
  error: string;
};

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
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
