import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import type { GameDef } from "@/lib/games";

const BADGE_STYLES: Record<string, string> = {
  HOT: "bg-rose-500/95 text-white",
  NEW: "bg-emerald-500/95 text-white",
  POPULAR: "bg-accent text-white",
  ORIGINAL: "bg-black/70 text-white border border-white/20",
};

export function GameCard({ game }: { game: GameDef }) {
  const inner = (
    <motion.div
      whileHover={{ scale: game.available ? 1.05 : 1.02, y: game.available ? -2 : 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 22 }}
      className="group relative w-40 sm:w-44 lg:w-48 shrink-0 rounded-2xl overflow-hidden cursor-pointer"
      style={{ background: game.cover.gradient }}
    >
      <div className="aspect-[3/4] relative">
        {/* Subtle radial highlight in upper-left, classic Stake-style illustration look */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(circle at 25% 22%, rgba(255,255,255,0.35), transparent 55%)",
          }}
        />
        {/* Decorative big icon */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className="text-[88px] sm:text-[100px] lg:text-[112px] drop-shadow-[0_6px_24px_rgba(0,0,0,0.5)] -mt-3"
            aria-hidden
          >
            {game.cover.icon}
          </div>
        </div>

        {/* Top badge */}
        <div className="absolute inset-x-0 top-0 p-2.5 flex items-start justify-between">
          {game.badge && (
            <span className={`badge ${BADGE_STYLES[game.badge]} shadow-lg`}>
              {game.badge}
            </span>
          )}
          {!game.available && (
            <span className="badge bg-black/70 text-white/80 ml-auto border border-white/15">
              SOON
            </span>
          )}
        </div>

        {/* Bottom title block */}
        <div className="absolute inset-x-0 bottom-0 p-3 pb-3.5 bg-gradient-to-t from-black/80 via-black/30 to-transparent">
          <div
            className="font-black tracking-tight uppercase leading-[1.05] text-base sm:text-lg lg:text-xl"
            style={{
              textShadow: "0 2px 8px rgba(0,0,0,0.55), 0 0 1px rgba(0,0,0,0.6)",
            }}
          >
            {game.title}
          </div>
          <div className="text-[9px] uppercase tracking-[0.18em] text-white/80 font-bold mt-0.5">
            {game.provider}
          </div>
        </div>

        {/* Hover overlay */}
        {game.available && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/55 opacity-0 group-hover:opacity-100 transition pointer-events-none">
            <div className="px-4 py-2 rounded-full bg-white text-black font-extrabold text-sm tracking-wider">
              PLAY NOW
            </div>
          </div>
        )}
      </div>

      {/* Live count chip below the artwork (Stake style: green dot + N spielen) */}
      {game.livePlayers !== undefined && game.livePlayers > 0 && (
        <div className="px-3 py-1.5 text-[11px] text-white/90 bg-black/40 backdrop-blur-sm flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-medium">
            {game.livePlayers.toLocaleString("de-CH")}
          </span>
          <span className="text-white/55">spielen</span>
        </div>
      )}
    </motion.div>
  );

  if (!game.available)
    return (
      <div className="opacity-80 cursor-not-allowed pointer-events-none">
        {inner}
      </div>
    );
  return (
    <Link
      to={`/play/${game.slug.startsWith("cs-") ? "" : game.slug}`}
      className="block"
    >
      {inner}
    </Link>
  );
}
