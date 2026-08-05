"use client";

import { forwardRef, useMemo, useRef, useState } from "react";
import {
  CalendarDays,
  Copy,
  Download,
  ImageIcon,
  Newspaper,
  Trophy,
} from "lucide-react";
import type {
  SocialFormat,
  SocialMatch,
  SocialNews,
  SocialTemplate,
} from "../../lib/social/types";

type Props = {
  matches: SocialMatch[];
  news: SocialNews[];
  logoSrc: string;
};

const FORMATS: Record<SocialFormat, { width: number; height: number; label: string }> = {
  feed: { width: 1080, height: 1350, label: "Instagram Feed" },
  story: { width: 1080, height: 1920, label: "Instagram Story" },
  square: { width: 1080, height: 1080, label: "Quadrat" },
};

const dateFormatter = new Intl.DateTimeFormat("de-DE", {
  weekday: "long",
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  timeZone: "Europe/Berlin",
});

const timeFormatter = new Intl.DateTimeFormat("de-DE", {
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Europe/Berlin",
});

export default function SocialStudio({ matches, news, logoSrc }: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [template, setTemplate] = useState<SocialTemplate>("matchday");
  const [format, setFormat] = useState<SocialFormat>("feed");
  const [matchId, setMatchId] = useState(matches[0]?.id ?? "");
  const [newsId, setNewsId] = useState(news[0]?.id ?? "");
  const [headline, setHeadline] = useState("HUJA – DIE MIDDELICHER SIND DA");
  const [accent, setAccent] = useState("#c1121f");
  const [busy, setBusy] = useState(false);

  const selectedMatch = useMemo(
    () => matches.find((item) => item.id === matchId) ?? matches[0] ?? null,
    [matches, matchId],
  );

  const selectedNews = useMemo(
    () => news.find((item) => item.id === newsId) ?? news[0] ?? null,
    [news, newsId],
  );

  const caption = useMemo(() => {
    if (template === "news") {
      return `${selectedNews?.title ?? "Neue Vereinsnews"}\n\n${
        selectedNews?.excerpt ?? "Alle Infos jetzt auf unserer Vereinsseite."
      }\n\n#HUJA #MiddelichResse #DieMiddelicherSindDa`;
    }

    if (!selectedMatch) return "";

    if (template === "result") {
      const score = `${selectedMatch.home_score ?? 0}:${selectedMatch.away_score ?? 0}`;
      return `ABPFIFF! 🔴⚫\n\n${selectedMatch.home_team} ${score} ${selectedMatch.away_team}\n\nGemeinsam weiter – die Middelicher sind da!\n\n#HUJA #MiddelichResse #Endstand`;
    }

    const date = new Date(selectedMatch.match_date);
    return `MATCHDAY! ⚽\n\n${selectedMatch.home_team} gegen ${selectedMatch.away_team}\n📅 ${dateFormatter.format(date)}\n⏰ ${timeFormatter.format(date)} Uhr\n📍 ${selectedMatch.location ?? "Spielort folgt"}\n\nKommt vorbei und unterstützt unsere Jungs!\n\n#HUJA #MiddelichResse #Matchday`;
  }, [selectedMatch, selectedNews, template]);

  async function exportPng() {
    const svg = svgRef.current;
    if (!svg) return;

    setBusy(true);

    try {
      const { width, height } = FORMATS[format];
      const source = new XMLSerializer().serializeToString(svg);
      const blob = new Blob([source], { type: "image/svg+xml;charset=utf-8" });
      const objectUrl = URL.createObjectURL(blob);
      const image = new Image();

      await new Promise<void>((resolve, reject) => {
        image.onload = () => resolve();
        image.onerror = () => reject(new Error("Grafik konnte nicht gerendert werden."));
        image.src = objectUrl;
      });

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const context = canvas.getContext("2d");
      if (!context) throw new Error("Canvas wird nicht unterstützt.");

      context.drawImage(image, 0, 0, width, height);
      URL.revokeObjectURL(objectUrl);

      const link = document.createElement("a");
      link.download = `middelich-resse-${template}-${format}.png`;
      link.href = canvas.toDataURL("image/png", 1);
      link.click();
    } catch (error) {
      alert(error instanceof Error ? error.message : "Export fehlgeschlagen.");
    } finally {
      setBusy(false);
    }
  }

  async function copyCaption() {
    await navigator.clipboard.writeText(caption);
  }

  const dimensions = FORMATS[format];

  return (
    <div className="grid gap-6 xl:grid-cols-[380px_minmax(0,1fr)]">
      <aside className="club-card h-fit p-5 xl:sticky xl:top-24">
        <p className="club-eyebrow">Generator</p>
        <h2 className="mt-2 text-2xl font-black uppercase">Einstellungen</h2>

        <div className="mt-6 space-y-5">
          <Control label="Vorlage">
            <div className="grid grid-cols-3 gap-2">
              <TemplateButton
                active={template === "matchday"}
                onClick={() => setTemplate("matchday")}
                icon={<CalendarDays size={17} />}
                label="Matchday"
              />
              <TemplateButton
                active={template === "result"}
                onClick={() => setTemplate("result")}
                icon={<Trophy size={17} />}
                label="Ergebnis"
              />
              <TemplateButton
                active={template === "news"}
                onClick={() => setTemplate("news")}
                icon={<Newspaper size={17} />}
                label="News"
              />
            </div>
          </Control>

          <Control label="Format">
            <select
              value={format}
              onChange={(event) => setFormat(event.target.value as SocialFormat)}
              className="admin-input"
            >
              {Object.entries(FORMATS).map(([value, item]) => (
                <option key={value} value={value}>
                  {item.label} – {item.width}×{item.height}
                </option>
              ))}
            </select>
          </Control>

          {template !== "news" ? (
            <Control label="Spiel auswählen">
              <select
                value={matchId}
                onChange={(event) => setMatchId(event.target.value)}
                className="admin-input"
              >
                {matches.map((match) => (
                  <option key={match.id} value={match.id}>
                    {match.home_team} – {match.away_team}
                  </option>
                ))}
              </select>
            </Control>
          ) : (
            <Control label="News auswählen">
              <select
                value={newsId}
                onChange={(event) => setNewsId(event.target.value)}
                className="admin-input"
              >
                {news.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.title}
                  </option>
                ))}
              </select>
            </Control>
          )}

          <Control label="Zusatzzeile">
            <input
              value={headline}
              onChange={(event) => setHeadline(event.target.value)}
              className="admin-input"
              maxLength={55}
            />
          </Control>

          <Control label="Akzentfarbe">
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={accent}
                onChange={(event) => setAccent(event.target.value)}
                className="h-14 w-16 cursor-pointer rounded-2xl border border-white/10 bg-black/30 p-2"
              />
              <input
                value={accent}
                onChange={(event) => setAccent(event.target.value)}
                className="admin-input"
              />
            </div>
          </Control>

          <button
            type="button"
            onClick={exportPng}
            disabled={busy}
            className="club-button-primary w-full disabled:opacity-50"
          >
            <Download size={18} />
            {busy ? "Export läuft …" : "Als PNG exportieren"}
          </button>
        </div>
      </aside>

      <section className="min-w-0">
        <div className="club-card p-4 sm:p-6">
          <div className="mb-4 flex items-center justify-between gap-4">
            <div>
              <p className="club-eyebrow">Live-Vorschau</p>
              <h2 className="mt-1 text-xl font-black uppercase">
                {FORMATS[format].label}
              </h2>
            </div>
            <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[10px] font-black text-zinc-400">
              {dimensions.width} × {dimensions.height}
            </span>
          </div>

          <div className="flex max-h-[76vh] justify-center overflow-auto rounded-3xl bg-black/35 p-3 sm:p-6">
            <SocialGraphic
              ref={svgRef}
              width={dimensions.width}
              height={dimensions.height}
              template={template}
              match={selectedMatch}
              news={selectedNews}
              logoSrc={logoSrc}
              headline={headline}
              accent={accent}
            />
          </div>
        </div>

        <div className="club-card mt-6 p-5 sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="club-eyebrow">Begleittext</p>
              <h2 className="mt-1 text-xl font-black uppercase">
                Social-Media-Text
              </h2>
            </div>
            <button type="button" onClick={copyCaption} className="club-button-secondary">
              <Copy size={17} />
              Kopieren
            </button>
          </div>
          <pre className="mt-5 whitespace-pre-wrap font-sans text-sm leading-7 text-zinc-300">
            {caption}
          </pre>
        </div>
      </section>
    </div>
  );
}

