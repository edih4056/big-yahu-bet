import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";

const SLIDES = [
  {
    title: "Welcome to Big Yahu Bet",
    sub: "10,000 demo balance to start — no real money, all play.",
    cta: "Browse casino",
    to: "/casino",
    bg: "linear-gradient(135deg, #2C0F6B 0%, #7B61FF 50%, #FF6BD9 100%)",
    icon: "🎰",
  },
  {
    title: "Sizzling Fruits — Now Live",
    sub: "Classic 5-reel fruit slot with neon win lines.",
    cta: "Spin now",
    to: "/play/sizzling-fruits",
    bg: "linear-gradient(135deg, #FF3B6B 0%, #FF8A00 60%, #FFD600 100%)",
    icon: "🍒",
  },
  {
    title: "Blackjack Mock Tournament",
    sub: "Practice your basic strategy at the felt table.",
    cta: "Take a seat",
    to: "/play/blackjack",
    bg: "linear-gradient(135deg, #073D24 0%, #0E5A36 60%, #14A463 100%)",
    icon: "♠",
  },
];

export function HeroCarousel() {
  const [i, setI] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setI((n) => (n + 1) % SLIDES.length), 6000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="mx-4 lg:mx-6 mt-4 relative h-56 sm:h-64 lg:h-72 rounded-2xl overflow-hidden border border-white/5">
      <AnimatePresence mode="wait">
        <motion.div
          key={i}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.6 }}
          className="absolute inset-0"
          style={{ background: SLIDES[i].bg }}
        >
          <div className="absolute inset-0 bg-black/30" />
          <div
            className="absolute -right-10 -bottom-10 text-[260px] opacity-20 pointer-events-none select-none"
            aria-hidden
          >
            {SLIDES[i].icon}
          </div>
          <div className="relative z-10 h-full flex flex-col justify-center px-6 lg:px-12 max-w-2xl">
            <div className="text-xs uppercase tracking-[0.3em] text-white/70 font-semibold mb-2">
              Featured
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold leading-tight drop-shadow">
              {SLIDES[i].title}
            </h1>
            <p className="mt-2 text-white/85 max-w-md">{SLIDES[i].sub}</p>
            <div className="mt-4">
              <Link to={SLIDES[i].to} className="btn-primary inline-block">
                {SLIDES[i].cta}
              </Link>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-2 z-10">
        {SLIDES.map((_, n) => (
          <button
            key={n}
            onClick={() => setI(n)}
            className={`h-1.5 rounded-full transition-all ${
              n === i ? "bg-white w-8" : "bg-white/40 w-3"
            }`}
            aria-label={`Slide ${n + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
