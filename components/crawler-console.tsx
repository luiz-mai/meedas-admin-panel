"use client";
import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Activity,
  RefreshCw,
  ShieldCheck,
  Clock,
  AlertTriangle,
  ExternalLink,
} from "lucide-react";
import { crawlerOperation } from "@/app/actions";
import type {
  CrawlerConsoleData,
  CrawlerControl,
} from "@/contracts/crawler-ops";
const labels: Record<string, string> = {
  esfera: "Esfera",
  "latam-pass": "LATAM Pass",
  livelo: "Livelo",
  running: "Em andamento",
  succeeded: "Concluída",
  partial: "Parcial",
  failed: "Falhou",
  cancelled: "Cancelada",
  published: "Publicada",
  staged: "Em staging",
  requested: "Solicitada",
  dispatched: "Aceita pelo GitHub",
  dispatch_unknown: "Resposta incerta",
  dispatch_failed: "Disparo falhou",
  cancel_requested: "Cancelamento solicitado",
  completed: "Concluída",
  queued: "Na fila",
  in_progress: "Em andamento",
  success: "Concluída",
  failure: "Falhou",
  collect: "Coletar",
  validate: "Validar",
  replay: "Reenviar lotes",
  reprocess: "Reprocessar captura",
  policy: "Configuração",
  resume: "Publicar staging",
  abort: "Encerrar staging",
  missing_store: "Loja não encontrada na extração",
  missing_rate: "Taxa esperada ausente",
  incomplete_offer: "Oferta incompleta",
  store_skipped: "Loja preservada sem atualização",
  app_validation: "Validação no backend",
  cancel: "Cancelar",
};
const label = (s: string) => labels[s] ?? s;
const date = (s: string) =>
  new Date(s).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" });
const stale = (s: string, minutes: number) =>
  Date.now() - Date.parse(s) > minutes * 60000;
