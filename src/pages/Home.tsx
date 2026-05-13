import { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  Home as HomeIcon,
  Flame,
  Sparkles,
  Dices,
  Tv2,
  Gamepad2,
} from "lucide-react";
import { HeroCarousel } from "@/components/HeroCarousel";
import { WinsTicker } from "@/components/WinsTicker";
import { GameRow } from "@/components/GameRow";
import { PromoCards } from "@/components/PromoCards";
import { GAMES } from "@/lib/games";

const TABS = [
  { to: "/", icon: HomeIcon, label: "Casino Startseite" },
  { to: "/originals", icon: Flame, label: "Yahu Originals" },
  { to: "/new", icon: Sparkles, label: "Neuerscheinungen" },
  { to: "/slots", icon: Gamepad2, label: "Slots" },
  { to: "/table-games", icon: Dices, label: "Table Games" },
  { to: "/live", icon: Tv2, label: "Live Casino" },
];

export default function Home() {
  const originals = GAMES.filter((g) => g.category === "originals");
  const slots = GAMES.filter((g) => g.category === "slots");
  const tables = GAMES.filter((g) => g.category === "table");
  const live = GAMES.filter((g) => g.category === "live");
  const featured = GAMES.filter((g) => g.available);
  // "Neuerscheinungen" — newly released or upcoming
  const newReleases = GAMES.filter(
    (g) => g.badge === "NEW" || (!g.available && g.category !== "live")
  ).slice(0, 24);

  return (
    <div className="pb-12">
      <HeroCarousel />
      <CategoryTabs />
      <WinsTicker />
      <GameRow title="Yahu Originals" viewAllTo="/originals" games={originals} />
      <GameRow title="Featured Games" viewAllTo="/casino" games={featured} />
      <GameRow title="Slots" viewAllTo="/slots" games={slots} />
      <GameRow title="Table Games" viewAllTo="/table-games" games={tables} />
      <GameRow title="Neuerscheinungen" viewAllTo="/new" games={newReleases} />
      <GameRow title="Live Casino" viewAllTo="/live" games={live} />
      <PromoCards />
    </div>
  );
}

function CategoryTabs() {
  const [overflow, setOverflow] = useState(false);
  void overflow;
  return (
    <div className="mt-4 px-4 lg:px-6">
      <div
        className="flex items-center gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        onScroll={(e) =>
          setOverflow((e.currentTarget.scrollLeft ?? 0) > 4)
        }
      >
        {TABS.map((t) => (
          <NavLink
            key={t.to}
            to={t.to}
            end={t.to === "/"}
            className={({ isActive }) =>
              `shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-semibold transition border ${
                isActive
                  ? "bg-bg-card text-white border-white/15"
                  : "bg-transparent text-text-secondary hover:text-white hover:bg-bg-card/50 border-transparent"
              }`
            }
          >
            <t.icon size={15} />
            {t.label}
          </NavLink>
        ))}
      </div>
    </div>
  );
}
