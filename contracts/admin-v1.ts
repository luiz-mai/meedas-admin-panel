/** Versioned transport contract. No Next.js, Supabase or server dependencies. */
export const ADMIN_SECTIONS = [
  "overview",
  "stores",
  "programs",
  "rates",
  "crawls",
  "users",
  "alerts",
  "deliveries",
  "subscriptions",
  "risks",
  "audit",
  "feedback",
] as const;
export type AdminSection = (typeof ADMIN_SECTIONS)[number];
export type AdminRow = Record<string, unknown>;
export interface AdminPage {
  version: 1;
  section: AdminSection;
  rows: AdminRow[];
  total: number;
  page: number;
  pageSize: number;
  generatedAt: string;
}
export interface AdminSession {
  version: 1;
  user: { id: string; email: string | null };
  role: "ADMIN";
}
export interface AdminMutation {
  resource: "stores" | "programs";
  id: string;
  name: string;
  active: boolean;
  expectedName: string;
  expectedActive: boolean;
  reason: string;
}
