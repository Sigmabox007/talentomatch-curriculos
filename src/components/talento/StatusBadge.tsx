import { AlertTriangle, CheckCircle2, CircleDashed } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import type { Status } from "@/lib/talento/schema";

export const STATUS_LABEL: Record<Status, string> = {
  identificado: "Identificado no currículo",
  nao_identificado: "Não identificado no texto",
  revisar: "Revisar",
};

export function StatusBadge({ status }: { status: Status }) {
  if (status === "identificado")
    return (
      <Badge variant="success">
        <CheckCircle2 className="size-3.5" aria-hidden="true" />
        {STATUS_LABEL.identificado}
      </Badge>
    );
  if (status === "revisar")
    return (
      <Badge variant="warning">
        <AlertTriangle className="size-3.5" aria-hidden="true" />
        {STATUS_LABEL.revisar}
      </Badge>
    );
  return (
    <Badge variant="neutral">
      <CircleDashed className="size-3.5" aria-hidden="true" />
      {STATUS_LABEL.nao_identificado}
    </Badge>
  );
}
