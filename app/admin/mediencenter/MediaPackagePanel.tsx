"use client";

import Link from "next/link";
import { useState } from "react";
import {
  CheckCircle2,
  Copy,
  FileText,
  Film,
  Globe2,
  ImageIcon,
  MessageCircle,
  Newspaper,
  Share2,
  Sparkles,
} from "lucide-react";

import type { MediaCenterPackage } from "../../../lib/ai/media-center";

type Props = {
  matchId: string;
  source: string;
  model: string | null;
  packageData: MediaCenterPackage;
};

export default function MediaPackagePanel({
  matchId,
  source,
  model,
  packageData,
}: Props) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-3xl border border-emerald-500/20 bg-emerald-950/20 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <CheckCircle2 className="text-emerald-300" size={22} />
          <div>
            <p className="font-black text-white">Medienpaket ist fertig</p>
            <p className="mt-1 text-xs text-zinc-500">
              Quelle: HUJA AI Engine · lokal und ohne API
            </p>
          </div>
        </div>
        <Link
          href={`/admin/grafikstudio?match=${matchId}`}
          className="club-button-primary"
        >
          <ImageIcon size={17} />
          Grafiken erstellen
        </Link>
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <TextCard
          icon={<Share2 size={18} />}
          title="Instagram"
          value={packageData.instagram}
        />
        <TextCard
          icon={<Globe2 size={18} />}
          title="Facebook"
          value={packageData.facebook}
        />
        <TextCard
          icon={<MessageCircle size={18} />}
          title="WhatsApp"
          value={packageData.whatsapp}
        />
        <TextCard
          icon={<Newspaper size={18} />}
          title="Pressemitteilung"
          value={packageData.pressRelease}
        />
        <TextCard
          icon={<FileText size={18} />}
          title={packageData.homepageTitle}
          value={`${packageData.homepageExcerpt}\n\n${packageData.homepageReport}`}
          large
        />
        <TextCard
          icon={<Film size={18} />}
          title="Reel-Skript"
          value={packageData.reelScript}
          large
        />
      </div>

      <section className="club-card p-5 sm:p-6">
        <div className="flex items-center gap-3">
          <div className="club-icon-box">
            <Sparkles size={18} />
          </div>
          <div>
            <p className="club-eyebrow">Instagram Story</p>
            <h2 className="mt-1 text-xl font-black uppercase text-white">
              Story-Ablauf
            </h2>
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {packageData.storySlides.map((slide, index) => (
            <div
              key={`${index}-${slide}`}
              className="relative aspect-[9/16] rounded-3xl border border-white/10 bg-gradient-to-br from-club-burgundy/50 via-black/70 to-black p-5"
            >
              <span className="text-[9px] font-black uppercase tracking-wider text-club-light-red">
                Slide {index + 1}
              </span>
              <p className="mt-5 whitespace-pre-wrap text-lg font-black leading-7 text-white">
                {slide}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="club-card p-5 sm:p-6">
        <p className="club-eyebrow">Grafik-Headlines</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {Object.entries(packageData.graphicHeadlines).map(([key, value]) => (
            <CopyChip key={key} label={key} value={value} />
          ))}
        </div>

        <div className="mt-5">
          <p className="text-xs font-black uppercase tracking-wider text-zinc-500">
            Hashtags
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {packageData.hashtags.map((hashtag) => (
              <span
                key={hashtag}
                className="rounded-full border border-white/10 bg-white/[0.035] px-3 py-2 text-xs font-bold text-zinc-300"
              >
                {hashtag}
              </span>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function TextCard({
  icon,
  title,
  value,
  large = false,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
  large?: boolean;
}) {
  const [copied, setCopied] = useState(false);

  return (
    <article className={`club-card p-5 ${large ? "xl:col-span-2" : ""}`}>
      <div className="flex items-center gap-3">
        <div className="club-icon-box">{icon}</div>
        <h3 className="min-w-0 flex-1 truncate font-black uppercase text-white">
          {title}
        </h3>
        <button
          type="button"
          onClick={async () => {
            await navigator.clipboard.writeText(value);
            setCopied(true);
            window.setTimeout(() => setCopied(false), 1600);
          }}
          className="club-button-secondary px-3 text-xs"
        >
          {copied ? <CheckCircle2 size={15} /> : <Copy size={15} />}
          {copied ? "Kopiert" : "Kopieren"}
        </button>
      </div>
      <textarea
        readOnly
        value={value}
        rows={large ? 14 : 10}
        className="admin-input mt-5 resize-none py-3 text-sm leading-6"
      />
    </article>
  );
}

function CopyChip({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <button
      type="button"
      onClick={async () => {
        await navigator.clipboard.writeText(value);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1400);
      }}
      className="rounded-2xl border border-white/10 bg-black/25 p-4 text-left transition hover:border-club-light-red/25"
    >
      <p className="text-[9px] font-black uppercase tracking-wider text-zinc-600">
        {label}
      </p>
      <p className="mt-2 font-black text-white">{value}</p>
      <p className="mt-3 text-[10px] font-bold uppercase text-club-light-red">
        {copied ? "Kopiert" : "Zum Kopieren klicken"}
      </p>
    </button>
  );
}
