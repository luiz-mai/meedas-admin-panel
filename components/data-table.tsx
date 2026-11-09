import Link from "next/link";
import {
  Search,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  Inbox,
  ExternalLink,
} from "lucide-react";
import type { AdminPage, AdminRow } from "@/contracts/admin-v1";
import { sections, display, valueAt, badgeTone } from "@/lib/presentation";
import { EditCatalog } from "./edit-catalog";
export function DataTable({
  data,
  query,
  status,
}: {
  data: AdminPage;
  query: string;
  status: string;
}) {
  const config = sections[data.section];
  const href = (page: number) => {
    const params = new URLSearchParams();
    params.set("page", String(page));
    if (query) params.set("q", query);
    if (status) params.set("status", status);
    return `/${data.section}?${params}`;
  };
  const pages = Math.max(1, Math.ceil(data.total / data.pageSize));
  return (
    <section className="data-card">
      <div className="table-toolbar">
        <form className="filter-form" method="get" action={`/${data.section}`}>
          {config.search && (
            <div className="search-field">
              <Search size={17} />
              <input
                name="q"
                aria-label={config.search}
                placeholder={config.search}
                defaultValue={query}
              />
            </div>
          )}
          {config.filters && (
            <div className="select-field">
              <SlidersHorizontal size={15} />
              <select
                name="status"
                aria-label={
                  data.section === "feedback"
                    ? "Filtrar por tipo de feedback"
                    : "Filtrar por estado"
                }
                defaultValue={status}
              >
                <option value="">
                  {data.section === "feedback"
                    ? "Todos os tipos"
                    : "Todos os estados"}
                </option>
                {config.filters.map(([value, label]) => (
                  <option value={value} key={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          )}
          <button className="button secondary" type="submit">
            Filtrar
          </button>
          {(query || status) && (
            <Link href={`/${data.section}`} className="clear-filters">
              Limpar
            </Link>
          )}
        </form>
        <span className="result-count">
          {display(data.total)} {data.total === 1 ? "registro" : "registros"}
        </span>
      </div>
      {data.rows.length ? (
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                {config.columns.map(([key, title]) => (
                  <th key={key} scope="col">
                    {title}
                  </th>
                ))}
                <th scope="col">
                  <span className="sr-only">Detalhes</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {data.rows.map((row, index) => (
                <TableRow
                  key={String(row.id ?? row.event_id ?? row.user_id ?? index)}
                  row={row}
                  data={data}
                />
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="empty-state">
          <Inbox size={32} />
          <h3>
            {query || status
              ? "Nenhum resultado encontrado"
              : "Nenhum registro por aqui"}
          </h3>
          <p>
            {query || status
              ? "Ajuste os filtros para tentar novamente."
              : "Os dados aparecerão quando forem registrados na operação do Meedas."}
          </p>
        </div>
      )}
      <div className="pagination">
        <span>
          {data.total
            ? `${(data.page - 1) * data.pageSize + 1}–${Math.min(data.page * data.pageSize, data.total)} de ${display(data.total)}`
            : "0 registros"}
        </span>
        <div>
          {data.page > 1 ? (
            <Link
              aria-label="Página anterior"
              className="icon-button"
              href={href(data.page - 1)}
            >
              <ChevronLeft size={17} />
            </Link>
          ) : (
            <button
              aria-label="Página anterior"
              className="icon-button"
              disabled
            >
              <ChevronLeft size={17} />
            </button>
          )}
          <span>
            Página {data.page} de {pages}
          </span>
          {data.page < pages ? (
            <Link
              aria-label="Próxima página"
              className="icon-button"
              href={href(data.page + 1)}
            >
              <ChevronRight size={17} />
            </Link>
          ) : (
            <button
              aria-label="Próxima página"
              className="icon-button"
              disabled
            >
              <ChevronRight size={17} />
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
function TableRow({ row, data }: { row: AdminRow; data: AdminPage }) {
  const config = sections[data.section];
  const badgeKeys = [
    "status",
    "coverage_status",
    "active",
    "is_active",
    "subscription_status",
    "plan.plan",
    "plan.status",
    "livemode",
  ];
  return (
    <tr>
      {config.columns.map(([key]) => {
        const value = valueAt(row, key);
        return (
          <td key={key}>
            {badgeKeys.includes(key) ? (
              <span
                className={`badge ${key === "livemode" ? (value ? "neutral" : "warning") : badgeTone(value)}`}
              >
                {display(value, key)}
              </span>
            ) : (
              <span
                className={
                  key.endsWith("_id") ? "mono cell-value" : "cell-value"
                }
                title={display(value, key)}
              >
                {display(value, key)}
              </span>
            )}
          </td>
        );
      })}
      <td className="details-cell">
        <details className="row-details">
          <summary>Detalhes</summary>
          <div className="record-detail">
            <strong>
              {data.section === "feedback"
                ? "Mensagem completa"
                : "Registro completo"}
            </strong>
            {data.section === "feedback" ? (
              <p className="feedback-message">{String(row.message ?? "")}</p>
            ) : (
              <pre>{JSON.stringify(row, null, 2)}</pre>
            )}
            {data.section === "users" && (
              <Link className="text-button" href={`/alerts?q=${row.id}`}>
                Consultar alertas desta conta →
              </Link>
            )}
            {typeof row.user_id === "string" && (
              <Link className="text-button" href={`/users?q=${row.user_id}`}>
                Consultar usuário →
              </Link>
            )}
            {typeof row.customer_id === "string" && (
              <a
                className="text-button"
                target="_blank"
                rel="noreferrer"
                href={`https://dashboard.stripe.com/${row.livemode === false || valueAt(row, "event.livemode") === false ? "test/" : ""}customers/${encodeURIComponent(row.customer_id)}`}
              >
                Abrir cliente na Stripe <ExternalLink size={14} />
              </a>
            )}
            {(data.section === "stores" || data.section === "programs") && (
              <EditCatalog
                resource={data.section}
                row={row as { id: string; name: string; active: boolean }}
              />
            )}
          </div>
        </details>
      </td>
    </tr>
  );
}
