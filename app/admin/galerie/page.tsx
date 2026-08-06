import Link from "next/link";
import {
  ArrowDown,
  ArrowUp,
  Camera,
  CheckCircle2,
  Eye,
  EyeOff,
  Film,
  FolderPlus,
  ImageIcon,
  Save,
  Star,
  Trash2,
  Upload,
} from "lucide-react";

import DirectGalleryUploader from "../../../components/gallery/DirectGalleryUploader";
import { requireRole } from "../../../lib/auth/roles";
import { createClient } from "../../../lib/supabase/server";
import {
  addExternalVideo,
  createGalleryAlbum,
  deleteGalleryAlbum,
  deleteGalleryMedia,
  moveGalleryMedia,
  setAlbumCover,
  updateGalleryAlbum,
  updateGalleryMedia,
} from "./actions";

type PageProps = {
  searchParams: Promise<{
    album?: string;
    created?: string;
    uploaded?: string;
    saved?: string;
    deleted?: string;
    cover?: string;
    video?: string;
    media_saved?: string;
    album_deleted?: string;
  }>;
};

export default async function GalleryAdminPage({ searchParams }: PageProps) {
  await requireRole([
    "administrator",
    "vorstand",
    "trainer",
    "social_media",
    "betreuer",
  ]);

  const params = await searchParams;
  const supabase = await createClient();

  const [{ data: albums }, { data: matches }] = await Promise.all([
    supabase
      .from("gallery_albums")
      .select(
        "id,title,slug,description,category,season,match_id,cover_media_id,is_public,created_at,gallery_media(id,media_type,file_url,external_url,title)",
      )
      .order("created_at", { ascending: false }),
    supabase
      .from("matches")
      .select("id,home_team,away_team,match_date")
      .or("home_team.ilike.%Middelich-Resse%,away_team.ilike.%Middelich-Resse%")
      .order("match_date", { ascending: false })
      .limit(100),
  ]);

  const selectedAlbumId = params.album ?? albums?.[0]?.id ?? null;

  const { data: selectedAlbum } = selectedAlbumId
    ? await supabase
        .from("gallery_albums")
        .select(
          "id,title,slug,description,category,season,match_id,cover_media_id,is_public,created_at",
        )
        .eq("id", selectedAlbumId)
        .maybeSingle()
    : { data: null };

  const { data: media } = selectedAlbumId
    ? await supabase
        .from("gallery_media")
        .select(
          "id,album_id,media_type,title,caption,file_url,file_path,external_url,mime_type,sort_order,is_public,photographer,created_at",
        )
        .eq("album_id", selectedAlbumId)
        .order("sort_order")
        .order("created_at")
    : { data: [] };

  const notice =
    params.created
      ? "Album wurde erstellt."
      : params.uploaded
        ? `${params.uploaded} Dateien wurden hochgeladen.`
        : params.saved
          ? "Album wurde gespeichert."
          : params.deleted
            ? "Medium wurde gelöscht."
            : params.cover
              ? "Titelbild wurde gesetzt."
              : params.video
                ? "Video wurde ergänzt."
                : params.media_saved
                  ? "Medium wurde gespeichert."
                  : params.album_deleted
                    ? "Album wurde gelöscht."
                    : null;

  return (
    <div className="mx-auto max-w-7xl pb-24">
      <div className="flex items-start gap-4">
        <div className="club-icon-box mt-1">
          <Camera size={21} />
        </div>
        <div>
          <p className="club-eyebrow">Version 19.2</p>
          <h1 className="club-heading mt-2">HUJA Galerie Pro</h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-zinc-400">
            Alben erstellen, mehrere Bilder gleichzeitig hochladen, Videos
            einbinden, Titelbilder bestimmen und die öffentliche Galerie
            verwalten.
          </p>
        </div>
      </div>

      {notice && (
        <div className="mt-6 flex items-center gap-2 rounded-2xl border border-emerald-500/20 bg-emerald-950/25 px-4 py-3 text-sm text-emerald-300">
          <CheckCircle2 size={17} />
          {notice}
        </div>
      )}

      <div className="mt-7 grid gap-6 xl:grid-cols-[22rem_minmax(0,1fr)]">
        <aside className="space-y-5">
          <section className="club-card p-5">
            <div className="flex items-center gap-3">
              <div className="club-icon-box">
                <FolderPlus size={18} />
              </div>
              <h2 className="font-black uppercase text-white">Neues Album</h2>
            </div>

            <form action={createGalleryAlbum} className="mt-5 space-y-3">
              <input
                name="title"
                required
                placeholder="z. B. Heimspiel gegen Musterverein"
                className="admin-input"
              />
              <textarea
                name="description"
                rows={3}
                placeholder="Kurze Beschreibung"
                className="admin-input resize-none"
              />
              <select name="category" className="admin-input">
                {[
                  "Spieltag",
                  "Training",
                  "Mannschaft",
                  "Pokal",
                  "Event",
                  "Fans",
                  "Feier",
                  "Sonstiges",
                ].map((category) => (
                  <option key={category}>{category}</option>
                ))}
              </select>
              <input
                name="season"
                placeholder="Saison, z. B. 2026/27"
                className="admin-input"
              />
              <select name="match_id" className="admin-input">
                <option value="">Keinem Spiel zuordnen</option>
                {(matches ?? []).map((match) => (
                  <option key={match.id} value={match.id}>
                    {match.home_team} – {match.away_team}
                  </option>
                ))}
              </select>
              <select name="is_public" defaultValue="true" className="admin-input">
                <option value="true">Sofort öffentlich</option>
                <option value="false">Zunächst verborgen</option>
              </select>
              <button className="club-button-primary w-full">
                <FolderPlus size={16} />
                Album erstellen
              </button>
            </form>
          </section>

          <section className="club-card overflow-hidden">
            <div className="border-b border-white/10 p-5">
              <p className="club-eyebrow">Alle Alben</p>
              <h2 className="mt-1 font-black uppercase text-white">
                {albums?.length ?? 0} Alben
              </h2>
            </div>
            <div className="divide-y divide-white/[0.07]">
              {(albums ?? []).map((album) => {
                const albumMedia = Array.isArray(album.gallery_media)
                  ? album.gallery_media
                  : [];
                const cover =
                  albumMedia.find((item) => item.id === album.cover_media_id) ??
                  albumMedia.find((item) => item.media_type === "image");

                return (
                  <Link
                    key={album.id}
                    href={`/admin/galerie?album=${album.id}`}
                    className={`flex gap-3 p-4 transition ${
                      selectedAlbumId === album.id
                        ? "bg-club-red/[0.10]"
                        : "hover:bg-white/[0.025]"
                    }`}
                  >
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-black/30">
                      {cover?.file_url ? (
                        <img
                          src={cover.file_url}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <ImageIcon size={20} className="text-zinc-600" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-black text-white">
                        {album.title}
                      </p>
                      <p className="mt-1 text-[10px] uppercase tracking-wider text-zinc-600">
                        {album.category} · {albumMedia.length} Medien
                      </p>
                      <div className="mt-2 flex items-center gap-1 text-[9px] font-black uppercase">
                        {album.is_public ? (
                          <>
                            <Eye size={12} className="text-emerald-300" />
                            <span className="text-emerald-300">Öffentlich</span>
                          </>
                        ) : (
                          <>
                            <EyeOff size={12} className="text-zinc-600" />
                            <span className="text-zinc-600">Verborgen</span>
                          </>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        </aside>

        <main className="space-y-6">
          {!selectedAlbum ? (
            <section className="club-card p-8 text-center">
              <ImageIcon size={42} className="mx-auto text-zinc-700" />
              <h2 className="mt-4 text-xl font-black uppercase text-white">
                Noch kein Album ausgewählt
              </h2>
              <p className="mt-2 text-sm text-zinc-500">
                Erstelle links ein neues Album oder wähle ein vorhandenes aus.
              </p>
            </section>
          ) : (
            <>
              <section className="club-card p-5 sm:p-6">
                <div className="flex items-center gap-3">
                  <div className="club-icon-box">
                    <Save size={18} />
                  </div>
                  <div>
                    <p className="club-eyebrow">Albumeinstellungen</p>
                    <h2 className="mt-1 text-xl font-black uppercase text-white">
                      {selectedAlbum.title}
                    </h2>
                  </div>
                </div>

                <form
                  action={updateGalleryAlbum}
                  className="mt-5 grid gap-4 sm:grid-cols-2"
                >
                  <input type="hidden" name="album_id" value={selectedAlbum.id} />
                  <label className="sm:col-span-2">
                    <span className="admin-label">Titel</span>
                    <input
                      name="title"
                      required
                      defaultValue={selectedAlbum.title}
                      className="admin-input"
                    />
                  </label>
                  <label className="sm:col-span-2">
                    <span className="admin-label">Beschreibung</span>
                    <textarea
                      name="description"
                      rows={3}
                      defaultValue={selectedAlbum.description ?? ""}
                      className="admin-input resize-none"
                    />
                  </label>
                  <label>
                    <span className="admin-label">Kategorie</span>
                    <select
                      name="category"
                      defaultValue={selectedAlbum.category}
                      className="admin-input"
                    >
                      {[
                        "Spieltag",
                        "Training",
                        "Mannschaft",
                        "Pokal",
                        "Event",
                        "Fans",
                        "Feier",
                        "Sonstiges",
                      ].map((category) => (
                        <option key={category}>{category}</option>
                      ))}
                    </select>
                  </label>
                  <label>
                    <span className="admin-label">Saison</span>
                    <input
                      name="season"
                      defaultValue={selectedAlbum.season ?? ""}
                      className="admin-input"
                    />
                  </label>
                  <label>
                    <span className="admin-label">Spielzuordnung</span>
                    <select
                      name="match_id"
                      defaultValue={selectedAlbum.match_id ?? ""}
                      className="admin-input"
                    >
                      <option value="">Keinem Spiel zuordnen</option>
                      {(matches ?? []).map((match) => (
                        <option key={match.id} value={match.id}>
                          {match.home_team} – {match.away_team}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    <span className="admin-label">Sichtbarkeit</span>
                    <select
                      name="is_public"
                      defaultValue={String(selectedAlbum.is_public)}
                      className="admin-input"
                    >
                      <option value="true">Öffentlich</option>
                      <option value="false">Verborgen</option>
                    </select>
                  </label>
                  <button className="club-button-primary sm:col-span-2">
                    <Save size={16} />
                    Album speichern
                  </button>
                </form>

                <form action={deleteGalleryAlbum} className="mt-3">
                  <input type="hidden" name="album_id" value={selectedAlbum.id} />
                  <button className="club-button-secondary w-full text-red-300">
                    <Trash2 size={16} />
                    Komplettes Album löschen
                  </button>
                </form>
              </section>

              <section className="grid gap-5 lg:grid-cols-2">
                <div className="club-card p-5 sm:p-6">
                  <div className="flex items-center gap-3">
                    <div className="club-icon-box">
                      <Upload size={18} />
                    </div>
                    <div>
                      <p className="club-eyebrow">Mehrfach-Upload</p>
                      <h2 className="mt-1 font-black uppercase text-white">
                        Bilder & Videos hochladen
                      </h2>
                    </div>
                  </div>
                  <div className="mt-5">
                    <DirectGalleryUploader albumId={selectedAlbum.id} />
                  </div>
                </div>

                <div className="club-card p-5 sm:p-6">
                  <div className="flex items-center gap-3">
                    <div className="club-icon-box">
                      <Film size={18} />
                    </div>
                    <div>
                      <p className="club-eyebrow">YouTube & Co.</p>
                      <h2 className="mt-1 font-black uppercase text-white">
                        Externes Video einbinden
                      </h2>
                    </div>
                  </div>
                  <form action={addExternalVideo} className="mt-5 space-y-3">
                    <input
                      type="hidden"
                      name="album_id"
                      value={selectedAlbum.id}
                    />
                    <input
                      name="title"
                      placeholder="Videotitel"
                      className="admin-input"
                    />
                    <input
                      name="external_url"
                      type="url"
                      required
                      placeholder="https://..."
                      className="admin-input"
                    />
                    <textarea
                      name="caption"
                      rows={2}
                      placeholder="Beschreibung optional"
                      className="admin-input resize-none"
                    />
                    <input
                      name="photographer"
                      placeholder="Urheber optional"
                      className="admin-input"
                    />
                    <button className="club-button-secondary w-full">
                      <Film size={16} />
                      Video hinzufügen
                    </button>
                  </form>
                </div>
              </section>

              <section className="club-card overflow-hidden">
                <div className="border-b border-white/10 p-5 sm:p-6">
                  <p className="club-eyebrow">Albuminhalt</p>
                  <h2 className="mt-1 text-xl font-black uppercase text-white">
                    {(media ?? []).length} Medien
                  </h2>
                </div>

                {(media ?? []).length ? (
                  <div className="grid gap-4 p-5 sm:grid-cols-2 sm:p-6 xl:grid-cols-3">
                    {(media ?? []).map((item, index) => (
                      <article
                        key={item.id}
                        className="overflow-hidden rounded-3xl border border-white/[0.08] bg-black/25"
                      >
                        <div className="relative aspect-[4/3] bg-black">
                          {item.media_type === "image" && item.file_url ? (
                            <img
                              src={item.file_url}
                              alt={item.title ?? ""}
                              className="h-full w-full object-cover"
                            />
                          ) : item.file_url ? (
                            <video
                              src={item.file_url}
                              controls
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <a
                              href={item.external_url ?? "#"}
                              target="_blank"
                              rel="noreferrer"
                              className="flex h-full flex-col items-center justify-center gap-3 text-club-light-red"
                            >
                              <Film size={34} />
                              Externes Video öffnen
                            </a>
                          )}

                          {selectedAlbum.cover_media_id === item.id && (
                            <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-amber-400 px-3 py-1.5 text-[9px] font-black uppercase text-black">
                              <Star size={12} fill="currentColor" />
                              Titelbild
                            </span>
                          )}
                        </div>

                        <div className="p-4">
                          <form action={updateGalleryMedia} className="space-y-3">
                            <input
                              type="hidden"
                              name="media_id"
                              value={item.id}
                            />
                            <input
                              type="hidden"
                              name="album_id"
                              value={selectedAlbum.id}
                            />
                            <input
                              name="title"
                              defaultValue={item.title ?? ""}
                              placeholder="Titel"
                              className="admin-input"
                            />
                            <textarea
                              name="caption"
                              rows={2}
                              defaultValue={item.caption ?? ""}
                              placeholder="Bildunterschrift"
                              className="admin-input resize-none"
                            />
                            <input
                              name="photographer"
                              defaultValue={item.photographer ?? ""}
                              placeholder="Fotograf"
                              className="admin-input"
                            />
                            <select
                              name="is_public"
                              defaultValue={String(item.is_public)}
                              className="admin-input"
                            >
                              <option value="true">Öffentlich</option>
                              <option value="false">Verborgen</option>
                            </select>
                            <button className="club-button-secondary w-full">
                              <Save size={15} />
                              Speichern
                            </button>
                          </form>

                          <div className="mt-3 grid grid-cols-2 gap-2">
                            <form action={moveGalleryMedia}>
                              <input
                                type="hidden"
                                name="media_id"
                                value={item.id}
                              />
                              <input
                                type="hidden"
                                name="album_id"
                                value={selectedAlbum.id}
                              />
                              <input type="hidden" name="direction" value="up" />
                              <button
                                disabled={index === 0}
                                className="club-button-secondary w-full disabled:opacity-25"
                              >
                                <ArrowUp size={14} />
                                Hoch
                              </button>
                            </form>
                            <form action={moveGalleryMedia}>
                              <input
                                type="hidden"
                                name="media_id"
                                value={item.id}
                              />
                              <input
                                type="hidden"
                                name="album_id"
                                value={selectedAlbum.id}
                              />
                              <input
                                type="hidden"
                                name="direction"
                                value="down"
                              />
                              <button
                                disabled={index === (media ?? []).length - 1}
                                className="club-button-secondary w-full disabled:opacity-25"
                              >
                                <ArrowDown size={14} />
                                Runter
                              </button>
                            </form>
                          </div>

                          {item.media_type === "image" &&
                            selectedAlbum.cover_media_id !== item.id && (
                              <form action={setAlbumCover} className="mt-2">
                                <input
                                  type="hidden"
                                  name="media_id"
                                  value={item.id}
                                />
                                <input
                                  type="hidden"
                                  name="album_id"
                                  value={selectedAlbum.id}
                                />
                                <button className="club-button-secondary w-full">
                                  <Star size={14} />
                                  Als Titelbild
                                </button>
                              </form>
                            )}

                          <form action={deleteGalleryMedia} className="mt-2">
                            <input
                              type="hidden"
                              name="media_id"
                              value={item.id}
                            />
                            <input
                              type="hidden"
                              name="album_id"
                              value={selectedAlbum.id}
                            />
                            <button className="club-button-secondary w-full text-red-300">
                              <Trash2 size={14} />
                              Löschen
                            </button>
                          </form>
                        </div>
                      </article>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center text-sm text-zinc-600">
                    Dieses Album enthält noch keine Bilder oder Videos.
                  </div>
                )}
              </section>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
