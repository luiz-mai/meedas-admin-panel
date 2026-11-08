import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "tests/e2e",
  timeout: 60000,
  fullyParallel: false,
  workers: 1,
  use: {
    baseURL: "http://127.0.0.1:3201",
    headless: true,
    launchOptions: {
      executablePath: process.env.CHROMIUM_PATH || "/usr/bin/chromium",
      args: ["--no-sandbox"],
    },
    screenshot: "only-on-failure",
  },
  webServer: process.env.ADMIN_E2E_SERVERS_RUNNING
    ? undefined
    : [
        {
          command: "npx tsx tests/admin-fixture-server.ts",
          cwd: "../meedas-app",
          url: "http://127.0.0.1:3202/health",
          timeout: 120000,
        },
        {
          command: "npm run dev -- --port 3200",
          cwd: "../meedas-app",
          url: "http://127.0.0.1:3200/api/admin/v1/session",
          timeout: 120000,
          env: {
            NEXT_PUBLIC_SUPABASE_URL: "http://127.0.0.1:3202",
            NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "test-only-public-key",
            SUPABASE_SECRET_KEY: "test-only-secret-key",
          },
        },
        {
          command: "npm run dev -- --port 3201",
          url: "http://127.0.0.1:3201/login",
          timeout: 120000,
          env: {
            NEXT_PUBLIC_SUPABASE_URL: "http://127.0.0.1:3202",
            NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "test-only-public-key",
            MEEDAS_API_URL: "http://127.0.0.1:3200",
          },
        },
      ],
});
