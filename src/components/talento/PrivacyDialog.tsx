import { ShieldCheck } from "lucide-react";
import type { ReactNode } from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { PrivacyContent } from "./PrivacyContent";

export function PrivacyDialog({ trigger }: { trigger: ReactNode }) {
  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-display text-brand">
            <ShieldCheck className="size-5 text-primary" aria-hidden="true" />
            Privacidade
          </DialogTitle>
          <DialogDescription>Como os seus textos são tratados nesta ferramenta.</DialogDescription>
        </DialogHeader>
        <PrivacyContent />
      </DialogContent>
    </Dialog>
  );
}
