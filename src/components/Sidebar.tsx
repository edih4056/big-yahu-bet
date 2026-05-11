import { NavLink } from "react-router-dom";
import {
  Sparkles,
  Dices,
  LayoutGrid,
  Gift,
  Trophy,
  Users,
  MessageCircle,
  Globe,
} from "lucide-react";

const ITEMS = [
  { to: "/casino", icon: LayoutGrid, label: "Casino" },
  { to: "/slots", icon: Sparkles, label: "Slots" },
  { to: "/table-games", icon: Dices, label: "Table Games" },
  { to: "/promotions", icon: Gift, label: "Promotions" },
  { to: "/leaderboard", icon: Trophy, label: "Leaderboard" },
  { to: "/affiliates", icon: Users, label: "Affiliates" },
];

export function Sidebar() {
  return (
    <aside className="hidden lg:flex flex-col w-64 shrink-0 border-r border-white/5 bg-bg-primary/40 px-3 py-5 sticky top-16 h-[calc(100vh-4rem)]">
      <nav className="flex flex-col gap-1">
        {ITEMS.map((it) => (
          <NavLink
            key={it.to}
            to={it.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${
                isActive
                  ? "bg-accent-gradient text-white shadow-glow-sm"
                  : "text-text-secondary hover:text-white hover:bg-white/5"
              }`
            }
          >
            <it.icon size={18} />
            {it.label}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto flex flex-col gap-2 pt-4 border-t border-white/5">
        <button className="btn-ghost flex items-center gap-2 text-sm">
          <Globe size={16} /> EN / Language
        </button>
        <button className="btn-ghost flex items-center gap-2 text-sm">
          <MessageCircle size={16} /> Live support
        </button>
        <div className="text-[10px] text-text-secondary/70 leading-relaxed mt-2">
          Demo Mode — Play Money Only
          <br />
          Not real gambling. 18+
        </div>
      </div>
    </aside>
  );
}
