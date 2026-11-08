import type { AdminSection } from "@/contracts/admin-v1";
export const sections: Record<
  AdminSection,
  {
    title: string;
    description: string;
    eyebrow: string;
    search?: string;
    filters?: [string, string][];
    columns: [string, string][];
  }
> = {
  overview: {
    title: "A operação, em perspectiva.",
    description: "Acompanhe o catálogo e saiba onde sua atenção faz diferença.",
    eyebrow: "VISÃO GERAL",
    columns: [],
  },
  stores: {
    title: "Lojas",
    description: "Consulte o catálogo e mantenha os cadastros organizados.",
    eyebrow: "CATÁLOGO E DADOS",
    search: "Buscar por nome da loja",
    columns: [
      ["name", "Loja"],
      ["slug", "Identificador"],
      ["active", "Disponibilidade"],
      ["created_at", "Cadastro"],
    ],
  },
  programs: {
    title: "Programas",
    description: "Os programas de fidelidade que fazem parte do Meedas.",
    eyebrow: "CATÁLOGO E DADOS",
    search: "Buscar por nome do programa",
    columns: [
      ["name", "Programa"],
      ["points_unit", "Unidade"],
      ["active", "Disponibilidade"],
      ["created_at", "Cadastro"],
    ],
  },
  rates: {
    title: "Pontuações e evidências",
    description:
      "Histórico das observações publicadas. Abra os detalhes para conferir condições e evidências.",
    eyebrow: "CATÁLOGO E DADOS",
    search: "Buscar no texto da evidência",
    columns: [
      ["series.partnership.store.name", "Loja"],
      ["series.partnership.program.name", "Programa"],
      ["normalized_rate", "Taxa por unidade"],
      ["series.base_unit_code", "Unidade-base"],
      ["qualifier", "Qualificador"],
      ["observed_on", "Observação"],
    ],
  },
  crawls: {
    title: "Coletas",
    description:
      "Publicação e cobertura são sinais diferentes. Uma execução publicada pode ter cobertura parcial.",
    eyebrow: "CATÁLOGO E DADOS",
    search: "Buscar código de erro",
    filters: [
      ["published", "Publicadas"],
      ["failed", "Com falha"],
      ["running", "Em andamento"],
      ["staged", "Em preparação"],
    ],
    columns: [
      ["source.program.name", "Programa"],
      ["status", "Execução"],
      ["coverage_status", "Cobertura"],
      ["published_records", "Publicados"],
      ["quarantined_records", "Quarentena"],
      ["started_at", "Início"],
    ],
  },
  users: {
    title: "Usuários",
    description:
      "Consulte contas e planos. Use o identificador da conta para localizar um usuário específico.",
    eyebrow: "CONTAS E RELACIONAMENTO",
    search: "Buscar pelo UUID do usuário",
    columns: [
      ["email", "E-mail"],
      ["plan.plan", "Plano registrado"],
      ["plan.status", "Estado do plano"],
      ["last_sign_in_at", "Último acesso"],
      ["created_at", "Cadastro"],
    ],
  },
  alerts: {
    title: "Alertas",
    description:
      "Regras cadastradas pelos usuários, com seus limites e condições.",
    eyebrow: "CONTAS E RELACIONAMENTO",
    search: "Buscar pelo UUID do usuário",
    columns: [
      ["store.name", "Loja"],
      ["rule_type", "Regra"],
      ["threshold", "Limite"],
      ["is_active", "Estado"],
      ["user_id", "Usuário"],
    ],
  },
  deliveries: {
    title: "Notificações",
    description:
      "Acompanhe o processamento dos envios. Enviado indica aceite pelo provedor, sem comprovar entrega na caixa de entrada.",
    eyebrow: "CONTAS E RELACIONAMENTO",
    search: "Buscar e-mail do destinatário",
    filters: [
      ["failed", "Com falha"],
      ["pending", "Pendentes"],
      ["processing", "Processando"],
      ["sent", "Enviadas"],
    ],
    columns: [
      ["recipient", "Destinatário"],
      ["status", "Processamento"],
      ["created_at", "Criada em"],
      ["processed_at", "Processada em"],
      ["error_message", "Diagnóstico"],
    ],
  },
  subscriptions: {
    title: "Assinaturas",
    description:
      "Estado financeiro sincronizado com a Stripe. Dados de teste e produção estão identificados por ambiente.",
    eyebrow: "NEGÓCIO E CONTROLE",
    search: "Buscar ID do cliente Stripe",
    filters: [
      ["active", "Ativas"],
      ["past_due", "Pagamento pendente"],
      ["canceled", "Canceladas"],
      ["incomplete", "Incompletas"],
    ],
    columns: [
      ["customer_id", "Cliente Stripe"],
      ["livemode", "Ambiente"],
      ["subscription_status", "Assinatura"],
      ["paid_until", "Período pago até"],
      ["cancel_at_period_end", "Cancela ao fim"],
    ],
  },
  risks: {
    title: "Revisões financeiras",
    description:
      "Acompanhe os riscos registrados. A análise financeira continua no painel da Stripe.",
    eyebrow: "NEGÓCIO E CONTROLE",
    search: "Buscar ID do cliente Stripe",
    filters: [["unresolved", "Aguardando revisão"]],
    columns: [
      ["customer_id", "Cliente Stripe"],
      ["kind", "Ocorrência"],
      ["blocks_access", "Bloqueia acesso"],
      ["resolved_at", "Resolvida em"],
      ["created_at", "Registrada em"],
    ],
  },
  audit: {
    title: "Auditoria",
    description:
      "Cada alteração de cadastro, seu responsável e sua justificativa.",
    eyebrow: "NEGÓCIO E CONTROLE",
    search: "Buscar na justificativa",
    columns: [
      ["created_at", "Data"],
      ["resource", "Recurso"],
      ["actor_id", "Responsável"],
      ["reason", "Justificativa"],
    ],
  },
};
export function valueAt(row: Record<string, unknown>, path: string): unknown {
  return path
    .split(".")
    .reduce<unknown>(
      (value, key) =>
        value && typeof value === "object"
          ? (value as Record<string, unknown>)[key]
          : undefined,
      row,
    );
}
const translations: Record<string, string> = {
  published: "Publicada",
  failed: "Falha",
  running: "Em andamento",
  staged: "Em preparação",
  complete: "Completa",
  partial: "Parcial",
  unknown: "Não verificada",
  pending: "Pendente",
  processing: "Processando",
  sent: "Enviada",
  active: "Ativa",
  canceled: "Cancelada",
  canceling: "Cancelamento agendado",
  past_due: "Pagamento pendente",
  incomplete: "Incompleta",
  none: "Sem assinatura",
  free: "Gratuito",
  plus: "Plus",
  promotion: "Promoção",
  minimum_rate: "Taxa mínima",
  exact: "Exata",
  up_to: "Até",
  from: "A partir de",
  refund: "Reembolso",
  dispute: "Disputa",
  fraud: "Fraude",
  stores: "Loja",
  programs: "Programa",
};
export function display(value: unknown, key = ""): string {
  if (value === null || value === undefined || value === "") return "—";
  if (key === "livemode") return value ? "Produção" : "Teste";
  if (typeof value === "boolean")
    return ["active", "is_active"].includes(key)
      ? value
        ? "Ativo"
        : "Inativo"
      : value
        ? "Sim"
        : "Não";
  if (typeof value === "number")
    return new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 6 }).format(
      value,
    );
  if (typeof value === "string") {
    if (/^\d{4}-\d{2}-\d{2}$/.test(value))
      return value.split("-").reverse().join("/");
    if (/^\d{4}-\d{2}-\d{2}T/.test(value) && !Number.isNaN(Date.parse(value)))
      return new Intl.DateTimeFormat("pt-BR", {
        dateStyle: "short",
        timeStyle: "short",
        timeZone: "America/Sao_Paulo",
      }).format(new Date(value));
    return translations[value] ?? value;
  }
  return JSON.stringify(value);
}
export function badgeTone(value: unknown) {
  if (["failed", "past_due", "fraud", "dispute"].includes(String(value)))
    return "danger";
  if (
    ["partial", "pending", "unknown", "processing", "incomplete"].includes(
      String(value),
    )
  )
    return "warning";
  if (
    ["published", "complete", "sent", "active", "plus", "true"].includes(
      String(value),
    )
  )
    return "success";
  return "neutral";
}
