import { Check } from "lucide-react";

import { cn } from "@/lib/utils";

export type StepId = 1 | 2 | 3;

const STEPS: { id: StepId; label: string; short: string }[] = [
  { id: 1, label: "Informar", short: "Vaga e currículo" },
  { id: 2, label: "Analisar", short: "Alinhamento" },
  { id: 3, label: "Revisar e exportar", short: "Currículo final" },
];

export function Stepper({
  current,
  maxReached,
  onSelect,
}: {
  current: StepId;
  maxReached: StepId;
  onSelect: (s: StepId) => void;
}) {
  return (
    <nav aria-label="Etapas" className="rounded-2xl bg-card p-2 shadow-raised sm:p-3">
      <ol className="grid grid-cols-3 gap-1 sm:gap-2">
        {STEPS.map((s) => {
          const done = s.id < current;
          const active = s.id === current;
          const enabled = s.id <= maxReached;
          return (
            <li key={s.id}>
              <button
                type="button"
                disabled={!enabled}
                onClick={() => onSelect(s.id)}
                aria-current={active ? "step" : undefined}
                className={cn(
                  "flex w-full items-center gap-2 rounded-xl px-2 py-2 text-left transition-colors sm:gap-3 sm:px-3",
                  active ? "bg-accent" : enabled ? "hover:bg-muted" : "opacity-60",
                )}
              >
                <span
                  className={cn(
                    "flex size-7 shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold sm:size-8 sm:text-sm",
                    active && "border-primary bg-primary text-primary-foreground",
                    done && "border-primary bg-card text-primary",
                    !active && !done && "border-border text-muted-foreground",
                  )}
                  aria-hidden="true"
                >
                  {done ? <Check className="size-4" /> : s.id}
                </span>
                <span className="min-w-0">
                  <span
                    className={cn(
                      "block truncate text-xs font-semibold sm:text-sm",
                      active ? "text-brand" : "text-foreground",
                    )}
                  >
                    <span className="sr-only">Etapa {s.id}: </span>
                    {s.label}
                  </span>
                  <span className="hidden truncate text-xs text-muted-foreground sm:block">
                    {s.short}
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
