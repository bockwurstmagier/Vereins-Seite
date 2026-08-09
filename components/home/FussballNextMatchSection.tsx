import { CalendarDays } from "lucide-react";
import FussballWidget from "../fussball/FussballWidget";

const NEXT_MATCH_WIDGET_ID = "0e4d6599-b984-4c8e-ba9d-d5e864925837";

export default function FussballNextMatchSection() {
  return (
    <section id="fussballde" className="club-section scroll-mt-24 py-10">
      <div className="club-container">
        <div className="mb-6">
          <div className="flex items-center gap-2">
            <CalendarDays
              size={16}
              strokeWidth={2.5}
              className="text-club-light-red"
              aria-hidden="true"
            />
            <p className="club-eyebrow">Matchday</p>
          </div>
          <h2 className="club-heading mt-2">Nächstes Spiel</h2>
        </div>

        <FussballWidget
          widgetId={NEXT_MATCH_WIDGET_ID}
          widgetType="next-match"
          title="Nächstes Spiel"
        />
      </div>
    </section>
  );
}
