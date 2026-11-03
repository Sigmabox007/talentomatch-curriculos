import { Link } from "@tanstack/react-router";
import { ShieldCheck } from "lucide-react";
import type { ReactNode } from "react";

import { BrandMark } from "./BrandMark";
import { PrivacyDialog } from "./PrivacyDialog";

export function SiteHeader({ children }: { children?: ReactNode }) {
  return (
    <header className="brand-band">
      <div className="mx-auto max-w-5xl px-4 pb-20 pt-6 sm:px-6 sm:pt-8">
        <Link
          to="/"
          className="inline-flex items-center gap-3 rounded-lg focus-visible:outline-brand-foreground"
        >
          <BrandMark className="size-10 shrink-0" />
          <span className="font-display text-xl font-extrabold tracking-tight">TalentoMatch</span>
        </Link>
        <p className="mt-6 max-w-xl font-display text-2xl font-bold leading-tight sm:text-4xl">
          Seu talento alinhado às oportunidades.
        </p>
        <p className="mt-3 max-w-xl text-sm text-brand-foreground/75 sm:text-base">
          Compare seu currículo com uma vaga, entenda o alinhamento e revise uma versão mais clara —
          sem inventar nada sobre você.
        </p>
        {children}
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-border bg-card">
      <div className="mx-auto flex max-w-5xl flex-col gap-3 px-4 py-6 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p>
          Ferramenta de apoio. A análise é estimativa textual e não garante aprovação em processos
          seletivos.
        </p>
        <PrivacyDialog
          trigger={
            <button
              type="button"
              className="inline-flex shrink-0 items-center gap-1.5 font-medium text-brand underline-offset-4 hover:underline"
            >
              <ShieldCheck className="size-4" aria-hidden="true" />
              Privacidade
            </button>
          }
        />
      </div>
    </footer>
  );
}
