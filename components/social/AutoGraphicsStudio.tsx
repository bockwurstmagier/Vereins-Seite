"use client";

import { useMemo, useState } from "react";
import {
  CheckCircle2,
  Download,
  ImageIcon,
  LoaderCircle,
  PackageCheck,
  Sparkles,
  WandSparkles,
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

type GraphicKind =
  | "result"
  | "motm"
  | "scorers"
  | "table"
  | "next"
  | "story"
  | "reel";

type GraphicItem = {
  id: GraphicKind;
  label: string;
  width: number;
  height: number;
};

const ITEMS: GraphicItem[] = [
  { id: "result", label: "Ergebnisgrafik", width: 1080, height: 1350 },
  { id: "motm", label: "Spieler des Spiels", width: 1080, height: 1350 },
  { id: "scorers", label: "Torschützengrafik", width: 1080, height: 1080 },
  { id: "table", label: "Tabellengrafik", width: 1080, height: 1350 },
  { id: "next", label: "Nächstes Spiel", width: 1080, height: 1350 },
  { id: "story", label: "Story-Slide", width: 1080, height: 1920 },
  { id: "reel", label: "Reel-Cover", width: 1080, height: 1920 },
];

export default function AutoGraphicsStudio({
  matches,
  players,
  standings,
  goals,
  clubLogoSrc,
  initialMatchId,
}: Props) {
  const initial =
    initialMatchId && matches.some((match) => match.id === initialMatchId)
      ? initialMatchId
      : matches.find((match) => match.status === "finished")?.id ??
        matches[0]?.id ??
        "";

  const [matchId, setMatchId] = useState(initial);
  const [playerId, setPlayerId] = useState(players[0]?.id ?? "");
  const [accent, setAccent] = useState("#c1121f");
  const [secondary, setSecondary] = useState("#51000e");
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [completed, setCompleted] = useState<GraphicKind[]>([]);

  const selectedMatch = useMemo(
    () => matches.find((match) => match.id === matchId) ?? null,
    [matches, matchId],
  );

  const nextMatch = useMemo(() => {
    if (!selectedMatch) return null;
    return (
      matches
        .filter(
          (match) =>
            new Date(match.match_date).getTime() >
            new Date(selectedMatch.match_date).getTime(),
        )
        .sort(
          (a, b) =>
            new Date(a.match_date).getTime() -
            new Date(b.match_date).getTime(),
        )[0] ?? null
    );
  }, [matches, selectedMatch]);

  const selectedPlayer = useMemo(
    () => players.find((player) => player.id === playerId) ?? null,
    [players, playerId],
  );

  const selectedGoals = useMemo(
    () => goals.filter((goal) => goal.match_id === selectedMatch?.id),
    [goals, selectedMatch],
  );

  async function chooseBackground(file: File) {
    const reader = new FileReader();
    const result = await new Promise<string>((resolve, reject) => {
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(new Error("Bild konnte nicht gelesen werden."));
      reader.readAsDataURL(file);
    });
    setBackgroundImage(result);
  }

  async function generateAll() {
    if (!selectedMatch || busy) return;

    setBusy(true);
    setCompleted([]);

    try {
      for (const item of ITEMS) {
        const blob = await renderGraphic({
          item,
          match: selectedMatch,
          nextMatch,
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
          `huja-${item.id}-${safeName(selectedMatch.home_team)}-${safeName(
            selectedMatch.away_team,
          )}.png`,
        );

        setCompleted((current) => [...current, item.id]);
        await wait(220);
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_23rem]">
      <section className="club-card p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <div className="club-icon-box">
            <WandSparkles size={19} />
          </div>
          <div>
            <p className="club-eyebrow">Ein-Klick-Automatik</p>
            <h2 className="mt-1 text-xl font-black uppercase text-white">
              Komplettes Grafikpaket
            </h2>
            <p className="mt-2 text-sm leading-6 text-zinc-500">
              Das ausgewählte Spiel wird automatisch in sieben HUJA-Motive
              umgesetzt.
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <Field label="Abgeschlossenes Spiel">
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

        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {ITEMS.map((item) => {
            const done = completed.includes(item.id);
            return (
              <article
                key={item.id}
                className={`rounded-2xl border p-4 ${
                  done
                    ? "border-emerald-500/20 bg-emerald-950/20"
                    : "border-white/10 bg-black/20"
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
              </article>
            );
          })}
        </div>

        <button
          type="button"
          disabled={!selectedMatch || busy}
          onClick={() => void generateAll()}
          className="club-button-primary mt-6 w-full disabled:opacity-50"
        >
          {busy ? (
            <LoaderCircle size={18} className="animate-spin" />
          ) : (
            <PackageCheck size={18} />
          )}
          {busy
            ? `Grafiken werden erstellt (${completed.length}/${ITEMS.length})`
            : "Alle Grafiken automatisch erstellen"}
        </button>

        <p className="mt-3 text-center text-xs leading-5 text-zinc-600">
          Beim ersten Export muss dein Browser möglicherweise mehrere
          Downloads erlauben.
        </p>
      </section>

      <aside className="space-y-5">
        <section className="club-card p-5">
          <div className="flex items-center gap-3">
            <div className="club-icon-box">
              <Sparkles size={18} />
            </div>
            <div>
              <p className="club-eyebrow">Automatisch erkannt</p>
              <h2 className="mt-1 font-black uppercase text-white">
                Spieldaten
              </h2>
            </div>
          </div>

          {selectedMatch ? (
            <div className="mt-5 space-y-3 text-sm">
              <Data label="Spiel" value={`${selectedMatch.home_team} – ${selectedMatch.away_team}`} />
              <Data label="Ergebnis" value={`${selectedMatch.home_score ?? 0}:${selectedMatch.away_score ?? 0}`} />
              <Data label="Tore" value={String(selectedGoals.length)} />
              <Data
                label="Spieler des Spiels"
                value={
                  selectedPlayer
                    ? `${selectedPlayer.first_name} ${selectedPlayer.last_name}`
                    : "Nicht gewählt"
                }
              />
              <Data
                label="Nächstes Spiel"
                value={
                  nextMatch
                    ? `${nextMatch.home_team} – ${nextMatch.away_team}`
                    : "Noch nicht vorhanden"
                }
              />
            </div>
          ) : (
            <p className="mt-5 text-sm text-zinc-500">Kein Spiel ausgewählt.</p>
          )}
        </section>

        <section className="rounded-3xl border border-emerald-500/15 bg-emerald-950/20 p-5">
          <p className="text-xs font-black uppercase tracking-wider text-emerald-300">
            Ohne externe API
          </p>
          <p className="mt-2 text-xs leading-5 text-emerald-100/65">
            Die PNG-Dateien werden direkt im Browser erzeugt. Es entstehen
            keine zusätzlichen Kosten.
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

function Data({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
      <p className="text-[9px] font-black uppercase tracking-wider text-zinc-600">
        {label}
      </p>
      <p className="mt-1 font-black text-white">{value}</p>
    </div>
  );
}

async function renderGraphic(input: {
  item: GraphicItem;
  match: SocialMatch;
  nextMatch: SocialMatch | null;
  player: SocialPlayer | null;
  standings: SocialStanding[];
  goals: SocialGoal[];
  clubLogoSrc: string;
  accent: string;
  secondary: string;
  backgroundImage: string | null;
}) {
  const canvas = document.createElement("canvas");
  canvas.width = input.item.width;
  canvas.height = input.item.height;

  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas wird nicht unterstützt.");

  await drawBase(context, input.item.width, input.item.height, input);

  switch (input.item.id) {
    case "result":
      await drawResult(context, input);
      break;
    case "motm":
      await drawMotm(context, input);
      break;
    case "scorers":
      await drawScorers(context, input);
      break;
    case "table":
      await drawTable(context, input);
      break;
    case "next":
      await drawNext(context, input);
      break;
    case "story":
      await drawStory(context, input);
      break;
    case "reel":
      await drawReel(context, input);
      break;
  }

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("PNG-Export fehlgeschlagen."))),
      "image/png",
      1,
    );
  });
}

async function drawBase(
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
  gradient.addColorStop(0, "#050505");
  gradient.addColorStop(0.42, input.secondary);
  gradient.addColorStop(1, "#000000");
  context.fillStyle = gradient;
  context.fillRect(0, 0, width, height);

  if (input.backgroundImage) {
    try {
      const image = await loadImage(input.backgroundImage);
      context.save();
      context.globalAlpha = 0.24;
      coverImage(context, image, width, height);
      context.restore();
    } catch {}
  }

  const glow = context.createRadialGradient(
    width * 0.78,
    height * 0.18,
    0,
    width * 0.78,
    height * 0.18,
    width * 0.8,
  );
  glow.addColorStop(0, hexToRgba(input.accent, 0.45));
  glow.addColorStop(1, "rgba(0,0,0,0)");
  context.fillStyle = glow;
  context.fillRect(0, 0, width, height);

  context.fillStyle = input.accent;
  context.fillRect(0, 0, width, 16);
  context.fillRect(0, height - 16, width, 16);

  context.textAlign = "left";
  context.fillStyle = "#fff";
  context.font = "900 28px Arial";
  context.fillText("SPVGG MIDDELICH-RESSE", 65, 70);

  context.textAlign = "right";
  context.fillStyle = input.accent;
  context.font = "900 24px Arial";
  context.fillText("HUJA", width - 65, 70);
}

async function drawResult(
  context: CanvasRenderingContext2D,
  input: Parameters<typeof renderGraphic>[0],
) {
  const { item, match, clubLogoSrc, accent } = input;
  title(context, item.width, item.height * 0.17, "ABPFIFF", accent);
  await drawTeams(context, item.width, item.height, match, clubLogoSrc, item.height * 0.40);

  context.textAlign = "center";
  context.fillStyle = "#fff";
  context.font = `950 ${Math.round(item.width * 0.15)}px Arial`;
  context.fillText(
    `${match.home_score ?? 0}:${match.away_score ?? 0}`,
    item.width / 2,
    item.height * 0.72,
  );

  context.fillStyle = accent;
  context.font = `900 ${Math.round(item.width * 0.036)}px Arial`;
  context.fillText("ENDSTAND", item.width / 2, item.height * 0.80);
  slogan(context, item.width, item.height, "GEMEINSAM BIS ZUM SCHLUSS");
}

async function drawMotm(
  context: CanvasRenderingContext2D,
  input: Parameters<typeof renderGraphic>[0],
) {
  const { item, player, accent } = input;
  title(context, item.width, item.height * 0.15, "SPIELER DES SPIELS", accent);

  if (player?.image_url) {
    try {
      const image = await loadImage(player.image_url);
      containImage(
        context,
        image,
        item.width * 0.16,
        item.height * 0.22,
        item.width * 0.68,
        item.height * 0.53,
      );
    } catch {}
  } else {
    context.fillStyle = hexToRgba(accent, 0.28);
    context.beginPath();
    context.arc(item.width / 2, item.height * 0.46, item.width * 0.16, 0, Math.PI * 2);
    context.fill();
  }

  const name = player
    ? `${player.first_name} ${player.last_name}`
    : "UNSER SPIELER";

  context.textAlign = "center";
  context.fillStyle = "#fff";
  context.font = `950 ${Math.round(item.width * 0.065)}px Arial`;
  wrapText(context, name.toUpperCase(), item.width / 2, item.height * 0.83, item.width * 0.82, item.width * 0.07);

  context.fillStyle = accent;
  context.font = `900 ${Math.round(item.width * 0.029)}px Arial`;
  context.fillText("STARKE LEISTUNG", item.width / 2, item.height * 0.92);
}

async function drawScorers(
  context: CanvasRenderingContext2D,
  input: Parameters<typeof renderGraphic>[0],
) {
  const { item, goals, accent } = input;
  title(context, item.width, item.height * 0.16, "TORSCHÜTZEN", accent);

  const rows = goals.length
    ? goals.slice(0, 7)
    : [{ id: "none", minute: 0, player_name: "TEAMLEISTUNG", description: null }];

  rows.forEach((goal, index) => {
    const y = item.height * 0.31 + index * item.height * 0.085;
    context.fillStyle = accent;
    context.beginPath();
    context.arc(item.width * 0.17, y - 8, item.width * 0.03, 0, Math.PI * 2);
    context.fill();

    context.fillStyle = "#fff";
    context.textAlign = "center";
    context.font = `900 ${Math.round(item.width * 0.022)}px Arial`;
    context.fillText(goal.minute ? `${goal.minute}'` : "⚽", item.width * 0.17, y);

    context.textAlign = "left";
    context.font = `900 ${Math.round(item.width * 0.038)}px Arial`;
    context.fillText(
      (goal.player_name ?? goal.description ?? "MIDDELICH-RESSE").toUpperCase(),
      item.width * 0.24,
      y,
    );
  });

  slogan(context, item.width, item.height, "UNSERE TORE. UNSER TEAM.");
}

async function drawTable(
  context: CanvasRenderingContext2D,
  input: Parameters<typeof renderGraphic>[0],
) {
  const { item, standings, accent } = input;
  title(context, item.width, item.height * 0.13, "TABELLE", accent);

  const rows = standings.slice(0, 10);
  const startY = item.height * 0.24;
  const rowHeight = item.height * 0.061;

  rows.forEach((row, index) => {
    const y = startY + index * rowHeight;

    if (row.is_club) {
      context.fillStyle = hexToRgba(accent, 0.24);
      roundRect(context, item.width * 0.07, y - rowHeight * 0.67, item.width * 0.86, rowHeight * 0.88, 18);
      context.fill();
    }

    context.textAlign = "left";
    context.fillStyle = row.is_club ? accent : "#9ca3af";
    context.font = `900 ${Math.round(item.width * 0.025)}px Arial`;
    context.fillText(`${row.position}.`, item.width * 0.10, y);

    context.fillStyle = "#fff";
    context.font = `${row.is_club ? "950" : "800"} ${Math.round(item.width * 0.025)}px Arial`;
    context.fillText(truncate(row.team_name.toUpperCase(), 26), item.width * 0.20, y);

    context.textAlign = "right";
    context.fillStyle = row.is_club ? accent : "#fff";
    context.font = `950 ${Math.round(item.width * 0.028)}px Arial`;
    context.fillText(`${row.points} P`, item.width * 0.90, y);
  });

  slogan(context, item.width, item.height, "UNSERE LIGA. UNSER WEG.");
}

async function drawNext(
  context: CanvasRenderingContext2D,
  input: Parameters<typeof renderGraphic>[0],
) {
  const { item, nextMatch, clubLogoSrc, accent } = input;
  title(context, item.width, item.height * 0.16, "NÄCHSTES SPIEL", accent);

  if (!nextMatch) {
    context.textAlign = "center";
    context.fillStyle = "#fff";
    context.font = `900 ${Math.round(item.width * 0.05)}px Arial`;
    context.fillText("TERMIN FOLGT", item.width / 2, item.height * 0.55);
    slogan(context, item.width, item.height, "HUJA – DIE MIDDELICHER SIND DA");
    return;
  }

  await drawTeams(context, item.width, item.height, nextMatch, clubLogoSrc, item.height * 0.42);

  const date = new Date(nextMatch.match_date);
  context.textAlign = "center";
  context.fillStyle = "#fff";
  context.font = `900 ${Math.round(item.width * 0.042)}px Arial`;
  context.fillText(
    new Intl.DateTimeFormat("de-DE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      timeZone: "Europe/Berlin",
    }).format(date),
    item.width / 2,
    item.height * 0.73,
  );

  context.fillStyle = accent;
  context.font = `900 ${Math.round(item.width * 0.038)}px Arial`;
  context.fillText(
    `${new Intl.DateTimeFormat("de-DE", {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Europe/Berlin",
    }).format(date)} UHR`,
    item.width / 2,
    item.height * 0.80,
  );

  slogan(context, item.width, item.height, "DIE MIDDELICHER SIND DA");
}

async function drawStory(
  context: CanvasRenderingContext2D,
  input: Parameters<typeof renderGraphic>[0],
) {
  const { item, match, accent } = input;
  title(context, item.width, item.height * 0.13, "ABPFIFF", accent);

  context.textAlign = "center";
  context.fillStyle = "#fff";
  context.font = `950 ${Math.round(item.width * 0.13)}px Arial`;
  context.fillText(
    `${match.home_score ?? 0}:${match.away_score ?? 0}`,
    item.width / 2,
    item.height * 0.43,
  );

  context.font = `900 ${Math.round(item.width * 0.048)}px Arial`;
  wrapText(context, match.home_team.toUpperCase(), item.width / 2, item.height * 0.56, item.width * 0.84, item.width * 0.055);
  wrapText(context, match.away_team.toUpperCase(), item.width / 2, item.height * 0.68, item.width * 0.84, item.width * 0.055);

  context.fillStyle = accent;
  context.font = `900 ${Math.round(item.width * 0.035)}px Arial`;
  context.fillText("HUJA – DIE MIDDELICHER SIND DA", item.width / 2, item.height * 0.89);
}

async function drawReel(
  context: CanvasRenderingContext2D,
  input: Parameters<typeof renderGraphic>[0],
) {
  const { item, match, accent } = input;

  context.textAlign = "center";
  context.fillStyle = accent;
  context.font = `900 ${Math.round(item.width * 0.035)}px Arial`;
  context.fillText("MATCH HIGHLIGHTS", item.width / 2, item.height * 0.18);

  context.shadowColor = accent;
  context.shadowBlur = 40;
  context.fillStyle = "#fff";
  context.font = `950 ${Math.round(item.width * 0.12)}px Arial`;
  context.fillText("HUJA", item.width / 2, item.height * 0.34);
  context.shadowBlur = 0;

  context.font = `950 ${Math.round(item.width * 0.15)}px Arial`;
  context.fillText(
    `${match.home_score ?? 0}:${match.away_score ?? 0}`,
    item.width / 2,
    item.height * 0.55,
  );

  context.font = `900 ${Math.round(item.width * 0.046)}px Arial`;
  wrapText(context, match.home_team.toUpperCase(), item.width / 2, item.height * 0.68, item.width * 0.84, item.width * 0.055);
  wrapText(context, match.away_team.toUpperCase(), item.width / 2, item.height * 0.78, item.width * 0.84, item.width * 0.055);

  slogan(context, item.width, item.height, "JETZT ANSCHAUEN");
}

async function drawTeams(
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
  match: SocialMatch,
  clubLogoSrc: string,
  centerY: number,
) {
  const logoSize = width * 0.18;

  const homeLogo = match.home_logo_url || clubLogoSrc;
  const awayLogo = match.away_logo_url;

  if (homeLogo) {
    try {
      const image = await loadImage(homeLogo);
      containImage(context, image, width * 0.14, centerY - logoSize / 2, logoSize, logoSize);
    } catch {}
  }

  if (awayLogo) {
    try {
      const image = await loadImage(awayLogo);
      containImage(context, image, width * 0.68, centerY - logoSize / 2, logoSize, logoSize);
    } catch {}
  }

  context.textAlign = "center";
  context.fillStyle = "#fff";
  context.font = `900 ${Math.round(width * 0.029)}px Arial`;
  wrapText(context, match.home_team.toUpperCase(), width * 0.23, centerY + logoSize * 0.78, width * 0.36, width * 0.034);
  wrapText(context, match.away_team.toUpperCase(), width * 0.77, centerY + logoSize * 0.78, width * 0.36, width * 0.034);

  context.fillStyle = "#c1121f";
  context.font = `950 ${Math.round(width * 0.055)}px Arial`;
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
  context.fillStyle = "#fff";
  context.font = `950 ${Math.round(width * 0.082)}px Arial`;
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
  context.fillStyle = "#fff";
  context.font = `900 ${Math.round(width * 0.023)}px Arial`;
  context.fillText(text, width / 2, height - 62);
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

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(`Bild konnte nicht geladen werden: ${src}`));
    image.src = src;
  });
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

function safeName(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function wait(milliseconds: number) {
  return new Promise((resolve) => window.setTimeout(resolve, milliseconds));
}
