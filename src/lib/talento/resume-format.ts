import type { AiOutput } from "./schema";
import { containsTerm } from "./text";

/**
 * Converte a proposta estruturada em texto simples editável.
 * Convenção: 1ª linha = nome; linhas em MAIÚSCULAS = títulos; "- " = tópicos.
 */
export function composeResumeText(resume: AiOutput["resume"]): string {
  const lines: string[] = [];
  if (resume.full_name) lines.push(resume.full_name.trim());
  for (const c of resume.contact_lines) if (c) lines.push(c);
  if (lines.length) lines.push("");

  for (const section of resume.sections) {
    const blocks = section.blocks.filter((b) => b.text);
    if (!section.title || blocks.length === 0) continue;
    lines.push(section.title.toLocaleUpperCase("pt-BR"));
    blocks.forEach((b, i) => {
      const prev = blocks[i - 1];
      if (b.kind === "subheading" && prev && prev.kind !== "subheading") lines.push("");
      lines.push(b.kind === "bullet" ? `- ${b.text}` : b.text);
    });
    lines.push("");
  }
  return lines.join("\n").replace(/\n{3,}/g, "\n\n").trim();
}

export type ResumeBlock =
  | { type: "name"; text: string }
  | { type: "heading"; text: string }
  | { type: "bullet"; text: string }
  | { type: "text"; text: string }
  | { type: "blank" };

const BULLET_RE = /^\s*[-•*]\s+/;

export function isHeadingLine(line: string): boolean {
  const t = line.trim();
  if (!t || t.length > 60 || BULLET_RE.test(t)) return false;
  const hasLetter = /\p{L}/u.test(t);
  return hasLetter && t === t.toLocaleUpperCase("pt-BR") && t !== t.toLocaleLowerCase("pt-BR");
}

/** Interpreta o texto revisado (exatamente como editado) em blocos para o PDF. */
export function parseResumeText(text: string): ResumeBlock[] {
  const out: ResumeBlock[] = [];
  let nameDone = false;
  for (const raw of text.replace(/\r\n?/g, "\n").split("\n")) {
    const line = raw.replace(/\s+$/, "");
    if (!line.trim()) {
      out.push({ type: "blank" });
      continue;
    }
    if (!nameDone) {
      nameDone = true;
      out.push({ type: "name", text: line.trim() });
      continue;
    }
    if (BULLET_RE.test(line)) out.push({ type: "bullet", text: line.replace(BULLET_RE, "").trim() });
    else if (isHeadingLine(line)) out.push({ type: "heading", text: line.trim() });
    else out.push({ type: "text", text: line.trim() });
  }
  return out;
}

const NUMBER_RE = /\d+(?:[.,:/]\d+)*/g;
const EMAIL_RE = /[\w.+-]+@[\w-]+(?:\.[\w-]+)+/g;
const URL_RE = /\b(?:https?:\/\/|www\.)[^\s)]+/gi;

/**
 * Aponta termos da versão revisada que não aparecem no currículo original:
 * números/datas, e-mails, links e palavras-chave da vaga ausentes no original.
 * Não altera o texto; serve para a pessoa conferir antes de exportar.
 */
export function findHonestyFlags(
  original: string,
  candidate: string,
  missingKeywords: string[],
): string[] {
  const flags = new Set<string>();
  const origLower = original.toLowerCase();

  const origNumbers = new Set<string>();
  for (const n of original.match(NUMBER_RE) ?? []) {
    origNumbers.add(n);
    for (const p of n.split(/[.,:/]/)) origNumbers.add(p);
  }
  for (const n of candidate.match(NUMBER_RE) ?? []) {
    const ok = origNumbers.has(n) || n.split(/[.,:/]/).every((p) => origNumbers.has(p));
    if (!ok) flags.add(`Número ou data “${n}” não aparece no currículo original.`);
  }
  for (const e of candidate.match(EMAIL_RE) ?? []) {
    if (!origLower.includes(e.toLowerCase()))
      flags.add(`Contato “${e}” não aparece no currículo original.`);
  }
  for (const u of candidate.match(URL_RE) ?? []) {
    if (!origLower.includes(u.toLowerCase()))
      flags.add(`Link “${u}” não aparece no currículo original.`);
  }
  for (const kw of missingKeywords) {
    if (containsTerm(candidate, kw))
      flags.add(
        `“${kw}” é termo da vaga e não aparecia no currículo original. Mantenha apenas se for verdadeiro.`,
      );
  }
  return Array.from(flags);
}
