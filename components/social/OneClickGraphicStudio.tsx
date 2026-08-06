"use client";

import { useMemo, useState } from "react";
import {
  CheckCircle2,
  Copy,
  Download,
  ImageIcon,
  LoaderCircle,
  PackageCheck,
  Sparkles,
} from "lucide-react";

import type {
  SocialGoal,
  SocialMatch,
  SocialPlayer,
  SocialStanding,
} from "../../lib/social/types";

type Props = {
  matches: SocialMatch[];
  players: SocialPlayer[];
  standings: SocialStanding[];
  goals: SocialGoal[];
  clubLogoSrc: string;
  initialMatchId?: string;
};

type PackageItem = {
  id:
    | "matchday-feed"
    | "matchday-story"
    | "result-feed"
    | "result-story"
    | "scorers-square"
    | "motm-square"
    | "table-feed";
  label: string;
  width: number;
  height: number;
  kind: "matchday" | "result" | "scorers" | "motm" | "table";
};

const PACKAGE_ITEMS: PackageItem[] = [
  {
    id: "matchday-feed",
    label: "Matchday Feed",
    width: 1080,
    height: 1350,
    kind: "matchday",
  },
  {
    id: "matchday-story",
    label: "Matchday Story",
    width: 1080,
    height: 1920,
    kind: "matchday",
  },
  {
    id: "result-feed",
    label: "Ergebnis Feed",
    width: 1080,
    height: 1350,
    kind: "result",
  },
  {
    id: "result-story",
    label: "Ergebnis Story",
    width: 1080,
    height: 1920,
    kind: "result",
  },
  {
    id: "scorers-square",
    label: "Torschützen",
    width: 1080,
    height: 1080,
    kind: "scorers",
  },
  {
    id: "motm-square",
    label: "Spieler des Spiels",
    width: 1080,
    height: 1080,
    kind: "motm",
  },
  {
    id: "table-feed",
    label: "Tabelle Feed",
    width: 1080,
    height: 1350,
    kind: "table",
  },
];

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

