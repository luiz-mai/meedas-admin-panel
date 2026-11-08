export interface CrawlerControl {
  program: string;
  paused: boolean;
  max_gemini_requests: number;
  max_zenrows_requests: number;
  updated_at: string;
}
export interface CrawlerExecution {
  id: string;
  program: string;
  mode: string;
  status: string;
  stage: string;
  github_run_id: string | null;
  started_at: string;
  heartbeat_at: string;
  finished_at: string | null;
  usage: { counts?: Record<string, number>; limits?: Record<string, number> };
  summary: Record<string, unknown>;
  diagnostics: {
    stage?: string;
    store?: string;
    reason?: string;
    source_hash?: string;
  }[];
  diagnostics_total: number;
}
export interface CrawlerPublication {
  id: string;
  status: string;
  coverage_status: string;
  started_at: string;
  last_activity_at: string;
  expected_batches: number | null;
  expected_records: number | null;
  published_records: number;
  extracted_records: number;
  error_code: string | null;
  crawl_sources: { programs: { slug: string; name: string } };
}
export interface CrawlerOperation {
  id: string;
  action: string;
  program: string;
  reason: string;
  status: string;
  created_at: string;
  github_run_id: string | null;
  result: Record<string, unknown>;
}
export interface GithubRun {
  id: string;
  title: string;
  status: string;
  conclusion: string | null;
  created_at: string;
  updated_at: string;
  url: string;
  path: string;
}
export interface CrawlerConsoleData {
  version: 1;
  generatedAt: string;
  controls: CrawlerControl[];
  executions: CrawlerExecution[];
  operations: CrawlerOperation[];
  publications: CrawlerPublication[];
  github: { configured: boolean; error: string | null; runs: GithubRun[] };
}
