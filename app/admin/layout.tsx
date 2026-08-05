import vereinsLogo from "../logo.png";
import AdminShell from "../../components/admin/AdminShell";
import { ROLE_LABELS, requireActiveProfile } from "../../lib/auth/roles";

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const profile = await requireActiveProfile();

  return (
    <AdminShell
      logo={vereinsLogo}
      profile={{
        displayName: profile.display_name || profile.email,
        email: profile.email,
        role: profile.role,
        roleLabel: ROLE_LABELS[profile.role],
      }}
    >
      {children}
    </AdminShell>
  );
}