function Status({ value }: { value: string }) {
  return (
    <span
      className={`crawl-status ${["failed", "failure", "dispatch_unknown"].includes(value) ? "bad" : ["partial", "staged", "running", "in_progress", "queued"].includes(value) ? "warn" : ""}`}
    >
      {label(value)}
    </span>
  );
}
function OperationForm({
  program,
  action,
  title,
  description,
  disabled = false,
  fields = {},
  control,
}: {
  program: string;
  action: string;
  title: string;
  description: string;
  disabled?: boolean;
  fields?: Record<string, string>;
  control?: CrawlerControl;
}) {
  const [state, submit, pending] = useActionState(crawlerOperation, {
    ok: false,
    message: "",
  });
  const [key, setKey] = useState("");
  useEffect(() => setKey(crypto.randomUUID()), []);
  useEffect(() => {
    if (state.ok) setKey(crypto.randomUUID());
  }, [state]);
  return (
    <form action={submit} className="crawl-action">
      <input type="hidden" name="program" value={program} />
      <input type="hidden" name="action" value={action} />
      <input type="hidden" name="request_key" value={key} />
      {Object.entries(fields).map(([k, v]) => (
        <input key={k} type="hidden" name={k} value={v} />
      ))}
      <h3>{title}</h3>
      <p>{description}</p>
      {control && (
        <fieldset key={control.updated_at} className="crawl-policy-fields">
          <input
            type="hidden"
            name="expected_updated_at"
            value={control.updated_at}
          />
          <label className="crawl-check">
            <input
              type="checkbox"
              name="paused"
              defaultChecked={control.paused}
            />{" "}
            Pausar próximas operações pagas
          </label>
          <div className="crawl-fields">
            <label>
              Máx. chamadas Gemini
              <input
                type="number"
                name="max_gemini_requests"
                min="0"
                max="128"
                defaultValue={control.max_gemini_requests}
                required
              />
            </label>
            <label>
              Máx. chamadas ZenRows
              <input
                type="number"
                name="max_zenrows_requests"
                min="0"
                max="10"
                defaultValue={control.max_zenrows_requests}
                required
              />
            </label>
          </div>
        </fieldset>
      )}
      <label>
        Motivo
        <textarea
          name="reason"
          minLength={10}
          maxLength={500}
          required
          placeholder="Descreva o problema ou a alteração"
          disabled={disabled}
        />
      </label>
      <button
        className="button secondary"
        disabled={disabled || pending || !key}
      >
        {pending ? "Enviando…" : title}
      </button>
      {state.message && (
        <p
          role="status"
          className={state.ok ? "crawl-feedback" : "crawl-error"}
        >
          {state.message}
        </p>
      )}
    </form>
  );
}
export function CrawlerConsole({ data }: { data: CrawlerConsoleData }) {
  const [tab, setTab] = useState("Visão geral");
  const [program, setProgram] = useState("esfera");
  const router = useRouter();
  const active =
    data.executions.some(
      (e) => e.status === "running" && !stale(e.heartbeat_at, 5),
    ) || data.github.runs.some((r) => r.status !== "completed");
  useEffect(() => {
    if (!active) return;
    const t = setInterval(() => router.refresh(), 30000);
    return () => clearInterval(t);
  }, [active, router]);
  const executions = data.executions.filter((e) => e.program === program);
  const publications = data.publications.filter(
    (p) => p.crawl_sources?.programs?.slug === program,
  );
  const control = data.controls.find((c) => c.program === program)!;
  const last = publications.find((p) => p.status === "published");
  const diagnostics = executions.flatMap((e) =>
    e.diagnostics.map((d) => ({ ...d, id: e.id, time: e.started_at })),
  );
  const counts = executions.reduce(
    (acc, e) => {
      for (const [k, v] of Object.entries(e.usage?.counts ?? {}))
        acc[k] = (acc[k] ?? 0) + v;
      return acc;
    },
    {} as Record<string, number>,
  );
  const paidDisabled = !data.github.configured || control?.paused;
  return (
    <>
      <div className="page-heading">
        <div>
          <span className="eyebrow">OPERAÇÃO DO CATÁLOGO</span>
          <h1>Central de coletas</h1>
          <p>
            Diagnostique falhas, recupere dados e controle o consumo por
            programa.
          </p>
        </div>
        <button className="button secondary" onClick={() => router.refresh()}>
          <RefreshCw size={16} /> Atualizar
        </button>
      </div>
      <div className="crawl-topline">
        <span>
          Consultado em {date(data.generatedAt)} · horário de Brasília
          {active ? " · atualização a cada 30 s" : ""}
        </span>
        <a
          href="https://github.com/luiz-mai/meedas-crawler/actions"
          target="_blank"
          rel="noreferrer"
        >
          GitHub Actions <ExternalLink size={13} />
        </a>
      </div>
      {!data.github.configured && (
        <div className="crawl-notice">
          <ShieldCheck size={19} />
          <div>
            <strong>Operações GitHub aguardam configuração</strong>
            <p>
              Configure MEEDAS_GITHUB_TOKEN no servidor do meedas-app.
              Diagnósticos e controles do banco continuam disponíveis.
            </p>
          </div>
        </div>
      )}
      {data.github.error && (
        <div className="crawl-notice">{data.github.error}</div>
      )}
      <div className="crawl-toolbar">
        <nav aria-label="Áreas da central de coletas">
          {[
            "Visão geral",
            "Execuções",
            "Publicações",
            "Diagnósticos",
            "Recuperação",
            "Controles e consumo",
            "Auditoria",
          ].map((t) => (
            <button
              key={t}
              aria-pressed={tab === t}
              className={tab === t ? "selected" : ""}
              onClick={() => setTab(t)}
            >
              {t}
            </button>
          ))}
        </nav>
        <label>
          Programa
          <select value={program} onChange={(e) => setProgram(e.target.value)}>
            {data.controls.map((c) => (
              <option key={c.program} value={c.program}>
                {label(c.program)}
              </option>
            ))}
          </select>
        </label>
      </div>
      {tab === "Visão geral" && (
        <>
          <div className="crawl-metrics">
            <article>
              <Clock size={20} />
              <span>Última publicação</span>
              <strong>{last ? date(last.started_at) : "Sem publicação"}</strong>
              <small>
                {last && stale(last.started_at, 36 * 60)
                  ? "Atenção: dados com mais de 36 horas"
                  : last
                    ? `${last.published_records} ofertas publicadas`
                    : "Confira as execuções e os logs"}
              </small>
            </article>
            <article>
              <Activity size={20} />
              <span>Última execução reportada</span>
              <strong>
                {executions[0]
                  ? label(executions[0].status)
                  : "Aguardando telemetria"}
              </strong>
              <small>
                {executions[0]
                  ? `${executions[0].stage} · ${date(executions[0].heartbeat_at)}`
                  : "Disponível a partir da nova versão do crawler"}
              </small>
            </article>
            <article>
              <ShieldCheck size={20} />
              <span>Política de execução</span>
              <strong>{control?.paused ? "Pausada" : "Diária · 10h"}</strong>
              <small>
                Máximo {control?.max_gemini_requests} Gemini /{" "}
                {control?.max_zenrows_requests} ZenRows por execução
              </small>
            </article>
          </div>
          <section className="crawl-panel">
            <h2>Operação com recuperação e custo limitado</h2>
            <p>
              As coletas continuam diárias. Consultar este painel não executa o
              crawler. Falhas transitórias têm até duas tentativas lógicas,
              reutilizando capturas e checkpoints e compartilhando o mesmo
              limite de chamadas.
            </p>
            <div className="crawl-guide">
              <article>
                <span>01</span>
                <h3>Confira a execução</h3>
                <p>
                  Veja etapa, heartbeat, erro e consumo. O GitHub também revela
                  falhas de preparação, anteriores ao crawler.
                </p>
              </article>
              <article>
                <span>02</span>
                <h3>Recupere o que já existe</h3>
                <p>
                  Staging completo pode ser publicado. Lotes validados podem ser
                  reenviados sem ZenRows ou Gemini.
                </p>
              </article>
              <article>
                <span>03</span>
                <h3>Faça uma coleta nova se precisar</h3>
                <p>
                  Disparos pagos manuais têm intervalo de 1 hora e limite de 2
                  por programa em 24 horas. Informe sempre um motivo.
                </p>
              </article>
            </div>
          </section>
          <section className="crawl-panel">
            <h2>Atenção agora</h2>
            {control?.paused && (
              <p>As próximas operações pagas deste programa estão pausadas.</p>
            )}
            {last && last.coverage_status !== "complete" && (
              <p>
                <AlertTriangle size={15} /> Última publicação parcial: lojas sem
                extração válida preservam os dados anteriores.
              </p>
            )}
            {executions
              .filter(
                (e) =>
                  e.status === "failed" ||
                  e.status === "partial" ||
                  (e.status === "running" && stale(e.heartbeat_at, 5)),
              )
              .slice(0, 5)
              .map((e) => (
                <p key={e.id}>
                  <Status value={e.status} /> {date(e.started_at)} · {e.stage}
                  {e.status === "running" && stale(e.heartbeat_at, 5)
                    ? " · Sem heartbeat recente: confira o GitHub"
                    : ""}
                </p>
              ))}
            {!executions.length && (
              <p>
                Execuções antigas aparecem em Publicações e no GitHub. A nova
                telemetria será registrada nas próximas execuções.
              </p>
            )}
          </section>
        </>
      )}
      {tab === "Execuções" && (
        <>
          <section className="crawl-panel">
            <h2>Pipeline de {label(program)}</h2>
            <p>
              Ausência de heartbeat por 5 minutos é um sinal de atenção; a
              conclusão do GitHub ajuda a confirmar interrupções.
            </p>
            {!executions.length && (
              <p>Nenhuma execução reportada nesta versão.</p>
            )}
            {executions.map((e) => (
              <details className="crawl-detail" key={e.id}>
                <summary>
                  <Status value={e.status} /> {date(e.started_at)} ·{" "}
                  {label(e.mode)} · {e.stage}
                </summary>
                <p>
                  Heartbeat: {date(e.heartbeat_at)} · ID: <code>{e.id}</code>
                </p>
                <p>
                  Gemini: {e.usage?.counts?.gemini_http ?? 0} chamadas ·
                  ZenRows: {e.usage?.counts?.zenrows_http ?? 0} chamadas
                </p>
                <pre>{JSON.stringify(e.summary, null, 2)}</pre>
                {e.github_run_id && (
                  <a
                    href={`https://github.com/luiz-mai/meedas-crawler/actions/runs/${e.github_run_id}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Abrir logs no GitHub ↗
                  </a>
                )}
              </details>
            ))}
          </section>
          <section className="crawl-panel">
            <h2>Execuções no GitHub · todos os programas</h2>
            <p>
              Inclui erros de checkout, instalação e download de artefatos que
              podem ocorrer antes do primeiro relatório. O nome da execução
              contém o ID da solicitação para conciliação.
            </p>
            {data.github.runs.map((r) => (
              <div className="crawl-run" key={r.id}>
                <div>
                  <a href={r.url} target="_blank" rel="noreferrer">
                    {r.title} ↗
                  </a>
                  <p>
                    {date(r.created_at)} · ID {r.id}
                  </p>
                </div>
                <Status value={r.conclusion ?? r.status} />
                {r.status !== "completed" && (
                  <details>
                    <summary>Cancelar</summary>
                    <OperationForm
                      program={program}
                      action="cancel"
                      title="Solicitar cancelamento"
                      description="Interrompe a execução inteira; numa coleta de todos os programas, afeta todos os jobs."
                      fields={{ github_run_id: r.id }}
                    />
                  </details>
                )}
              </div>
            ))}
            {!data.github.runs.length && (
              <p>
                Sem execuções disponíveis. Confira a configuração ou abra o
                GitHub Actions.
              </p>
            )}
          </section>
        </>
      )}
      {tab === "Publicações" && (
        <section className="crawl-panel">
          <h2>Entrega e publicação atômica</h2>
          <p>
            Uma execução pode falhar antes de criar uma publicação. Nenhum
            staging incompleto pode ser publicado pela recuperação.
          </p>
          <div className="crawl-table">
            <table>
              <thead>
                <tr>
                  <th>Coletado em</th>
                  <th>Status</th>
                  <th>Cobertura</th>
                  <th>Ofertas</th>
                  <th>Lotes esperados</th>
                  <th>Identificador</th>
                </tr>
              </thead>
              <tbody>
                {publications.map((p) => (
                  <tr key={p.id}>
                    <td>{date(p.started_at)}</td>
                    <td>
                      <Status value={p.status} />
                    </td>
                    <td>
                      {p.coverage_status === "complete"
                        ? "Completa"
                        : p.coverage_status === "partial"
                          ? "Parcial"
                          : "Não informada"}
                    </td>
                    <td>{p.published_records}</td>
                    <td>{p.expected_batches ?? "Legado"}</td>
                    <td>
                      <code>{p.id}</code>
                      {p.error_code && <p>{p.error_code}</p>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
      {tab === "Diagnósticos" && (
        <section className="crawl-panel">
          <h2>Lojas e ofertas que exigem atenção</h2>
          <p>
            Até 100 diagnósticos por execução. Artefatos e logs completos ficam
            no GitHub por 7 dias. Evidências inválidas não se tornam dados
            publicados.
          </p>
          <div className="crawl-table">
            <table>
              <thead>
                <tr>
                  <th>Execução</th>
                  <th>Loja</th>
                  <th>Etapa</th>
                  <th>Motivo</th>
                </tr>
              </thead>
              <tbody>
                {diagnostics.map((d, i) => (
                  <tr key={`${d.id}-${i}`}>
                    <td>{date(d.time)}</td>
                    <td>{d.store ?? "—"}</td>
                    <td>{d.stage}</td>
                    <td>{label(d.reason ?? "—")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!diagnostics.length && (
            <p>Nenhum diagnóstico reportado neste período.</p>
          )}
        </section>
      )}
      {tab === "Recuperação" && (
        <>
          <section className="crawl-panel">
            <h2>Qual recuperação usar?</h2>
            <p>
              Use o ID numérico da execução de origem no GitHub. Artefatos e
              observações precisam ter menos de 7 dias. Se houver um staging
              abandonado, recupere-o ou encerre-o antes de criar outra
              publicação.
            </p>
            <Recovery
              program={program}
              runs={data.github.runs.filter((r) => r.status === "completed")}
              configured={data.github.configured}
              paused={control?.paused ?? false}
            />
          </section>
          <section className="crawl-panel">
            <h2>Staging que pode exigir intervenção</h2>
            <p>
              O backend exige 30 minutos sem atividade e ausência de heartbeat
              recente. A publicação exige todos os lotes em sequência; staging
              legado não pode ser retomado por este painel.
            </p>
            {publications
              .filter((p) => ["staged", "running"].includes(p.status))
              .map((p) => (
                <details key={p.id} className="crawl-detail">
                  <summary>
                    <Status value={p.status} /> {date(p.started_at)} · {p.id}
                  </summary>
                  <div className="crawl-grid">
                    <OperationForm
                      key={`${p.id}-resume`}
                      program={program}
                      action="resume"
                      title="Publicar staging completo"
                      description="Sem chamadas ao ZenRows ou Gemini. O banco valida a completude antes de publicar."
                      disabled={
                        p.expected_batches === null ||
                        !stale(p.last_activity_at, 30)
                      }
                      fields={{ target_id: p.id }}
                    />
                    <OperationForm
                      program={program}
                      action="abort"
                      title="Encerrar staging abandonado"
                      description="Preserva snapshots e histórico. Libera uma nova entrega; não publica lotes incompletos."
                      disabled={!stale(p.last_activity_at, 30)}
                      fields={{ target_id: p.id }}
                    />
                  </div>
                </details>
              ))}
            {!publications.some((p) =>
              ["staged", "running"].includes(p.status),
            ) && <p>Nenhum staging pendente para este programa.</p>}
          </section>
          <section className="crawl-panel">
            <h2>Iniciar uma nova execução</h2>
            <div className="crawl-grid">
              <OperationForm
                key={program + "collect"}
                program={program}
                action="collect"
                title="Coletar e publicar"
                description="Acessa a fonte e pode consumir ZenRows e Gemini. Publica apenas lojas com dados válidos."
                disabled={paidDisabled}
              />
              <OperationForm
                key={program + "validate"}
                program={program}
                action="validate"
                title="Validar sem publicar"
                description="Também pode consumir ZenRows e Gemini; gera artefatos e diagnósticos sem publicar no catálogo."
                disabled={paidDisabled}
              />
            </div>
          </section>
        </>
      )}
      {tab === "Controles e consumo" && (
        <>
          <section className="crawl-panel">
            <h2>Consumo observado · {label(program)}</h2>
            <p>
              Soma das últimas {executions.length} execuções reportadas (máximo
              100 no painel). São chamadas HTTP, incluindo tentativas; não
              representam valores em reais nem o extrato dos provedores.
            </p>
            <div className="crawl-metrics">
              <article>
                <span>Gemini</span>
                <strong>{counts.gemini_http ?? 0}</strong>
                <small>
                  Chamadas HTTP · {counts.gemini_input_tokens ?? 0} tokens de
                  entrada reportados
                </small>
              </article>
              <article>
                <span>ZenRows</span>
                <strong>{counts.zenrows_http ?? 0}</strong>
                <small>
                  Chamadas HTTP; cobrança depende do modo contratado
                </small>
              </article>
              <article>
                <span>Reuso de extração</span>
                <strong>{counts.checkpoint_hits ?? 0}</strong>
                <small>
                  Checkpoints aproveitados · {counts.source_cache_hits ?? 0}{" "}
                  capturas reutilizadas
                </small>
              </article>
            </div>
          </section>
          {control && (
            <section className="crawl-panel">
              <OperationForm
                key={control.program}
                program={program}
                action="policy"
                title="Salvar controles"
                description="Aplicado no preflight das próximas execuções. Não interrompe uma execução já iniciada. Para interromper agora, solicite cancelamento no GitHub."
                control={control}
              />
            </section>
          )}
        </>
      )}
      {tab === "Auditoria" && (
        <section className="crawl-panel">
          <h2>Solicitações administrativas · {label(program)}</h2>
          <p>
            Disparo aceito significa que o GitHub recebeu a solicitação.
            Confirme o início em Execuções; falhas anteriores ao crawler
            permanecem visíveis no GitHub.
          </p>
          {data.operations
            .filter((o) => o.program === program)
            .map((o) => (
              <details className="crawl-detail" key={o.id}>
                <summary>
                  <Status value={o.status} /> {label(o.action)} ·{" "}
                  {date(o.created_at)}
                </summary>
                <p>{o.reason}</p>
                <p>
                  ID da solicitação: <code>{o.id}</code>
                </p>
                <pre>{JSON.stringify(o.result, null, 2)}</pre>
              </details>
            ))}
        </section>
      )}
    </>
  );
}
function Recovery({
  program,
  configured,
  paused,
  runs,
}: {
  runs: CrawlerConsoleData["github"]["runs"];
  program: string;
  configured: boolean;
  paused: boolean;
}) {
  const [id, setId] = useState("");
  return (
    <>
      {runs.length > 0 && (
        <label className="crawl-source">
          Selecionar execução recente
          <select value={id} onChange={(e) => setId(e.target.value)}>
            <option value="">Escolha a execução de origem</option>
            {runs.map((r) => (
              <option key={r.id} value={r.id}>
                {date(r.created_at)} · {r.title}
              </option>
            ))}
          </select>
        </label>
      )}
      <label className="crawl-source">
        ID da execução GitHub de origem
        <input
          inputMode="numeric"
          pattern="[0-9]+"
          value={id}
          onChange={(e) => setId(e.target.value)}
          placeholder="Ex.: 12345678901"
        />
      </label>
      <div className="crawl-grid">
        <OperationForm
          key={program + id + "replay"}
          program={program}
          action="replay"
          title="Reenviar lotes validados"
          description="Sem ZenRows e sem Gemini. Preserva o horário original da coleta e os dados anteriores das lojas ausentes."
          disabled={!configured || !/^\d+$/.test(id)}
          fields={{ github_run_id: id }}
        />
        <OperationForm
          key={program + id + "reprocess"}
          program={program}
          action="reprocess"
          title="Reprocessar captura salva"
          description="Sem ZenRows. Pode consumir Gemini apenas nas extrações sem checkpoint válido, incluindo lojas ignoradas."
          disabled={!configured || paused || !/^\d+$/.test(id)}
          fields={{ github_run_id: id }}
        />
      </div>
    </>
  );
}
