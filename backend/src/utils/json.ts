/**
 * Recursively converts BigInt values to string so the result is JSON-serializable.
 * Used for Bridge Kit estimate/result responses that may contain bigint (e.g. gas, gasPrice).
 */
export function serializeForJson<T>(value: T): T {
    if (value === null || value === undefined) {
        return value;
    }
    if (typeof value === 'bigint') {
        return String(value) as T;
    }
    if (Array.isArray(value)) {
        return value.map(serializeForJson) as T;
    }
    if (typeof value === 'object') {
        const out: Record<string, unknown> = {};
        for (const [k, v] of Object.entries(value)) {
            out[k] = serializeForJson(v);
        }
        return out as T;
    }
    return value;
}
