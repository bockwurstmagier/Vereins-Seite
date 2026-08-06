import Link from "next/link";
import {
  ArrowLeft,
  Building2,
  Copyright,
  FileText,
  Mail,
  MapPin,
  Phone,
  Scale,
  UserRound,
} from "lucide-react";

import BottomNavigation from "../../components/home/layout/BottomNavigation";
import { HUJA_BRANDING } from "../../lib/branding";
import { createClient } from "../../lib/supabase/server";

export const metadata = {
  title: `Impressum | ${HUJA_BRANDING.clubName}`,
  description: `Impressum und Anbieterkennzeichnung von ${HUJA_BRANDING.clubName}.`,
};

export const revalidate = 0;

export default async function ImprintPage() {
  const supabase = await createClient();

  const { data: imprint } = await supabase
    .from("site_imprint")
    .select("*")
    .eq("id", "main")
    .maybeSingle();

  const clubName = imprint?.club_name || HUJA_BRANDING.clubName;
  const address = [
    imprint?.street,
    [imprint?.postal_code, imprint?.city].filter(Boolean).join(" "),
  ].filter(Boolean);

  return (
    <main className="min-h-screen bg-black pb-28 text-white">
      <section className="border-b border-white/10 bg-gradient-to-br from-club-burgundy/80 via-club-dark-red/35 to-black px-4 py-11">
        <div className="mx-auto max-w-5xl">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider text-club-light-red"
          >
            <ArrowLeft size={16} />
            Zur Startseite
          </Link>

          <div className="mt-8 flex items-start gap-4">
            <div className="club-icon-box mt-1">
              <FileText size={20} />
            </div>
            <div>
              <p className="club-eyebrow">Rechtliche Angaben</p>
              <h1 className="club-heading mt-2">Impressum</h1>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-zinc-400">
                Anbieterkennzeichnung und Verantwortlichkeiten des Vereins.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-5xl gap-5 px-4 py-8 md:grid-cols-2">
        <LegalCard icon={<Building2 size={19} />} title="Vereinsdaten">
          <Strong>{clubName}</Strong>
          {imprint?.club_legal_name && <Text>{imprint.club_legal_name}</Text>}
          {address.length > 0 ? (
            <div className="mt-3 flex items-start gap-2 text-sm leading-6 text-zinc-400">
              <MapPin size={16} className="mt-1 shrink-0 text-club-light-red" />
              <div>
                {address.map((line) => (
                  <p key={line}>{line}</p>
                ))}
              </div>
            </div>
          ) : (
            <Missing>Die Vereinsanschrift wird noch ergänzt.</Missing>
          )}
        </LegalCard>

        <LegalCard icon={<UserRound size={19} />} title="Vertreten durch">
          {imprint?.first_chairman_name && (
            <Entry label="1. Vorsitzender" value={imprint.first_chairman_name} />
          )}
          {imprint?.second_chairman_name && (
            <Entry label="2. Vorsitzender" value={imprint.second_chairman_name} />
          )}
          {imprint?.president_name && (
            <Entry label="Präsident" value={imprint.president_name} />
          )}
          {!imprint?.first_chairman_name &&
            !imprint?.second_chairman_name &&
            !imprint?.president_name && (
              <Missing>Die Vertretungsberechtigten werden noch ergänzt.</Missing>
            )}
        </LegalCard>

        <LegalCard icon={<Mail size={19} />} title="Kontakt">
          {imprint?.phone && (
            <Contact icon={<Phone size={15} />} value={imprint.phone} />
          )}
          {imprint?.email && (
            <Contact
              icon={<Mail size={15} />}
              value={imprint.email}
              href={`mailto:${imprint.email}`}
            />
          )}
          {imprint?.website && (
            <Contact value={imprint.website} href={imprint.website} />
          )}
          {!imprint?.phone && !imprint?.email && !imprint?.website && (
            <Missing>Die Kontaktdaten werden noch ergänzt.</Missing>
          )}
        </LegalCard>

        <LegalCard
          icon={<Scale size={19} />}
          title="Verantwortlich für den Inhalt"
        >
          {imprint?.content_responsible_name ? (
            <>
              <Strong>{imprint.content_responsible_name}</Strong>
              {imprint.content_responsible_street && (
                <Text>{imprint.content_responsible_street}</Text>
              )}
              {(imprint.content_responsible_postal_code ||
                imprint.content_responsible_city) && (
                <Text>
                  {[
                    imprint.content_responsible_postal_code,
                    imprint.content_responsible_city,
                  ]
                    .filter(Boolean)
                    .join(" ")}
                </Text>
              )}
            </>
          ) : (
            <Missing>
              Die verantwortliche Person wird im Adminbereich ergänzt.
            </Missing>
          )}
        </LegalCard>

        {(imprint?.register_court ||
          imprint?.register_number ||
          imprint?.tax_number) && (
          <LegalCard icon={<FileText size={19} />} title="Registerangaben">
            {imprint.register_court && (
              <Entry label="Registergericht" value={imprint.register_court} />
            )}
            {imprint.register_number && (
              <Entry label="Registernummer" value={imprint.register_number} />
            )}
            {imprint.tax_number && (
              <Entry label="Steuernummer" value={imprint.tax_number} />
            )}
          </LegalCard>
        )}

        <LegalCard icon={<Copyright size={19} />} title="Software & Urheberrecht">
          <Strong>
            {HUJA_BRANDING.productName} – {HUJA_BRANDING.productSubtitle}
          </Strong>
          <Text>Version {HUJA_BRANDING.version}</Text>
          <Text>
            © {HUJA_BRANDING.copyrightYear} {HUJA_BRANDING.developer}
          </Text>
          <Text>{HUJA_BRANDING.rights}</Text>
          <p className="mt-3 text-xs leading-6 text-zinc-600">
            {HUJA_BRANDING.legalNotice}
          </p>
        </LegalCard>
      </section>

      {imprint?.additional_information && (
        <section className="mx-auto max-w-5xl px-4">
          <div className="club-card p-5 sm:p-6">
            <p className="club-eyebrow">Weitere Angaben</p>
            <p className="mt-3 whitespace-pre-line text-sm leading-7 text-zinc-400">
              {imprint.additional_information}
            </p>
          </div>
        </section>
      )}

      <BottomNavigation />
    </main>
  );
}

