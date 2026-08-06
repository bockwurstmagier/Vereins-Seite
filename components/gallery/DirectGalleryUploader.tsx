"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  FileImage,
  Film,
  LoaderCircle,
  Upload,
  X,
} from "lucide-react";

import { registerDirectGalleryUploads } from "../../app/admin/galerie/actions";
import { createClient } from "../../lib/supabase/client";

const MAX_IMAGE_SIZE = 15 * 1024 * 1024;
const MAX_VIDEO_SIZE = 25 * 1024 * 1024;
const MAX_FILES = 100;

type UploadState = {
  id: string;
  file: File;
  progress: number;
  status: "waiting" | "uploading" | "done" | "error";
  error?: string;
};

export default function DirectGalleryUploader({
  albumId,
}: {
  albumId: string;
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploads, setUploads] = useState<UploadState[]>([]);
  const [photographer, setPhotographer] = useState("");
  const [dragging, setDragging] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const totalProgress = useMemo(() => {
    if (!uploads.length) return 0;
    return Math.round(
      uploads.reduce((sum, upload) => sum + upload.progress, 0) /
        uploads.length,
    );
  }, [uploads]);

  function addFiles(fileList: FileList | File[]) {
    const selected = Array.from(fileList);
    setMessage(null);

    setUploads((current) => {
      const available = Math.max(0, MAX_FILES - current.length);
      const additions = selected.slice(0, available).map(validateFile);
      return [...current, ...additions];
    });
  }

  function removeFile(id: string) {
    if (busy) return;
    setUploads((current) => current.filter((upload) => upload.id !== id));
  }

  async function startUpload() {
    const validUploads = uploads.filter(
      (upload) => upload.status !== "error" && upload.status !== "done",
    );

    if (!validUploads.length || busy) return;

    setBusy(true);
    setMessage(null);

    const supabase = createClient();
    const completedPaths: string[] = [];
    const metadata: Array<{
      mediaType: "image" | "video";
      title: string;
      fileUrl: string;
      filePath: string;
      mimeType: string;
    }> = [];

    try {
      for (const upload of validUploads) {
        updateUpload(upload.id, {
          status: "uploading",
          progress: 10,
          error: undefined,
        });

        const file = upload.file;
        const isVideo = file.type.startsWith("video/");
        const extension =
          file.name
            .split(".")
            .pop()
            ?.toLowerCase()
            .replace(/[^a-z0-9]/g, "") || (isVideo ? "mp4" : "jpg");
        const filePath = `${albumId}/${crypto.randomUUID()}.${extension}`;

        updateUpload(upload.id, { progress: 25 });

        const { error: uploadError } = await supabase.storage
          .from("gallery-media")
          .upload(filePath, file, {
            cacheControl: "31536000",
            contentType: file.type,
            upsert: false,
          });

        if (uploadError) {
          throw new UploadFileError(upload.id, uploadError.message);
        }

        completedPaths.push(filePath);
        updateUpload(upload.id, { progress: 80 });

        const { data: publicUrl } = supabase.storage
          .from("gallery-media")
          .getPublicUrl(filePath);

        metadata.push({
          mediaType: isVideo ? "video" : "image",
          title: file.name.replace(/\.[^.]+$/, ""),
          fileUrl: publicUrl.publicUrl,
          filePath,
          mimeType: file.type,
        });

        updateUpload(upload.id, { progress: 90 });
      }

      await registerDirectGalleryUploads({
        albumId,
        photographer,
        items: metadata,
      });

      for (const upload of validUploads) {
        updateUpload(upload.id, { status: "done", progress: 100 });
      }

      setMessage(
        `${metadata.length} ${
          metadata.length === 1 ? "Datei wurde" : "Dateien wurden"
        } erfolgreich hochgeladen.`,
      );

      router.refresh();
    } catch (error) {
      if (completedPaths.length) {
        await supabase.storage.from("gallery-media").remove(completedPaths);
      }

      if (error instanceof UploadFileError) {
        updateUpload(error.uploadId, {
          status: "error",
          progress: 0,
          error: error.message,
        });
      }

      setMessage(
        error instanceof Error
          ? `Upload fehlgeschlagen: ${error.message}`
          : "Upload fehlgeschlagen.",
      );
    } finally {
      setBusy(false);
    }
  }

  function updateUpload(id: string, patch: Partial<UploadState>) {
    setUploads((current) =>
      current.map((upload) =>
        upload.id === id ? { ...upload, ...patch } : upload,
      ),
    );
  }

  return (
    <div>
      <div
        onDragEnter={(event) => {
          event.preventDefault();
          if (!busy) setDragging(true);
        }}
        onDragOver={(event) => event.preventDefault()}
        onDragLeave={(event) => {
          event.preventDefault();
          if (event.currentTarget === event.target) setDragging(false);
        }}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          if (!busy) addFiles(event.dataTransfer.files);
        }}
        className={`rounded-3xl border-2 border-dashed p-6 text-center transition ${
          dragging
            ? "border-club-light-red bg-club-red/10"
            : "border-white/10 bg-black/20"
        }`}
      >
        <Upload size={32} className="mx-auto text-club-light-red" />
        <p className="mt-3 font-black text-white">
          Bilder und Videos hier hineinziehen
        </p>
        <p className="mt-2 text-xs leading-5 text-zinc-600">
          oder Dateien vom Handy beziehungsweise Computer auswählen
        </p>

        <input
          ref={inputRef}
          type="file"
          accept="image/*,video/mp4,video/webm"
          multiple
          className="hidden"
          onChange={(event) => {
            if (event.target.files) addFiles(event.target.files);
            event.target.value = "";
          }}
        />

        <button
          type="button"
          disabled={busy}
          onClick={() => inputRef.current?.click()}
          className="club-button-secondary mt-4"
        >
          Dateien auswählen
        </button>
      </div>

      <input
        value={photographer}
        onChange={(event) => setPhotographer(event.target.value)}
        disabled={busy}
        placeholder="Fotograf optional"
        className="admin-input mt-4"
      />

      {uploads.length > 0 && (
        <div className="mt-4 space-y-3">
          {uploads.map((upload) => {
            const isVideo = upload.file.type.startsWith("video/");

            return (
              <div
                key={upload.id}
                className="rounded-2xl border border-white/[0.08] bg-black/25 p-3"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-club-red/10 text-club-light-red">
                    {isVideo ? <Film size={17} /> : <FileImage size={17} />}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-black text-white">
                      {upload.file.name}
                    </p>
                    <p className="mt-1 text-[10px] text-zinc-600">
                      {formatBytes(upload.file.size)}
                      {upload.status === "error" && upload.error
                        ? ` · ${upload.error}`
                        : ""}
                    </p>
                  </div>

                  {upload.status === "done" ? (
                    <CheckCircle2 size={18} className="text-emerald-300" />
                  ) : upload.status === "uploading" ? (
                    <LoaderCircle
                      size={18}
                      className="animate-spin text-club-light-red"
                    />
                  ) : (
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => removeFile(upload.id)}
                      className="text-zinc-600 hover:text-red-300"
                      aria-label="Datei entfernen"
                    >
                      <X size={17} />
                    </button>
                  )}
                </div>

                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                  <div
                    className={`h-full rounded-full transition-all ${
                      upload.status === "error"
                        ? "bg-red-500"
                        : upload.status === "done"
                          ? "bg-emerald-400"
                          : "bg-club-light-red"
                    }`}
                    style={{ width: `${upload.progress}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {busy && (
        <div className="mt-4">
          <div className="flex items-center justify-between text-xs">
            <span className="font-black uppercase text-zinc-500">
              Gesamtfortschritt
            </span>
            <span className="font-black text-white">{totalProgress}%</span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/[0.06]">
            <div
              className="h-full rounded-full bg-gradient-to-r from-club-red to-club-light-red transition-all"
              style={{ width: `${totalProgress}%` }}
            />
          </div>
        </div>
      )}

      {message && (
        <div
          className={`mt-4 rounded-2xl border px-4 py-3 text-sm ${
            message.startsWith("Upload fehlgeschlagen")
              ? "border-red-500/20 bg-red-950/25 text-red-200"
              : "border-emerald-500/20 bg-emerald-950/25 text-emerald-200"
          }`}
        >
          {message}
        </div>
      )}

      <button
        type="button"
        disabled={
          busy ||
          !uploads.some(
            (upload) =>
              upload.status === "waiting" || upload.status === "error",
          )
        }
        onClick={() => void startUpload()}
        className="club-button-primary mt-4 w-full disabled:opacity-40"
      >
        {busy ? (
          <LoaderCircle size={17} className="animate-spin" />
        ) : (
          <Upload size={17} />
        )}
        {busy ? "Upload läuft…" : "Direkt zu Supabase hochladen"}
      </button>

      <p className="mt-3 text-xs leading-5 text-zinc-600">
        Die Dateien laufen direkt vom Browser zu Supabase Storage und nicht
        mehr über den Hostinger- oder Vercel-Server.
      </p>
    </div>
  );
}

function validateFile(file: File): UploadState {
  const isImage = file.type.startsWith("image/");
  const isVideo = file.type.startsWith("video/");
  let error: string | undefined;

  if (!isImage && !isVideo) {
    error = "Nur Bilder, MP4 und WebM sind erlaubt.";
  } else if (isImage && file.size > MAX_IMAGE_SIZE) {
    error = "Bild ist größer als 15 MB.";
  } else if (isVideo && file.size > MAX_VIDEO_SIZE) {
    error = "Video ist größer als 25 MB.";
  }

  return {
    id: crypto.randomUUID(),
    file,
    progress: 0,
    status: error ? "error" : "waiting",
    error,
  };
}

function formatBytes(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.ceil(bytes / 1024)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

class UploadFileError extends Error {
  constructor(
    public uploadId: string,
    message: string,
  ) {
    super(message);
    this.name = "UploadFileError";
  }
}
