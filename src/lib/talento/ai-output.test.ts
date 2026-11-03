import { afterEach, describe, expect, it, vi } from "vitest";

import { parseAiOutput } from "./ai-output";
import { AI_OUTPUT_LIMITS as L } from "./constants";
import { aiOutputSchema } from "./schema";

/** Resposta no mesmo formato das respostas reais do modelo (exemplo fictício). */
function validOutput() {
  return {
    job_title: "Analista de Suporte Técnico (Pleno)",
    extraction_confidence: "alta",
    injection_detected: false,
    requirements: [
      {
        requirement: "Experiência com sistema de chamados (Jira, GLPI ou similar)",
        category: "obrigatorio",
        status: "identificado",
        evidence: "Atendo chamados dos funcionários das lojas pelo GLPI, uns 15 por dia.",
        note: "O uso de GLPI está explícito.",
      },
      {
        requirement: "Inglês intermediário para leitura de documentação",
        category: "obrigatorio",
        status: "revisar",
        evidence: "Inglês básico",
        note: "O nível declarado é inferior ao solicitado.",
      },
      {
        requirement: "Experiência com Linux",
        category: "desejavel",
        status: "nao_identificado",
        evidence: null,
        note: "O currículo não menciona Linux.",
      },
    ],
    keywords: ["GLPI", "Windows", "Office", "Linux"],
    recommendations: ["Destaque a experiência com GLPI já descrita no currículo."],
    resume: {
      full_name: "Mariana Exemplo (pessoa fictícia)",
      contact_lines: ["São Paulo - SP | mariana.exemplo@exemplo.com"],
      sections: [
        {
          title: "Experiência profissional",
          blocks: [
            { kind: "subheading", text: "Técnica de Suporte — Loja Fictícia Alfa (mar/2021 – atual)" },
            { kind: "bullet", text: "Formatação e instalação de Windows 10 e Office." },
          ],
        },
        { title: "Idiomas", blocks: [{ kind: "paragraph", text: "Inglês básico" }] },
      ],
    },
    rewrite_notes: ["Atividades organizadas em tópicos."],
  };
}

const raw = (v: unknown) => JSON.stringify(v);

afterEach(() => vi.restoreAllMocks());

describe("resposta válida da IA", () => {
  it("é aceita sem cortar nenhuma lista", () => {
    const r = parseAiOutput(raw(validOutput()));
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.data.requirements).toHaveLength(3);
    expect(r.data.keywords).toEqual(["GLPI", "Windows", "Office", "Linux"]);
    expect(r.data.resume.sections[0].blocks).toHaveLength(2);
    expect(r.data.requirements[2].evidence).toBeNull();
  });

  it("aceita listas exatamente no limite (25 requisitos, 30 palavras-chave, 10 recomendações)", () => {
    const o = validOutput();
    o.requirements = Array.from({ length: 25 }, (_, i) => ({ ...o.requirements[0], requirement: `Req ${i}` }));
    o.keywords = Array.from({ length: 30 }, (_, i) => `termo ${i}`);
    o.recommendations = Array.from({ length: 10 }, (_, i) => `rec ${i}`);
    const r = parseAiOutput(raw(o));
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.data.requirements).toHaveLength(25);
      expect(r.data.keywords).toHaveLength(30);
      expect(r.data.recommendations).toHaveLength(10);
    }
  });

  it("remove só espaços nas pontas dos textos", () => {
    const o = validOutput();
    o.keywords = ["  GLPI  "];
    const r = parseAiOutput(raw(o));
    expect(r.ok && r.data.keywords).toEqual(["GLPI"]);
  });
});

