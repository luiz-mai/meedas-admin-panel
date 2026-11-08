import Link from "next/link";
import {
  ArrowUpRight,
  Store,
  Bell,
  Mail,
  CircleAlert,
  ScanLine,
  Check,
  Clock3,
} from "lucide-react";
import type { AdminPage } from "@/contracts/admin-v1";
import { display, badgeTone } from "@/lib/presentation";
export function Overview({ data }: { data: AdminPage }) {
  const metrics = data.rows.filter((row) => row.kind === "metric");
  const freshness = data.rows.filter((row) => row.kind === "freshness");
  const icons = [Store, Bell, Clock3, Mail];
  const destinations = [
    "/stores",
    "/alerts",
    "/deliveries?status=pending",
    "/deliveries?status=failed",
  ];
  const failures = Number(
    metrics.find((row) => row.label === "Envios com falha")?.value ?? 0,
  );
  return (
    <>
      <div className="metrics-grid">
        {metrics.map((metric, index) => {
          const Icon = icons[index % icons.length];
          return (
            <Link
              href={destinations[index] ?? "/rates"}
              key={String(metric.label)}
              className="metric-card"
            >
              <div className="metric-top">
                <span className={`metric-icon metric-icon-${index}`}>
                  <Icon size={20} />
                </span>
                <ArrowUpRight size={17} />
              </div>
              <strong>{display(metric.value)}</strong>
              <span>{String(metric.label)}</span>
              <small>
                Consultar registros <span>→</span>
              </small>
            </Link>
          );
        })}
      </div>
      <section className="data-card freshness-card">
        <div className="card-heading">
          <div>
            <span className="eyebrow">CATÁLOGO</span>
            <h2>Última publicação por programa</h2>
            <p className="muted">
              Acompanhe quando os dados chegaram e qual a cobertura declarada.
            </p>
          </div>
          <Link href="/crawls" className="button secondary">
            Ver coletas <ArrowUpRight size={15} />
          </Link>
        </div>
        <div className="freshness-list">
          {freshness.length ? (
            freshness.map((row) => {
              const date = row.published_at
                ? new Date(String(row.published_at))
                : null;
              const old = !date || Date.now() - date.getTime() > 48 * 3600000;
              return (
                <div className="freshness-row" key={String(row.program)}>
                  <div className="program-symbol">
                    {String(row.program).slice(0, 1)}
                  </div>
                  <div className="program-info">
                    <strong>{String(row.program)}</strong>
                    <span>
                      {date
                        ? `Publicado em ${display(row.published_at)}`
                        : "Sem publicação registrada"}
                    </span>
                  </div>
                  <div className="freshness-count">
                    <strong>{display(row.published_records)}</strong>
                    <span>registros publicados</span>
                  </div>
                  <span className={`badge ${badgeTone(row.coverage_status)}`}>
                    {display(row.coverage_status)}
                  </span>
                  <span
                    className={`freshness-health ${old ? "warning-text" : "success-text"}`}
                  >
                    {old ? <Clock3 size={15} /> : <Check size={15} />}{" "}
                    {old ? "Verificar atualização" : "Publicação recente"}
                  </span>
                </div>
              );
            })
          ) : (
            <div className="empty-state">
              <ScanLine size={28} />
              <h3>Nenhum programa ativo</h3>
              <p>
                Os programas aparecerão aqui quando forem cadastrados no
                backend.
              </p>
            </div>
          )}
        </div>
        <div className="card-footnote">
          <CircleAlert size={15} /> Uma publicação recente pode preservar
          pontuações antigas de lojas ignoradas. Confira a cobertura e as
          observações.
        </div>
      </section>
      <div className="overview-bottom">
        <section className="attention-card">
          <span className="eyebrow">ACOMPANHAMENTO</span>
          <h2>Onde olhar agora</h2>
          <Link href="/deliveries?status=failed">
            <span
              className={`attention-icon ${failures ? "danger-text" : "success-text"}`}
            >
              <Mail size={20} />
            </span>
            <span>
              <strong>
                {failures
                  ? `${failures} ${failures === 1 ? "notificação" : "notificações"} com falha`
                  : "Nenhuma falha de envio registrada"}
              </strong>
              <small>Confira o processamento dos alertas por e-mail</small>
            </span>
            <ArrowUpRight size={18} />
          </Link>
          <Link href="/risks?status=unresolved">
            <span className="attention-icon">
              <CircleAlert size={20} />
            </span>
            <span>
              <strong>Revisões financeiras</strong>
              <small>Consulte os registros que aguardam análise</small>
            </span>
            <ArrowUpRight size={18} />
          </Link>
        </section>
        <section className="operation-note">
          <div className="operation-note-icon">
            <ScanLine size={24} />
          </div>
          <span className="eyebrow">DADOS COM CONTEXTO</span>
          <h2>Cada pontuação tem uma história.</h2>
          <p>
            Consulte a unidade, as condições e a evidência antes de avaliar uma
            taxa.
          </p>
          <Link href="/rates">
            Explorar pontuações <ArrowUpRight size={17} />
          </Link>
        </section>
      </div>
    </>
  );
}