export default function OneClickGraphicStudio({
  matches,
  players,
  standings,
  goals,
  clubLogoSrc,
  initialMatchId,
}: Props) {
  const [matchId, setMatchId] = useState(
    initialMatchId && matches.some((match) => match.id === initialMatchId)
      ? initialMatchId
      : matches[0]?.id ?? "",
  );
  const [playerId, setPlayerId] = useState(players[0]?.id ?? "");
  const [accent, setAccent] = useState("#c1121f");
  const [secondary, setSecondary] = useState("#51000e");
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [completed, setCompleted] = useState<string[]>([]);
  const [copySuccess, setCopySuccess] = useState(false);

  const selectedMatch = useMemo(
    () => matches.find((match) => match.id === matchId) ?? matches[0] ?? null,
    [matches, matchId],
  );

  const selectedPlayer = useMemo(
    () => players.find((player) => player.id === playerId) ?? players[0] ?? null,
    [players, playerId],
  );

  const selectedGoals = useMemo(
    () => goals.filter((goal) => goal.match_id === selectedMatch?.id),
    [goals, selectedMatch],
  );

  const textPackage = useMemo(() => {
    if (!selectedMatch) return "";

    const score = `${selectedMatch.home_score ?? 0}:${selectedMatch.away_score ?? 0}`;
    const date = new Date(selectedMatch.match_date);
    const scorerText = selectedGoals.length
      ? selectedGoals
          .map(
            (goal) =>
              `${goal.minute}' ${
                goal.player_name ?? goal.description ?? "Middelich-Resse"
              }`,
          )
          .join(", ")
      : "Torschützen folgen";

    const motm = selectedPlayer
      ? `${selectedPlayer.first_name} ${selectedPlayer.last_name}`
      : "Spieler des Spiels";

    return `MATCHDAY ⚽

${selectedMatch.home_team} gegen ${selectedMatch.away_team}
📅 ${dateFormatter.format(date)}
⏰ ${timeFormatter.format(date)} Uhr
📍 ${selectedMatch.location ?? "Spielort folgt"}

Kommt vorbei und unterstützt unsere Jungs!

#HUJA #MiddelichResse #Matchday

--------------------

ABPFIFF 🔴⚫

${selectedMatch.home_team} ${score} ${selectedMatch.away_team}

Unsere Jungs haben bis zum Schluss alles gegeben. Gemeinsam weiter!

Torschützen: ${scorerText}

⭐ Spieler des Spiels: ${motm}

#HUJA #MiddelichResse #Endstand`;
  }, [selectedGoals, selectedMatch, selectedPlayer]);

  async function chooseBackground(file: File) {
    const reader = new FileReader();
    const result = await new Promise<string>((resolve, reject) => {
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(new Error("Bild konnte nicht gelesen werden."));
      reader.readAsDataURL(file);
    });
    setBackgroundImage(result);
  }

  async function createPackage() {
    if (!selectedMatch || busy) return;

    setBusy(true);
    setCompleted([]);

    try {
      for (const item of PACKAGE_ITEMS) {
        const blob = await renderGraphic({
          item,
          match: selectedMatch,
          player: selectedPlayer,
          standings,
          goals: selectedGoals,
          clubLogoSrc,
          accent,
          secondary,
          backgroundImage,
        });

        downloadBlob(
          blob,
          `huja-${item.id}-${safeFileName(
            selectedMatch.home_team,
          )}-${safeFileName(selectedMatch.away_team)}.png`,
        );

        setCompleted((current) => [...current, item.id]);
        await delay(250);
      }
    } finally {
      setBusy(false);
    }
  }

  async function copyTexts() {
    await navigator.clipboard.writeText(textPackage);
    setCopySuccess(true);
    window.setTimeout(() => setCopySuccess(false), 1800);
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
      <section className="club-card p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <div className="club-icon-box">
            <Sparkles size={19} />
          </div>
          <div>
            <p className="club-eyebrow">Ein-Klick-Automatik</p>
            <h2 className="mt-1 text-xl font-black uppercase text-white">
              Komplettes Spieltagspaket
            </h2>
            <p className="mt-2 text-sm leading-6 text-zinc-500">
              Erstellt nacheinander sieben fertige PNG-Grafiken mit Logos,
              Ergebnis, Torschützen, Spieler des Spiels und Tabelle.
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <Field label="Spiel auswählen">
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
          </Field>

          <Field label="Spieler des Spiels">
            <select
              value={playerId}
              onChange={(event) => setPlayerId(event.target.value)}
              className="admin-input"
            >
              {players.map((player) => (
                <option key={player.id} value={player.id}>
                  {player.first_name} {player.last_name}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Hauptfarbe">
            <input
              type="color"
              value={accent}
              onChange={(event) => setAccent(event.target.value)}
              className="admin-input h-12 p-2"
            />
          </Field>

          <Field label="Zweitfarbe">
            <input
              type="color"
              value={secondary}
              onChange={(event) => setSecondary(event.target.value)}
              className="admin-input h-12 p-2"
            />
          </Field>

          <Field label="Optionales Hintergrundbild" className="sm:col-span-2">
            <input
              type="file"
              accept="image/*"
              className="admin-file-input"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) void chooseBackground(file);
              }}
            />
          </Field>
        </div>

        {selectedMatch ? (
          <div className="mt-6 rounded-3xl border border-white/10 bg-black/30 p-5">
            <p className="text-[10px] font-black uppercase tracking-wider text-club-light-red">
              Ausgewähltes Spiel
            </p>
            <h3 className="mt-2 text-lg font-black text-white">
              {selectedMatch.home_team}
              <span className="mx-2 text-club-light-red">vs.</span>
              {selectedMatch.away_team}
            </h3>
            <p className="mt-2 text-sm text-zinc-500">
              {dateFormatter.format(new Date(selectedMatch.match_date))}
            </p>
          </div>
        ) : (
          <div className="mt-6 rounded-3xl border border-dashed border-white/10 p-6 text-center text-sm text-zinc-500">
            Noch kein Spiel vorhanden.
          </div>
        )}

        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {PACKAGE_ITEMS.map((item) => {
            const done = completed.includes(item.id);
            return (
              <div
                key={item.id}
                className={`rounded-2xl border p-4 ${
                  done
                    ? "border-emerald-500/25 bg-emerald-950/20"
                    : "border-white/10 bg-white/[0.025]"
                }`}
              >
                <div className="flex items-center justify-between">
                  <ImageIcon
                    size={18}
                    className={done ? "text-emerald-300" : "text-club-light-red"}
                  />
                  {done && <CheckCircle2 size={16} className="text-emerald-300" />}
                </div>
                <p className="mt-3 text-sm font-black text-white">{item.label}</p>
                <p className="mt-1 text-xs text-zinc-600">
                  {item.width} × {item.height}
                </p>
              </div>
            );
          })}
        </div>

        <button
          type="button"
          disabled={!selectedMatch || busy}
          onClick={() => void createPackage()}
          className="club-button-primary mt-6 w-full disabled:cursor-not-allowed disabled:opacity-50"
        >
          {busy ? (
            <LoaderCircle size={18} className="animate-spin" />
          ) : (
            <PackageCheck size={18} />
          )}
          {busy
            ? `Grafiken werden erstellt (${completed.length}/${PACKAGE_ITEMS.length})`
            : "Alle Grafiken automatisch erstellen"}
        </button>

        <p className="mt-3 text-center text-xs leading-5 text-zinc-600">
          Dein Browser lädt die PNG-Dateien nacheinander herunter. Bei einer
          Nachfrage bitte mehrere Downloads erlauben.
        </p>
      </section>

      <aside className="space-y-5">
        <section className="club-card p-5">
          <div className="flex items-center gap-3">
            <div className="club-icon-box">
              <Copy size={18} />
            </div>
            <div>
              <p className="club-eyebrow">Textpaket</p>
              <h2 className="mt-1 font-black uppercase text-white">
                Social-Media-Texte
              </h2>
            </div>
          </div>

          <textarea
            readOnly
            value={textPackage}
            rows={18}
            className="admin-input mt-5 min-h-96 resize-none py-3 text-xs leading-5"
          />

          <button
            type="button"
            disabled={!textPackage}
            onClick={() => void copyTexts()}
            className="club-button-secondary mt-4 w-full"
          >
            {copySuccess ? <CheckCircle2 size={16} /> : <Copy size={16} />}
            {copySuccess ? "Kopiert" : "Alle Texte kopieren"}
          </button>
        </section>

        <section className="rounded-3xl border border-emerald-500/15 bg-emerald-950/20 p-5">
          <p className="text-xs font-black uppercase tracking-wider text-emerald-300">
            Kostenloser Automatikmodus
          </p>
          <p className="mt-2 text-xs leading-5 text-emerald-100/65">
            Das Grafikpaket wird lokal im Browser gerendert. Es entstehen keine
            zusätzlichen KI- oder API-Kosten.
          </p>
        </section>
      </aside>
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
    <label className={className}>
      <span className="mb-2 block text-[10px] font-black uppercase tracking-wider text-zinc-500">
        {label}
      </span>
      {children}
    </label>
  );
}

