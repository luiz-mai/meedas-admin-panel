import { CrawlerConsole } from "@/components/crawler-console";
import { backendRequest } from "@/lib/backend";
import type { CrawlerConsoleData } from "@/contracts/crawler-ops";
import { notFound } from "next/navigation";
import { RefreshButton } from "@/components/refresh-button";
import { ADMIN_SECTIONS, type AdminSection } from "@/contracts/admin-v1";
import { adminPage } from "@/lib/backend";
import { sections, display } from "@/lib/presentation";
import { Overview } from "@/components/overview";
import { DataTable } from "@/components/data-table";
export default async function SectionPage({
  params,
  searchParams,
}: {
  params: Promise<{ section: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { section } = await params;
  if (!ADMIN_SECTIONS.includes(section as AdminSection)) notFound();
  const config = sections[section as AdminSection];
  const search = await searchParams;
  const query = new URLSearchParams();
  for (const key of ["page", "q", "status"])
    if (typeof search[key] === "string") query.set(key, search[key] as string);
  if (section === "crawls")
    return (
      <CrawlerConsole
        data={await backendRequest<CrawlerConsoleData>("crawler-ops")}
      />
    );
  const data = await adminPage(section as AdminSection, query);
  return (
    <>
      <div className="page-heading">
        <div>
          <span className="eyebrow">{config.eyebrow}</span>
          <h1>{config.title}</h1>
          <p>{config.description}</p>
        </div>
        <RefreshButton />
      </div>
      <div className="data-timestamp">
        <span className="live-dot" /> Consultado em {display(data.generatedAt)}
      </div>
      {section === "overview" ? (
        <Overview data={data} />
      ) : (
        <DataTable
          data={data}
          query={query.get("q") ?? ""}
          status={query.get("status") ?? ""}
        />
      )}
    </>
  );
}
