import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { serverSupabase } from "./supabase/server";
import type {
  AdminPage,
  AdminSession,
  AdminMutation,
  AdminSection,
} from "@/contracts/admin-v1";
export class BackendError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}
export function backendOrigin() {
  const value = process.env.MEEDAS_API_URL;
  if (!value)
    throw new BackendError(503, "Configure a conexão com o backend Meedas.");
  const url = new URL(value);
  if (
    url.username ||
    url.password ||
    url.search ||
    url.hash ||
    url.pathname !== "/" ||
    (url.protocol !== "https:" &&
      !(
        process.env.NODE_ENV !== "production" &&
        url.protocol === "http:" &&
        ["localhost", "127.0.0.1"].includes(url.hostname)
      ))
  )
    throw new BackendError(503, "Endereço do backend inválido.");
  return url.origin;
}
export async function backendRequest<T>(
  resource: string,
  options?: {
    query?: URLSearchParams;
    mutation?: AdminMutation;
    operation?: Record<string, unknown>;
  },
): Promise<T> {
  const client = await serverSupabase();
  if (!client)
    throw new BackendError(503, "Configure a autenticação Supabase.");
  // The backend verifies this token with getUser; the cookie alone grants no access.
  const { data } = await client.auth.getSession();
  if (!data.session) throw new BackendError(401, "Entre para continuar.");
  const url = new URL(`/api/admin/v1/${resource}`, backendOrigin());
  if (options?.query) url.search = options.query.toString();
  let response: Response;
  try {
    response = await fetch(url, {
      method: options?.operation ? "POST" : options?.mutation ? "PATCH" : "GET",
      cache: "no-store",
      redirect: "error",
      signal: AbortSignal.timeout(30000),
      headers: {
        Authorization: `Bearer ${data.session.access_token}`,
        ...(options?.mutation || options?.operation
          ? { "Content-Type": "application/json" }
          : {}),
      },
      ...(options?.mutation || options?.operation
        ? { body: JSON.stringify(options.operation ?? options.mutation) }
        : {}),
    });
  } catch {
    throw new BackendError(
      503,
      "O backend não respondeu. Tente novamente em instantes.",
    );
  }
  const body = await response.json().catch(() => null);
  if (!response.ok)
    throw new BackendError(
      response.status,
      body?.error ?? "Não foi possível concluir a operação.",
    );
  if (!body || (body.version !== 1 && !body.ok))
    throw new BackendError(503, "Resposta incompatível do backend.");
  return body as T;
}
export const adminSession = cache(async () => {
  try {
    return await backendRequest<AdminSession>("session");
  } catch (error) {
    if (error instanceof BackendError && error.status === 401)
      redirect("/login");
    if (error instanceof BackendError && error.status === 403)
      redirect("/acesso-negado");
    throw error;
  }
});
export async function adminPage(section: AdminSection, query: URLSearchParams) {
  try {
    return await backendRequest<AdminPage>(section, { query });
  } catch (error) {
    if (error instanceof BackendError && error.status === 401)
      redirect("/login");
    if (error instanceof BackendError && error.status === 403)
      redirect("/acesso-negado");
    throw error;
  }
}