async function renderGraphic(input: {
  item: PackageItem;
  match: SocialMatch;
  player: SocialPlayer | null;
  standings: SocialStanding[];
  goals: SocialGoal[];
  clubLogoSrc: string;
  accent: string;
  secondary: string;
  backgroundImage: string | null;
}) {
  const { item } = input;
  const canvas = document.createElement("canvas");
  canvas.width = item.width;
  canvas.height = item.height;

  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas wird nicht unterstützt.");

  await drawBackground(context, item.width, item.height, input);
  drawBranding(context, item.width, item.height, input);

  if (item.kind === "matchday") {
    await drawMatchday(context, item.width, item.height, input);
  } else if (item.kind === "result") {
    await drawResult(context, item.width, item.height, input);
  } else if (item.kind === "scorers") {
    await drawScorers(context, item.width, item.height, input);
  } else if (item.kind === "motm") {
    await drawMotm(context, item.width, item.height, input);
  } else {
    await drawTable(context, item.width, item.height, input);
  }

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) =>
        blob ? resolve(blob) : reject(new Error("PNG konnte nicht erstellt werden.")),
      "image/png",
      1,
    );
  });
}

async function drawBackground(
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
  input: {
    accent: string;
    secondary: string;
    backgroundImage: string | null;
  },
) {
  const gradient = context.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, "#090909");
  gradient.addColorStop(0.45, input.secondary);
  gradient.addColorStop(1, "#020202");
  context.fillStyle = gradient;
  context.fillRect(0, 0, width, height);

  if (input.backgroundImage) {
    const image = await loadImage(input.backgroundImage);
    context.save();
    context.globalAlpha = 0.28;
    coverImage(context, image, width, height);
    context.restore();
  }

  const glow = context.createRadialGradient(
    width * 0.82,
    height * 0.18,
    0,
    width * 0.82,
    height * 0.18,
    width * 0.75,
  );
  glow.addColorStop(0, hexToRgba(input.accent, 0.42));
  glow.addColorStop(1, "rgba(0,0,0,0)");
  context.fillStyle = glow;
  context.fillRect(0, 0, width, height);

  context.fillStyle = "rgba(255,255,255,0.025)";
  for (let y = 0; y < height; y += 38) {
    context.fillRect(0, y, width, 1);
  }
}

