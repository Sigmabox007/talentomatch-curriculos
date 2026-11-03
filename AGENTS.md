<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

# Project rules

- Domain logic lives in `src/lib/talento/` as pure, tested modules (text, scoring, resume-format, validation); UI only renders their output. Why: the score and honesty checks must be verifiable without the AI.
- The alignment percentage is always computed in code from verified requirements, never taken from the AI. Why: the model's numbers are untrusted.
- Every AI-cited evidence snippet is verified against the original resume; unverifiable "identified" items are downgraded. Why: no skill is shown as proven without a real quote.
- Exactly one AI call per "Analisar" click, through `analyze.functions.ts` → `analyze.server.ts` (AI Gateway SDK, strict JSON schema + Zod). Why: cost control and a single validated contract.
- AI output goes only through `parseAiOutput` (`ai-output.ts`): total size, JSON, then list lengths are checked before Zod, with limits in `AI_OUTPUT_LIMITS`; anything over a limit rejects the whole response, never truncates. Why: Zod 3 `.max()` still iterates every element, and silent cuts would hide data.
- No persistence of user texts: no database, no localStorage/sessionStorage, no logging of content (log only error codes). Why: privacy promise of the MVP.
- Input limits are shared via `validation.ts` and re-checked on the server. Why: client checks are bypassable.
- PDF export uses jsPDF with standard fonts, built from the exact editor text via `parseResumeText`. Why: selectable, single-column, ATS-friendly output identical to what the user reviewed.
- All colors are semantic tokens in `src/styles.css`; components use variants (badge success/warning/neutral, alert info/warning). Why: consistent theming.
