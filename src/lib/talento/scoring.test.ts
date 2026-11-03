import { describe, expect, it } from "vitest";

import { findHonestyFlags, parseResumeText } from "./resume-format";
import type { Requirement } from "./schema";
import {
  classifyKeywords,
  computeScore,
  dedupeRequirements,
  verifyRequirement,
} from "./scoring";
import { evidenceExists } from "./text";

const resume = `Ana Teste
Atendo chamados pelo GLPI, uns 15 por dia. Instalação de Windows 10 e Office.
Idiomas: Inglês básico`;

function req(p: Partial<Requirement>): Requirement {
  return {
    id: "x",
    text: "Requisito",
    category: "obrigatorio",
    status: "identificado",
    evidence: "GLPI",
    note: "",
    downgraded: false,
    ...p,
  };
}

describe("percentual de alinhamento", () => {
  it("usa peso 2 para obrigatório e 1 para desejável", () => {
    const list = [
      req({ text: "A", category: "obrigatorio", status: "identificado" }),
      req({ text: "B", category: "obrigatorio", status: "identificado" }),
      req({ text: "C", category: "desejavel", status: "nao_identificado", evidence: null }),
    ];
    // (2 + 2) / (2 + 2 + 1) = 80%
    expect(computeScore(list, "alta").value).toBe(80);
  });

  it("não conta requisitos marcados como Revisar", () => {
    const list = [
      req({ text: "A", category: "obrigatorio", status: "identificado" }),
      req({ text: "B", category: "obrigatorio", status: "revisar" }),
    ];
    expect(computeScore(list, "alta").value).toBe(50);
  });

  it("arredonda o resultado", () => {
    const list = [
      req({ text: "A", category: "desejavel", status: "identificado" }),
      req({ text: "B", category: "desejavel", status: "nao_identificado", evidence: null }),
      req({ text: "C", category: "desejavel", status: "nao_identificado", evidence: null }),
    ];
    expect(computeScore(list, "alta").value).toBe(33);
  });

  it("mostra 'não foi possível estimar' quando há menos de 2 requisitos", () => {
    expect(computeScore([req({})], "alta").value).toBeNull();
  });

  it("mostra 'não foi possível estimar' quando a extração tem baixa confiança", () => {
    expect(computeScore([req({ text: "A" }), req({ text: "B" })], "baixa").value).toBeNull();
  });
});

describe("verificação de evidências", () => {
  it("rebaixa para Revisar quando o trecho citado não existe no currículo", () => {
    const r = verifyRequirement(
      {
        requirement: "SQL",
        category: "desejavel",
        status: "identificado",
        evidence: "experiência com SQL Server",
        note: "",
      },
      resume,
      0,
    );
    expect(r.status).toBe("revisar");
    expect(r.evidence).toBeNull();
    expect(r.downgraded).toBe(true);
  });

  it("aceita trecho com diferença de maiúsculas e acentos", () => {
    expect(evidenceExists(resume, "INSTALACAO DE WINDOWS 10")).toBe(true);
  });

  it("mantém identificado quando o trecho existe", () => {
    const r = verifyRequirement(
      {
        requirement: "Sistema de chamados",
        category: "obrigatorio",
        status: "identificado",
        evidence: "Atendo chamados pelo GLPI",
        note: "",
      },
      resume,
      0,
    );
    expect(r.status).toBe("identificado");
  });
});

describe("duplicados", () => {
  it("une requisitos repetidos e mantém a categoria mais forte", () => {
    const out = dedupeRequirements([
      req({ text: "Windows 10", category: "desejavel" }),
      req({ text: "windows 10.", category: "obrigatorio" }),
    ]);
    expect(out).toHaveLength(1);
    expect(out[0]?.category).toBe("obrigatorio");
  });
});

describe("palavras-chave", () => {
  it("separa termos presentes e ausentes no currículo", () => {
    const k = classifyKeywords(["GLPI", "Linux", "glpi"], resume);
    expect(k.found).toEqual(["GLPI"]);
    expect(k.missing).toEqual(["Linux"]);
  });
});

describe("alertas de honestidade", () => {
  it("aponta número inexistente no original", () => {
    const flags = findHonestyFlags(resume, "Atendo 30 chamados por dia", []);
    expect(flags.some((f) => f.includes("30"))).toBe(true);
  });

  it("aponta termo da vaga ausente no original", () => {
    const flags = findHonestyFlags(resume, "Experiência com Linux", ["Linux"]);
    expect(flags).toHaveLength(1);
  });

  it("não aponta números que já existiam", () => {
    expect(findHonestyFlags(resume, "Uns 15 chamados por dia no Windows 10", [])).toEqual([]);
  });
});

describe("texto para PDF", () => {
  it("reconhece nome, títulos e tópicos", () => {
    const blocks = parseResumeText("Ana Teste\nEXPERIÊNCIA\n- Atendo chamados\nTexto livre");
    expect(blocks.map((b) => b.type)).toEqual(["name", "heading", "bullet", "text"]);
  });
});
