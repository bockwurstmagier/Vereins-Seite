"use client";

import {
  forwardRef,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  CalendarDays,
  Copy,
  Download,
  ImagePlus,
  Newspaper,
  RotateCcw,
  Shirt,
  Trophy,
  Handshake,
  ListOrdered,
  Medal,
  Star,
} from "lucide-react";
import type {
  SocialFormat,
  SocialMatch,
  SocialNews,
  SocialPlayer,
  SocialSponsor,
  SocialStanding,
  SocialGoal,
  SocialTemplate,
} from "../../lib/social/types";

type Props = {
  matches: SocialMatch[];
  news: SocialNews[];
  players: SocialPlayer[];
  sponsors: SocialSponsor[];
  standings: SocialStanding[];
  goals: SocialGoal[];
  logoSrc: string;
};

type FormatInfo = {
  width: number;
  height: number;
  label: string;
};

const FORMATS: Record<SocialFormat, FormatInfo> = {
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

const DEFAULT_HEADLINES: Record<SocialTemplate, string> = {
  matchday: "HUJA – DIE MIDDELICHER SIND DA",
  result: "GEMEINSAM BIS ZUM SCHLUSS",
  news: "NEUES AUS DEM VEREIN",
  player: "EIN TEAM. EIN VEREIN.",
  sponsor: "GEMEINSAM STARK",
  table: "UNSERE LIGA. UNSER WEG.",
  scorers: "DIE TORE FÜR MIDDELICH",
  motm: "SPIELER DES SPIELS",
};

export default function SocialStudio({
  matches,
  news,
  players,
  sponsors,
  standings,
  goals,
  logoSrc,
}: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const backgroundInputRef = useRef<HTMLInputElement>(null);

  const [template, setTemplate] = useState<SocialTemplate>("matchday");
  const [format, setFormat] = useState<SocialFormat>("feed");
  const [matchId, setMatchId] = useState(matches[0]?.id ?? "");
  const [newsId, setNewsId] = useState(news[0]?.id ?? "");
  const [playerId, setPlayerId] = useState(players[0]?.id ?? "");
  const [sponsorId, setSponsorId] = useState(sponsors[0]?.id ?? "");
  const [headline, setHeadline] = useState(DEFAULT_HEADLINES.matchday);
  const [accent, setAccent] = useState("#c1121f");
  const [secondary, setSecondary] = useState("#51000e");
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null);
  const [backgroundOpacity, setBackgroundOpacity] = useState(0.42);
  const [showClubName, setShowClubName] = useState(true);
  const [busy, setBusy] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  const selectedMatch = useMemo(
    () => matches.find((item) => item.id === matchId) ?? matches[0] ?? null,
    [matches, matchId],
  );

  const selectedNews = useMemo(
    () => news.find((item) => item.id === newsId) ?? news[0] ?? null,
    [news, newsId],
  );

  const selectedPlayer = useMemo(
    () => players.find((item) => item.id === playerId) ?? players[0] ?? null,
    [players, playerId],
  );

  const selectedSponsor = useMemo(
    () =>
      sponsors.find((item) => item.id === sponsorId) ?? sponsors[0] ?? null,
    [sponsors, sponsorId],
  );

  useEffect(() => {
    setHeadline(DEFAULT_HEADLINES[template]);
  }, [template]);

  const caption = useMemo(() => {
    if (template === "news") {
      return `${selectedNews?.title ?? "Neue Vereinsnews"}\n\n${
        selectedNews?.excerpt ?? "Alle Infos jetzt auf unserer Vereinsseite."
      }\n\n#HUJA #MiddelichResse #DieMiddelicherSindDa`;
    }

    if (template === "player") {
      const name = selectedPlayer
        ? `${selectedPlayer.first_name} ${selectedPlayer.last_name}`
        : "Unser Spieler";
      return `${name} 🔴⚫\n\n${
        selectedPlayer?.position ?? "Mannschaft"
      } · ${selectedPlayer?.squad ?? "SpVgg Middelich-Resse"}\n\nEin Team. Ein Verein. Eine Leidenschaft.\n\n#HUJA #MiddelichResse #Mannschaft`;
    }

    if (template === "table") {
      const ourRow = standings.find((row) => row.is_club);
      return `AKTUELLE TABELLE 📊\n\n${
        ourRow
          ? `SpVgg Middelich-Resse steht aktuell auf Platz ${ourRow.position} mit ${ourRow.points} Punkten.`
          : "Hier ist der aktuelle Tabellenstand unserer Liga."
      }\n\nGemeinsam weiter! 🔴⚫\n\n#HUJA #MiddelichResse #Tabelle`;
    }

    if (template === "scorers") {
      const matchGoals = goals.filter((goal) => goal.match_id === selectedMatch?.id);
      const names = matchGoals
        .map((goal) => `${goal.minute}' ${goal.player_name ?? goal.description ?? "Middelich-Resse"}`)
        .join("\n");
      return `UNSERE TORSCHÜTZEN ⚽\n\n${names || "Die Torschützen werden nachgetragen."}\n\n#HUJA #MiddelichResse #Torschützen`;
    }

    if (template === "motm") {
      const name = selectedPlayer
        ? `${selectedPlayer.first_name} ${selectedPlayer.last_name}`
        : "Unser Spieler des Spiels";
      return `SPIELER DES SPIELS ⭐\n\n${name}\n\nStarker Auftritt für Middelich-Resse! 🔴⚫\n\n#HUJA #MiddelichResse #ManOfTheMatch`;
    }

    if (template === "sponsor") {
      return `DANKE FÜR EURE UNTERSTÜTZUNG! 🤝\n\n${
        selectedSponsor?.name ?? "Unser Partner"
      } steht an unserer Seite. Gemeinsam bewegen wir mehr.\n\n#HUJA #MiddelichResse #Sponsor #GemeinsamStark`;
    }

    if (!selectedMatch) return "";

    if (template === "result") {
      const score = `${selectedMatch.home_score ?? 0}:${selectedMatch.away_score ?? 0}`;
      return `ABPFIFF! 🔴⚫\n\n${selectedMatch.home_team} ${score} ${selectedMatch.away_team}\n\nGemeinsam weiter – die Middelicher sind da!\n\n#HUJA #MiddelichResse #Endstand`;
    }

    const date = new Date(selectedMatch.match_date);
    return `MATCHDAY! ⚽\n\n${selectedMatch.home_team} gegen ${selectedMatch.away_team}\n📅 ${dateFormatter.format(date)}\n⏰ ${timeFormatter.format(date)} Uhr\n📍 ${selectedMatch.location ?? "Spielort folgt"}\n\nKommt vorbei und unterstützt unsere Jungs!\n\n#HUJA #MiddelichResse #Matchday`;
  }, [selectedMatch, selectedNews, selectedPlayer, selectedSponsor, standings, goals, template]);

  async function exportPng() {
    const svg = svgRef.current;
    if (!svg) return;

    setBusy(true);

    try {
      const { width, height } = FORMATS[format];
      const clonedSvg = svg.cloneNode(true) as SVGSVGElement;
      clonedSvg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
      clonedSvg.setAttribute("width", String(width));
      clonedSvg.setAttribute("height", String(height));

      const source = new XMLSerializer().serializeToString(clonedSvg);
      const blob = new Blob([source], { type: "image/svg+xml;charset=utf-8" });
      const objectUrl = URL.createObjectURL(blob);
      const image = new Image();

      await new Promise<void>((resolve, reject) => {
        image.onload = () => resolve();
        image.onerror = () =>
          reject(new Error("Grafik konnte nicht gerendert werden."));
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
      window.alert(
        error instanceof Error ? error.message : "Export fehlgeschlagen.",
      );
    } finally {
      setBusy(false);
    }
  }

  async function copyCaption() {
    await navigator.clipboard.writeText(caption);
    setCopySuccess(true);
    window.setTimeout(() => setCopySuccess(false), 1600);
  }

  function uploadBackground(file: File | undefined) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      window.alert("Bitte wähle eine Bilddatei aus.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => setBackgroundImage(String(reader.result));
    reader.readAsDataURL(file);
  }

  function resetDesign() {
    setAccent("#c1121f");
    setSecondary("#51000e");
    setBackgroundImage(null);
    setBackgroundOpacity(0.42);
    setShowClubName(true);
    setHeadline(DEFAULT_HEADLINES[template]);
    if (backgroundInputRef.current) backgroundInputRef.current.value = "";
  }

  const dimensions = FORMATS[format];

  return (
    <div className="grid gap-6 xl:grid-cols-[390px_minmax(0,1fr)]">
      <aside className="club-card h-fit p-5 xl:sticky xl:top-24">
        <p className="club-eyebrow">Generator</p>
        <h2 className="mt-2 text-2xl font-black uppercase">Einstellungen</h2>

        <div className="mt-6 space-y-5">
          <Control label="Vorlage">
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-2">
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
                active={template === "table"}
                onClick={() => setTemplate("table")}
                icon={<ListOrdered size={17} />}
                label="Tabelle"
              />
              <TemplateButton
                active={template === "scorers"}
                onClick={() => setTemplate("scorers")}
                icon={<Medal size={17} />}
                label="Torschützen"
              />
              <TemplateButton
                active={template === "motm"}
                onClick={() => setTemplate("motm")}
                icon={<Star size={17} />}
                label="Spieler d. Spiels"
              />
              <TemplateButton
                active={template === "news"}
                onClick={() => setTemplate("news")}
                icon={<Newspaper size={17} />}
                label="News"
              />
              <TemplateButton
                active={template === "player"}
                onClick={() => setTemplate("player")}
                icon={<Shirt size={17} />}
                label="Spieler"
              />
              <TemplateButton
                active={template === "sponsor"}
                onClick={() => setTemplate("sponsor")}
                icon={<Handshake size={17} />}
                label="Sponsor"
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

          {(template === "matchday" || template === "result" || template === "scorers") && (
            <Control label="Spiel auswählen">
              <select
                value={matchId}
                onChange={(event) => setMatchId(event.target.value)}
                className="admin-input"
              >
                {matches.length ? (
                  matches.map((match) => (
                    <option key={match.id} value={match.id}>
                      {match.home_team} – {match.away_team}
                    </option>
                  ))
                ) : (
                  <option value="">Keine Spiele vorhanden</option>
                )}
              </select>
            </Control>
          )}

          {template === "news" && (
            <Control label="News auswählen">
              <select
                value={newsId}
                onChange={(event) => setNewsId(event.target.value)}
                className="admin-input"
              >
                {news.length ? (
                  news.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.title}
                    </option>
                  ))
                ) : (
                  <option value="">Keine News vorhanden</option>
                )}
              </select>
            </Control>
          )}

          {(template === "player" || template === "motm") && (
            <Control label="Spieler auswählen">
              <select
                value={playerId}
                onChange={(event) => setPlayerId(event.target.value)}
                className="admin-input"
              >
                {players.length ? (
                  players.map((player) => (
                    <option key={player.id} value={player.id}>
                      {player.first_name} {player.last_name} – {player.position}
                    </option>
                  ))
                ) : (
                  <option value="">Keine Spieler vorhanden</option>
                )}
              </select>
            </Control>
          )}

          {template === "sponsor" && (
            <Control label="Sponsor auswählen">
              <select
                value={sponsorId}
                onChange={(event) => setSponsorId(event.target.value)}
                className="admin-input"
              >
                {sponsors.length ? (
                  sponsors.map((sponsor) => (
                    <option key={sponsor.id} value={sponsor.id}>
                      {sponsor.name} – {sponsor.category}
                    </option>
                  ))
                ) : (
                  <option value="">Keine Sponsoren vorhanden</option>
                )}
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

          <Control label="Farben">
            <div className="grid grid-cols-2 gap-3">
              <ColorControl
                label="Akzent"
                value={accent}
                onChange={setAccent}
              />
              <ColorControl
                label="Dunkelrot"
                value={secondary}
                onChange={setSecondary}
              />
            </div>
          </Control>

          <Control label="Eigener Hintergrund">
            <input
              ref={backgroundInputRef}
              type="file"
              accept="image/*"
              onChange={(event) => uploadBackground(event.target.files?.[0])}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => backgroundInputRef.current?.click()}
              className="club-button-secondary w-full"
            >
              <ImagePlus size={17} />
              Hintergrund auswählen
            </button>
            {backgroundImage && (
              <button
                type="button"
                onClick={() => {
                  setBackgroundImage(null);
                  if (backgroundInputRef.current) {
                    backgroundInputRef.current.value = "";
                  }
                }}
                className="mt-2 text-xs font-bold text-zinc-500 hover:text-white"
              >
                Hintergrund entfernen
              </button>
            )}
          </Control>

          {backgroundImage && (
            <Control label={`Hintergrundstärke ${Math.round(backgroundOpacity * 100)} %`}>
              <input
                type="range"
                min="0.1"
                max="0.8"
                step="0.05"
                value={backgroundOpacity}
                onChange={(event) => setBackgroundOpacity(Number(event.target.value))}
                className="w-full accent-red-600"
              />
            </Control>
          )}

          <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/30 px-4 py-4">
            <input
              type="checkbox"
              checked={showClubName}
              onChange={(event) => setShowClubName(event.target.checked)}
              className="h-5 w-5 accent-red-600"
            />
            <span className="text-sm font-bold text-zinc-300">
              Vereinsname oben anzeigen
            </span>
          </label>

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={resetDesign}
              className="club-button-secondary"
            >
              <RotateCcw size={17} />
              Zurücksetzen
            </button>
            <button
              type="button"
              onClick={exportPng}
              disabled={busy}
              className="club-button-primary disabled:opacity-50"
            >
              <Download size={18} />
              {busy ? "Export …" : "PNG"}
            </button>
          </div>
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
              player={selectedPlayer}
              sponsor={selectedSponsor}
              standings={standings}
              goals={goals.filter((goal) => goal.match_id === selectedMatch?.id)}
              logoSrc={logoSrc}
              headline={headline}
              accent={accent}
              secondary={secondary}
              backgroundImage={backgroundImage}
              backgroundOpacity={backgroundOpacity}
              showClubName={showClubName}
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
            <button
              type="button"
              onClick={copyCaption}
              className="club-button-secondary"
            >
              <Copy size={17} />
              {copySuccess ? "Kopiert" : "Kopieren"}
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

function Control({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="mb-2 text-xs font-black uppercase tracking-[0.16em] text-zinc-500">
        {label}
      </p>
      {children}
    </div>
  );
}

function ColorControl({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="rounded-2xl border border-white/10 bg-black/30 p-3">
      <span className="text-[9px] font-black uppercase tracking-wider text-zinc-500">
        {label}
      </span>
      <div className="mt-2 flex items-center gap-2">
        <input
          type="color"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="h-10 w-11 cursor-pointer rounded-xl border border-white/10 bg-transparent p-1"
        />
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="min-w-0 flex-1 bg-transparent text-xs font-bold text-white outline-none"
        />
      </div>
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
      className={`flex min-h-14 items-center justify-center gap-2 rounded-2xl border px-3 text-[10px] font-black uppercase tracking-wide transition ${
        active
          ? "border-club-light-red/40 bg-club-red text-white"
          : "border-white/10 bg-white/[0.04] text-zinc-500 hover:text-white"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

type GraphicProps = {
  width: number;
  height: number;
  template: SocialTemplate;
  match: SocialMatch | null;
  news: SocialNews | null;
  player: SocialPlayer | null;
  sponsor: SocialSponsor | null;
  standings: SocialStanding[];
  goals: SocialGoal[];
  logoSrc: string;
  headline: string;
  accent: string;
  secondary: string;
  backgroundImage: string | null;
  backgroundOpacity: number;
  showClubName: boolean;
};

const SocialGraphic = forwardRef<SVGSVGElement, GraphicProps>(
  function SocialGraphic(
    {
      width,
      height,
      template,
      match,
      news,
      player,
      sponsor,
      standings,
      goals,
      logoSrc,
      headline,
      accent,
      secondary,
      backgroundImage,
      backgroundOpacity,
      showClubName,
    },
    ref,
  ) {
    const center = width / 2;
    const scale = width / 1080;
    const verticalScale = height / 1350;
    const contentScale = Math.min(scale, verticalScale);
    const titleSize = Math.max(68, 92 * contentScale);
    const mediumSize = Math.max(38, 52 * contentScale);
    const smallSize = Math.max(24, 31 * contentScale);
    const matchDate = match ? new Date(match.match_date) : null;
    const newsLines = wrapText(news?.title ?? "NEUE VEREINSNEWS", 22);
    const playerName = player
      ? `${player.first_name} ${player.last_name}`
      : "SPIELERNAME";

    return (
      <svg
        ref={ref}
        viewBox={`0 0 ${width} ${height}`}
        width="100%"
        height="auto"
        xmlns="http://www.w3.org/2000/svg"
        style={{ maxWidth: width > height ? 780 : 620 }}
      >
        <defs>
          <linearGradient id="background" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#050505" />
            <stop offset="45%" stopColor={secondary} />
            <stop offset="100%" stopColor="#020202" />
          </linearGradient>
          <radialGradient id="glow" cx="50%" cy="22%" r="72%">
            <stop offset="0%" stopColor={accent} stopOpacity="0.52" />
            <stop offset="55%" stopColor={accent} stopOpacity="0.08" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="overlay" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#000000" stopOpacity="0.14" />
            <stop offset="55%" stopColor="#000000" stopOpacity="0.26" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0.92" />
          </linearGradient>
          <filter id="shadow">
            <feDropShadow dx="0" dy="12" stdDeviation="18" floodColor="#000000" floodOpacity="0.65" />
          </filter>
          <filter id="redGlow">
            <feDropShadow dx="0" dy="0" stdDeviation="14" floodColor={accent} floodOpacity="0.72" />
          </filter>
          <pattern id="grain" width="42" height="42" patternUnits="userSpaceOnUse">
            <circle cx="4" cy="7" r="1.3" fill="#ffffff" opacity="0.05" />
            <circle cx="31" cy="15" r="1" fill="#ffffff" opacity="0.035" />
            <circle cx="18" cy="36" r="1.4" fill="#ffffff" opacity="0.03" />
          </pattern>
          <clipPath id="playerClip">
            <rect x="0" y="0" width={width} height={height} rx="0" />
          </clipPath>
        </defs>

        <rect width={width} height={height} fill="url(#background)" />
        {backgroundImage && (
          <image
            href={backgroundImage}
            x="0"
            y="0"
            width={width}
            height={height}
            preserveAspectRatio="xMidYMid slice"
            opacity={backgroundOpacity}
          />
        )}
        {(template === "news" && news?.image_url) && (
          <image
            href={news.image_url}
            x="0"
            y="0"
            width={width}
            height={height}
            preserveAspectRatio="xMidYMid slice"
            opacity={backgroundImage ? 0.18 : 0.38}
          />
        )}
        <rect width={width} height={height} fill="url(#glow)" />
        <rect width={width} height={height} fill="url(#overlay)" />
        <rect width={width} height={height} fill="url(#grain)" />

        <path
          d={`M0 ${height * 0.83} L${width} ${height * 0.68} L${width} ${height} L0 ${height}Z`}
          fill={accent}
          fillOpacity="0.17"
        />
        <path
          d={`M0 ${height * 0.91} L${width} ${height * 0.76}`}
          stroke={accent}
          strokeWidth={Math.max(8, 12 * scale)}
          opacity="0.82"
        />
        <path
          d={`M${width * 0.73} 0 L${width} ${height * 0.18}`}
          stroke={accent}
          strokeWidth={Math.max(4, 7 * scale)}
          opacity="0.32"
        />

        <image
          href={logoSrc}
          x={center - 92 * scale}
          y={55 * verticalScale}
          width={184 * scale}
          height={184 * scale}
          preserveAspectRatio="xMidYMid meet"
          filter="url(#shadow)"
        />

        {showClubName && (
          <text
            x={center}
            y={280 * verticalScale}
            textAnchor="middle"
            fill={accent}
            fontSize={smallSize}
            fontWeight="900"
            letterSpacing={8 * scale}
          >
            SPVGG MIDDELICH-RESSE
          </text>
        )}

        {template === "matchday" && match && (
          <>
            <MainTitle center={center} y={390 * verticalScale} text="MATCHDAY" size={titleSize} />
            <TeamNames
              match={match}
              center={center}
              scale={scale}
              verticalScale={verticalScale}
              accent={accent}
              mediumSize={mediumSize}
            />
            <text
              x={center}
              y={780 * verticalScale}
              textAnchor="middle"
              fill="#ffffff"
              fontSize={mediumSize}
              fontWeight="900"
            >
              VS
            </text>
            <InfoText
              center={center}
              y={885 * verticalScale}
              text={matchDate ? dateFormatter.format(matchDate).toUpperCase() : "DATUM FOLGT"}
              size={smallSize}
            />
            <text
              x={center}
              y={945 * verticalScale}
              textAnchor="middle"
              fill={accent}
              fontSize={smallSize}
              fontWeight="900"
            >
              {matchDate ? `${timeFormatter.format(matchDate)} UHR` : "UHRZEIT FOLGT"}
            </text>
            <InfoText
              center={center}
              y={1005 * verticalScale}
              text={truncate(match.location ?? "SPIELORT FOLGT", 48).toUpperCase()}
              size={Math.max(22, 28 * contentScale)}
              color="#a1a1aa"
            />
          </>
        )}

        {template === "result" && match && (
          <>
            <MainTitle center={center} y={390 * verticalScale} text="ENDSTAND" size={titleSize} />
            <TeamNames
              match={match}
              center={center}
              scale={scale}
              verticalScale={verticalScale}
              accent={accent}
              mediumSize={mediumSize}
            />
            <text
              x={center}
              y={900 * verticalScale}
              textAnchor="middle"
              fill="#ffffff"
              fontSize={Math.max(130, 176 * contentScale)}
              fontWeight="950"
              filter="url(#redGlow)"
            >
              {match.home_score ?? 0}
              <tspan fill={accent}>:</tspan>
              {match.away_score ?? 0}
            </text>
            <InfoText
              center={center}
              y={1010 * verticalScale}
              text={match.competition.toUpperCase()}
              size={smallSize}
              color="#a1a1aa"
            />
          </>
        )}

        {template === "table" && (
          <>
            <MainTitle center={center} y={380 * verticalScale} text="TABELLE" size={titleSize} />
            <text
              x={center}
              y={445 * verticalScale}
              textAnchor="middle"
              fill={accent}
              fontSize={smallSize}
              fontWeight="900"
              letterSpacing={5 * scale}
            >
              AKTUELLER STAND
            </text>

            {standings.slice(0, 10).map((row, index) => {
              const y = (515 + index * 63) * verticalScale;
              return (
                <g key={row.id}>
                  {row.is_club && (
                    <rect
                      x={75 * scale}
                      y={y - 40 * verticalScale}
                      width={width - 150 * scale}
                      height={54 * verticalScale}
                      rx={18 * contentScale}
                      fill={accent}
                      opacity="0.24"
                    />
                  )}
                  <text
                    x={100 * scale}
                    y={y}
                    fill={row.is_club ? accent : "#a1a1aa"}
                    fontSize={Math.max(22, 27 * contentScale)}
                    fontWeight="950"
                  >
                    {row.position}.
                  </text>
                  {row.logo_url && (
                    <image
                      href={row.logo_url}
                      x={155 * scale}
                      y={y - 37 * verticalScale}
                      width={45 * scale}
                      height={45 * verticalScale}
                      preserveAspectRatio="xMidYMid meet"
                    />
                  )}
                  <text
                    x={(row.logo_url ? 220 : 165) * scale}
                    y={y}
                    fill="#ffffff"
                    fontSize={Math.max(20, 25 * contentScale)}
                    fontWeight={row.is_club ? "950" : "800"}
                  >
                    {truncate(row.team_name, 28).toUpperCase()}
                  </text>
                  <text
                    x={width - 180 * scale}
                    y={y}
                    textAnchor="end"
                    fill="#a1a1aa"
                    fontSize={Math.max(19, 23 * contentScale)}
                    fontWeight="800"
                  >
                    {row.played} SP
                  </text>
                  <text
                    x={width - 90 * scale}
                    y={y}
                    textAnchor="end"
                    fill={row.is_club ? accent : "#ffffff"}
                    fontSize={Math.max(23, 29 * contentScale)}
                    fontWeight="950"
                  >
                    {row.points} P
                  </text>
                </g>
              );
            })}
          </>
        )}

        {template === "scorers" && match && (
          <>
            <MainTitle center={center} y={380 * verticalScale} text="TORSCHÜTZEN" size={titleSize} />
            <TeamNames
              match={match}
              center={center}
              scale={scale}
              verticalScale={verticalScale}
              accent={accent}
              mediumSize={Math.max(30, 40 * contentScale)}
            />
            <text
              x={center}
              y={790 * verticalScale}
              textAnchor="middle"
              fill={accent}
              fontSize={smallSize}
              fontWeight="900"
              letterSpacing={4 * scale}
            >
              UNSERE TORE
            </text>
            {(goals.length ? goals.slice(0, 6) : [{ id: "none", minute: 0, player_name: "NOCH KEINE TORSCHÜTZEN", description: null }]).map(
              (goal, index) => (
                <g key={goal.id}>
                  <circle
                    cx={170 * scale}
                    cy={(865 + index * 82) * verticalScale}
                    r={25 * contentScale}
                    fill={accent}
                  />
                  <text
                    x={170 * scale}
                    y={(874 + index * 82) * verticalScale}
                    textAnchor="middle"
                    fill="#ffffff"
                    fontSize={Math.max(17, 20 * contentScale)}
                    fontWeight="950"
                  >
                    {goal.minute ? `${goal.minute}'` : "⚽"}
                  </text>
                  <text
                    x={225 * scale}
                    y={(874 + index * 82) * verticalScale}
                    fill="#ffffff"
                    fontSize={Math.max(25, 34 * contentScale)}
                    fontWeight="900"
                  >
                    {truncate(goal.player_name ?? goal.description ?? "Middelich-Resse", 32).toUpperCase()}
                  </text>
                </g>
              ),
            )}
          </>
        )}

        {template === "motm" && (
          <>
            <text
              x={center}
              y={390 * verticalScale}
              textAnchor="middle"
              fill={accent}
              fontSize={smallSize}
              fontWeight="900"
              letterSpacing={7 * scale}
            >
              SPIELER DES SPIELS
            </text>
            {player?.image_url ? (
              <image
                href={player.image_url}
                x={width * 0.08}
                y={height * 0.28}
                width={width * 0.84}
                height={height * 0.53}
                preserveAspectRatio="xMidYMin meet"
                clipPath="url(#playerClip)"
                filter="url(#shadow)"
              />
            ) : (
              <g opacity="0.4">
                <circle cx={center} cy={height * 0.5} r={150 * contentScale} fill={accent} />
                <rect x={center - 190 * contentScale} y={height * 0.59} width={380 * contentScale} height={240 * contentScale} rx={100 * contentScale} fill={accent} />
              </g>
            )}
            <text
              x={center}
              y={1030 * verticalScale}
              textAnchor="middle"
              fill="#ffffff"
              fontSize={titleSize}
              fontWeight="950"
              filter="url(#redGlow)"
            >
              {truncate(playerName, 26).toUpperCase()}
            </text>
            <text
              x={center}
              y={1100 * verticalScale}
              textAnchor="middle"
              fill={accent}
              fontSize={smallSize}
              fontWeight="900"
              letterSpacing={5 * scale}
            >
              STARKE LEISTUNG
            </text>
          </>
        )}

        {template === "news" && (
          <>
            <text
              x={center}
              y={385 * verticalScale}
              textAnchor="middle"
              fill={accent}
              fontSize={smallSize}
              fontWeight="900"
              letterSpacing={7 * scale}
            >
              {news?.category.toUpperCase() ?? "VEREINSNEWS"}
            </text>
            {newsLines.map((line, index) => (
              <text
                key={`${line}-${index}`}
                x={center}
                y={(500 + index * 92) * verticalScale}
                textAnchor="middle"
                fill="#ffffff"
                fontSize={titleSize}
                fontWeight="950"
              >
                {line.toUpperCase()}
              </text>
            ))}
            <rect
              x={110 * scale}
              y={875 * verticalScale}
              width={width - 220 * scale}
              height={5 * contentScale}
              rx={3}
              fill={accent}
            />
            <InfoText
              center={center}
              y={975 * verticalScale}
              text={truncate(news?.excerpt ?? "ALLE INFOS JETZT AUF UNSERER VEREINSSEITE", 58).toUpperCase()}
              size={Math.max(23, 30 * contentScale)}
              color="#d4d4d8"
            />
          </>
        )}

        {template === "player" && (
          <>
            {player?.image_url ? (
              <image
                href={player.image_url}
                x={width * 0.08}
                y={height * 0.24}
                width={width * 0.84}
                height={height * 0.58}
                preserveAspectRatio="xMidYMin meet"
                clipPath="url(#playerClip)"
                filter="url(#shadow)"
              />
            ) : (
              <g opacity="0.38">
                <circle cx={center} cy={height * 0.48} r={150 * contentScale} fill={accent} />
                <rect x={center - 190 * contentScale} y={height * 0.57} width={380 * contentScale} height={260 * contentScale} rx={100 * contentScale} fill={accent} />
              </g>
            )}
            {player?.shirt_number !== null && player?.shirt_number !== undefined && (
              <text
                x={90 * scale}
                y={430 * verticalScale}
                fill="#ffffff"
                fontSize={Math.max(90, 130 * contentScale)}
                fontWeight="950"
                opacity="0.92"
              >
                #{player.shirt_number}
              </text>
            )}
            <text
              x={center}
              y={1000 * verticalScale}
              textAnchor="middle"
              fill="#ffffff"
              fontSize={titleSize}
              fontWeight="950"
            >
              {truncate(playerName, 26).toUpperCase()}
            </text>
            <text
              x={center}
              y={1075 * verticalScale}
              textAnchor="middle"
              fill={accent}
              fontSize={smallSize}
              fontWeight="900"
              letterSpacing={5 * scale}
            >
              {(player?.position ?? "MANNSCHAFT").toUpperCase()}
            </text>
            <InfoText
              center={center}
              y={1130 * verticalScale}
              text={(player?.squad ?? "SPVGG MIDDELICH-RESSE").toUpperCase()}
              size={Math.max(20, 25 * contentScale)}
              color="#a1a1aa"
            />
          </>
        )}

        {template === "sponsor" && (
          <>
            <MainTitle center={center} y={410 * verticalScale} text="DANKE" size={titleSize} />
            <text
              x={center}
              y={480 * verticalScale}
              textAnchor="middle"
              fill={accent}
              fontSize={smallSize}
              fontWeight="900"
              letterSpacing={7 * scale}
            >
              FÜR EURE UNTERSTÜTZUNG
            </text>
            <rect
              x={140 * scale}
              y={560 * verticalScale}
              width={width - 280 * scale}
              height={330 * verticalScale}
              rx={36 * contentScale}
              fill="#ffffff"
              opacity="0.96"
            />
            {sponsor?.logo_url ? (
              <image
                href={sponsor.logo_url}
                x={190 * scale}
                y={610 * verticalScale}
                width={width - 380 * scale}
                height={230 * verticalScale}
                preserveAspectRatio="xMidYMid meet"
              />
            ) : (
              <text
                x={center}
                y={750 * verticalScale}
                textAnchor="middle"
                fill="#171717"
                fontSize={mediumSize}
                fontWeight="950"
              >
                {truncate(sponsor?.name ?? "UNSER PARTNER", 26).toUpperCase()}
              </text>
            )}
            <text
              x={center}
              y={980 * verticalScale}
              textAnchor="middle"
              fill="#ffffff"
              fontSize={mediumSize}
              fontWeight="950"
            >
              {truncate(sponsor?.name ?? "UNSER PARTNER", 30).toUpperCase()}
            </text>
            <InfoText
              center={center}
              y={1050 * verticalScale}
              text={(sponsor?.category ?? "PARTNER").toUpperCase()}
              size={smallSize}
              color={accent}
            />
          </>
        )}

        <text
          x={center}
          y={height - 102 * verticalScale}
          textAnchor="middle"
          fill="#ffffff"
          fontSize={Math.max(20, 27 * contentScale)}
          fontWeight="900"
          letterSpacing={4 * scale}
        >
          {truncate(headline, 55).toUpperCase()}
        </text>
        <text
          x={center}
          y={height - 52 * verticalScale}
          textAnchor="middle"
          fill={accent}
          fontSize={Math.max(17, 21 * contentScale)}
          fontWeight="900"
          letterSpacing={5 * scale}
        >
          #HUJA · #DIE MIDDELICHER SIND DA
        </text>
      </svg>
    );
  },
);

