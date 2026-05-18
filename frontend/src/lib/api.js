import { useAuthStore } from '../store/authStore';

const API_BASE = import.meta.env.VITE_API_URL || 'https://dak-khana.onrender.com';

/**
 * Absolute URL for a DakExport API v1 path (no leading slash required on `path`).
 */
export function apiUrl(path) {
    const p = path.startsWith('/') ? path.slice(1) : path;
    return `${API_BASE}/api/v1/${p}`;
}

/**
 * JSON fetch helper with Bearer token from the auth store unless overridden.
 */
export async function apiFetch(path, options = {}) {
    const { token: tokenOverride, parseJson = true, ...rest } = options;
    const headers = {
        Accept: 'application/json',
        ...(rest.headers || {}),
    };

    let token = tokenOverride;
    if (token === undefined) {
        token = useAuthStore.getState().token;
    }
    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    const res = await fetch(apiUrl(path), { ...rest, headers });
    const text = await res.text();
    let body = null;
    if (parseJson && text) {
        try {
            body = JSON.parse(text);
        } catch {
            body = { raw: text };
        }
    } else if (text) {
        body = text;
    }

    return { ok: res.ok, status: res.status, body };
}

export { API_BASE };
