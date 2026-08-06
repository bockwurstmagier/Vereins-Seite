import Link from "next/link";
import { ExternalLink, FileText, Save } from "lucide-react";

import { requireRole } from "../../../lib/auth/roles";
import { HUJA_BRANDING } from "../../../lib/branding";
import { createClient } from "../../../lib/supabase/server";
import { saveImprint } from "./actions";

type Props = {
  searchParams: Promise<{ saved?: string }>;
};

export default async function ImprintAdminPage({ searchParams }: Props) {
  await requireRole(["administrator", "vorstand"]);

  const params = await searchParams;
  const supabase = await createClient();

  const { data: imprint } = await supabase
    .from("site_imprint")
    .select("*")
    .eq("id", "main")
    .maybeSingle();

  return (
    <div className="mx-auto max-w-5xl pb-24">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex items-start gap-4">
          <div className="club-icon-box mt-1">
            <FileText size={20} />
          </div>
          <div>
            <p className="club-eyebrow">Rechtliche Angaben</p>
            <h1 className="club-heading mt-2">Impressum verwalten</h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-zinc-400">
              Trage hier die offiziellen Vereins-, Vorstands- und
              Kontaktdaten ein. Leere Felder werden öffentlich nicht angezeigt.
            </p>
          </div>
        </div>

        <Link href="/impressum" target="_blank" className="club-button-secondary">
          Öffentliche Seite
          <ExternalLink size={16} />
        </Link>
      </div>

      {params.saved && (
        <div className="mt-6 rounded-2xl border border-emerald-500/20 bg-emerald-950/25 px-4 py-3 text-sm text-emerald-300">
          Das Impressum wurde gespeichert.
        </div>
      )}

      <form action={saveImprint} className="mt-7 space-y-6">
        <Section title="Vereinsdaten">
          <Field label="Vereinsname" wide>
            <input
              name="club_name"
              required
              defaultValue={imprint?.club_name ?? HUJA_BRANDING.clubName}
              className="admin-input"
            />
          </Field>
          <Field label="Offizieller Rechtsname" wide>
            <input
              name="club_legal_name"
              defaultValue={imprint?.club_legal_name ?? ""}
              placeholder="Optional, falls abweichend"
              className="admin-input"
            />
          </Field>
          <Field label="Straße und Hausnummer">
            <input
              name="street"
              defaultValue={imprint?.street ?? ""}
              className="admin-input"
            />
          </Field>
          <Field label="Postleitzahl">
            <input
              name="postal_code"
              defaultValue={imprint?.postal_code ?? ""}
              className="admin-input"
            />
          </Field>
          <Field label="Ort">
            <input
              name="city"
              defaultValue={imprint?.city ?? ""}
              className="admin-input"
            />
          </Field>
        </Section>

        <Section title="Vorstand und Vertretung">
          <Field label="1. Vorsitzender">
            <input
              name="first_chairman_name"
              defaultValue={imprint?.first_chairman_name ?? ""}
              className="admin-input"
            />
          </Field>
          <Field label="2. Vorsitzender">
            <input
              name="second_chairman_name"
              defaultValue={imprint?.second_chairman_name ?? ""}
              className="admin-input"
            />
          </Field>
          <Field label="Präsident">
            <input
              name="president_name"
              defaultValue={imprint?.president_name ?? ""}
              className="admin-input"
            />
          </Field>
        </Section>

        <Section title="Kontakt">
          <Field label="Telefon">
            <input
              name="phone"
              defaultValue={imprint?.phone ?? ""}
              className="admin-input"
            />
          </Field>
          <Field label="E-Mail">
            <input
              name="email"
              type="email"
              defaultValue={imprint?.email ?? ""}
              className="admin-input"
            />
          </Field>
          <Field label="Website">
            <input
              name="website"
              type="url"
              defaultValue={imprint?.website ?? ""}
              placeholder="https://..."
              className="admin-input"
            />
          </Field>
        </Section>

        <Section title="Verantwortlich für den Inhalt">
          <Field label="Name" wide>
            <input
              name="content_responsible_name"
              defaultValue={imprint?.content_responsible_name ?? ""}
              className="admin-input"
            />
          </Field>
          <Field label="Straße und Hausnummer">
            <input
              name="content_responsible_street"
              defaultValue={imprint?.content_responsible_street ?? ""}
              className="admin-input"
            />
          </Field>
          <Field label="Postleitzahl">
            <input
              name="content_responsible_postal_code"
              defaultValue={imprint?.content_responsible_postal_code ?? ""}
              className="admin-input"
            />
          </Field>
          <Field label="Ort">
            <input
              name="content_responsible_city"
              defaultValue={imprint?.content_responsible_city ?? ""}
              className="admin-input"
            />
          </Field>
        </Section>

        <Section title="Register und weitere Angaben">
          <Field label="Registergericht">
            <input
              name="register_court"
              defaultValue={imprint?.register_court ?? ""}
              className="admin-input"
            />
          </Field>
          <Field label="Registernummer">
            <input
              name="register_number"
              defaultValue={imprint?.register_number ?? ""}
              className="admin-input"
            />
          </Field>
          <Field label="Steuernummer">
            <input
              name="tax_number"
              defaultValue={imprint?.tax_number ?? ""}
              className="admin-input"
            />
          </Field>
          <Field label="Zusätzliche Informationen" wide>
            <textarea
              name="additional_information"
              rows={5}
              defaultValue={imprint?.additional_information ?? ""}
              className="admin-input min-h-32 resize-y py-4"
            />
          </Field>
        </Section>

        <button type="submit" className="club-button-primary w-full">
          <Save size={17} />
          Impressum speichern
        </button>
      </form>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="club-card p-5 sm:p-6">
      <p className="club-eyebrow">{title}</p>
      <div className="mt-5 grid gap-4 md:grid-cols-2">{children}</div>
    </section>
  );
}

function Field({
  label,
  wide = false,
  children,
}: {
  label: string;
  wide?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className={wide ? "md:col-span-2" : ""}>
      <span className="admin-label">{label}</span>
      {children}
    </label>
  );
}
