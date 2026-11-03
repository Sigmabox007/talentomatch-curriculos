// Utilitários de texto puros (sem dependências de navegador ou servidor).

/** Minúsculas, sem acentos, espaços colapsados. Mantém pontuação. */
export function normalizeLoose(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

/** Como normalizeLoose, mas remove pontuação: útil para comparar trechos citados. */
export function normalizeStrict(input: string): string {
  return normalizeLoose(input)
    .replace(/[^a-z0-9#+ ]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Verifica se um termo aparece como palavra/expressão inteira no texto,
 * ignorando maiúsculas, acentos e variação de espaços.
 */
export function containsTerm(haystack: string, term: string): boolean {
  const needle = normalizeLoose(term);
  if (needle.length < 2) return false;
  const hay = normalizeLoose(haystack);
  const re = new RegExp(`(^|[^a-z0-9])${escapeRegExp(needle)}($|[^a-z0-9])`);
  return re.test(hay);
}

/**
 * Verifica se um trecho de evidência existe no texto original.
 * Aceita diferenças de maiúsculas, acentos, espaços e pontuação.
 * Trechos com reticências são aceitos se todas as partes existirem.
 */
export function evidenceExists(source: string, evidence: string): boolean {
  const hay = normalizeStrict(source);
  const parts = evidence
    .split(/\.{3}|…/)
    .map((p) => normalizeStrict(p))
    .filter((p) => p.length > 0);
  if (parts.length === 0) return false;
  const total = parts.reduce((n, p) => n + p.length, 0);
  if (total < 3) return false;
  return parts.every((p) => hay.includes(p));
}
