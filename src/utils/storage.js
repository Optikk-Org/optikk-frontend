/**
 * Safe localStorage wrapper.
 *
 * All reads are guarded with try/catch so corrupted or missing storage
 * never crashes the application.  All writes silently swallow quota errors.
 */

export function safeGet(key, fallback = null) {
    try {
        const value = localStorage.getItem(key);
        return value !== null ? value : fallback;
    } catch {
        return fallback;
    }
}

export function safeSet(key, value) {
    try {
        localStorage.setItem(key, value);
    } catch {
        // quota exceeded or private browsing — silently ignore
    }
}

export function safeRemove(key) {
    try {
        localStorage.removeItem(key);
    } catch {
        // ignore
    }
}

export function safeGetJSON(key, fallback = null) {
    try {
        const raw = localStorage.getItem(key);
        return raw !== null ? JSON.parse(raw) : fallback;
    } catch {
        return fallback;
    }
}

export function safeSetJSON(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch {
        // quota exceeded or private browsing — silently ignore
    }
}
