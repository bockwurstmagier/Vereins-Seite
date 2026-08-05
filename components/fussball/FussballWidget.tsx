"use client";

import Script from "next/script";
import { useState } from "react";
import { ExternalLink, ShieldCheck } from "lucide-react";

const FUSSBALL_WIDGET_SCRIPT_URL = "https://www.fussball.de/widgets.js";

type FussballWidgetProps = {
  widgetId: string;
  widgetType: string;
  title?: string;
  className?: string;
};

export default function FussballWidget({
  widgetId,
  widgetType,
  title = "FUSSBALL.DE-Widget",
  className = "",
}: FussballWidgetProps) {
  const [allowed, setAllowed] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  if (!allowed) {
    return (
      <div className={`club-card p-5 text-center ${className}`}>
        <div className="club-icon-box mx-auto">
          <ShieldCheck size={20} aria-hidden="true" />
        </div>

        <h3 className="mt-4 text-lg font-black text-white">{title}</h3>

        <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-zinc-400">
          Mit dem Laden werden offizielle Inhalte von FUSSBALL.DE abgerufen.
          Dabei kann deine IP-Adresse an den Anbieter übertragen werden.
        </p>

        <button
          type="button"
          onClick={() => setAllowed(true)}
          className="club-button-primary mt-5"
        >
          <ExternalLink size={17} aria-hidden="true" />
          Offizielle Daten laden
        </button>
      </div>
    );
  }

  return (
    <div className={className}>
      <Script
        id="fussballde-widget-script"
        src={FUSSBALL_WIDGET_SCRIPT_URL}
        strategy="afterInteractive"
        onLoad={() => setLoaded(true)}
        onReady={() => setLoaded(true)}
        onError={() => setFailed(true)}
      />

      {!loaded && !failed && (
        <div className="club-card mb-4 p-6 text-center text-sm text-zinc-400">
          Offizielle Spieldaten werden geladen …
        </div>
      )}

      {failed && (
        <div className="club-card mb-4 border-red-500/20 p-6 text-center">
          <p className="text-sm font-black text-red-300">
            Das FUSSBALL.DE-Widget konnte nicht geladen werden.
          </p>
          <p className="mt-2 text-sm leading-6 text-zinc-400">
            Prüfe deine Internetverbindung oder teste die Seite auf der
            freigeschalteten Vereinsdomain.
          </p>
        </div>
      )}

      <div
        className="fussballde_widget min-h-24 overflow-hidden rounded-[2rem]"
        data-id={widgetId}
        data-type={widgetType}
        style={{ width: "100%" }}
      />
    </div>
  );
}