function LegalCard({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <article className="club-card p-5 sm:p-6">
      <div className="club-icon-box">{icon}</div>
      <h2 className="mt-4 text-lg font-black uppercase text-white">{title}</h2>
      <div className="mt-4 space-y-2">{children}</div>
    </article>
  );
}

function Entry({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/[0.07] bg-black/20 p-3">
      <p className="text-[9px] font-black uppercase tracking-wider text-zinc-600">
        {label}
      </p>
      <p className="mt-1 text-sm font-black text-white">{value}</p>
    </div>
  );
}

function Contact({
  icon,
  value,
  href,
}: {
  icon?: React.ReactNode;
  value: string;
  href?: string;
}) {
  const content = (
    <span className="flex items-center gap-2 text-sm text-zinc-400">
      {icon}
      {value}
    </span>
  );

  return href ? (
    <a
      href={href}
      target={href.startsWith("http") ? "_blank" : undefined}
      rel={href.startsWith("http") ? "noreferrer" : undefined}
      className="block rounded-2xl border border-white/[0.07] bg-black/20 p-3 transition hover:border-club-light-red/20"
    >
      {content}
    </a>
  ) : (
    <div className="rounded-2xl border border-white/[0.07] bg-black/20 p-3">
      {content}
    </div>
  );
}

function Strong({ children }: { children: React.ReactNode }) {
  return <p className="font-black text-white">{children}</p>;
}

function Text({ children }: { children: React.ReactNode }) {
  return <p className="text-sm leading-6 text-zinc-400">{children}</p>;
}

function Missing({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-2xl border border-dashed border-white/10 bg-black/15 p-4 text-sm leading-6 text-zinc-600">
      {children}
    </p>
  );
}
