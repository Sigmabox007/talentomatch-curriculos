import { AlertTriangle, ArrowLeft, Copy, Download, Loader2, PenLine } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { findHonestyFlags } from "@/lib/talento/resume-format";

export function ReviewStep({
  text,
  onText,
  originalResume,
  missingKeywords,
  rewriteNotes,
  onBack,
}: {
  text: string;
  onText: (v: string) => void;
  originalResume: string;
  missingKeywords: string[];
  rewriteNotes: string[];
  onBack: () => void;
}) {
  const [exporting, setExporting] = useState(false);
  const flags = useMemo(
    () => findHonestyFlags(originalResume, text, missingKeywords),
    [originalResume, text, missingKeywords],
  );
  const empty = text.trim().length === 0;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Texto copiado.");
    } catch {
      toast.error("Não foi possível copiar. Selecione o texto e copie manualmente.");
    }
  };

  const download = async () => {
    if (exporting || empty) return;
    setExporting(true);
    try {
      const { downloadResumePdf } = await import("@/lib/talento/pdf");
      await downloadResumePdf(text);
      toast.success("PDF gerado com a versão revisada.");
    } catch {
      toast.error("Não foi possível gerar o PDF. Tente novamente.");
    } finally {
      setExporting(false);
    }
  };

  return (
    <section aria-labelledby="step-heading-3" className="space-y-6">
      <div>
        <h2 id="step-heading-3" tabIndex={-1} className="text-2xl font-extrabold text-brand outline-none">
          Revise e exporte o currículo
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Proposta gerada por IA a partir do seu currículo. Confira cada informação: o PDF terá
          exatamente o texto abaixo, com as suas edições.
        </p>
      </div>

      {flags.length > 0 && (
        <Alert variant="warning">
          <AlertTriangle className="size-4" aria-hidden="true" />
          <AlertTitle className="font-semibold">Confira antes de exportar</AlertTitle>
          <AlertDescription>
            <p>Estes itens do texto abaixo não aparecem no currículo original:</p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              {flags.map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {rewriteNotes.length > 0 && (
        <details className="rounded-2xl border border-border bg-card p-4 shadow-card">
          <summary className="cursor-pointer font-semibold text-brand">O que foi ajustado na proposta</summary>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm">
            {rewriteNotes.map((n, i) => (
              <li key={i}>{n}</li>
            ))}
          </ul>
        </details>
      )}

      <div className="rounded-2xl border border-border bg-card p-4 shadow-card sm:p-6">
        <Label htmlFor="resume-editor" className="flex items-center gap-2 font-display text-base font-bold text-brand">
          <PenLine className="size-4 text-primary" aria-hidden="true" />
          Currículo ajustado (editável)
        </Label>
        <p id="resume-editor-hint" className="mt-1 text-sm text-muted-foreground">
          A primeira linha é o nome. Linhas em MAIÚSCULAS viram títulos de seção. Linhas iniciadas
          com “- ” viram tópicos. Emojis e símbolos especiais não são exportados.
        </p>
        <Textarea
          id="resume-editor"
          value={text}
          onChange={(e) => onText(e.target.value)}
          aria-describedby="resume-editor-hint"
          spellCheck
          className="mt-3 min-h-[60vh] resize-y bg-background p-4 text-base leading-relaxed md:text-[15px]"
        />
      </div>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Button type="button" variant="outline" size="xl" onClick={onBack}>
          <ArrowLeft aria-hidden="true" />
          Voltar à análise
        </Button>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button type="button" variant="outline" size="xl" onClick={copy} disabled={empty}>
            <Copy aria-hidden="true" />
            Copiar texto
          </Button>
          <Button type="button" size="xl" onClick={download} disabled={exporting || empty} aria-busy={exporting}>
            {exporting ? <Loader2 className="animate-spin" aria-hidden="true" /> : <Download aria-hidden="true" />}
            Baixar PDF
          </Button>
        </div>
      </div>
    </section>
  );
}
