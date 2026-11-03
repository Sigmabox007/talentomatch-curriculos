// Limite de uso em memória, por instância do servidor.
// Limitação conhecida (documentada no README): instâncias diferentes não
// compartilham contadores, então isto é uma barreira de melhor esforço,
// não uma cota garantida.

const WINDOW_MS = 10 * 60 * 1000;
const PER_CLIENT = 6;
const PER_INSTANCE = 120;

const hits = new Map<string, number[]>();
let globalHits: number[] = [];

export function checkRateLimit(clientKey: string): { ok: true } | { ok: false; retryAfterSec: number } {
  const now = Date.now();
  globalHits = globalHits.filter((t) => now - t < WINDOW_MS);
  const list = (hits.get(clientKey) ?? []).filter((t) => now - t < WINDOW_MS);

  if (list.length >= PER_CLIENT || globalHits.length >= PER_INSTANCE) {
    const oldest = (list.length >= PER_CLIENT ? list[0] : globalHits[0]) ?? now;
    return { ok: false, retryAfterSec: Math.max(1, Math.ceil((WINDOW_MS - (now - oldest)) / 1000)) };
  }
  list.push(now);
  globalHits.push(now);
  hits.set(clientKey, list);
  if (hits.size > 5000) {
    for (const [k, v] of hits) if (v.every((t) => now - t >= WINDOW_MS)) hits.delete(k);
  }
  return { ok: true };
}
