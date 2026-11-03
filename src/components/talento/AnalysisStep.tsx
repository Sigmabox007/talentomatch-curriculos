import { ArrowLeft, ArrowRight, Info, Lightbulb, ShieldAlert } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GAP_GUIDANCE, WEIGHTS } from "@/lib/talento/constants";
import type { AnalysisResult, Category, Requirement } from "@/lib/talento/schema";

import { StatusBadge } from "./StatusBadge";

const CATEGORY_TITLE: Record<Category, string> = {
  obrigatorio: "Requisitos obrigatórios",
  desejavel: "Requisitos desejáveis (diferenciais)",
  nao_especificado: "Requisitos sem indicação de obrigatoriedade",
};

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`rounded-2xl border border-border bg-card p-5 shadow-card sm:p-6 ${className}`}>{children}</div>;
}

function ScoreCard({ result }: { result: AnalysisResult }) {
  const { score } = result;
  const counts = {
    identificado: result.requirements.filter((r) => r.status === "identificado").length,
    revisar: result.requirements.filter((r) => r.status === "revisar").length,
    nao: result.requirements.filter((r) => r.status === "nao_identificado").length,
  };
  return (
    <Card>
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Estimativa de alinhamento textual
          </h3>
          {score.value === null ? (
            <p className="mt-2 font-display text-2xl font-extrabold text-brand">Não foi possível estimar</p>
          ) : (
            <p className="mt-1 font-display text-6xl font-extrabold tabular-nums text-brand">
              {score.value}
              <span className="text-3xl">%</span>
            </p>
          )}
          {result.jobTitle && <p className="mt-1 text-sm text-muted-foreground">Vaga: {result.jobTitle}</p>}
        </div>
        <dl className="grid grid-cols-3 gap-2 text-center sm:w-80">
          <div className="rounded-xl bg-success-soft px-2 py-3">
            <dt className="text-xs text-accent-foreground">Identificados</dt>
            <dd className="font-display text-xl font-bold text-accent-foreground">{counts.identificado}</dd>
          </div>
          <div className="rounded-xl bg-warning-soft px-2 py-3">
            <dt className="text-xs text-warning-strong">Revisar</dt>
            <dd className="font-display text-xl font-bold text-warning-strong">{counts.revisar}</dd>
          </div>
          <div className="rounded-xl bg-neutral-soft px-2 py-3">
            <dt className="text-xs text-muted-foreground">Não identificados</dt>
            <dd className="font-display text-xl font-bold text-foreground">{counts.nao}</dd>
          </div>
        </dl>
      </div>

      {score.value !== null ? (
        <>
          <div
            className="meter-track mt-5 h-3 w-full overflow-hidden rounded-full"
            role="img"
            aria-label={`${score.value}% de alinhamento estimado`}
          >
            <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${score.value}%` }} />
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            {score.earned} de {score.total} pontos de peso atendidos com evidência no currículo.
          </p>
        </>
      ) : (
        <p className="mt-3 text-sm text-muted-foreground">{score.reason}</p>
      )}

      <details className="group mt-4 rounded-xl border border-border bg-muted/50 p-4">
        <summary className="cursor-pointer font-semibold text-brand">Como este número é calculado</summary>
        <div className="mt-3 space-y-2 text-sm leading-relaxed">
          <p>
            Cada requisito da vaga recebe um peso: <strong>{WEIGHTS.obrigatorio}</strong> para obrigatório e{" "}
            <strong>{WEIGHTS.desejavel}</strong> para desejável (requisitos sem indicação clara recebem peso{" "}
            {WEIGHTS.nao_especificado}). Somamos os pesos dos requisitos identificados com um trecho
            verificável do seu currículo e dividimos pela soma de todos os pesos.
          </p>
          <p>
            Itens marcados como “Revisar” não contam até serem comprovados. Requisitos repetidos são
            considerados uma única vez. Trechos citados são conferidos contra o texto original.
          </p>
          <p className="font-medium">
            É um método simplificado. Não é nota oficial de sistemas ATS e não representa a avaliação
            real de recrutadores.
          </p>
        </div>
      </details>
    </Card>
  );
}

function RequirementItem({ r }: { r: Requirement }) {
  return (
    <li className="rounded-xl border border-border bg-card p-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <p className="font-medium text-foreground">{r.text}</p>
        <div className="shrink-0">
          <StatusBadge status={r.status} />
        </div>
      </div>
      {r.evidence && (
        <figure className="mt-3 border-l-4 border-primary/50 pl-3">
          <figcaption className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Trecho do seu currículo
          </figcaption>
          <blockquote className="mt-0.5 text-sm italic text-foreground">“{r.evidence}”</blockquote>
        </figure>
      )}
      {r.note && <p className="mt-2 text-sm text-muted-foreground">{r.note}</p>}
      {r.status !== "identificado" && (
        <p className="mt-2 rounded-lg bg-muted px-3 py-2 text-sm text-foreground">{GAP_GUIDANCE}</p>
      )}
    </li>
  );
}

export function AnalysisStep({
  result,
  onBack,
  onNext,
}: {
  result: AnalysisResult;
  onBack: () => void;
  onNext: () => void;
}) {
  const groups = (["obrigatorio", "desejavel", "nao_especificado"] as Category[])
    .map((c) => ({ c, items: result.requirements.filter((r) => r.category === c) }))
    .filter((g) => g.items.length > 0);

  return (
    <section aria-labelledby="step-heading-2" className="space-y-6">
      <div>
        <h2 id="step-heading-2" tabIndex={-1} className="text-2xl font-extrabold text-brand outline-none">
          Análise de alinhamento
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          “Não identificado no texto” indica lacuna de informação no currículo, não falta de capacidade.
        </p>
      </div>

      {result.injectionDetected && (
        <Alert variant="warning" role="status">
          <ShieldAlert className="size-4" aria-hidden="true" />
          <AlertTitle className="font-semibold">Instruções ignoradas</AlertTitle>
          <AlertDescription>
            Os textos continham instruções direcionadas à IA. Elas foram tratadas apenas como texto e
            não alteraram as regras da análise.
          </AlertDescription>
        </Alert>
      )}

      <ScoreCard result={result} />

      {groups.length > 0 && (
        <Card>
          <h3 className="text-lg font-bold text-brand">Requisitos da vaga</h3>
          <div className="mt-4 space-y-6">
            {groups.map((g) => (
              <div key={g.c}>
                <h4 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  {CATEGORY_TITLE[g.c]} <span className="font-normal">({g.items.length})</span>
                </h4>
                <ul className="space-y-3">
                  {g.items.map((r) => (
                    <RequirementItem key={r.id} r={r} />
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Card>
      )}

      {(result.keywords.found.length > 0 || result.keywords.missing.length > 0) && (
        <Card>
          <h3 className="text-lg font-bold text-brand">Palavras-chave da vaga</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Conferidas literalmente no texto do seu currículo (sem diferenciar maiúsculas e acentos).
          </p>
          <div className="mt-4 grid gap-5 md:grid-cols-2">
            <div>
              <h4 className="mb-2 text-sm font-semibold text-accent-foreground">
                Encontradas no currículo ({result.keywords.found.length})
              </h4>
              <ul className="flex flex-wrap gap-2">
                {result.keywords.found.map((k) => (
                  <li key={k}>
                    <Badge variant="success">{k}</Badge>
                  </li>
                ))}
                {result.keywords.found.length === 0 && <li className="text-sm text-muted-foreground">Nenhuma.</li>}
              </ul>
            </div>
            <div>
              <h4 className="mb-2 text-sm font-semibold text-muted-foreground">
                Não encontradas no texto ({result.keywords.missing.length})
              </h4>
              <ul className="flex flex-wrap gap-2">
                {result.keywords.missing.map((k) => (
                  <li key={k}>
                    <Badge variant="neutral">{k}</Badge>
                  </li>
                ))}
                {result.keywords.missing.length === 0 && <li className="text-sm text-muted-foreground">Nenhuma.</li>}
              </ul>
            </div>
          </div>
        </Card>
      )}

      {result.recommendations.length > 0 && (
        <Card>
          <h3 className="flex items-center gap-2 text-lg font-bold text-brand">
            <Lightbulb className="size-5 text-warning" aria-hidden="true" />
            Recomendações
          </h3>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed">
            {result.recommendations.map((r, i) => (
              <li key={i}>{r}</li>
            ))}
          </ul>
        </Card>
      )}

      <Alert variant="info" role="note">
        <Info className="size-4" aria-hidden="true" />
        <AlertDescription>
          Requisitos não identificados não são acrescentados automaticamente ao currículo ajustado.
        </AlertDescription>
      </Alert>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
        <Button type="button" variant="outline" size="xl" onClick={onBack}>
          <ArrowLeft aria-hidden="true" />
          Voltar e corrigir dados
        </Button>
        <Button type="button" size="xl" onClick={onNext}>
          Revisar currículo ajustado
          <ArrowRight aria-hidden="true" />
        </Button>
      </div>
    </section>
  );
}
