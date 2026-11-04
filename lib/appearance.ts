export const APPEARANCE_KEY = "huja-appearance-v1";
export const BACKGROUNDS = [
  { id: "stadium", name: "Flutlicht", description: "Stadionatmosphäre am Spieltag" },
  { id: "smoke", name: "Rot & Schwarz", description: "Weiche rote Rauchformen" },
  { id: "crest", name: "Vereinsliebe", description: "Dezentes Wappenmuster" },
  { id: "plain", name: "Pur", description: "Ruhig und ganz ohne Bild" },
] as const;
export type Appearance = { mode: "dark" | "light" | "system"; background: (typeof BACKGROUNDS)[number]["id"]; effects: boolean };
export const DEFAULT_APPEARANCE: Appearance = { mode: "dark", background: "stadium", effects: true };
export function normalizeAppearance(input: unknown): Appearance {
  const value = input && typeof input === "object" ? input as Partial<Appearance> : {};
  return {
    mode: value.mode === "light" || value.mode === "system" ? value.mode : "dark",
    background: BACKGROUNDS.some(item => item.id === value.background) ? value.background! : "stadium",
    effects: typeof value.effects === "boolean" ? value.effects : true,
  };
}
export function applyAppearance(value: Appearance, systemDark: boolean, reducedMotion: boolean) {
  const root = document.documentElement;
  root.dataset.theme = value.mode === "system" ? (systemDark ? "dark" : "light") : value.mode;
  root.dataset.background = value.background;
  root.dataset.effects = value.effects && !reducedMotion ? "on" : "off";
  root.style.colorScheme = root.dataset.theme;
}

// Applied before the page is painted. Fixed allowlists; no user data becomes markup or a URL.
export const APPEARANCE_BOOTSTRAP = `(function(){try{var p=JSON.parse(localStorage.getItem('${APPEARANCE_KEY}')||'null')||{};var r=document.documentElement;var m=p.mode==='light'||p.mode==='system'?p.mode:'dark';r.dataset.theme=m==='system'?(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'):m;r.dataset.background=['stadium','smoke','crest','plain'].includes(p.background)?p.background:'stadium';r.dataset.effects=p.effects===false||matchMedia('(prefers-reduced-motion: reduce)').matches?'off':'on';r.style.colorScheme=r.dataset.theme;}catch(e){}})();`;
