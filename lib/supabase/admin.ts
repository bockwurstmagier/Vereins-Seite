import "server-only";

import { createClient } from "@supabase/supabase-js";

export type AdminSupabaseConfigStatus = {
  ok: boolean;
  missing: string[];
};

export function getAdminSupabaseConfigStatus(): AdminSupabaseConfigStatus {
  const missing: string[] = [];

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    missing.push("NEXT_PUBLIC_SUPABASE_URL");
  }

  if (!process.env.SUPABASE_SECRET_KEY && !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    missing.push("SUPABASE_SECRET_KEY");
  }

  return { ok: missing.length === 0, missing };
}

export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey =
    process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    const status = getAdminSupabaseConfigStatus();
    throw new Error(
      `Supabase-Serverkonfiguration unvollständig: ${status.missing.join(", ")}.`,
    );
  }

  return createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