function MainTitle({
  center,
  y,
  text,
  size,
}: {
  center: number;
  y: number;
  text: string;
  size: number;
}) {
  return (
    <text
      x={center}
      y={y}
      textAnchor="middle"
      fill="#ffffff"
      fontSize={size}
      fontWeight="950"
      letterSpacing="4"
    >
      {text}
    </text>
  );
}

function InfoText({
  center,
  y,
  text,
  size,
  color = "#ffffff",
}: {
  center: number;
  y: number;
  text: string;
  size: number;
  color?: string;
}) {
  return (
    <text
      x={center}
      y={y}
      textAnchor="middle"
      fill={color}
      fontSize={size}
      fontWeight="800"
    >
      {text}
    </text>
  );
}

function TeamNames({
  match,
  center,
  scale,
  verticalScale,
  accent,
  mediumSize,
}: {
  match: SocialMatch;
  center: number;
  scale: number;
  verticalScale: number;
  accent: string;
  mediumSize: number;
}) {
  return (
    <>
      {match.home_logo_url && (
        <image
          href={match.home_logo_url}
          x={center - 250 * scale}
          y={500 * verticalScale}
          width={110 * scale}
          height={110 * verticalScale}
          preserveAspectRatio="xMidYMid meet"
          filter="url(#shadow)"
        />
      )}
      <text
        x={center + (match.home_logo_url ? 45 * scale : 0)}
        y={575 * verticalScale}
        textAnchor="middle"
        fill="#ffffff"
        fontSize={mediumSize}
        fontWeight="950"
      >
        {truncate(match.home_team, 30).toUpperCase()}
      </text>
      <rect
        x={center - 165 * scale}
        y={620 * verticalScale}
        width={330 * scale}
        height={5 * verticalScale}
        rx={3}
        fill={accent}
      />
      {match.away_logo_url && (
        <image
          href={match.away_logo_url}
          x={center - 250 * scale}
          y={635 * verticalScale}
          width={110 * scale}
          height={110 * verticalScale}
          preserveAspectRatio="xMidYMid meet"
          filter="url(#shadow)"
        />
      )}
      <text
        x={center + (match.away_logo_url ? 45 * scale : 0)}
        y={710 * verticalScale}
        textAnchor="middle"
        fill="#ffffff"
        fontSize={mediumSize}
        fontWeight="950"
      >
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
