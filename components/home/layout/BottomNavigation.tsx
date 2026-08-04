import {
  CalendarDays,
  Home,
  Menu,
  Newspaper,
  Users,
} from "lucide-react";

const navigationItems = [
  {
    label: "Home",
    href: "#top",
    icon: Home,
    active: true,
  },
  {
    label: "Spiele",
    href: "#next-match",
    icon: CalendarDays,
    active: false,
  },
  {
    label: "News",
    href: "#news",
    icon: Newspaper,
    active: false,
  },
  {
    label: "Team",
    href: "#team",
    icon: Users,
    active: false,
  },
  {
    label: "Mehr",
    href: "#more",
    icon: Menu,
    active: false,
  },
];

export default function BottomNavigation() {
  return (
    <nav
      aria-label="Hauptnavigation"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-white/10 bg-black/85 px-3 pt-2 backdrop-blur-2xl"
    >
      <div className="mx-auto grid max-w-md grid-cols-5 gap-1 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        {navigationItems.map((item) => {
          const Icon = item.icon;

          return (
            <a
              key={item.label}
              href={item.href}
              aria-label={item.label}
              className={`group flex min-h-14 flex-col items-center justify-center rounded-2xl transition duration-200 active:scale-90 ${
                item.active
                  ? "bg-red-600 text-white shadow-[0_0_24px_rgba(220,38,38,0.35)]"
                  : "text-zinc-500 hover:bg-white/5 hover:text-white"
              }`}
            >
              <Icon
                size={21}
                strokeWidth={item.active ? 2.5 : 2}
                aria-hidden="true"
              />

              <span className="mt-1 text-[10px] font-bold uppercase tracking-wide">
                {item.label}
              </span>
            </a>
          );
        })}
      </div>
    </nav>
  );
}