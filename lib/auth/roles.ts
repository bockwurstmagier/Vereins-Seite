import { redirect } from "next/navigation";
import { createClient } from "../supabase/server";

export const APP_ROLES = [
  "administrator",
  "vorstand",
  "trainer",
  "social_media",
  "betreuer",
] as const;

export type AppRole = (typeof APP_ROLES)[number];

export type UserProfile = {
  id: string;
  email: string;
  display_name: string | null;
  role: AppRole;
  is_active: boolean;
};

export const ROLE_LABELS: Record<AppRole, string> = {
  administrator: "Administrator",
  vorstand: "Vorstand",
  trainer: "Trainer",
  social_media: "Social Media",
  betreuer: "Betreuer",
};

export async function getCurrentProfile(): Promise<UserProfile | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data, error } = await supabase
    .from("user_profiles")
    .select("id, email, display_name, role, is_active")
    .eq("id", user.id)
    .maybeSingle();

  if (error || !data) return null;

  return data as UserProfile;
}

export async function requireActiveProfile() {
  const profile = await getCurrentProfile();

  if (!profile || !profile.is_active) {
    redirect("/login?error=inactive");
  }

  return profile;
}

export async function requireRole(roles: AppRole[]) {
  const profile = await requireActiveProfile();

  if (!roles.includes(profile.role)) {
    redirect("/admin?error=forbidden");
  }

  return profile;
}
