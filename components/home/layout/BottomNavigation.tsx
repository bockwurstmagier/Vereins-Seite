import { getCurrentProfile, ROLE_LABELS } from "../../../lib/auth/roles";
import MobileBottomNavigation from "./MobileBottomNavigation";

export default async function BottomNavigation({ homeModules }: { homeModules?: string[] } = {}) {
  const profile = await getCurrentProfile();

  return (
    <MobileBottomNavigation
      homeModules={homeModules}
      account={
        profile
          ? {
              displayName: profile.display_name || profile.email,
              email: profile.email,
              roleLabel: ROLE_LABELS[profile.role],
            }
          : null
      }
    />
  );
}
