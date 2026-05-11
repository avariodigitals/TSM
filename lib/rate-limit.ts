type RateLimitEntry = {
  count: number;
  resetAt: number;
};

type EnforceRateLimitInput = {
  scope: string;
  key: string;
  maxRequests: number;
  windowMs: number;
};

type EnforceRateLimitResult = {
  ok: boolean;
  retryAfterSeconds: number;
};

const STORE_SYMBOL = "__tsmRateLimitStore";

type GlobalWithRateLimitStore = typeof globalThis & {
  [STORE_SYMBOL]?: Map<string, RateLimitEntry>;
};

function getStore() {
  const globalStore = globalThis as GlobalWithRateLimitStore;
  if (!globalStore[STORE_SYMBOL]) {
    globalStore[STORE_SYMBOL] = new Map<string, RateLimitEntry>();
  }

  return globalStore[STORE_SYMBOL];
}

function pruneExpiredEntries(store: Map<string, RateLimitEntry>, now: number) {
  for (const [entryKey, entry] of store.entries()) {
    if (entry.resetAt <= now) {
      store.delete(entryKey);
    }
  }
}

export function enforceRateLimit(input: EnforceRateLimitInput): EnforceRateLimitResult {
  const now = Date.now();
  const store = getStore();

  if (Math.random() < 0.05) {
    pruneExpiredEntries(store, now);
  }

  const combinedKey = `${input.scope}:${input.key || "unknown"}`;
  const current = store.get(combinedKey);

  if (!current || current.resetAt <= now) {
    store.set(combinedKey, {
      count: 1,
      resetAt: now + input.windowMs,
    });

    return { ok: true, retryAfterSeconds: 0 };
  }

  if (current.count >= input.maxRequests) {
    return {
      ok: false,
      retryAfterSeconds: Math.max(1, Math.ceil((current.resetAt - now) / 1000)),
    };
  }

  current.count += 1;
  store.set(combinedKey, current);

  return { ok: true, retryAfterSeconds: 0 };
}
