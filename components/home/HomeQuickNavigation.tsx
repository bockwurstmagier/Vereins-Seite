"use client";
import { useEffect, useRef, useState } from "react";

export default function HomeQuickNavigation({ items }: { items: { id: string; label: string }[] }) {
  const [open, setOpen] = useState(false);
  const [visible, setVisible] = useState(items);
  const root = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    // Async sections may render nothing. Keep the menu aligned with actual content.
    const sync = () => setVisible(items.filter(item => !!document.getElementById(`home-${item.id}`)?.firstElementChild));
    sync();
    const observer = new MutationObserver(sync);
    const content = document.getElementById("home-sections");
    if (content) observer.observe(content, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [items]);
  useEffect(() => {
    if (!open) return;
    const close = (event: PointerEvent) => { if (!root.current?.contains(event.target as Node)) setOpen(false); };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, [open]);
  return <div ref={root} className="fixed right-4 top-4 z-[190]" onKeyDown={event => { if (event.key === "Escape") { setOpen(false); button.current?.focus(); } }}>
    <button ref={button} type="button" aria-expanded={open} aria-controls="huja-quick-navigation" aria-label={open ? "Vereinsmenü schließen" : "Vereinsmenü öffnen"} onClick={() => setOpen(!open)} className="min-h-12 min-w-12 rounded-2xl border border-white/20 bg-black/95 px-4 text-2xl text-white shadow-xl">{open ? "×" : "☰"}</button>
    {open && <nav id="huja-quick-navigation" aria-label="Vereinsbereiche" className="mt-2 max-h-[75dvh] w-[min(20rem,calc(100vw-2rem))] overflow-y-auto rounded-2xl border border-white/15 bg-zinc-950 p-2 shadow-xl">
      {visible.map(item => <a key={item.id} href={`#home-${item.id}`} onClick={() => { setOpen(false); document.getElementById(`home-${item.id}`)?.focus({ preventScroll: true }); }} className="block rounded-xl px-4 py-3 font-bold text-white hover:bg-white/10 focus:bg-white/10">{item.label}</a>)}
    </nav>}
  </div>;
}
