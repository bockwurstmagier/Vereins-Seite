"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Film, LoaderCircle, PlayCircle, Upload, X } from "lucide-react";

import { addLiveMoment } from "../../app/admin/live/actions";
import { createClient } from "../../lib/supabase/client";

const MAX_VIDEO_SIZE = 35 * 1024 * 1024;

export default function LiveMomentUploader({
  matchId,
  defaultMinute,
}: {
  matchId: string;
  defaultMinute: number;
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [minute, setMinute] = useState(defaultMinute);
  const [eventType, setEventType] = useState<"penalty" | "moment">("penalty");
  const [description, setDescription] = useState("");
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState<string | null>(null);

  function chooseFile(selected?: File) {
    setMessage(null);
    if (!selected) return;
    if (!selected.type.startsWith("video/")) {
      setMessage("Bitte eine Videodatei auswählen.");
      return;
    }
    if (selected.size > MAX_VIDEO_SIZE) {
      setMessage("Das Video ist zu groß. Maximal 35 MB pro Live-Moment.");
      return;
    }
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(selected);
    setPreviewUrl(URL.createObjectURL(selected));
  }

  function clearFile() {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(null);
    setPreviewUrl(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  async function upload() {
    if (!file || busy) return;
    setBusy(true);
    setProgress(10);
    setMessage(null);

    const supabase = createClient();
    let uploadedPath: string | null = null;

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Bitte erneut anmelden.");

      const extension =
        file.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") ||
        "mp4";
      uploadedPath = `${user.id}/${matchId}/${crypto.randomUUID()}.${extension}`;

      setProgress(30);
      const { error: uploadError } = await supabase.storage
        .from("live-moments")
        .upload(uploadedPath, file, {
          cacheControl: "31536000",
          contentType: file.type,
          upsert: false,
        });
      if (uploadError) throw new Error(uploadError.message);

      setProgress(80);
      const { data } = supabase.storage
        .from("live-moments")
        .getPublicUrl(uploadedPath);

      await addLiveMoment({
        matchId,
        minute,
        eventType,
        description,
        videoUrl: data.publicUrl,
        videoPath: uploadedPath,
      });

      setProgress(100);
      setMessage("Live-Moment wurde veröffentlicht.");
      clearFile();
      setDescription("");
      router.refresh();
    } catch (error) {
      if (uploadedPath) {
        await supabase.storage.from("live-moments").remove([uploadedPath]);
      }
      setProgress(0);
      setMessage(
        error instanceof Error ? `Upload fehlgeschlagen: ${error.message}` : "Upload fehlgeschlagen.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-5 space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-2 block text-[10px] font-black uppercase tracking-[0.16em] text-zinc-500">Art</span>
          <select
            className="admin-input"
            value={eventType}
            onChange={(event) => setEventType(event.target.value as "penalty" | "moment")}
            disabled={busy}
          >
            <option value="penalty">Elfmeter</option>
            <option value="moment">Besonderer Live-Moment</option>
          </select>
        </label>
        <label className="block">
          <span className="mb-2 block text-[10px] font-black uppercase tracking-[0.16em] text-zinc-500">Minute</span>
          <input
            type="number"
            min="0"
            max="130"
            className="admin-input"
            value={minute}
            onChange={(event) => setMinute(Number(event.target.value))}
            disabled={busy}
          />
        </label>
      </div>

      <label className="block">
        <span className="mb-2 block text-[10px] font-black uppercase tracking-[0.16em] text-zinc-500">Beschreibung</span>
        <input
          className="admin-input"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder={eventType === "penalty" ? "z. B. Elfmeter für Middelich-Resse" : "Was ist passiert?"}
          disabled={busy}
        />
      </label>

      {!file ? (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="club-button-secondary min-h-20 w-full flex-col"
          disabled={busy}
        >
          <Upload size={23} />
          Video vom Handy auswählen
        </button>
      ) : (
        <div className="overflow-hidden rounded-3xl border border-white/10 bg-black/30">
          {previewUrl && <video src={previewUrl} controls playsInline className="max-h-80 w-full bg-black object-contain" />}
          <div className="flex items-center justify-between gap-3 p-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-black text-white">{file.name}</p>
              <p className="mt-1 text-xs text-zinc-500">{(file.size / 1024 / 1024).toFixed(1)} MB</p>
            </div>
            <button type="button" onClick={clearFile} disabled={busy} className="club-button-secondary">
              <X size={16} /> Entfernen
            </button>
          </div>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="video/mp4,video/webm,video/quicktime,video/*"
        className="hidden"
        onChange={(event) => chooseFile(event.target.files?.[0])}
      />

      {busy && (
        <div>
          <div className="h-2 overflow-hidden rounded-full bg-white/10">
            <div className="h-full rounded-full bg-club-red transition-all" style={{ width: `${progress}%` }} />
          </div>
          <p className="mt-2 flex items-center gap-2 text-xs text-zinc-400"><LoaderCircle size={14} className="animate-spin" /> Video wird veröffentlicht …</p>
        </div>
      )}

      {message && <p className="rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-zinc-300">{message}</p>}

      <button
        type="button"
        onClick={upload}
        disabled={!file || busy}
        className="club-button-primary min-h-16 w-full disabled:cursor-not-allowed disabled:opacity-50"
      >
        {busy ? <LoaderCircle size={20} className="animate-spin" /> : <PlayCircle size={20} />}
        Live-Moment veröffentlichen
      </button>

      <p className="flex items-start gap-2 text-xs leading-5 text-zinc-500">
        <Film size={15} className="mt-0.5 shrink-0" />
        Kurze Clips bis 35 MB. Der Upload läuft direkt zu Supabase und nicht über den App-Server.
      </p>
    </div>
  );
}
