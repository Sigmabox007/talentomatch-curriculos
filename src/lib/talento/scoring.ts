import { MAX_KEYWORDS, MAX_REQUIREMENTS, WEIGHTS } from "./constants";
import type { AiOutput, Category, Requirement, ScoreResult, Status } from "./schema";
import { containsTerm, evidenceExists, normalizeLoose, normalizeStrict } from "./text";

const CATEGORY_RANK: Record<Category, number> = {
  obrigatorio: 3,
  nao_especificado: 2,
  desejavel: 1,
};

export const DOWNGRADE_NOTE =
  "A análise apontou este requisito, mas o trecho citado não foi localizado no seu currículo. Confira manualmente.";

type RawRequirement = AiOutput["requirements"][number];

/**
 * Confere cada evidência no texto original e rebaixa para "revisar" qualquer
 * requisito marcado como identificado sem trecho verificável.
 */
export function verifyRequirement(raw: RawRequirement, resume: string, index: number): Requirement {
  const verified = raw.evidence ? evidenceExists(resume, raw.evidence) : false;
  let status: Status = raw.status;
  let evidence: string | null = verified ? raw.evidence : null;
  let note = raw.note;
  let downgraded = false;

  if (raw.status === "identificado" && !verified) {
    status = "revisar";
    downgraded = true;
    note = DOWNGRADE_NOTE;
  }
  if (raw.status === "nao_identificado") {
    evidence = null;
  }

  return {
    id: `r${index}`,
    text: raw.requirement,
    category: raw.category,
    status,
    evidence,
    note,
    downgraded,
  };
}

/** Remove requisitos duplicados (mesmo texto normalizado), mantendo a classificação mais forte. */
export function dedupeRequirements(list: Requirement[]): Requirement[] {
  const byKey = new Map<string, Requirement>();
  for (const req of list) {
    const key = normalizeStrict(req.text);
    if (!key) continue;
    const prev = byKey.get(key);
    if (!prev) {
      byKey.set(key, { ...req });
      continue;
    }
    if (CATEGORY_RANK[req.category] > CATEGORY_RANK[prev.category]) prev.category = req.category;
    if (req.status === "identificado" && prev.status !== "identificado") {
      prev.status = "identificado";
      prev.evidence = req.evidence;
      prev.note = req.note;
      prev.downgraded = false;
    }
  }
  return Array.from(byKey.values()).slice(0, MAX_REQUIREMENTS);
}

/**
 * Percentual = soma dos pesos dos requisitos identificados (com evidência)
 * / soma dos pesos de todos os requisitos considerados × 100, arredondado.
 * Obrigatório = 2, desejável = 1, não especificado = 1. "Revisar" não conta.
 */
export function computeScore(
  requirements: Requirement[],
  confidence: AiOutput["extraction_confidence"],
): ScoreResult {
  if (requirements.length < 2 || confidence === "baixa") {
    return {
      value: null,
      earned: 0,
      total: 0,
      reason:
        "Não foi possível extrair requisitos confiáveis da vaga. Verifique se o texto colado contém a descrição completa, com requisitos.",
    };
  }
  let earned = 0;
  let total = 0;
  for (const r of requirements) {
    const w = WEIGHTS[r.category];
    total += w;
    if (r.status === "identificado" && r.evidence) earned += w;
  }
  return { value: Math.round((earned / total) * 100), earned, total, reason: null };
}

/** Classifica palavras-chave da vaga verificando presença literal no currículo. */
export function classifyKeywords(keywords: string[], resume: string) {
  const seen = new Set<string>();
  const found: string[] = [];
  const missing: string[] = [];
  for (const kw of keywords) {
    const key = normalizeLoose(kw);
    if (key.length < 2 || seen.has(key)) continue;
    seen.add(key);
    if (seen.size > MAX_KEYWORDS) break;
    (containsTerm(resume, kw) ? found : missing).push(kw);
  }
  return { found, missing };
}
