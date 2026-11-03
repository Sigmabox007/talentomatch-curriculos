import { createServerFn } from "@tanstack/react-start";
import { getRequestHeader } from "@tanstack/react-start/server";
import { z } from "zod";

import { HARD_PAYLOAD_LIMIT } from "./constants";
import type { AnalyzeResponse } from "./schema";
import { validateInputs } from "./validation";

const inputSchema = z.object({
  job: z.string().max(HARD_PAYLOAD_LIMIT),
  resume: z.string().max(HARD_PAYLOAD_LIMIT),
});

export const analyzeMatch = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => inputSchema.parse(data))
  .handler(async ({ data }): Promise<AnalyzeResponse> => {
    const errors = validateInputs(data.job, data.resume);
    if (errors.job || errors.resume) {
      return {
        ok: false,
        error: {
          code: "invalid_input",
          message: errors.job ?? errors.resume ?? "Dados inválidos.",
          retryable: false,
        },
      };
    }

    const { checkRateLimit } = await import("./rate-limit.server");
    const ip =
      getRequestHeader("cf-connecting-ip") ??
      getRequestHeader("x-forwarded-for")?.split(",")[0]?.trim() ??
      "anon";
    const limit = checkRateLimit(ip);
    if (!limit.ok) {
      const minutes = Math.ceil(limit.retryAfterSec / 60);
      return {
        ok: false,
        error: {
          code: "rate_limited",
          message: `Muitas análises em pouco tempo. Aguarde cerca de ${minutes} minuto(s) e tente novamente.`,
          retryable: true,
        },
      };
    }

    const { runAnalysis } = await import("./analyze.server");
    return runAnalysis(data.job.trim(), data.resume.trim());
  });
