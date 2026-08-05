import { getCurrentProfile, ROLE_LABELS } from "../../../lib/auth/roles";
import MobileBottomNavigation from "./MobileBottomNavigation";

export default async function BottomNavigation() {
  const profile = await getCurrentProfile();

  return (
    <MobileBottomNavigation
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
