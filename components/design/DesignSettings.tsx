"use client";
import { useState } from "react";
import { ArrowLeft, Check, Moon, Monitor, Sun, Sparkles, RotateCcw } from "lucide-react";
import { useAppearance } from "./AppearanceProvider";
import { BACKGROUNDS } from "../../lib/appearance";

export default function DesignSettings() {
  const { value, update, reset, ready, persistent } = useAppearance();
  const [message, setMessage] = useState("");
  function saved() { setMessage("Dein Design wurde übernommen."); }
  return <main className="design-settings min-h-screen px-4 py-8"><div className="mx-auto max-w-xl">
    <a href="/" className="club-button-secondary mb-7"><ArrowLeft size={17} />Zur Startseite</a>
    <p className="club-eyebrow">HUJA · Dein Verein. Dein Look.</p>
    <h1 className="club-heading mt-3 text-4xl">Mein Design</h1>
    <p className="mt-3 text-sm leading-6 text-zinc-400">So, wie du HUJA magst. Deine Auswahl gilt nur auf diesem Gerät und wird sofort angezeigt – auch ohne Anmeldung.</p>
    <fieldset disabled={!ready} className="mt-7"><legend className="mb-3 text-lg font-black">Deine Farben</legend>
      <div className="grid grid-cols-3 gap-2">{([{ id: "dark", label: "Dunkel", Icon: Moon }, { id: "light", label: "Hell", Icon: Sun }, { id: "system", label: "Automatisch", Icon: Monitor }] as const).map(({ id, label, Icon }) =>
        <label key={id} className={`design-option flex min-h-24 cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border p-2 text-sm font-bold ${value.mode === id ? "is-selected" : ""}`}>
          <input type="radio" name="appearance-mode" value={id} checked={value.mode === id} onChange={() => { update({ ...value, mode: id }); saved(); }} className="accent-red-600" /><Icon size={21} aria-hidden="true" />{label}
        </label>)}</div>
    </fieldset>
    <fieldset disabled={!ready} className="mt-8"><legend className="mb-3 text-lg font-black">Dein Hintergrund</legend>
      <div className="grid grid-cols-2 gap-3">{BACKGROUNDS.map(background => <label key={background.id} className={`design-option cursor-pointer overflow-hidden rounded-2xl border ${value.background === background.id ? "is-selected" : ""}`}>
        <div className={`design-swatch design-swatch-${background.id}`} aria-hidden="true">{value.background === background.id && <span className="rounded-full bg-red-700 p-2 text-white"><Check size={17} /></span>}</div>
        <span className="block p-3"><span className="flex items-center gap-2 font-bold"><input type="radio" name="appearance-background" checked={value.background === background.id} onChange={() => { update({ ...value, background: background.id }); saved(); }} className="accent-red-600" />{background.name}</span><span className="mt-1 block text-xs leading-5 text-zinc-400">{background.description}</span></span>
      </label>)}</div>
    </fieldset>
    <div className="club-card mt-7 p-5"><label className="flex cursor-pointer items-center justify-between gap-4"><span><span className="flex items-center gap-2 font-bold"><Sparkles size={18} />Licht & Bewegung</span><span className="mt-2 block text-sm text-zinc-400">Dekorative Effekte ein- oder ausschalten.</span></span><input aria-label="Dekorative Effekte" type="checkbox" checked={value.effects} disabled={!ready} onChange={event => { update({ ...value, effects: event.target.checked }); saved(); }} className="h-6 w-6 shrink-0 accent-red-600" /></label>
      <p className="mt-3 text-xs leading-5 text-zinc-500">„Bewegung reduzieren“ auf deinem Gerät hat immer Vorrang.</p>
    </div>
    <section aria-label="Designvorschau" className="design-preview mt-7 overflow-hidden rounded-3xl border border-white/10 p-5">
      <p className="text-xs font-bold uppercase tracking-widest">Deine Vorschau</p>
      <div className="club-card mt-4 p-5"><p className="club-eyebrow">Spieltag</p><h2 className="mt-2 text-xl font-black">Gemeinsam für Middelich.</h2><p className="mt-2 text-sm text-zinc-400">So erscheinen Karten und Texte mit deinem Look.</p><a href="/" className="club-button-primary mt-4 w-full">Auf der Startseite ansehen</a></div>
    </section>
    <p role="status" className="my-4 min-h-6 text-sm text-zinc-400">{!persistent ? "Dein Browser erlaubt keine Speicherung. Die Auswahl gilt nur bis zum Neuladen." : message || "Änderungen werden automatisch gespeichert."}</p>
    <button type="button" disabled={!ready} onClick={() => { reset(); setMessage("HUJA-Standard wiederhergestellt."); }} className="club-button-secondary w-full"><RotateCcw size={16} />Standard wiederherstellen</button>
  </div></main>;
}

