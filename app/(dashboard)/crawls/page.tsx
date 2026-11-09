import { CrawlerConsole } from "@/components/crawler-console";
import { backendRequest } from "@/lib/backend";
import type { CrawlerConsoleData } from "@/contracts/crawler-ops";
export default async function CrawlsPage() {
  const data = await backendRequest<CrawlerConsoleData>("crawler-ops");
  return <CrawlerConsole data={data} />;
}
