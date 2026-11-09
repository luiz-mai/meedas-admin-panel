import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cache } from "react";
import { cookies } from "next/headers";
import { supabaseConfig } from "./config";
export const serverSupabase = cache(async () => {
  const config = supabaseConfig();
  if (!config) return null;
  const jar = await cookies();
  return createServerClient(config.url, config.key, {
    cookieOptions: {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    },
    cookies: {
      getAll: () => jar.getAll(),
      setAll: (entries) => {
        try {
          entries.forEach(({ name, value, options }) =>
            jar.set(name, value, options),
          );
        } catch {
          /* Renovação de cookies é feita pelo proxy durante renderização. */
        }
      },
    },
  });
});
