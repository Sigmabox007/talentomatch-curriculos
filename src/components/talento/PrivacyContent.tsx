export function PrivacyContent() {
  return (
    <div className="space-y-4 text-sm leading-relaxed text-foreground">
      <section className="space-y-1.5">
        <h3 className="text-base font-bold text-brand">O que acontece com os seus textos</h3>
        <p>
          Quando você clica em <strong>Analisar compatibilidade</strong>, a descrição da vaga e o
          texto do currículo são enviados ao nosso servidor e, de lá, a um serviço de inteligência
          artificial de terceiros, acessado pelo gateway de IA da plataforma Lovable, para gerar a
          análise e a proposta de currículo.
        </p>
      </section>
      <section className="space-y-1.5">
        <h3 className="text-base font-bold text-brand">O que o TalentoMatch não faz</h3>
        <ul className="list-disc space-y-1 pl-5">
          <li>Não exige login e não cria conta.</li>
          <li>Não guarda currículos nem vagas em banco de dados.</li>
          <li>
            Não salva os textos no armazenamento do navegador (localStorage ou sessionStorage).
          </li>
          <li>Não registra o conteúdo dos textos nos registros de erro do servidor.</li>
        </ul>
        <p>
          Os textos e o resultado ficam apenas na memória desta página. Ao atualizar ou fechar a
          aba, eles são perdidos.
        </p>
      </section>
      <section className="space-y-1.5">
        <h3 className="text-base font-bold text-brand">O que não podemos garantir</h3>
        <p>
          Não temos contrato próprio com o provedor de IA que confirme ausência total de retenção.
          Por isso, não afirmamos que os dados nunca são armazenados por terceiros. Trate o envio
          como compartilhamento com um serviço externo.
        </p>
      </section>
      <section className="space-y-1.5">
        <h3 className="text-base font-bold text-brand">Recomendação</h3>
        <p>
          Antes de enviar, remova CPF, RG, endereço completo, telefone, data de nascimento e outros
          dados pessoais que não sejam necessários para a análise. Você pode acrescentá-los
          manualmente na versão final antes de baixar o PDF.
        </p>
      </section>
    </div>
  );
}
