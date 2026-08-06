"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import {
  Bot,
  Copy,
  LoaderCircle,
  Send,
  Sparkles,
  UserRound,
} from "lucide-react";

import type { ClubAssistantAnswer } from "../../../lib/assistant/club-assistant";
import { askClubAssistant } from "./actions";

type Message =
  | {
      id: string;
      role: "user";
      text: string;
    }
  | {
      id: string;
      role: "assistant";
      answer: ClubAssistantAnswer;
    };

const SUGGESTIONS = [
  "Wann ist unser nächstes Spiel?",
  "Wann ist unser nächstes Auswärtsspiel?",
  "Auf welchem Tabellenplatz stehen wir?",
  "Wer ist aktuell bester Torschütze?",
  "Wie ist unsere Form in den letzten 5 Spielen?",
  "Schreib mir einen Instagram-Post zum letzten Ergebnis.",
];

export default function ClubAssistant() {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      answer: {
        title: "HUJA Vereinsassistent",
        text: "Ich beantworte Fragen direkt aus euren Spiel-, Tabellen- und Spielerdaten. Der Grundmodus funktioniert ohne externe KI-Kosten.",
        details: [
          "Spielplan und nächste Begegnungen",
          "Tabelle und Form",
          "Tore, Vorlagen, Karten und Einsatzzeiten",
          "Social-Media-Vorschläge",
        ],
        mode: "notice",
      },
    },
  ]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function submit(value = question) {
    const clean = value.trim();
    if (!clean || loading) return;

    setQuestion("");
    setMessages((current) => [
      ...current,
      { id: crypto.randomUUID(), role: "user", text: clean },
    ]);
    setLoading(true);

    try {
      const answer = await askClubAssistant(clean);
      setMessages((current) => [
        ...current,
        { id: crypto.randomUUID(), role: "assistant", answer },
      ]);
    } catch (error) {
      setMessages((current) => [
        ...current,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          answer: {
            title: "Frage konnte nicht beantwortet werden",
            text:
              error instanceof Error
                ? error.message
                : "Bitte versuche es noch einmal.",
            mode: "notice",
          },
        },
      ]);
    } finally {
      setLoading(false);
      window.setTimeout(() => inputRef.current?.focus(), 50);
    }
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_19rem]">
      <section className="club-card overflow-hidden">
        <div className="border-b border-white/10 bg-gradient-to-r from-club-burgundy/60 via-club-dark-red/20 to-transparent px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="club-icon-box">
              <Bot size={20} />
            </div>
            <div>
              <p className="font-black uppercase text-white">
                Vereinsassistent
              </p>
              <p className="text-xs text-zinc-500">
                Antworten aus euren echten Vereinsdaten
              </p>
            </div>
          </div>
        </div>

        <div className="max-h-[62vh] min-h-[31rem] space-y-5 overflow-y-auto p-4 sm:p-6">
          {messages.map((message) =>
            message.role === "user" ? (
              <div key={message.id} className="flex justify-end gap-3">
                <div className="max-w-[86%] rounded-[1.5rem] rounded-br-md bg-club-red px-4 py-3 text-sm leading-6 text-white">
                  {message.text}
                </div>
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/[0.06] text-zinc-400">
                  <UserRound size={17} />
                </div>
              </div>
            ) : (
              <AssistantMessage key={message.id} answer={message.answer} />
            ),
          )}

          {loading && (
            <div className="flex items-center gap-3 text-sm text-zinc-500">
              <LoaderCircle className="animate-spin" size={18} />
              Vereinsdaten werden ausgewertet …
            </div>
          )}
        </div>

        <form
          onSubmit={(event) => {
            event.preventDefault();
            void submit();
          }}
          className="border-t border-white/10 p-4"
        >
          <div className="flex gap-2">
            <input
              ref={inputRef}
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              maxLength={500}
              placeholder="Frag z. B.: Wer hat die meisten Tore?"
              className="admin-input min-w-0 flex-1"
            />
            <button
              type="submit"
              disabled={loading || !question.trim()}
              className="club-button-primary h-12 shrink-0 px-4 disabled:cursor-not-allowed disabled:opacity-50"
              aria-label="Frage senden"
            >
              <Send size={18} />
              <span className="hidden sm:inline">Senden</span>
            </button>
          </div>
        </form>
      </section>

      <aside className="space-y-4">
        <div className="club-card p-4">
          <div className="flex items-center gap-2">
            <Sparkles size={17} className="text-club-light-red" />
            <p className="text-xs font-black uppercase tracking-wider text-white">
              Schnellfragen
            </p>
          </div>

          <div className="mt-4 space-y-2">
            {SUGGESTIONS.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                disabled={loading}
                onClick={() => void submit(suggestion)}
                className="w-full rounded-2xl border border-white/10 bg-white/[0.035] px-3 py-3 text-left text-xs font-bold leading-5 text-zinc-300 transition hover:border-club-light-red/25 hover:bg-club-red/10 hover:text-white"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-emerald-500/15 bg-emerald-950/20 p-4">
          <p className="text-xs font-black uppercase tracking-wider text-emerald-300">
            Kostenloser Datenmodus
          </p>
          <p className="mt-2 text-xs leading-5 text-emerald-100/65">
            Die Antworten werden aus Supabase berechnet. Es wird kein
            kostenpflichtiger KI-Aufruf ausgelöst.
          </p>
        </div>
      </aside>
    </div>
  );
}

function AssistantMessage({ answer }: { answer: ClubAssistantAnswer }) {
  async function copy() {
    const content = [
      answer.title,
      answer.text,
      ...(answer.details ?? []),
    ].join("\n");
    await navigator.clipboard.writeText(content);
  }

  return (
    <div className="flex gap-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-club-red/15 text-club-light-red">
        <Bot size={18} />
      </div>

      <article className="max-w-[90%] rounded-[1.5rem] rounded-bl-md border border-white/10 bg-white/[0.035] p-4">
        <p className="font-black text-white">{answer.title}</p>
        <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-zinc-300">
          {answer.text}
        </p>

        {answer.details?.length ? (
          <div className="mt-4 space-y-2">
            {answer.details.map((detail) => (
              <div
                key={detail}
                className="rounded-xl bg-black/25 px-3 py-2 text-xs leading-5 text-zinc-400"
              >
                {detail}
              </div>
            ))}
          </div>
        ) : null}

        <div className="mt-4 flex flex-wrap gap-2">
          {answer.link && (
            <Link href={answer.link.href} className="club-button-secondary text-xs">
              {answer.link.label}
            </Link>
          )}
          <button
            type="button"
            onClick={() => void copy()}
            className="club-button-secondary text-xs"
          >
            <Copy size={14} />
            Kopieren
          </button>
        </div>
      </article>
    </div>
  );
}
