import {
  CalendarDays,
  FilePenLine,
  ImageIcon,
  Newspaper,
  Plus,
  Trash2,
} from "lucide-react";
import DirectNewsImageUploader from "../../../components/news/DirectNewsImageUploader";
import { createClient } from "../../../lib/supabase/server";
import { createNews, deleteNews } from "./actions";

type SearchParams = Promise<{
  created?: string;
  updated?: string;
  deleted?: string;
}>;

const dateFormatter = new Intl.DateTimeFormat("de-DE", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Europe/Berlin",
});

export default async function NewsAdminPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const supabase = await createClient();

  const { data: news, error } = await supabase
    .from("news")
    .select(
      "id, title, excerpt, category, image_url, image_path, status, published_at, created_at",
    )
    .order("created_at", { ascending: false });

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="club-eyebrow">Vereinsmanager</p>
          <h1 className="club-heading mt-2">News verwalten</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400">
            Verfasse Vereinsmeldungen, lade Titelbilder hoch und veröffentliche
            Beiträge direkt auf der Website.
          </p>
        </div>

        <a href="#new-news" className="club-button-primary">
          <Plus size={18} aria-hidden="true" />
          Neue News
        </a>
      </div>

      {params.created && <Notice text="Die News wurde gespeichert." />}
      {params.updated && <Notice text="Die News wurde aktualisiert." />}
      {params.deleted && (
        <div className="mt-6 rounded-2xl border border-red-500/25 bg-red-950/30 px-4 py-3 text-sm text-red-300">
          Die News wurde gelöscht.
        </div>
      )}

      <section id="new-news" className="club-card mt-8 scroll-mt-24 p-5 sm:p-6">
        <div className="flex items-center gap-3">
          <div className="club-icon-box">
            <Newspaper size={19} aria-hidden="true" />
          </div>

          <div>
            <p className="club-eyebrow">Neuer Beitrag</p>
            <h2 className="mt-1 text-xl font-black uppercase text-white">
              News erstellen
            </h2>
          </div>
        </div>

        <form action={createNews} className="mt-6 grid gap-4 md:grid-cols-2">
          <Field label="Titel" className="md:col-span-2">
            <input
              name="title"
              required
              placeholder="Titel der Vereinsmeldung"
              className="admin-input"
            />
          </Field>

          <Field label="Kategorie">
            <select name="category" defaultValue="Verein" className="admin-input">
              <option>Verein</option>
              <option>Spielbericht</option>
              <option>Mannschaft</option>
              <option>Transfer</option>
              <option>Sponsoren</option>
              <option>Veranstaltung</option>
            </select>
          </Field>

          <Field label="Status">
            <select name="status" defaultValue="draft" className="admin-input">
              <option value="draft">Entwurf</option>
              <option value="published">Veröffentlicht</option>
            </select>
          </Field>

          <Field label="Kurzbeschreibung" className="md:col-span-2">
            <textarea
              name="excerpt"
              rows={3}
              placeholder="Kurzer Vorschautext für die Startseite"
              className="admin-input min-h-24 py-4"
            />
          </Field>

          <Field label="Beitragstext" className="md:col-span-2">
            <textarea
              name="content"
              required
              rows={10}
              placeholder="Hier den vollständigen Beitrag schreiben …"
              className="admin-input min-h-64 py-4"
            />
          </Field>

          <div className="md:col-span-2">
            <DirectNewsImageUploader />
          </div>

          <div className="md:col-span-2">
            <button type="submit" className="club-button-primary w-full">
              <Plus size={18} aria-hidden="true" />
              News speichern
            </button>
          </div>
        </form>
      </section>

      <section className="mt-8">
        <div className="mb-5 flex items-center gap-3">
          <div className="club-icon-box">
            <Newspaper size={19} aria-hidden="true" />
          </div>

          <div>
            <p className="club-eyebrow">Datenbank</p>
            <h2 className="mt-1 text-xl font-black uppercase text-white">
              Vorhandene News
            </h2>
          </div>
        </div>

        {error ? (
          <div className="club-card p-5 text-sm text-red-300">
            News konnten nicht geladen werden: {error.message}
          </div>
        ) : !news?.length ? (
          <div className="club-card p-6 text-sm text-zinc-400">
            Noch keine News eingetragen.
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {news.map((item) => {
              const displayDate = item.published_at || item.created_at;

              return (
                <article key={item.id} className="club-card overflow-hidden">
                  <div className="relative h-44 bg-gradient-to-br from-club-burgundy to-black">
                    {item.image_url ? (
                      <img
                        src={item.image_url}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <ImageIcon
                          size={42}
                          className="text-club-light-red/50"
                          aria-hidden="true"
                        />
                      </div>
                    )}

                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />

                    <span className="absolute left-4 top-4 rounded-full border border-white/10 bg-black/60 px-3 py-1 text-[9px] font-black uppercase tracking-wider text-white backdrop-blur-xl">
                      {item.status === "published" ? "Veröffentlicht" : "Entwurf"}
                    </span>
                  </div>

                  <div className="p-5">
                    <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                      <span className="text-club-light-red">{item.category}</span>
                      <span>•</span>
                      <CalendarDays size={13} aria-hidden="true" />
                      <span>{dateFormatter.format(new Date(displayDate))}</span>
                    </div>

                    <h3 className="mt-3 text-xl font-black leading-tight text-white">
                      {item.title}
                    </h3>

                    {item.excerpt && (
                      <p className="mt-2 line-clamp-3 text-sm leading-5 text-zinc-400">
                        {item.excerpt}
                      </p>
                    )}

                    <div className="mt-5 flex gap-2">
                      <a
                        href={`/admin/news/${item.id}`}
                        className="club-button-secondary flex-1"
                      >
                        <FilePenLine size={17} aria-hidden="true" />
                        Bearbeiten
                      </a>

                      <form action={deleteNews}>
                        <input type="hidden" name="id" value={item.id} />
                        <input
                          type="hidden"
                          name="image_path"
                          value={item.image_path ?? ""}
                        />

                        <button
                          type="submit"
                          aria-label="News löschen"
                          className="flex h-14 w-14 items-center justify-center rounded-2xl border border-red-500/20 bg-red-950/30 text-red-400 transition hover:bg-red-900/40 active:scale-95"
                        >
                          <Trash2 size={18} aria-hidden="true" />
                        </button>
                      </form>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

function Notice({ text }: { text: string }) {
  return (
    <div className="mt-6 rounded-2xl border border-emerald-500/25 bg-emerald-950/30 px-4 py-3 text-sm text-emerald-300">
      {text}
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
