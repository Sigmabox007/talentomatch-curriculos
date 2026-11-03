import { describe, expect, it } from "vitest";

import { buildResumePdf, toPdfSafe } from "./pdf";
import { checkRateLimit } from "./rate-limit.server";
import { validateInputs } from "./validation";

describe("limite de uso por cliente", () => {
  it("bloqueia a 7ª análise do mesmo cliente em 10 minutos", () => {
    const key = `test-${Math.random()}`;
    for (let i = 0; i < 6; i++) expect(checkRateLimit(key).ok).toBe(true);
    expect(checkRateLimit(key).ok).toBe(false);
  });
});

describe("validação de entrada", () => {
  const ok = "x".repeat(200);
  it("recusa campo acima de 12.000 caracteres", () => {
    expect(validateInputs("x".repeat(12_001), ok).job).toBeDefined();
  });
  it("aceita exatamente 12.000 caracteres", () => {
    expect(validateInputs("x".repeat(12_000), ok).job).toBeUndefined();
  });
  it("recusa texto com menos de 150 caracteres", () => {
    expect(validateInputs(ok, "x".repeat(149)).resume).toBeDefined();
  });
});

describe("PDF", () => {
  it("preserva acentos do português", () => {
    expect(toPdfSafe("Formação — ação “ok” 🚀")).toBe('Formação - ação "ok" ');
  });

  it("quebra páginas em currículos longos", async () => {
    const lines = ["Nome Teste", "EXPERIÊNCIA"];
    for (let i = 0; i < 120; i++) lines.push(`- Atividade número ${i} descrita em uma linha de texto.`);
    const doc = await buildResumePdf(lines.join("\n"));
    expect(doc.getNumberOfPages()).toBeGreaterThan(1);
  });
});
