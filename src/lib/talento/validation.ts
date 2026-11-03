import { MAX_CHARS, MIN_JOB_CHARS, MIN_RESUME_CHARS } from "./constants";

const fmt = (n: number) => n.toLocaleString("pt-BR");

/** Validação compartilhada: a interface mostra as mensagens e o servidor repete a checagem. */
export function validateInputs(job: string, resume: string): { job?: string; resume?: string } {
  const out: { job?: string; resume?: string } = {};
  const j = job.trim();
  const r = resume.trim();

  if (!j) out.job = "Cole ou digite a descrição da vaga.";
  else if (j.length < MIN_JOB_CHARS)
    out.job = `A descrição da vaga está muito curta. Inclua pelo menos ${fmt(MIN_JOB_CHARS)} caracteres, com os requisitos.`;
  else if (j.length > MAX_CHARS)
    out.job = `A descrição da vaga passou do limite de ${fmt(MAX_CHARS)} caracteres. Remova trechos que não sejam requisitos ou responsabilidades.`;

  if (!r) out.resume = "Cole ou digite o texto do seu currículo.";
  else if (r.length < MIN_RESUME_CHARS)
    out.resume = `O currículo está muito curto. Inclua pelo menos ${fmt(MIN_RESUME_CHARS)} caracteres.`;
  else if (r.length > MAX_CHARS)
    out.resume = `O currículo passou do limite de ${fmt(MAX_CHARS)} caracteres. Resuma ou remova partes menos relevantes.`;

  return out;
}
