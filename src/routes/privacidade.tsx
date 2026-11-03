import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

import { PrivacyContent } from "@/components/talento/PrivacyContent";
import { SiteFooter, SiteHeader } from "@/components/talento/SiteChrome";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/privacidade")({
  head: () => ({
    meta: [
      { title: "Privacidade — TalentoMatch" },
      {
        name: "description",
        content:
          "Como o TalentoMatch trata os textos de vaga e currículo: sem login, sem banco de currículos e processamento por serviço de IA de terceiros.",
      },
      { property: "og:title", content: "Privacidade — TalentoMatch" },
      {
        property: "og:description",
        content: "Linguagem honesta sobre o tratamento dos seus textos no TalentoMatch.",
      },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="mx-auto -mt-12 w-full max-w-3xl flex-1 px-4 sm:px-6">
        <article className="rounded-2xl border border-border bg-card p-6 shadow-raised sm:p-8">
          <h1 className="mb-4 text-2xl font-extrabold text-brand">Privacidade</h1>
          <PrivacyContent />
          <Button asChild variant="outline" className="mt-6">
            <Link to="/">
              <ArrowLeft aria-hidden="true" />
              Voltar ao TalentoMatch
            </Link>
          </Button>
        </article>
      </main>
      <SiteFooter />
    </div>
  );
}
