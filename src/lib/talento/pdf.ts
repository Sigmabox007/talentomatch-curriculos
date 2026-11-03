import { parseResumeText } from "./resume-format";

/**
 * Substitui caracteres que as fontes padrão do PDF não representam
 * (emoji, símbolos raros) por equivalentes simples, preservando acentos do português.
 */
export function toPdfSafe(text: string): string {
  return text
    .replace(/[\u2018\u2019\u201A\u2032]/g, "'")
    .replace(/[\u201C\u201D\u201E\u2033]/g, '"')
    .replace(/[\u2013\u2014\u2212]/g, "-")
    .replace(/\u2026/g, "...")
    .replace(/\u00A0/g, " ")
    .replace(/\t/g, "    ")
    .replace(/[^\u0000-\u00FF]/g, (ch) => {
      const base = ch.normalize("NFKD").replace(/[\u0300-\u036f]/g, "");
      return /^[\u0000-\u00FF]+$/.test(base) ? base : "";
    });
}

/**
 * Gera um PDF de uma coluna com texto selecionável a partir do texto revisado.
 * Sem imagens, tabelas, ícones ou gráficos.
 */
export async function buildResumePdf(text: string) {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "pt", format: "a4", compress: true });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 56;
  const width = pageW - margin * 2;
  let y = margin;

  doc.setProperties({ title: "Currículo", creator: "TalentoMatch" });
  doc.setTextColor(20, 20, 20);

  const ensure = (h: number) => {
    if (y + h > pageH - margin) {
      doc.addPage();
      y = margin;
    }
  };

  const writeLines = (lines: string[], x: number, size: number, lh: number) => {
    for (const l of lines) {
      ensure(lh);
      doc.text(l, x, y + size);
      y += lh;
    }
  };

  const blocks = parseResumeText(text);
  let lastWasBlank = true;
  blocks.forEach((b, i) => {
    if (b.type === "blank") {
      if (!lastWasBlank) y += 6;
      lastWasBlank = true;
      return;
    }
    lastWasBlank = false;
    const content = toPdfSafe(b.text);
    if (b.type === "name") {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(17);
      writeLines(doc.splitTextToSize(content, width), margin, 17, 22);
      y += 2;
    } else if (b.type === "heading") {
      if (i > 0) y += 8;
      // Evita título órfão no fim da página.
      ensure(16 + 15 * 2);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11.5);
      writeLines(doc.splitTextToSize(content, width), margin, 11.5, 16);
      y += 3;
    } else if (b.type === "bullet") {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10.5);
      const indent = 12;
      const lines = doc.splitTextToSize(content, width - indent);
      ensure(14.5);
      doc.text("-", margin, y + 10.5);
      writeLines(lines, margin + indent, 10.5, 14.5);
    } else {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10.5);
      writeLines(doc.splitTextToSize(content, width), margin, 10.5, 14.5);
    }
  });

  return doc;
}

export async function downloadResumePdf(text: string, filename = "curriculo-talentomatch.pdf") {
  const doc = await buildResumePdf(text);
  doc.save(filename);
}
