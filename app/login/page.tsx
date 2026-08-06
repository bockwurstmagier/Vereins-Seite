import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import vereinsLogo from "../logo.png";
import LoginForm from "./LoginForm";
import { createClient } from "../../lib/supabase/server";

export default async function LoginPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const { data: profile } = await supabase
      .from("user_profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    redirect(profile?.role === "spieler" ? "/spielerportal" : "/admin");
  }

  return (
    <main className="relative flex min-h-[100svh] items-center justify-center overflow-hidden bg-club-black px-4 py-10 text-white">
      <div className="pointer-events-none absolute left-1/2 top-1/3 h-80 w-80 -translate-x-1/2 rounded-full bg-club-red/20 blur-3xl" />

      <section className="club-card relative w-full max-w-md p-6 sm:p-8">
        <Link href="/" className="mb-5 inline-flex text-[10px] font-black uppercase tracking-[0.18em] text-club-light-red">
          ← Zurück zur App
        </Link>
        <Image
          src={vereinsLogo}
          alt="Logo der SpVgg Middelich-Resse"
          priority
          className="mx-auto h-auto w-28 object-contain"
        />

        <p className="club-eyebrow mt-6 text-center">Vereinsmanager</p>
        <h1 className="mt-2 text-center text-3xl font-black uppercase">
          Vereins-Login
        </h1>
        <p className="mt-3 text-center text-sm leading-6 text-zinc-400">
          Melde dich als Verantwortlicher oder Spieler an.
        </p>

        <LoginForm />
      </section>
    </main>
  );
}
