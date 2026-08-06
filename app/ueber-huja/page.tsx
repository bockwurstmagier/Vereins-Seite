import Link from "next/link";
import { ArrowLeft, BadgeCheck, Code2, Copyright, ShieldCheck } from "lucide-react";

import BottomNavigation from "../../components/home/layout/BottomNavigation";
import { HUJA_BRANDING } from "../../lib/branding";

export const metadata = {
  title: `Über ${HUJA_BRANDING.productName} | ${HUJA_BRANDING.clubName}`,
  description: "Informationen zur HUJA Vereinsplattform, Version und Urheberrecht.",
};

export default function AboutHujaPage() {
  return (
    <main className="min-h-screen bg-black pb-28 text-white">
      <section className="border-b border-white/10 bg-gradient-to-br from-club-burgundy/80 via-club-dark-red/35 to-black px-4 py-12">
        <div className="mx-auto max-w-5xl">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider text-club-light-red"
          >
            <ArrowLeft size={16} />
            Zur Startseite
          </Link>

          <div className="mt-8">
            <p className="club-eyebrow">Club Management System</p>
            <h1 className="club-heading mt-2">{HUJA_BRANDING.productName}</h1>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-zinc-400">
              Die digitale Vereinsplattform für Spielbetrieb, Mannschaft,
              Kommunikation, Medien, Galerie, Statistik und Organisation.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-5xl gap-5 px-4 py-8 md:grid-cols-2">
        <InfoCard
          icon={<BadgeCheck size={20} />}
          title="Produkt"
          lines={[
            HUJA_BRANDING.productName,
            HUJA_BRANDING.productSubtitle,
            `Version ${HUJA_BRANDING.version}`,
          ]}
        />
        <InfoCard
          icon={<Code2 size={20} />}
          title="Entwicklung"
          lines={[
            `Developed by ${HUJA_BRANDING.developer}`,
            HUJA_BRANDING.clubName,
          ]}
        />
        <InfoCard
          icon={<Copyright size={20} />}
          title="Copyright"
          lines={[
            `© ${HUJA_BRANDING.copyrightYear} ${HUJA_BRANDING.developer}`,
            HUJA_BRANDING.rights,
          ]}
        />
        <InfoCard
          icon={<ShieldCheck size={20} />}
          title="Nutzungsrecht"
          lines={[HUJA_BRANDING.legalNotice]}
        />
      </section>

      <section className="mx-auto max-w-5xl px-4">
        <div className="rounded-[2rem] border border-club-light-red/20 bg-club-red/[0.08] p-6">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-club-light-red">
            HUJA™
          </p>
          <h2 className="mt-2 text-2xl font-black uppercase">
            Die Middelicher sind da.
          </h2>
          <p className="mt-3 text-sm leading-7 text-zinc-400">
            HUJA verbindet alle wichtigen Vereinsbereiche in einer Plattform
            und wurde speziell für die Anforderungen von
            {` ${HUJA_BRANDING.clubName}`} entwickelt.
          </p>
        </div>
      </section>

      <BottomNavigation />
    </main>
  );
}

function InfoCard({
  icon,
  title,
  lines,
}: {
  icon: React.ReactNode;
  title: string;
  lines: string[];
}) {
  return (
    <article className="club-card p-5 sm:p-6">
      <div className="club-icon-box">{icon}</div>
      <h2 className="mt-4 text-lg font-black uppercase text-white">{title}</h2>
      <div className="mt-3 space-y-2">
        {lines.map((line) => (
          <p key={line} className="text-sm leading-6 text-zinc-500">
            {line}
          </p>
        ))}
      </div>
    </article>
  );
}
