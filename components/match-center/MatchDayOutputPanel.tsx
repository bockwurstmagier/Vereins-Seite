"use client";

import { useRef, useState } from "react";
import { Check, Copy, Download } from "lucide-react";

type Props = {
  matchId: string;
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  headline: string;
  instagramText: string;
  facebookText: string;
  whatsappText: string;
  pressText: string;
  report: string;
};

export default function MatchDayOutputPanel(props: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [copied, setCopied] = useState<string | null>(null);

  async function copy(key: string, value: string) {
    await navigator.clipboard.writeText(value);
    setCopied(key);
    window.setTimeout(() => setCopied(null), 1400);
  }

  async function exportGraphic() {
    const svg = svgRef.current;
    if (!svg) return;
    const clone = svg.cloneNode(true) as SVGSVGElement;
    clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    const source = new XMLSerializer().serializeToString(clone);
    const blob = new Blob([source], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const image = new Image();
    image.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 1080;
      canvas.height = 1350;
      const context = canvas.getContext("2d");
      if (!context) return;
      context.drawImage(image, 0, 0, 1080, 1350);
      URL.revokeObjectURL(url);
      const link = document.createElement("a");
      link.download = `endstand-${props.matchId}.png`;
      link.href = canvas.toDataURL("image/png", 1);
      link.click();
    };
    image.src = url;
  }

  const texts = [
    ["Instagram", props.instagramText],
    ["Facebook", props.facebookText],
    ["WhatsApp", props.whatsappText],
    ["Pressebericht", props.pressText],
    ["Website-Spielbericht", props.report],
  ] as const;

  return (
    <div className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
      <section className="club-card overflow-hidden p-4 sm:p-6">
        <svg ref={svgRef} viewBox="0 0 1080 1350" className="h-auto w-full rounded-[1.75rem]">
          <defs>
            <linearGradient id="result-bg" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#080808" />
              <stop offset="0.55" stopColor="#51000e" />
              <stop offset="1" stopColor="#0a0a0a" />
            </linearGradient>
            <radialGradient id="result-glow">
              <stop offset="0" stopColor="#ef3340" stopOpacity="0.55" />
              <stop offset="1" stopColor="#ef3340" stopOpacity="0" />
            </radialGradient>
          </defs>
          <rect width="1080" height="1350" fill="url(#result-bg)" />
          <circle cx="860" cy="250" r="390" fill="url(#result-glow)" />
          <text x="70" y="120" fill="#ef3340" fontSize="36" fontWeight="900" letterSpacing="8">SPVGG MIDDELICH-RESSE</text>
          <text x="70" y="260" fill="#ffffff" fontSize="96" fontWeight="1000">{props.headline}</text>
          <line x1="70" y1="310" x2="1010" y2="310" stroke="#ef3340" strokeWidth="8" />
          <text x="540" y="520" fill="#ffffff" fontSize="58" fontWeight="900" textAnchor="middle">{props.homeTeam}</text>
          <text x="540" y="720" fill="#ffffff" fontSize="190" fontWeight="1000" textAnchor="middle">{props.homeScore}:{props.awayScore}</text>
          <text x="540" y="870" fill="#ffffff" fontSize="58" fontWeight="900" textAnchor="middle">{props.awayTeam}</text>
          <text x="540" y="1100" fill="#ef3340" fontSize="48" fontWeight="900" textAnchor="middle" letterSpacing="8">HUJA</text>
          <text x="540" y="1170" fill="#d4d4d8" fontSize="31" fontWeight="700" textAnchor="middle">DIE MIDDELICHER SIND DA</text>
          <text x="540" y="1280" fill="#71717a" fontSize="25" fontWeight="700" textAnchor="middle">#MiddelichResse · #Endstand</text>
        </svg>
        <button type="button" onClick={exportGraphic} className="club-button-primary mt-4 w-full">
          <Download size={18} /> Ergebnisgrafik als PNG
        </button>
      </section>

      <div className="space-y-4">
        {texts.map(([label, value]) => (
          <section key={label} className="club-card p-5">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-sm font-black uppercase tracking-wider text-white">{label}</h2>
              <button type="button" onClick={() => void copy(label, value)} className="club-button-secondary !min-h-10 !px-3">
                {copied === label ? <Check size={16} /> : <Copy size={16} />}
                {copied === label ? "Kopiert" : "Kopieren"}
              </button>
            </div>
            <pre className="mt-4 whitespace-pre-wrap font-sans text-sm leading-6 text-zinc-300">{value}</pre>
          </section>
        ))}
      </div>
    </div>
  );
}
