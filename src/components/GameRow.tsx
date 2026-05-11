import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import type { GameDef } from "@/lib/games";
import { GameCard } from "./GameCard";

type Props = {
  title: string;
  viewAllTo?: string;
  games: GameDef[];
};

export function GameRow({ title, viewAllTo, games }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  const scroll = (dir: number) => {
    ref.current?.scrollBy({ left: dir * 480, behavior: "smooth" });
  };

  return (
    <section className="mt-8 first:mt-4">
      <div className="flex items-center mb-3 px-4 lg:px-6">
        <h2 className="heading text-lg sm:text-xl">{title}</h2>
        {viewAllTo && (
          <Link
            to={viewAllTo}
            className="ml-auto text-sm text-text-secondary hover:text-white transition"
          >
            View all →
          </Link>
        )}
        <div className="hidden md:flex items-center gap-1 ml-4">
          <button
            onClick={() => scroll(-1)}
            className="p-1.5 rounded-lg bg-bg-card hover:bg-bg-elevated transition"
            aria-label="Scroll left"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={() => scroll(1)}
            className="p-1.5 rounded-lg bg-bg-card hover:bg-bg-elevated transition"
            aria-label="Scroll right"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
      <div
        ref={ref}
        className="flex gap-3 overflow-x-auto px-4 lg:px-6 pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {games.map((g) => (
          <GameCard key={g.slug} game={g} />
        ))}
      </div>
    </section>
  );
}