function drawBranding(
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
  input: { accent: string },
) {
  context.fillStyle = input.accent;
  context.fillRect(0, 0, width, 18);
  context.fillRect(0, height - 18, width, 18);

  context.textAlign = "left";
  context.fillStyle = "#ffffff";
  context.font = "900 28px Arial";
  context.fillText("SPVGG MIDDELICH-RESSE", 70, 75);

  context.textAlign = "right";
  context.fillStyle = input.accent;
  context.font = "900 23px Arial";
  context.fillText("HUJA", width - 70, 75);
}

async function drawMatchday(
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
  input: {
    match: SocialMatch;
    clubLogoSrc: string;
    accent: string;
  },
) {
  const match = input.match;
  const date = new Date(match.match_date);

  title(context, width, height * 0.19, "MATCHDAY", input.accent);

  await drawTeams(context, width, height, input, height * 0.42);

  context.textAlign = "center";
  context.fillStyle = "#ffffff";
  context.font = `900 ${Math.round(width * 0.05)}px Arial`;
  context.fillText(
    `${dateFormatter.format(date).toUpperCase()}`,
    width / 2,
    height * 0.70,
  );

  context.fillStyle = input.accent;
  context.font = `900 ${Math.round(width * 0.043)}px Arial`;
  context.fillText(
    `${timeFormatter.format(date)} UHR`,
    width / 2,
    height * 0.76,
  );

  context.fillStyle = "#b5b5b5";
  context.font = `700 ${Math.round(width * 0.025)}px Arial`;
  wrapText(
    context,
    (match.location ?? "SPIELORT FOLGT").toUpperCase(),
    width / 2,
    height * 0.82,
    width * 0.78,
    width * 0.035,
  );

  slogan(context, width, height, "DIE MIDDELICHER SIND DA");
}

async function drawResult(
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
  input: {
    match: SocialMatch;
    clubLogoSrc: string;
    accent: string;
  },
) {
  title(context, width, height * 0.18, "ABPFIFF", input.accent);
  await drawTeams(context, width, height, input, height * 0.39);

  context.textAlign = "center";
  context.fillStyle = "#ffffff";
  context.font = `950 ${Math.round(width * 0.14)}px Arial`;
  context.fillText(
    `${input.match.home_score ?? 0}:${input.match.away_score ?? 0}`,
    width / 2,
    height * 0.69,
  );

  context.fillStyle = input.accent;
  context.font = `900 ${Math.round(width * 0.034)}px Arial`;
  context.fillText("ENDSTAND", width / 2, height * 0.76);

  slogan(context, width, height, "GEMEINSAM BIS ZUM SCHLUSS");
}

async function drawScorers(
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
  input: {
    match: SocialMatch;
    goals: SocialGoal[];
    clubLogoSrc: string;
    accent: string;
  },
) {
  title(context, width, height * 0.17, "TORSCHÜTZEN", input.accent);
  await drawTeams(context, width, height, input, height * 0.34, 0.7);

  const rows = input.goals.length
    ? input.goals.slice(0, 6)
    : [
        {
          id: "none",
          minute: 0,
          player_name: "NOCH KEINE TORSCHÜTZEN",
          description: null,
        },
      ];

  rows.forEach((goal, index) => {
    const y = height * 0.60 + index * height * 0.065;
    context.fillStyle = input.accent;
    context.beginPath();
    context.arc(width * 0.19, y - 8, width * 0.027, 0, Math.PI * 2);
    context.fill();

    context.fillStyle = "#ffffff";
    context.textAlign = "center";
    context.font = `900 ${Math.round(width * 0.021)}px Arial`;
    context.fillText(goal.minute ? `${goal.minute}'` : "⚽", width * 0.19, y);

    context.textAlign = "left";
    context.font = `900 ${Math.round(width * 0.032)}px Arial`;
    context.fillText(
      (
        goal.player_name ??
        goal.description ??
        "MIDDELICH-RESSE"
      ).toUpperCase(),
      width * 0.25,
      y,
    );
  });

  slogan(context, width, height, "UNSERE TORE. UNSER TEAM.");
}

