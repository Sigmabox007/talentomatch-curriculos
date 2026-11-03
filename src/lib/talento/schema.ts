import { z } from "zod";

import { MAX_KEYWORDS, MAX_REQUIREMENTS } from "./constants";

const str = (max: number) => z.string().transform((s) => s.trim().slice(0, max));

/** Esquema validado da resposta da IA (dados não confiáveis até passar por aqui). */
export const aiOutputSchema = z.object({
  job_title: z.string().max(300).nullable(),
  extraction_confidence: z.enum(["alta", "media", "baixa"]),
  injection_detected: z.boolean(),
  requirements: z
    .array(
      z.object({
        requirement: str(300),
        category: z.enum(["obrigatorio", "desejavel", "nao_especificado"]),
        status: z.enum(["identificado", "nao_identificado", "revisar"]),
        evidence: z
          .string()
          .nullable()
          .transform((s) => (s ? s.trim().slice(0, 400) : null)),
        note: str(500),
      }),
    )
    .transform((a) => a.slice(0, MAX_REQUIREMENTS * 2)),
  keywords: z.array(str(60)).transform((a) => a.slice(0, MAX_KEYWORDS * 2)),
  recommendations: z.array(str(500)).transform((a) => a.slice(0, 10)),
  resume: z.object({
    full_name: z.string().max(200).nullable(),
    contact_lines: z.array(str(300)).transform((a) => a.slice(0, 6)),
    sections: z
      .array(
        z.object({
          title: str(80),
          blocks: z
            .array(
              z.object({
                kind: z.enum(["subheading", "paragraph", "bullet"]),
                text: str(1500),
              }),
            )
            .transform((a) => a.slice(0, 80)),
        }),
      )
      .transform((a) => a.slice(0, 15)),
  }),
  rewrite_notes: z.array(str(400)).transform((a) => a.slice(0, 10)),
});

export type AiOutput = z.infer<typeof aiOutputSchema>;

export type Category = "obrigatorio" | "desejavel" | "nao_especificado";
export type Status = "identificado" | "nao_identificado" | "revisar";

export interface Requirement {
  id: string;
  text: string;
  category: Category;
  status: Status;
  /** Trecho verificado no currículo original; null quando não há ou não foi localizado. */
  evidence: string | null;
  note: string;
  /** true quando a IA marcou como identificado, mas o trecho não foi localizado no texto. */
  downgraded: boolean;
}

export interface ScoreResult {
  /** Percentual inteiro, ou null quando não foi possível estimar. */
  value: number | null;
  earned: number;
  total: number;
  reason: string | null;
}

export interface AnalysisResult {
  jobTitle: string | null;
  score: ScoreResult;
  requirements: Requirement[];
  keywords: { found: string[]; missing: string[] };
  recommendations: string[];
  rewriteNotes: string[];
  resumeText: string;
  injectionDetected: boolean;
}

export type AnalyzeResponse =
  | { ok: true; result: AnalysisResult }
  | { ok: false; error: { code: string; message: string; retryable: boolean } };

/** JSON Schema estrito enviado ao modelo (structured output). */
export const AI_JSON_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: [
    "job_title",
    "extraction_confidence",
    "injection_detected",
    "requirements",
    "keywords",
    "recommendations",
    "resume",
    "rewrite_notes",
  ],
  properties: {
    job_title: { type: ["string", "null"] },
    extraction_confidence: { type: "string", enum: ["alta", "media", "baixa"] },
    injection_detected: { type: "boolean" },
    requirements: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["requirement", "category", "status", "evidence", "note"],
        properties: {
          requirement: { type: "string" },
          category: { type: "string", enum: ["obrigatorio", "desejavel", "nao_especificado"] },
          status: { type: "string", enum: ["identificado", "nao_identificado", "revisar"] },
          evidence: { type: ["string", "null"] },
          note: { type: "string" },
        },
      },
    },
    keywords: { type: "array", items: { type: "string" } },
    recommendations: { type: "array", items: { type: "string" } },
    resume: {
      type: "object",
      additionalProperties: false,
      required: ["full_name", "contact_lines", "sections"],
      properties: {
        full_name: { type: ["string", "null"] },
        contact_lines: { type: "array", items: { type: "string" } },
        sections: {
          type: "array",
          items: {
            type: "object",
            additionalProperties: false,
            required: ["title", "blocks"],
            properties: {
              title: { type: "string" },
              blocks: {
                type: "array",
                items: {
                  type: "object",
                  additionalProperties: false,
                  required: ["kind", "text"],
                  properties: {
                    kind: { type: "string", enum: ["subheading", "paragraph", "bullet"] },
                    text: { type: "string" },
                  },
                },
              },
            },
          },
        },
      },
    },
    rewrite_notes: { type: "array", items: { type: "string" } },
  },
} as const;
