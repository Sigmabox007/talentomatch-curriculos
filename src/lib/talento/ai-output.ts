import { AI_OUTPUT_LIMITS as L } from "./constants";
import { aiOutputSchema, type AiOutput } from "./schema";

/** Motivo da rejeição (só o código é registrado em log, nunca o conteúdo). */
export type AiOutputRejection =
  | "empty"
  | "too_large"
  | "invalid_json"
  | "not_object"
  | "limits_exceeded"
  | "schema_invalid";

export type AiOutputParse =
  | { ok: true; data: AiOutput }
  | { ok: false; reason: AiOutputRejection; detail?: string };

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

/** Retorna o caminho da primeira lista acima do limite, ou null. Não percorre os elementos das listas. */
function firstOversizedList(obj: Record<string, unknown>): string | null {
  const top: Array<[string, number]> = [
    ["requirements", L.requirements],
    ["keywords", L.keywords],
    ["recommendations", L.recommendations],
    ["rewrite_notes", L.rewriteNotes],
  ];
  for (const [key, max] of top) {
    const v = obj[key];
    if (Array.isArray(v) && v.length > max) return key;
  }

  const resume = obj.resume;
  if (!isRecord(resume)) return null; // formato errado: o Zod rejeita adiante
  if (Array.isArray(resume.contact_lines) && resume.contact_lines.length > L.contactLines) {
    return "resume.contact_lines";
  }
  const sections = resume.sections;
  if (!Array.isArray(sections)) return null;
  if (sections.length > L.sections) return "resume.sections";

  // Só chega aqui com no máximo L.sections seções.
  let totalBlocks = 0;
  for (let i = 0; i < sections.length; i++) {
    const s = sections[i];
    if (!isRecord(s) || !Array.isArray(s.blocks)) continue;
    if (s.blocks.length > L.blocksPerSection) return `resume.sections[${i}].blocks`;
    totalBlocks += s.blocks.length;
    if (totalBlocks > L.totalBlocks) return "resume.sections[*].blocks (total)";
  }
  return null;
}

/**
 * Interpreta e valida a resposta bruta da IA, em ordem:
 * 1) tamanho total do texto; 2) JSON; 3) tamanho de cada lista (antes do Zod, pois no
 * Zod 3 o `.max()` não interrompe o processamento dos elementos); 4) esquema Zod.
 * Qualquer excesso rejeita a resposta inteira — nada é cortado.
 */
export function parseAiOutput(raw: string | undefined | null): AiOutputParse {
  if (!raw) return { ok: false, reason: "empty" };
  if (raw.length > L.rawChars) return { ok: false, reason: "too_large" };
  if (raw.trim() === "") return { ok: false, reason: "empty" };

  let json: unknown;
  try {
    json = JSON.parse(raw);
  } catch {
    return { ok: false, reason: "invalid_json" };
  }
  if (!isRecord(json)) return { ok: false, reason: "not_object" };

  const oversized = firstOversizedList(json);
  if (oversized) return { ok: false, reason: "limits_exceeded", detail: oversized };

  const parsed = aiOutputSchema.safeParse(json);
  if (!parsed.success) {
    return { ok: false, reason: "schema_invalid", detail: String(parsed.error.issues.length) };
  }
  return { ok: true, data: parsed.data };
}
