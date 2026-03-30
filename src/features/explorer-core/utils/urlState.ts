export function serializeStateSnapshot(state: unknown): string {
  const raw = JSON.stringify(state ?? {});
  return encodeURIComponent(btoa(unescape(encodeURIComponent(raw))));
}

export function deserializeStateSnapshot<T>(raw: string | null, fallback: T): T {
  if (!raw) {
    return fallback;
  }

  try {
    const decoded = decodeURIComponent(raw);
    const json = decodeURIComponent(escape(atob(decoded)));
    return JSON.parse(json) as T;
  } catch {
    return fallback;
  }
}
