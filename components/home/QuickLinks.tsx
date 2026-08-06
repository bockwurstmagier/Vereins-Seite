import { BarChart3, CalendarDays, FileText, Mail, Radio, BadgeCheck, Table2 } from "lucide-react";

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
        <div className="mt-6 grid grid-cols-2 gap-3">
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
