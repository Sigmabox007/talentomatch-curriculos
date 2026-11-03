import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useRef, useState } from "react";

import { AnalysisStep } from "@/components/talento/AnalysisStep";
import { InputStep } from "@/components/talento/InputStep";
import { ReviewStep } from "@/components/talento/ReviewStep";
import { SiteFooter, SiteHeader } from "@/components/talento/SiteChrome";
import { Stepper, type StepId } from "@/components/talento/Stepper";
import { analyzeMatch } from "@/lib/talento/analyze.functions";
import { EXAMPLE_JOB, EXAMPLE_RESUME } from "@/lib/talento/constants";
import type { AnalysisResult } from "@/lib/talento/schema";
import { validateInputs } from "@/lib/talento/validation";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "TalentoMatch — Compare seu currículo com a vaga" },
      {
        name: "description",
        content:
          "Compare o texto do seu currículo com uma vaga, veja uma análise explicável de alinhamento e revise uma versão mais clara, sem inventar fatos.",
      },
      { property: "og:title", content: "TalentoMatch — Seu talento alinhado às oportunidades" },
      {
        property: "og:description",
        content:
          "Análise explicável entre currículo e vaga, com proposta revisável e exportação em PDF.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

interface Analyzed {
  job: string;
  resume: string;
  result: AnalysisResult;
}

function Index() {
  const analyze = useServerFn(analyzeMatch);

  // Tudo fica apenas em memória desta página (sem localStorage/sessionStorage).
  const [step, setStep] = useState<StepId>(1);
  const [job, setJob] = useState("");
  const [resume, setResume] = useState("");
  const [consent, setConsent] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<{ message: string; retryable: boolean } | null>(null);
  const [analyzed, setAnalyzed] = useState<Analyzed | null>(null);
  const [edited, setEdited] = useState("");
  const inflight = useRef(false);
  const firstRender = useRef(true);

  const errors = submitted ? validateInputs(job, resume) : {};
  const consentError = submitted && !consent;
  const inputsChanged = !!analyzed && (analyzed.job !== job.trim() || analyzed.resume !== resume.trim());

  useEffect(() => {
    const hasData = job.length > 0 || resume.length > 0;
    if (!hasData) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [job, resume]);

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
    document.getElementById(`step-heading-${step}`)?.focus({ preventScroll: true });
  }, [step]);

  const runAnalyze = async () => {
    if (inflight.current) return;
    setSubmitted(true);
    const v = validateInputs(job, resume);
    if (v.job || v.resume || !consent) return;

    inflight.current = true;
    setLoading(true);
    setApiError(null);
    try {
      const res = await analyze({ data: { job, resume } });
      if (res.ok) {
        setAnalyzed({ job: job.trim(), resume: resume.trim(), result: res.result });
        setEdited(res.result.resumeText);
        setStep(2);
      } else {
        setApiError({ message: res.error.message, retryable: res.error.retryable });
      }
    } catch {
      setApiError({
        message: "Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.",
        retryable: true,
      });
    } finally {
      inflight.current = false;
      setLoading(false);
    }
  };

  const maxReached: StepId = analyzed ? 3 : 1;

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="mx-auto -mt-12 w-full max-w-5xl flex-1 px-4 sm:px-6">
        <Stepper current={step} maxReached={maxReached} onSelect={setStep} />
        <div className="mt-8">
          {step === 1 && (
            <InputStep
              job={job}
              resume={resume}
              onJob={setJob}
              onResume={setResume}
              errors={errors}
              consent={consent}
              onConsent={setConsent}
              consentError={consentError}
              loading={loading}
              onAnalyze={runAnalyze}
              onLoadExample={() => {
                setJob(EXAMPLE_JOB);
                setResume(EXAMPLE_RESUME);
              }}
              apiError={apiError}
              hasResult={!!analyzed}
              inputsChanged={inputsChanged}
              onViewResult={() => setStep(2)}
            />
          )}
          {step === 2 && analyzed && (
            <AnalysisStep result={analyzed.result} onBack={() => setStep(1)} onNext={() => setStep(3)} />
          )}
          {step === 3 && analyzed && (
            <ReviewStep
              text={edited}
              onText={setEdited}
              originalResume={analyzed.resume}
              missingKeywords={analyzed.result.keywords.missing}
              rewriteNotes={analyzed.result.rewriteNotes}
              onBack={() => setStep(2)}
            />
          )}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