async function drawMotm(
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
  input: {
    player: SocialPlayer | null;
    clubLogoSrc: string;
    accent: string;
  },
) {
  title(context, width, height * 0.16, "SPIELER DES SPIELS", input.accent);

  if (input.player?.image_url) {
    const image = await loadImage(input.player.image_url);
    context.save();
    context.globalAlpha = 0.96;
    containImage(
      context,
      image,
      width * 0.15,
      height * 0.23,
      width * 0.70,
      height * 0.53,
    );
    context.restore();
  } else {
    context.fillStyle = hexToRgba(input.accent, 0.3);
    context.beginPath();
    context.arc(width / 2, height * 0.46, width * 0.16, 0, Math.PI * 2);
    context.fill();
    context.fillRect(width * 0.30, height * 0.60, width * 0.40, height * 0.18);
  }

  const name = input.player
    ? `${input.player.first_name} ${input.player.last_name}`
    : "UNSER SPIELER";

  context.textAlign = "center";
  context.fillStyle = "#ffffff";
  context.font = `950 ${Math.round(width * 0.065)}px Arial`;
  wrapText(context, name.toUpperCase(), width / 2, height * 0.82, width * 0.84, width * 0.07);

  context.fillStyle = input.accent;
  context.font = `900 ${Math.round(width * 0.028)}px Arial`;
  context.fillText("STARKE LEISTUNG", width / 2, height * 0.92);
}

async function drawTable(
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
  input: {
    standings: SocialStanding[];
    accent: string;
  },
) {
  title(context, width, height * 0.15, "TABELLE", input.accent);

  const rows = input.standings.slice(0, 10);
  const startY = height * 0.25;
  const rowHeight = height * 0.058;

  for (const [index, row] of rows.entries()) {
    const y = startY + index * rowHeight;

    if (row.is_club) {
      context.fillStyle = hexToRgba(input.accent, 0.25);
      roundRect(context, width * 0.07, y - rowHeight * 0.65, width * 0.86, rowHeight * 0.85, 18);
      context.fill();
    }

    context.textAlign = "left";
    context.fillStyle = row.is_club ? input.accent : "#a1a1aa";
    context.font = `900 ${Math.round(width * 0.025)}px Arial`;
    context.fillText(`${row.position}.`, width * 0.10, y);

    if (row.logo_url) {
      try {
        const image = await loadImage(row.logo_url);
        containImage(
          context,
          image,
          width * 0.16,
          y - rowHeight * 0.55,
          rowHeight * 0.65,
          rowHeight * 0.65,
        );
      } catch {
        // Das Tabellenlayout bleibt auch bei einem fehlerhaften Logo nutzbar.
      }
    }

    context.fillStyle = "#ffffff";
    context.font = `${row.is_club ? "950" : "800"} ${Math.round(width * 0.025)}px Arial`;
    context.fillText(
      truncate(row.team_name.toUpperCase(), 25),
      width * 0.24,
      y,
    );

    context.textAlign = "right";
    context.fillStyle = "#a1a1aa";
    context.font = `800 ${Math.round(width * 0.021)}px Arial`;
    context.fillText(`${row.played} SP`, width * 0.80, y);

    context.fillStyle = row.is_club ? input.accent : "#ffffff";
    context.font = `950 ${Math.round(width * 0.028)}px Arial`;
    context.fillText(`${row.points} P`, width * 0.91, y);
  }

  slogan(context, width, height, "UNSERE LIGA. UNSER WEG.");
}

