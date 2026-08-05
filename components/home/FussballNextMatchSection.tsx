import { BadgeCheck, CalendarDays } from "lucide-react";
import FussballWidget from "../fussball/FussballWidget";

const NEXT_MATCH_WIDGET_ID = "0e4d6599-b984-4c8e-ba9d-d5e864925837";

export default function FussballNextMatchSection() {
  return (
    <section id="fussballde" className="club-section scroll-mt-24 py-10">
      <div className="club-container">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <CalendarDays
                size={16}
                strokeWidth={2.5}
                className="text-club-light-red"
                aria-hidden="true"
              />
              <p className="club-eyebrow">Offizielle Daten</p>
            </div>
            <h2 className="club-heading mt-2">Nächstes Spiel</h2>
          </div>

          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-950/30 px-3 py-1.5 text-[9px] font-black uppercase tracking-wider text-emerald-300">
            <BadgeCheck size={13} aria-hidden="true" />
            FUSSBALL.DE
          </span>
        </div>

        <FussballWidget
          widgetId={NEXT_MATCH_WIDGET_ID}
          widgetType="next-match"
          title="Offizielles nächstes Spiel"
        />
      </div>
    </section>
  );
}
