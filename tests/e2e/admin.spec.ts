import { test, expect, type Page } from "@playwright/test";
const backend = "http://127.0.0.1:3200/api/admin/v1";
async function login(page: Page, email = "admin@example.test") {
  await page.goto("/login");
  await page.getByLabel("E-mail da sua conta").fill(email);
  await page.getByRole("button", { name: "Receber código de acesso" }).click();
  await page.getByLabel("Código de acesso").fill("123456");
  await page.getByRole("button", { name: "Entrar no painel" }).click();
}
test("anonymous requests and forged metadata never grant admin access", async ({
  page,
  request,
}) => {
  expect((await request.get(`${backend}/stores`)).status()).toBe(401);
  expect(
    (
      await request.get(`${backend}/session`, {
        headers: { Authorization: "Bearer forged" },
      })
    ).status(),
  ).toBe(401);
  await page.goto("/stores");
  await expect(page).toHaveURL(/\/login/);
  const verification = await request.post("http://127.0.0.1:3202/auth/v1/verify", { data: { email: "user@example.test", token: "123456" } });
  const normalSession = await verification.json();
  for (const resource of ["overview", "users", "rates", "audit", "subscriptions"]) {
    const denied = await request.get(`${backend}/${resource}`, { headers: { Authorization: `Bearer ${normalSession.access_token}` } });
    expect(denied.status()).toBe(403);
    expect(denied.headers()["cache-control"]).toContain("no-store");
  }
  expect((await request.patch(`${backend}/stores`, { headers: { Authorization: `Bearer ${normalSession.access_token}` }, data: { name: "forged" } })).status()).toBe(403);
  await login(page, "user@example.test");
  await expect(page).toHaveURL(/\/acesso-negado/);
  await expect(
    page.getByRole("heading", { name: "Esta conta não tem acesso." }),
  ).toBeVisible();
  await expect(page.getByText("Loja de teste", { exact: true })).toHaveCount(0);
});
test("ADMIN can inspect real local data, edit a store atomically, inspect audit and lose access immediately on revocation", async ({
  page,
  request,
}) => {
  await request.post("http://127.0.0.1:3202/__test/role");
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await login(page);
  await expect(
    page.getByRole("heading", { name: "A operação, em perspectiva." }),
  ).toBeVisible();
  expect((await page.context().cookies()).filter(cookie => cookie.name.startsWith("sb-")).every(cookie => cookie.httpOnly)).toBe(true);
  await expect(page.getByText("Parcial", { exact: true })).toBeVisible();
  await page.screenshot({
    path: "test-results/overview-desktop.png",
    fullPage: true,
  });
  await page.getByRole("link", { name: "Lojas", exact: true }).click();
  await expect(page.getByText("29 registros", { exact: true })).toBeVisible();
  await page.getByRole("link", { name: "Próxima página" }).click();
  await expect(page.getByText("Página 2 de 2")).toBeVisible();
  await page
    .getByRole("textbox", { name: "Buscar por nome da loja" })
    .fill("Loja de teste");
  await page.getByRole("button", { name: "Filtrar", exact: true }).click();
  await expect(page.getByText("1 registro", { exact: true })).toBeVisible();
  await page
    .locator("summary")
    .filter({ hasText: /^Detalhes$/ })
    .click();
  await page
    .locator("summary")
    .filter({ hasText: /^Editar cadastro$/ })
    .click();
  await page
    .getByLabel("Nome", { exact: true })
    .fill("Loja revisada pelo painel");
  await page
    .getByLabel("Justificativa")
    .fill("Revisão operacional feita em teste local");
  await page.getByRole("button", { name: "Salvar alteração" }).click();
  // Renaming removes the row from the old search; query the new name to verify persistence.
  await page.goto("/stores?q=Loja+revisada+pelo+painel");
  await expect(
    page.getByText("Loja revisada pelo painel", { exact: true }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Auditoria", exact: true }).click();
  await expect(
    page.getByText("Revisão operacional feita em teste local", { exact: true }),
  ).toBeVisible();
  for (const [section, title] of [
    ["programs", "Programas"],
    ["rates", "Pontuações e evidências"],
    ["crawls", "Coletas"],
    ["users", "Usuários"],
    ["alerts", "Alertas"],
    ["deliveries", "Notificações"],
    ["subscriptions", "Assinaturas"],
    ["risks", "Revisões financeiras"],
  ]) {
    await page.goto(`/${section}`);
    await expect(
      page.getByRole("heading", { name: title, exact: true }),
    ).toBeVisible();
    await expect(page.getByText("Esta seção está indisponível.")).toHaveCount(
      0,
    );
  }
  await page.goto("/rates");
  await page.locator("summary").first().click();
  await expect(
    page.getByText(/Até 5 pontos por real\. Fixture local\./),
  ).toBeVisible();
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/overview");
  await expect(
    page.getByRole("heading", { name: "A operação, em perspectiva." }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: "test-results/overview-mobile.png",
    fullPage: true,
  });
  await request.post("http://127.0.0.1:3202/__test/role?revoke=true");
  await page.goto("/stores");
  await expect(page).toHaveURL(/\/acesso-negado/);
  expect(errors).toEqual([]);
  await request.post("http://127.0.0.1:3202/__test/role");
});
