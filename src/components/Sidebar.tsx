import { NavLink } from "react-router-dom";
import {
  Sparkles,
  Dices,
  LayoutGrid,
  Gamepad2,
  Gift,
  Trophy,
  Users,
  Globe,
  MessageCircle,
  Bookmark,
  Heart,
  Play,
  Star,
  Tv2,
  Flame,
  TrendingUp,
} from "lucide-react";

type Item = {
  to: string;
  icon: typeof Sparkles;
  label: string;
  disabled?: boolean;
};

const PERSONAL: Item[] = [
  { to: "/profile", icon: Bookmark, label: "Gespeicherte Spiele" },
  { to: "/profile", icon: Heart, label: "Gefolgt" },
  { to: "/profile", icon: Play, label: "Weiterspielen" },
  { to: "/profile", icon: Star, label: "Spiele für Sie" },
];

const SPIELE: Item[] = [
  { to: "/casino", icon: LayoutGrid, label: "Casino" },
  { to: "/originals", icon: Flame, label: "Yahu Originals" },
  { to: "/new", icon: Sparkles, label: "Neuerscheinungen" },
  { to: "/slots", icon: TrendingUp, label: "Slots" },
  { to: "/table-games", icon: Dices, label: "Table Games" },
  { to: "/games", icon: Gamepad2, label: "Games" },
  { to: "/live", icon: Tv2, label: "Live Casino", disabled: true },
  { to: "/promotions", icon: Gift, label: "Promotions" },
  { to: "/leaderboard", icon: Trophy, label: "Leaderboard" },
  { to: "/affiliates", icon: Users, label: "Affiliates" },
];

export function Sidebar() {
  return (
    <aside className="hidden lg:flex flex-col w-60 shrink-0 border-r border-white/5 bg-bg-primary/40 px-2 py-4 sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto">
      <Section title="Persönlich" items={PERSONAL} />

      <div className="text-[10px] uppercase tracking-[0.2em] text-text-secondary/60 font-semibold mt-4 mb-1 px-3">
        Spiele
      </div>
      <Section items={SPIELE} />

      <div className="mt-auto pt-4 border-t border-white/5 flex flex-col gap-1.5">
        <button className="btn-ghost flex items-center gap-2 text-sm px-3">
          <Globe size={15} /> EN / Language
        </button>
        <button className="btn-ghost flex items-center gap-2 text-sm px-3">
          <MessageCircle size={15} /> Live support
        </button>
        <div className="text-[10px] text-text-secondary/60 leading-relaxed mt-2 px-3">
          Demo · play money only · 18+
        </div>
      </div>
    </aside>
  );
}

function Section({ title, items }: { title?: string; items: Item[] }) {
  return (
    <div>
      {title && (
        <div className="text-[10px] uppercase tracking-[0.2em] text-text-secondary/60 font-semibold mb-1 px-3 mt-1">
          {title}
        </div>
      )}
      <nav className="flex flex-col gap-0.5">
        {items.map((it) =>
          it.disabled ? (
            <div
              key={it.label}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-text-secondary/40 cursor-not-allowed"
            >
              <it.icon size={16} />
              {it.label}
              <span className="ml-auto text-[9px] uppercase tracking-wider bg-bg-elevated px-1.5 py-0.5 rounded">
                Soon
              </span>
            </div>
          ) : (
            <NavLink
              key={it.label + it.to}
              to={it.to}
              end={it.to === "/"}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition ${
                  isActive
                    ? "bg-white/[0.07] text-white"
                    : "text-text-secondary hover:text-white hover:bg-white/[0.04]"
                }`
              }
            >
              <it.icon size={16} />
              {it.label}
            </NavLink>
          )
        )}
      </nav>
    </div>
  );
}
