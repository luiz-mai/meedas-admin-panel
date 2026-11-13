"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { serverSupabase } from "@/lib/supabase/server";
import { backendRequest, BackendError } from "@/lib/backend";
import type { AdminMutation } from "@/contracts/admin-v1";
export type LoginState = {
  step: "email" | "code";
  email: string;
  error?: string;
};
export async function loginAction(
  previous: LoginState,
  form: FormData,
): Promise<LoginState> {
  const client = await serverSupabase();
  if (!client)
    return {
      ...previous,
      error: "O acesso administrativo ainda não foi configurado.",
    };
  const email = String(form.get("email") ?? "")
    .trim()
    .toLowerCase();
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return { ...previous, error: "Informe um e-mail válido." };
  const code = String(form.get("code") ?? "").trim();
  if (form.get("intent") === "verify") {
    if (!/^\d{6,8}$/.test(code))
      return {
        step: "code",
        email,
        error: "Informe o código de 6 a 8 dígitos.",
      };
    const result = await client.auth.verifyOtp({
      email,
      token: code,
      type: "email",
    });
    if (result.error)
      return {
        step: "code",
        email,
        error: "Código inválido ou expirado. Solicite um novo código.",
      };
    redirect("/overview");
  }
  const result = await client.auth.signInWithOtp({
    email,
    options: { shouldCreateUser: false },
  });
  if (result.error)
    return {
      step: "email",
      email,
      error:
        "Não foi possível enviar o código. Verifique o endereço e tente novamente mais tarde.",
    };
  return { step: "code", email };
}
export async function signOut() {
  const client = await serverSupabase();
  await client?.auth.signOut();
  redirect("/login");
}
export type EditState = { ok: boolean; message: string };
export async function editCatalog(
  _: EditState,
  form: FormData,
): Promise<EditState> {
  const resource = String(form.get("resource"));
  if (resource !== "stores" && resource !== "programs")
    return { ok: false, message: "Recurso inválido." };
  const mutation: AdminMutation = {
    resource,
    id: String(form.get("id")),
    name: String(form.get("name")),
    active: form.get("active") === "on",
    expectedName: String(form.get("expectedName")),
    expectedActive: form.get("expectedActive") === "true",
    reason: String(form.get("reason")),
  };
  try {
    await backendRequest(resource, { mutation });
    revalidatePath(`/${resource}`);
    revalidatePath("/overview");
    revalidatePath("/audit");
    return { ok: true, message: "Alteração salva e registrada na auditoria." };
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof BackendError
          ? error.message
          : "Não foi possível salvar. Tente novamente.",
    };
  }
}

export async function crawlerOperation(
  _: EditState,
  form: FormData,
): Promise<EditState> {
  const operation: Record<string, unknown> = {};
  for (const key of [
    "action",
    "program",
    "reason",
    "request_key",
    "target_id",
    "github_run_id",
    "expected_updated_at",
  ])
    if (form.has(key)) operation[key] = String(form.get(key));
  if (operation.action === "policy") {
    operation.paused = form.get("paused") === "on";
    operation.max_gemini_requests = Number(form.get("max_gemini_requests"));
    operation.max_zenrows_requests = Number(form.get("max_zenrows_requests"));
  }
  try {
    const result = await backendRequest<{ ok: boolean; message: string }>(
      "crawler-ops",
      { operation },
    );
    revalidatePath("/crawls");
    return { ok: true, message: result.message };
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof BackendError
          ? error.message
          : "Não foi possível concluir a operação.",
    };
  }
}

export async function cancelSubscription(
  _: EditState,
  form: FormData,
): Promise<EditState> {
  try {
    const result = await backendRequest<{ ok: boolean; message: string }>(
      "subscriptions",
      {
        operation: {
          action: "cancel_now",
          userId: String(form.get("userId")),
          subscriptionId: String(form.get("subscriptionId")),
          livemode: form.get("livemode") === "true",
          confirmed: form.get("confirmed") === "on",
          reason: String(form.get("reason") ?? ""),
        },
      },
    );
    for (const path of [
      "/subscriptions",
      "/users",
      "/alerts",
      "/overview",
      "/audit",
    ])
      revalidatePath(path);
    return { ok: true, message: result.message };
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof BackendError
          ? error.message
          : "Não foi possível concluir. Atualize a página e tente novamente.",
    };
  }
}
