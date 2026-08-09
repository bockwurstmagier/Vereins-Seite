import {
  BarChart3,
  CalendarDays,
  ExternalLink,
  FileText,
  Mail,
  Radio,
  BadgeCheck,
  ShoppingBag,
  Table2,
} from "lucide-react";

const SHOP_URL = "https://spvgg-middelich-resse.fan12.de";

const links = [
  { t: "Offizielle Spiele", h: "/fussball", i: BadgeCheck },
  { t: "Spielplan", h: "/spielplan", i: CalendarDays },
  { t: "Tabelle", h: "/tabelle", i: Table2 },
  { t: "Match-Center", h: "/match-center", i: Radio },
  { t: "Statistiken", h: "/statistiken", i: BarChart3 },
  { t: "Kontakt", h: "/kontakt", i: Mail },
  { t: "Impressum", h: "/impressum", i: FileText },
];

export default function QuickLinks() {
  return (
    <section id="more" className="club-section py-10">
      <div className="club-container">
        <p className="club-eyebrow">Mehr entdecken</p>
        <h2 className="club-heading mt-2">Vereinszentrale</h2>

        <a
          href={SHOP_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="club-card group mt-6 flex min-h-28 items-center justify-between gap-4 p-5"
          aria-label="Offiziellen Fanshop von SpVgg Middelich-Resse öffnen"
        >
          <div className="flex min-w-0 items-center gap-4">
            <div className="club-icon-box shrink-0">
              <ShoppingBag size={22} />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-red-300">
                Offizieller Fanshop
              </p>
              <p className="mt-1 text-base font-black uppercase text-white">Middelich-Resse Shop</p>
              <p className="mt-1 text-xs text-white/60">Trikots, Shirts, Fanartikel & mehr</p>
            </div>
          </div>
          <ExternalLink className="shrink-0 text-red-300 transition-transform group-hover:translate-x-0.5" size={20} />
        </a>

        <div className="mt-3 grid grid-cols-2 gap-3">
          {links.map((link) => {
            const Icon = link.i;
            return (
              <a key={link.h} href={link.h} className="club-card flex min-h-32 flex-col items-center justify-center gap-3 p-4 text-center">
                <div className="club-icon-box"><Icon size={20} /></div>
                <span className="text-sm font-black uppercase">{link.t}</span>
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
}
