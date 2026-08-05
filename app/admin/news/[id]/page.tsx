import { notFound } from "next/navigation";
import { ArrowLeft, Save } from "lucide-react";
import { createClient } from "../../../../lib/supabase/server";
import { updateNews } from "../actions";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditNewsPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: news, error } = await supabase
    .from("news")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error || !news) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-4xl">
      <a
        href="/admin/news"
        className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider text-club-light-red"
      >
        <ArrowLeft size={16} aria-hidden="true" />
        Zurück zu den News
      </a>

      <p className="club-eyebrow mt-8">Newsverwaltung</p>
      <h1 className="club-heading mt-2">News bearbeiten</h1>

      <form
        action={updateNews}
        className="club-card mt-8 grid gap-4 p-5 md:grid-cols-2 md:p-6"
      >
        <input type="hidden" name="id" value={news.id} />
        <input
          type="hidden"
          name="old_image_url"
          value={news.image_url ?? ""}
        />
        <input
          type="hidden"
          name="old_image_path"
          value={news.image_path ?? ""}
        />
        <input
          type="hidden"
          name="old_published_at"
          value={news.published_at ?? ""}
        />

        <Field label="Titel" className="md:col-span-2">
          <input
            name="title"
            required
            defaultValue={news.title}
            className="admin-input"
          />
        </Field>

        <Field label="Kategorie">
          <select
            name="category"
            defaultValue={news.category}
            className="admin-input"
          >
            <option>Verein</option>
            <option>Spielbericht</option>
            <option>Mannschaft</option>
            <option>Transfer</option>
            <option>Sponsoren</option>
            <option>Veranstaltung</option>
          </select>
        </Field>

        <Field label="Status">
          <select
            name="status"
            defaultValue={news.status}
            className="admin-input"
          >
            <option value="draft">Entwurf</option>
            <option value="published">Veröffentlicht</option>
          </select>
        </Field>

        <Field label="Kurzbeschreibung" className="md:col-span-2">
          <textarea
            name="excerpt"
            rows={3}
            defaultValue={news.excerpt ?? ""}
            className="admin-input min-h-24 py-4"
          />
        </Field>

        <Field label="Beitragstext" className="md:col-span-2">
          <textarea
            name="content"
            required
            rows={12}
            defaultValue={news.content}
            className="admin-input min-h-72 py-4"
          />
        </Field>

        {news.image_url && (
          <div className="md:col-span-2">
            <p className="mb-2 text-xs font-black uppercase tracking-[0.16em] text-zinc-500">
              Aktuelles Titelbild
            </p>
            <img
              src={news.image_url}
              alt=""
              className="h-52 w-full rounded-3xl object-cover"
            />
          </div>
        )}

        <Field label="Neues Titelbild" className="md:col-span-2">
          <input
            name="image"
            type="file"
            accept="image/*"
            className="admin-file-input"
          />
          <p className="mt-2 text-xs text-zinc-600">
            Leer lassen, um das aktuelle Bild beizubehalten.
          </p>
        </Field>

        <div className="md:col-span-2">
          <button type="submit" className="club-button-primary w-full">
            <Save size={18} aria-hidden="true" />
            Änderungen speichern
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({
  label,
  className = "",
  children,
}: {
  label: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-2 block text-xs font-black uppercase tracking-[0.16em] text-zinc-500">
        {label}
      </span>
      {children}
    </label>
  );
}