function Control({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-black uppercase tracking-[0.16em] text-zinc-500">
        {label}
      </span>
      {children}
    </label>
  );
}

function TemplateButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex min-h-20 flex-col items-center justify-center rounded-2xl border px-2 text-[10px] font-black uppercase tracking-wide transition ${
        active
          ? "border-club-light-red/40 bg-club-red text-white"
          : "border-white/10 bg-black/30 text-zinc-500 hover:text-white"
      }`}
    >
      {icon}
      <span className="mt-2">{label}</span>
    </button>
  );
}


const SocialGraphic = forwardRef<
  SVGSVGElement,
  {
    width: number;
    height: number;
    template: SocialTemplate;
    match: SocialMatch | null;
    news: SocialNews | null;
    logoSrc: string;
    headline: string;
    accent: string;
  }
>(function SocialGraphic(
  { width, height, template, match, news, logoSrc, headline, accent },
  ref,
) {
  const scale = height / 1350;
  const center = width / 2;
  const matchDate = match ? new Date(match.match_date) : null;
  const small = Math.max(30, 36 * scale);
  const medium = Math.max(48, 58 * scale);
  const large = Math.max(72, 92 * scale);

  const titleLines = wrapText(
    template === "news" ? news?.title ?? "VEREINSNEWS" : headline,
    template === "news" ? 24 : 30,
  );

  return (
    <svg
      ref={ref}
      xmlns="http://www.w3.org/2000/svg"
      viewBox={`0 0 ${width} ${height}`}
      width={Math.min(width, 580)}
      className="h-auto max-w-full rounded-2xl shadow-2xl"
      role="img"
      aria-label="Social-Media-Grafik Vorschau"
    >
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#050505" />
          <stop offset="0.55" stopColor="#170004" />
          <stop offset="1" stopColor="#020202" />
        </linearGradient>
        <radialGradient id="glow" cx="50%" cy="35%" r="60%">
          <stop offset="0" stopColor={accent} stopOpacity="0.48" />
          <stop offset="1" stopColor={accent} stopOpacity="0" />
        </radialGradient>
        <pattern id="grid" width="55" height="55" patternUnits="userSpaceOnUse">
          <path d="M 55 0 L 0 0 0 55" fill="none" stroke="#ffffff" strokeOpacity="0.035" strokeWidth="2" />
        </pattern>
        <filter id="shadow" x="-40%" y="-40%" width="180%" height="180%">
          <feDropShadow dx="0" dy="18" stdDeviation="20" floodColor="#000000" floodOpacity="0.7" />
        </filter>
      </defs>

      <rect width={width} height={height} fill="url(#bg)" />
      <rect width={width} height={height} fill="url(#grid)" />
      <ellipse cx={center} cy={height * 0.34} rx={width * 0.62} ry={height * 0.38} fill="url(#glow)" />
      <path d={`M0 ${height * 0.86} L${width} ${height * 0.70} L${width} ${height} L0 ${height}Z`} fill={accent} fillOpacity="0.18" />
      <path d={`M0 ${height * 0.92} L${width} ${height * 0.78}`} stroke={accent} strokeWidth={Math.max(8, 12 * scale)} opacity="0.8" />

      <image href={logoSrc} x={center - 105 * scale} y={70 * scale} width={210 * scale} height={210 * scale} preserveAspectRatio="xMidYMid meet" filter="url(#shadow)" />

      <text x={center} y={330 * scale} textAnchor="middle" fill={accent} fontSize={small} fontWeight="900" letterSpacing={9 * scale}>
        SPVGG MIDDELICH-RESSE
      </text>

      {template === "matchday" && match && (
        <>
          <text x={center} y={440 * scale} textAnchor="middle" fill="#ffffff" fontSize={large} fontWeight="950" letterSpacing={4 * scale}>
            MATCHDAY
          </text>
          <TeamNames match={match} center={center} scale={scale} accent={accent} />
          <text x={center} y={820 * scale} textAnchor="middle" fill="#ffffff" fontSize={medium} fontWeight="900">
            VS
          </text>
          <text x={center} y={930 * scale} textAnchor="middle" fill="#ffffff" fontSize={small} fontWeight="800">
            {matchDate ? dateFormatter.format(matchDate).toUpperCase() : "DATUM FOLGT"}
          </text>
          <text x={center} y={990 * scale} textAnchor="middle" fill={accent} fontSize={small} fontWeight="900">
            {matchDate ? `${timeFormatter.format(matchDate)} UHR` : "UHRZEIT FOLGT"}
          </text>
          <text x={center} y={1050 * scale} textAnchor="middle" fill="#a1a1aa" fontSize={Math.max(24, 29 * scale)} fontWeight="700">
            {truncate(match.location ?? "SPIELORT FOLGT", 48).toUpperCase()}
          </text>
        </>
      )}

      {template === "result" && match && (
        <>
          <text x={center} y={440 * scale} textAnchor="middle" fill="#ffffff" fontSize={large} fontWeight="950" letterSpacing={4 * scale}>
            ENDSTAND
          </text>
          <TeamNames match={match} center={center} scale={scale} accent={accent} />
          <text x={center} y={900 * scale} textAnchor="middle" fill="#ffffff" fontSize={Math.max(140, 180 * scale)} fontWeight="950">
            {match.home_score ?? 0}
            <tspan fill={accent}>:</tspan>
            {match.away_score ?? 0}
          </text>
          <text x={center} y={1020 * scale} textAnchor="middle" fill="#a1a1aa" fontSize={small} fontWeight="800">
            {match.competition.toUpperCase()}
          </text>
        </>
      )}

      {template === "news" && (
        <>
          <text x={center} y={445 * scale} textAnchor="middle" fill={accent} fontSize={small} fontWeight="900" letterSpacing={7 * scale}>
            {news?.category.toUpperCase() ?? "VEREINSNEWS"}
          </text>
          {titleLines.map((line, index) => (
            <text
              key={`${line}-${index}`}
              x={center}
              y={(560 + index * 98) * scale}
              textAnchor="middle"
              fill="#ffffff"
              fontSize={large}
              fontWeight="950"
            >
              {line.toUpperCase()}
            </text>
          ))}
          <rect x={110 * scale} y={900 * scale} width={width - 220 * scale} height={4 * scale} rx={2} fill={accent} />
          <text x={center} y={1000 * scale} textAnchor="middle" fill="#d4d4d8" fontSize={Math.max(24, 31 * scale)} fontWeight="700">
            {truncate(news?.excerpt ?? "ALLE INFOS JETZT AUF UNSERER VEREINSSEITE", 58).toUpperCase()}
          </text>
        </>
      )}

      <text x={center} y={height - 105 * scale} textAnchor="middle" fill="#ffffff" fontSize={Math.max(22, 28 * scale)} fontWeight="900" letterSpacing={4 * scale}>
        {truncate(headline, 55).toUpperCase()}
      </text>
      <text x={center} y={height - 55 * scale} textAnchor="middle" fill={accent} fontSize={Math.max(18, 22 * scale)} fontWeight="900" letterSpacing={6 * scale}>
        #HUJA · #DIE MIDDELICHER SIND DA
      </text>
    </svg>
  );
});

function TeamNames({
  match,
  center,
  scale,
  accent,
}: {
  match: SocialMatch;
  center: number;
  scale: number;
  accent: string;
}) {
  return (
    <>
      <text x={center} y={620 * scale} textAnchor="middle" fill="#ffffff" fontSize={Math.max(43, 56 * scale)} fontWeight="950">
        {truncate(match.home_team, 30).toUpperCase()}
      </text>
      <rect x={center - 165 * scale} y={665 * scale} width={330 * scale} height={5 * scale} rx={3} fill={accent} />
      <text x={center} y={760 * scale} textAnchor="middle" fill="#ffffff" fontSize={Math.max(43, 56 * scale)} fontWeight="950">
        {truncate(match.away_team, 30).toUpperCase()}
      </text>
    </>
  );
}

function truncate(value: string, max: number) {
  return value.length > max ? `${value.slice(0, max - 1)}…` : value;
}

function wrapText(value: string, maxLength: number) {
  const words = value.trim().split(/\s+/);
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    const test = current ? `${current} ${word}` : word;
    if (test.length > maxLength && current) {
      lines.push(current);
      current = word;
    } else {
      current = test;
    }
  }

  if (current) lines.push(current);
  return lines.slice(0, 4);
}