describe("listas excessivas são rejeitadas antes do Zod", () => {
  const cases: Array<[string, (o: ReturnType<typeof validOutput>) => void, string]> = [
    ["26 requisitos", (o) => (o.requirements = Array(26).fill(o.requirements[0])), "requirements"],
    ["31 palavras-chave", (o) => (o.keywords = Array(31).fill("x")), "keywords"],
    ["11 recomendações", (o) => (o.recommendations = Array(11).fill("x")), "recommendations"],
    ["21 notas de ajuste", (o) => (o.rewrite_notes = Array(21).fill("x")), "rewrite_notes"],
    ["11 linhas de contato", (o) => (o.resume.contact_lines = Array(11).fill("x")), "resume.contact_lines"],
    ["21 seções", (o) => (o.resume.sections = Array(21).fill(o.resume.sections[1])), "resume.sections"],
    [
      "151 blocos numa seção",
      (o) => (o.resume.sections[0].blocks = Array(151).fill(o.resume.sections[0].blocks[1])),
      "resume.sections[0].blocks",
    ],
    [
      "401 blocos no total",
      (o) =>
        (o.resume.sections = Array.from({ length: 3 }, () => ({
          title: "Seção",
          blocks: Array(134).fill({ kind: "bullet", text: "x" }),
        }))),
      "resume.sections[*].blocks (total)",
    ],
  ];

  it.each(cases)("%s", (_name, mutate, path) => {
    const spy = vi.spyOn(aiOutputSchema, "safeParse");
    const o = validOutput();
    mutate(o);
    const r = parseAiOutput(raw(o));
    expect(r).toEqual({ ok: false, reason: "limits_exceeded", detail: path });
    expect(spy).not.toHaveBeenCalled();
  });

  it("lista enorme (30.000 itens inválidos) é rejeitada sem chegar ao Zod", () => {
    const spy = vi.spyOn(aiOutputSchema, "safeParse");
    const o = validOutput() as Record<string, unknown>;
    o.keywords = Array(30_000).fill(1); // no Zod, cada item inválido geraria um erro
    const text = raw(o);
    expect(text.length).toBeLessThanOrEqual(L.rawChars); // isola a verificação de lista
    expect(parseAiOutput(text)).toEqual({ ok: false, reason: "limits_exceeded", detail: "keywords" });
    expect(spy).not.toHaveBeenCalled();
  });
});

describe("respostas malformadas são rejeitadas", () => {
  it("vazia", () => {
    expect(parseAiOutput("")).toEqual({ ok: false, reason: "empty" });
    expect(parseAiOutput(undefined)).toEqual({ ok: false, reason: "empty" });
  });

  it("texto acima de 80.000 caracteres, antes de interpretar o JSON", () => {
    const parse = vi.spyOn(JSON, "parse");
    const r = parseAiOutput(" ".repeat(L.rawChars + 1));
    expect(r).toEqual({ ok: false, reason: "too_large" });
    expect(parse).not.toHaveBeenCalled();
  });

  it("JSON inválido ou truncado", () => {
    expect(parseAiOutput('{"job_title": "x", ').ok).toBe(false);
    expect(parseAiOutput("não é json")).toEqual({ ok: false, reason: "invalid_json" });
  });

  it("JSON que não é objeto", () => {
    expect(parseAiOutput("[]")).toEqual({ ok: false, reason: "not_object" });
    expect(parseAiOutput("null")).toEqual({ ok: false, reason: "not_object" });
    expect(parseAiOutput('"texto"')).toEqual({ ok: false, reason: "not_object" });
  });

  it("campo obrigatório ausente", () => {
    const o = validOutput() as Partial<ReturnType<typeof validOutput>>;
    delete o.requirements;
    expect(parseAiOutput(raw(o))).toMatchObject({ ok: false, reason: "schema_invalid" });
  });

  it("lista com tipo errado (objeto com length falso)", () => {
    const o = validOutput() as Record<string, unknown>;
    o.keywords = { length: 1_000_000_000 };
    expect(parseAiOutput(raw(o))).toMatchObject({ ok: false, reason: "schema_invalid" });
  });

  it("status ou categoria fora do permitido", () => {
    const o = validOutput();
    o.requirements[0].status = "comprovado";
    expect(parseAiOutput(raw(o))).toMatchObject({ ok: false, reason: "schema_invalid" });
    const o2 = validOutput();
    o2.requirements[0].category = "essencial";
    expect(parseAiOutput(raw(o2))).toMatchObject({ ok: false, reason: "schema_invalid" });
  });

  it("evidência acima de 600 caracteres é rejeitada, não cortada", () => {
    const o = validOutput();
    o.requirements[0].evidence = "a".repeat(L.text.evidence + 1);
    expect(parseAiOutput(raw(o))).toMatchObject({ ok: false, reason: "schema_invalid" });
  });

  it("texto de bloco acima do limite é rejeitado, não cortado", () => {
    const o = validOutput();
    o.resume.sections[0].blocks[1].text = "b".repeat(L.text.block + 1);
    expect(parseAiOutput(raw(o))).toMatchObject({ ok: false, reason: "schema_invalid" });
  });
});
