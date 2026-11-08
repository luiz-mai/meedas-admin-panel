"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Store,
  Layers,
  ChartNoAxesCombined,
  ScanLine,
  Users,
  Bell,
  Mail,
  CreditCard,
  ShieldAlert,
  History,
  ArrowUpRight,
} from "lucide-react";
const groups = [
  { label: "VISÃO GERAL", items: [["overview", "Resumo", LayoutDashboard]] },
  {
    label: "CATÁLOGO E DADOS",
    items: [
      ["stores", "Lojas", Store],
      ["programs", "Programas", Layers],
      ["rates", "Pontuações", ChartNoAxesCombined],
      ["crawls", "Coletas", ScanLine],
    ],
  },
  {
    label: "CONTAS E RELACIONAMENTO",
    items: [
      ["users", "Usuários", Users],
      ["alerts", "Alertas", Bell],
      ["deliveries", "Notificações", Mail],
    ],
  },
  {
    label: "NEGÓCIO E CONTROLE",
    items: [
      ["subscriptions", "Assinaturas", CreditCard],
      ["risks", "Revisões financeiras", ShieldAlert],
      ["audit", "Auditoria", History],
    ],
  },
] as const;
export function Sidebar() {
  const path = usePathname();
  return (
    <aside className="sidebar">
      <a className="skip-link" href="#main-content">
        Pular para o conteúdo
      </a>
      <Link className="sidebar-brand" href="/overview">
        <img src="/brand/wordmark.png" alt="Meedas" />
        <span>admin</span>
      </Link>
      <nav aria-label="Navegação administrativa">
        {groups.map((group) => (
          <div className="nav-group" key={group.label}>
            <p>{group.label}</p>
            {group.items.map(([slug, label, Icon]) => (
              <Link
                prefetch={false}
                key={slug}
                aria-label={label}
                href={`/${slug}`}
                className={`nav-item ${path === `/${slug}` ? "active" : ""}`}
                aria-current={path === `/${slug}` ? "page" : undefined}
              >
                <Icon size={18} />
                <span>{label}</span>
                {path === `/${slug}` && <span className="nav-active-dot" />}
              </Link>
            ))}
          </div>
        ))}
      </nav>
      <div className="sidebar-bottom">
        <div className="workspace-mark">M</div>
        <div>
          <strong>Meedas</strong>
          <span>Central de operação</span>
        </div>
        <a
          href="https://app.meedas.com.br"
          aria-label="Abrir aplicativo Meedas"
          target="_blank"
          rel="noreferrer"
        >
          <ArrowUpRight size={18} />
        </a>
      </div>
    </aside>
  );
}
