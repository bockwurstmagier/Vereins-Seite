"use client";

import { useEffect, useRef, useState } from "react";
import {
  CheckCircle2,
  ImagePlus,
  LoaderCircle,
  Upload,
  X,
} from "lucide-react";

import { createClient } from "../../lib/supabase/client";

const MAX_SIZE = 8 * 1024 * 1024;

type Props = {
  initialUrl?: string | null;
  initialPath?: string | null;
};

export default function DirectNewsImageUploader({
  initialUrl = null,
  initialPath = null,
}: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [imageUrl, setImageUrl] = useState(initialUrl ?? "");
  const [imagePath, setImagePath] = useState(initialPath ?? "");
  const [preview, setPreview] = useState(initialUrl ?? "");
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploaded, setUploaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const form = rootRef.current?.closest("form");
    if (!form) return;

    const preventSubmitDuringUpload = (event: SubmitEvent) => {
      if (!busy) return;
      event.preventDefault();
      setError("Bitte warte, bis das Titelbild vollständig hochgeladen ist.");
    };

    form.addEventListener("submit", preventSubmitDuringUpload);
    return () => form.removeEventListener("submit", preventSubmitDuringUpload);
  }, [busy]);

  async function upload(file: File) {
    setError(null);
    setUploaded(false);

    if (!file.type.startsWith("image/")) {
      setError("Es dürfen nur Bilddateien hochgeladen werden.");
      return;
    }

    if (file.size > MAX_SIZE) {
      setError("Das Titelbild darf maximal 8 MB groß sein.");
      return;
    }

    setBusy(true);
    setProgress(15);

    const previewUrl = URL.createObjectURL(file);
    setPreview(previewUrl);

    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("Du bist nicht mehr angemeldet.");
      }

      const extension =
        file.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") ||
        "jpg";
      const nextPath = `${user.id}/${crypto.randomUUID()}.${extension}`;

      setProgress(35);

      const { error: uploadError } = await supabase.storage
        .from("news-images")
        .upload(nextPath, file, {
          cacheControl: "31536000",
          contentType: file.type,
          upsert: false,
        });

      if (uploadError) {
        throw new Error(uploadError.message);
      }

      setProgress(85);

      const { data } = supabase.storage
        .from("news-images")
        .getPublicUrl(nextPath);

      setImageUrl(data.publicUrl);
      setImagePath(nextPath);
      setProgress(100);
      setUploaded(true);
    } catch (uploadError) {
      setImageUrl(initialUrl ?? "");
      setImagePath(initialPath ?? "");
      setPreview(initialUrl ?? "");
      setProgress(0);
      setError(
        uploadError instanceof Error
          ? `Upload fehlgeschlagen: ${uploadError.message}`
          : "Upload fehlgeschlagen.",
      );
    } finally {
      setBusy(false);
      window.setTimeout(() => URL.revokeObjectURL(previewUrl), 1000);
    }
  }

  return (
    <div ref={rootRef}>
      <input type="hidden" name="direct_image_url" value={imageUrl} />
      <input type="hidden" name="direct_image_path" value={imagePath} />

      <div className="rounded-3xl border border-white/10 bg-black/20 p-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="flex h-40 w-full shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-black sm:w-56">
            {preview ? (
              <img
                src={preview}
                alt="Vorschau des News-Titelbildes"
                className="h-full w-full object-cover"
              />
            ) : (
              <ImagePlus size={36} className="text-zinc-700" />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-sm font-black text-white">Titelbild</p>
            <p className="mt-1 text-xs leading-5 text-zinc-600">
              Das Bild wird direkt zu Supabase hochgeladen und nicht mehr über
              den Hostinger-Server gesendet.
            </p>

            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) void upload(file);
                event.target.value = "";
              }}
            />

            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                disabled={busy}
                onClick={() => inputRef.current?.click()}
                className="club-button-secondary"
              >
                {busy ? (
                  <LoaderCircle size={16} className="animate-spin" />
                ) : (
                  <Upload size={16} />
                )}
                {busy ? "Wird hochgeladen…" : "Bild auswählen"}
              </button>

              {imageUrl && (
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => {
                    setImageUrl("");
                    setImagePath("");
                    setPreview("");
                    setProgress(0);
                    setUploaded(false);
                    setError(null);
                  }}
                  className="club-button-secondary text-red-300"
                >
                  <X size={16} />
                  Bild entfernen
                </button>
              )}
            </div>
          </div>
        </div>

        {(busy || progress > 0) && (
          <div className="mt-4">
            <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-wider text-zinc-500">
              <span>Upload</span>
              <span>{progress}%</span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/[0.06]">
              <div
                className="h-full rounded-full bg-gradient-to-r from-club-red to-club-light-red transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {uploaded && !busy && (
          <div className="mt-4 flex items-center gap-2 rounded-2xl border border-emerald-500/20 bg-emerald-950/25 px-4 py-3 text-sm text-emerald-300">
            <CheckCircle2 size={17} />
            Titelbild wurde erfolgreich hochgeladen.
          </div>
        )}

        {error && (
          <div className="mt-4 rounded-2xl border border-red-500/20 bg-red-950/25 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
