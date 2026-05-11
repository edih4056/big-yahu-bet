import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import type { GameDef } from "@/lib/games";

const BADGE_STYLES: Record<string, string> = {
  HOT: "bg-rose-500/90 text-white",
  NEW: "bg-emerald-500/90 text-white",
  POPULAR: "bg-accent text-white",
};

export function GameCard({ game }: { game: GameDef }) {
  const inner = (
    <motion.div
      whileHover={{ scale: game.available ? 1.04 : 1.02 }}
      transition={{ type: "spring", stiffness: 300, damping: 22 }}
      className="group relative w-44 sm:w-48 shrink-0 aspect-[3/4] rounded-2xl overflow-hidden cursor-pointer border border-white/5"
      style={{ background: game.cover.gradient }}
    >
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.4), transparent 50%)",
        }}
      />

      <div className="absolute inset-x-0 top-0 p-3 flex items-start justify-between">
        {game.badge && (
          <span
            className={`badge ${BADGE_STYLES[game.badge]} shadow-lg`}
          >
            {game.badge}
          </span>
        )}
        {!game.available && (
          <span className="badge bg-black/60 text-white/80 ml-auto">
            SOON
          </span>
        )}
      </div>

      <div className="absolute inset-0 flex items-center justify-center">
        <div
          className="text-6xl drop-shadow-[0_4px_18px_rgba(0,0,0,0.5)]"
          aria-hidden
        >
          {game.cover.icon}
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/85 via-black/40 to-transparent">
        <div className="text-[10px] uppercase tracking-wider text-white/60 font-semibold">
          {game.provider}
        </div>
        <div className="font-bold text-sm leading-tight">{game.title}</div>
      </div>

      {game.available && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition pointer-events-none">
          <div className="btn-primary text-sm">PLAY NOW</div>
        </div>
      )}
    </motion.div>
  );

  if (!game.available)
    return (
      <div className="opacity-70 cursor-not-allowed pointer-events-none">
        {inner}
      </div>
    );
  return (
    <Link to={`/play/${game.slug}`} className="block">
      {inner}
    </Link>
  );
}
