import { motion } from "framer-motion";
import type { Card as TCard } from "./engine";

export function PlayingCard({
  card,
  delay = 0,
}: {
  card: TCard;
  delay?: number;
}) {
  const isRed = card.suit === "♥" || card.suit === "♦";
  return (
    <motion.div
      initial={{ rotateY: 180, x: 200, y: -120, opacity: 0 }}
      animate={{ rotateY: card.hidden ? 180 : 0, x: 0, y: 0, opacity: 1 }}
      transition={{
        delay,
        duration: 0.45,
        type: "spring",
        stiffness: 280,
        damping: 24,
      }}
      style={{ perspective: 800 }}
      className="relative w-[68px] h-[96px] sm:w-[80px] sm:h-[112px]"
    >
      <div
        className="absolute inset-0 rounded-lg"
        style={{
          transformStyle: "preserve-3d",
          transform: card.hidden ? "rotateY(180deg)" : "rotateY(0)",
          transition: "transform 0.5s",
        }}
      >
        {/* Front */}
        <div
          className="absolute inset-0 rounded-lg bg-white shadow-lg flex flex-col p-1.5"
          style={{ backfaceVisibility: "hidden" }}
        >
          <div
            className={`text-sm font-bold leading-none ${
              isRed ? "text-rose-600" : "text-slate-900"
            }`}
          >
            {card.rank}
          </div>
          <div
            className={`text-xs leading-none ${isRed ? "text-rose-600" : "text-slate-900"}`}
          >
            {card.suit}
          </div>
          <div
            className={`flex-1 flex items-center justify-center text-3xl ${
              isRed ? "text-rose-600" : "text-slate-900"
            }`}
          >
            {card.suit}
          </div>
          <div
            className={`text-sm font-bold leading-none rotate-180 self-end ${
              isRed ? "text-rose-600" : "text-slate-900"
            }`}
          >
            {card.rank}
            <span className="ml-0.5">{card.suit}</span>
          </div>
        </div>
        {/* Back */}
        <div
          className="absolute inset-0 rounded-lg shadow-lg"
          style={{
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
            background:
              "linear-gradient(135deg, #2C0F6B 0%, #7B61FF 50%, #C26BFF 100%)",
          }}
        >
          <div className="absolute inset-1 rounded-md border-2 border-white/30 flex items-center justify-center">
            <div className="text-2xl gold-text font-extrabold">Y</div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
