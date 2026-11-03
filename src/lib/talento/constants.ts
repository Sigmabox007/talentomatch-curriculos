// Limites e textos compartilhados entre interface e servidor.
export const MAX_CHARS = 12_000;
export const MIN_JOB_CHARS = 150;
export const MIN_RESUME_CHARS = 150;
/** Teto absoluto aceito pelo servidor antes de qualquer validação detalhada. */
export const HARD_PAYLOAD_LIMIT = 20_000;
/** Número máximo de requisitos considerados no cálculo. */
export const MAX_REQUIREMENTS = 25;
export const MAX_KEYWORDS = 30;

/**
 * Limites da resposta da IA, verificados ANTES do Zod. Respostas acima deles são
 * rejeitadas por inteiro (nunca cortadas). As instruções pedem no máximo 20 requisitos,
 * 20 palavras-chave e 6 recomendações; os limites deixam folga sobre esse formato real.
 */
export const AI_OUTPUT_LIMITS = {
  /** Tamanho total do texto bruto antes de interpretar o JSON (16.000 tokens de saída cabem com folga). */
  rawChars: 80_000,
  requirements: MAX_REQUIREMENTS,
  keywords: MAX_KEYWORDS,
  recommendations: 10,
  rewriteNotes: 20,
  contactLines: 10,
  sections: 20,
  blocksPerSection: 150,
  totalBlocks: 400,
  /** Tamanho máximo de cada texto (caracteres). */
  text: {
    jobTitle: 300,
    requirement: 500,
    evidence: 600,
    note: 1000,
    keyword: 120,
    recommendation: 1000,
    rewriteNote: 600,
    fullName: 200,
    contactLine: 300,
    sectionTitle: 120,
    block: 6000,
  },
} as const;

export const WEIGHTS = {
  obrigatorio: 2,
  desejavel: 1,
  nao_especificado: 1,
} as const;

export const GAP_GUIDANCE =
  "Se você possui essa experiência e apenas não a descreveu, acrescente-a manualmente após conferir os fatos.";

// Exemplo inteiramente fictício, carregado apenas quando a pessoa clica no botão.
export const EXAMPLE_JOB = `Analista de Suporte Técnico (Pleno) — Empresa Fictícia Horizonte

Responsabilidades:
- Atender chamados de usuários internos por telefone, e-mail e sistema de tickets.
- Diagnosticar e resolver problemas de hardware, software e rede.
- Documentar soluções na base de conhecimento.

Requisitos obrigatórios:
- Experiência mínima de 2 anos com suporte técnico.
- Conhecimento em Windows 10/11 e pacote Office.
- Experiência com sistema de chamados (Jira, GLPI ou similar).
- Inglês intermediário para leitura de documentação.

Diferenciais:
- Conhecimento em SQL básico.
- Certificação ITIL Foundation.
- Experiência com Linux.`;

export const EXAMPLE_RESUME = `Mariana Exemplo (pessoa fictícia)
São Paulo - SP | mariana.exemplo@exemplo.com

Objetivo: trabalhar com suporte de TI.

Experiência
Técnica de Suporte — Loja Fictícia Alfa (mar/2021 – atual)
Atendo chamados dos funcionários das lojas pelo GLPI, uns 15 por dia. Faço formatação e instalação de Windows 10 e Office. Resolvo problemas de impressora e de rede wi-fi. Escrevo tutoriais para a equipe.

Auxiliar Administrativo — Escritório Fictício Beta (2019 – 2021)
Controle de planilhas no Excel e atendimento telefônico.

Formação
Técnico em Informática — Escola Técnica Fictícia (2020)

Idiomas
Inglês básico`;
