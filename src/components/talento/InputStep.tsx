import { AlertCircle, FlaskConical, Info, Loader2, RotateCcw, Sparkles } from "lucide-react";
import { useId } from "react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MAX_CHARS } from "@/lib/talento/constants";
import { cn } from "@/lib/utils";

import { PrivacyDialog } from "./PrivacyDialog";

function TextField({
  label,
  hint,
  placeholder,
  value,
  onChange,
  error,
  disabled,
}: {
  label: string;
  hint: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  error?: string | undefined;
  disabled?: boolean;
}) {
  const id = useId();
  const len = value.length;
  const over = len > MAX_CHARS;
  const near = !over && len > MAX_CHARS * 0.9;
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={id} className="font-display text-base font-bold text-brand">
        {label}
      </Label>
      <p id={`${id}-hint`} className="text-sm text-muted-foreground">
        {hint}
      </p>
      <Textarea
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        aria-invalid={error ? true : undefined}
        aria-describedby={`${id}-hint ${id}-count${error ? ` ${id}-err` : ""}`}
        spellCheck
        className={cn(
          "min-h-[260px] resize-y bg-card p-4 text-base leading-relaxed md:min-h-[340px] md:text-[15px]",
          error && "border-destructive focus-visible:ring-destructive",
        )}
      />
      <div className="flex items-start justify-between gap-3 text-sm">
        <p id={`${id}-err`} className="font-medium text-destructive" role={error ? "alert" : undefined}>
          {error}
        </p>
        <p
          id={`${id}-count`}
          className={cn(
            "shrink-0 tabular-nums",
            over ? "font-semibold text-destructive" : near ? "text-warning-strong" : "text-muted-foreground",
          )}
        >
          {len.toLocaleString("pt-BR")} / {MAX_CHARS.toLocaleString("pt-BR")}
          <span className="sr-only"> caracteres</span>
        </p>
      </div>
    </div>
  );
}

export interface InputStepProps {
  job: string;
  resume: string;
  onJob: (v: string) => void;
  onResume: (v: string) => void;
  errors: { job?: string | undefined; resume?: string | undefined };
  consent: boolean;
  onConsent: (v: boolean) => void;
  consentError: boolean;
  loading: boolean;
  onAnalyze: () => void;
  onLoadExample: () => void;
  apiError: { message: string; retryable: boolean } | null;
  hasResult: boolean;
  inputsChanged: boolean;
  onViewResult: () => void;
}

export function InputStep(p: InputStepProps) {
  return (
    <section aria-labelledby="step-heading-1" className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 id="step-heading-1" tabIndex={-1} className="text-2xl font-extrabold text-brand outline-none">
            Informe a vaga e o seu currículo
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Cole ou digite os textos. Nesta versão não há envio de arquivos PDF ou Word.
          </p>
        </div>
        <Button type="button" variant="outline" onClick={p.onLoadExample} disabled={p.loading}>
          <FlaskConical aria-hidden="true" />
          Carregar exemplo fictício
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <TextField
          label="Descrição da vaga"
          hint="Inclua requisitos, responsabilidades e diferenciais do anúncio."
          placeholder={"Ex.: Requisitos obrigatórios:\n- Experiência com atendimento ao cliente\n- Pacote Office\nDiferenciais:\n- Inglês intermediário"}
          value={p.job}
          onChange={p.onJob}
          error={p.errors.job}
          disabled={p.loading}
        />
        <TextField
          label="Meu currículo atual"
          hint="Cole o texto completo: experiências, formação, cursos, idiomas e competências."
          placeholder={"Ex.: Maria Silva\nExperiência\nAtendente — Loja X (2021 – atual)\n- Atendimento a clientes por telefone e e-mail"}
          value={p.resume}
          onChange={p.onResume}
          error={p.errors.resume}
          disabled={p.loading}
        />
      </div>

      <Alert variant="info" role="note">
        <Info className="size-4" aria-hidden="true" />
        <AlertTitle className="font-semibold">Antes de enviar</AlertTitle>
        <AlertDescription className="space-y-2">
          <p>
            Os textos serão processados por um serviço de inteligência artificial de terceiros.
            Remova CPF, endereço, telefone e outros dados pessoais desnecessários. Nada é salvo
            nesta ferramenta: ao atualizar ou fechar a página, os dados serão perdidos.{" "}
            <PrivacyDialog
              trigger={
                <button type="button" className="font-semibold text-brand underline underline-offset-4">
                  Ler sobre privacidade
                </button>
              }
            />
          </p>
          <div className="flex items-start gap-2.5 pt-1">
            <Checkbox
              id="consent"
              checked={p.consent}
              onCheckedChange={(v) => p.onConsent(v === true)}
              disabled={p.loading}
              aria-invalid={p.consentError ? true : undefined}
              aria-describedby={p.consentError ? "consent-err" : undefined}
              className="mt-0.5"
            />
            <Label htmlFor="consent" className="text-sm font-medium leading-snug">
              Entendi que os textos serão enviados a um serviço de IA para análise.
            </Label>
          </div>
          {p.consentError && (
            <p id="consent-err" role="alert" className="text-sm font-medium text-destructive">
              Confirme que entendeu o envio para continuar.
            </p>
          )}
        </AlertDescription>
      </Alert>

      {p.apiError && (
        <Alert variant="destructive">
          <AlertCircle className="size-4" aria-hidden="true" />
          <AlertTitle className="font-semibold">A análise não foi concluída</AlertTitle>
          <AlertDescription className="space-y-3">
            <p>{p.apiError.message}</p>
            {p.apiError.retryable && (
              <Button type="button" variant="outline" size="sm" onClick={p.onAnalyze} disabled={p.loading}>
                <RotateCcw aria-hidden="true" />
                Tentar novamente
              </Button>
            )}
          </AlertDescription>
        </Alert>
      )}

      {p.hasResult && (
        <p className="text-sm text-muted-foreground">
          {p.inputsChanged
            ? "Você alterou os textos. Uma nova análise substituirá a análise e a versão revisada atuais."
            : "Já existe uma análise para estes textos."}{" "}
          {!p.inputsChanged && (
            <button
              type="button"
              onClick={p.onViewResult}
              className="font-semibold text-brand underline underline-offset-4"
            >
              Ver análise atual
            </button>
          )}
        </p>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Button
          type="button"
          size="xl"
          onClick={p.onAnalyze}
          disabled={p.loading}
          aria-busy={p.loading}
          className="w-full sm:w-auto"
        >
          {p.loading ? (
            <Loader2 className="animate-spin" aria-hidden="true" />
          ) : (
            <Sparkles aria-hidden="true" />
          )}
          {p.loading ? "Analisando…" : "Analisar compatibilidade"}
        </Button>
        <p className="text-sm text-muted-foreground" aria-live="polite">
          {p.loading ? "Analisando os textos. Isso pode levar até um minuto." : ""}
        </p>
      </div>
    </section>
  );
}