async function drawTeams(
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
  input: {
    match: SocialMatch;
    clubLogoSrc: string;
    accent: string;
  },
  centerY: number,
  scale = 1,
) {
  const logoSize = width * 0.18 * scale;
  const homeLogo = input.match.home_logo_url || input.clubLogoSrc;
  const awayLogo = input.match.away_logo_url;

  if (homeLogo) {
    try {
      const image = await loadImage(homeLogo);
      containImage(
        context,
        image,
        width * 0.14,
        centerY - logoSize / 2,
        logoSize,
        logoSize,
      );
    } catch {}
  }

  if (awayLogo) {
    try {
      const image = await loadImage(awayLogo);
      containImage(
        context,
        image,
        width * 0.68,
        centerY - logoSize / 2,
        logoSize,
        logoSize,
      );
    } catch {}
  } else {
    context.fillStyle = "rgba(255,255,255,0.08)";
    context.beginPath();
    context.arc(width * 0.77, centerY, logoSize / 2, 0, Math.PI * 2);
    context.fill();
  }

  context.textAlign = "center";
  context.fillStyle = "#ffffff";
  context.font = `900 ${Math.round(width * 0.028 * scale)}px Arial`;
  wrapText(
    context,
    input.match.home_team.toUpperCase(),
    width * 0.23,
    centerY + logoSize * 0.77,
    width * 0.36,
    width * 0.033,
  );
  wrapText(
    context,
    input.match.away_team.toUpperCase(),
    width * 0.77,
    centerY + logoSize * 0.77,
    width * 0.36,
    width * 0.033,
  );

  context.fillStyle = input.accent;
  context.font = `950 ${Math.round(width * 0.055 * scale)}px Arial`;
  context.fillText("VS", width / 2, centerY + width * 0.018);
}

function title(
  context: CanvasRenderingContext2D,
  width: number,
  y: number,
  text: string,
  accent: string,
) {
  context.textAlign = "center";
  context.shadowColor = accent;
  context.shadowBlur = 30;
  context.fillStyle = "#ffffff";
  context.font = `950 ${Math.round(width * 0.085)}px Arial`;
  context.fillText(text, width / 2, y);
  context.shadowBlur = 0;

  context.fillStyle = accent;
  context.fillRect(width * 0.36, y + 28, width * 0.28, 8);
}

function slogan(
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
  text: string,
) {
  context.textAlign = "center";
  context.fillStyle = "#ffffff";
  context.font = `900 ${Math.round(width * 0.023)}px Arial`;
  context.fillText(text, width / 2, height - 65);
}

function wrapText(
  context: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
) {
  const words = text.split(" ");
  const lines: string[] = [];
  let line = "";

  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (context.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);

  lines.slice(0, 3).forEach((entry, index) => {
    context.fillText(entry, x, y + index * lineHeight);
  });
}

function truncate(value: string, max: number) {
  return value.length > max ? `${value.slice(0, max - 1)}…` : value;
}

function roundRect(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) {
  const r = Math.min(radius, width / 2, height / 2);
  context.beginPath();
  context.moveTo(x + r, y);
  context.arcTo(x + width, y, x + width, y + height, r);
  context.arcTo(x + width, y + height, x, y + height, r);
  context.arcTo(x, y + height, x, y, r);
  context.arcTo(x, y, x + width, y, r);
  context.closePath();
}

function coverImage(
  context: CanvasRenderingContext2D,
  image: HTMLImageElement,
  width: number,
  height: number,
) {
  const scale = Math.max(width / image.width, height / image.height);
  const drawWidth = image.width * scale;
  const drawHeight = image.height * scale;
  context.drawImage(
    image,
    (width - drawWidth) / 2,
    (height - drawHeight) / 2,
    drawWidth,
    drawHeight,
  );
}

function containImage(
  context: CanvasRenderingContext2D,
  image: HTMLImageElement,
  x: number,
  y: number,
  width: number,
  height: number,
) {
  const scale = Math.min(width / image.width, height / image.height);
  const drawWidth = image.width * scale;
  const drawHeight = image.height * scale;
  context.drawImage(
    image,
    x + (width - drawWidth) / 2,
    y + (height - drawHeight) / 2,
    drawWidth,
    drawHeight,
  );
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(`Bild konnte nicht geladen werden: ${src}`));
    image.src = src;
  });
}

function hexToRgba(hex: string, alpha: number) {
  const normalized = hex.replace("#", "");
  const value =
    normalized.length === 3
      ? normalized
          .split("")
          .map((character) => `${character}${character}`)
          .join("")
      : normalized;
  const number = Number.parseInt(value, 16);
  const red = (number >> 16) & 255;
  const green = (number >> 8) & 255;
  const blue = number & 255;
  return `rgba(${red},${green},${blue},${alpha})`;
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function safeFileName(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function delay(milliseconds: number) {
  return new Promise((resolve) => window.setTimeout(resolve, milliseconds));
}
