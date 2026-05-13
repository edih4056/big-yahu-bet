import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play } from "lucide-react";
import { useWalletStore } from "@/store/walletStore";
import { formatMoney } from "@/lib/format";
import { playSfx } from "@/lib/sound";
import { fireConfetti } from "@/lib/confetti";
import {
  settleCoin,
  COIN_FLIP_MULTIPLIER,
  type CoinSide,
} from "@/games/coinflip/engine";

const BET_PRESETS = [10, 100, 500, 1000, 5000];
const MAX_BET = 5000;

export default function CoinFlip() {
  const balance = useWalletStore((s) => s.balance);
  const placeBet = useWalletStore((s) => s.bet);
  const winCoins = useWalletStore((s) => s.win);
  const pushHistory = useWalletStore((s) => s.pushHistory);
  const currency = useWalletStore((s) => s.currency);
  const fmt = (n: number) => formatMoney(n, currency);

  const [bet, setBet] = useState(100);
  const [pick, setPick] = useState<CoinSide>("heads");
  const [busy, setBusy] = useState(false);
  const [landed, setLanded] = useState<CoinSide | null>(null);
  const [winLast, setWinLast] = useState<boolean | null>(null);
  const [streak, setStreak] = useState<CoinSide[]>([]);
  const animFlipsRef = useRef(0);

  function flip() {
    if (busy || balance < bet) return;
    const ok = placeBet("coin-flip", bet);
    if (!ok) return;
    setBusy(true);
    setWinLast(null);
    const r = settleCoin(bet, pick);
    playSfx("chip");

    // animate ~6 quick flips before settling on the final side
    let count = 0;
    const total = 8;
    animFlipsRef.current = window.setInterval(() => {
      count++;
      setLanded(count % 2 === 0 ? "heads" : "tails");
      if (count >= total) {
        clearInterval(animFlipsRef.current);
        setLanded(r.landed);
        setWinLast(r.win);
        setBusy(false);
        setStreak((s) => [r.landed, ...s].slice(0, 20));
        if (r.win) {
          winCoins("coin-flip", r.payout);
          playSfx("win");
          fireConfetti("small");
        } else {
          playSfx("lose");
        }
        pushHistory({
          game: "Coin Flip",
          bet,
          result: r.payout,
          net: r.payout - bet,
        });
      }
    }, 80);
  }

  return (
    <div className="px-4 lg:px-6 py-4 grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-4">
      <div
        className="rounded-3xl p-4 sm:p-6 lg:p-8 border border-white/5"
        style={{
          background:
            "radial-gradient(ellipse at top, #1B1F3A 0%, #0F1226 60%, #07091A 100%)",
        }}
      >
        <div className="flex items-baseline gap-3 mb-4">
          <h1 className="heading text-2xl sm:text-3xl">Coin Flip</h1>
          <div className="text-text-secondary text-sm">
            Heads or tails. Wins pay {COIN_FLIP_MULTIPLIER.toFixed(2)}×.
          </div>
        </div>

        <div className="rounded-2xl bg-black/30 p-8 border border-white/5 mb-4 flex flex-col items-center justify-center min-h-[260px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={landed ?? "idle"}
              initial={{ rotateY: 0, scale: 0.85, opacity: 0 }}
              animate={{ rotateY: busy ? 360 : 0, scale: 1, opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: busy ? 0.12 : 0.35 }}
              className="w-32 h-32 sm:w-40 sm:h-40 rounded-full flex items-center justify-center text-5xl sm:text-6xl font-black shadow-glow"
              style={{
                background:
                  landed === "tails"
                    ? "radial-gradient(circle at 35% 30%, #FFE15A, #B45309)"
                    : "radial-gradient(circle at 35% 30%, #E5E7EB, #6B7280)",
                color: landed === "tails" ? "#1F1300" : "#0F0E1A",
                textShadow: "0 1px 0 rgba(255,255,255,0.4)",
              }}
            >
              {landed === "tails" ? "T" : landed === "heads" ? "H" : "?"}
            </motion.div>
          </AnimatePresence>

          <div className="mt-4 text-sm">
            {winLast === true && (
              <span className="text-win font-semibold">
                ✓ {landed?.toUpperCase()} — You win {fmt(bet * COIN_FLIP_MULTIPLIER)}
              </span>
            )}
            {winLast === false && (
              <span className="text-rose-300 font-semibold">
                ✗ {landed?.toUpperCase()} — Lost {fmt(bet)}
              </span>
            )}
            {winLast === null && !busy && (
              <span className="text-text-secondary">
                Pick a side and flip.
              </span>
            )}
            {busy && <span className="text-text-secondary">Flipping...</span>}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_240px] gap-3">
          <div className="card-base p-3">
            <div className="text-[10px] uppercase tracking-wider text-text-secondary mb-2">
              Your pick
            </div>
            <div className="grid grid-cols-2 gap-2">
              {(["heads", "tails"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => !busy && setPick(s)}
                  disabled={busy}
                  className={`px-3 py-3 rounded-xl font-extrabold uppercase tracking-wider text-sm border-2 transition ${
                    pick === s
                      ? "border-accent bg-accent/20 shadow-glow-sm"
                      : "border-white/10 bg-bg-elevated hover:bg-bg-card"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <div className="card-base p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] uppercase tracking-wider text-text-secondary">
                  Bet
                </span>
                <span className="text-[10px] text-text-secondary">{fmt(bet)}</span>
              </div>
              <input
                type="number"
                value={bet}
                onChange={(e) =>
                  setBet(
                    Math.min(MAX_BET, Math.max(1, Math.floor(Number(e.target.value) || 1)))
                  )
                }
                disabled={busy}
                className="w-full bg-bg-elevated rounded-lg px-3 py-2 outline-none border border-white/5 focus:border-accent/50 disabled:opacity-50"
              />
              <div className="flex flex-wrap gap-1 mt-2">
                {BET_PRESETS.map((p) => (
                  <button
                    key={p}
                    onClick={() => setBet(p)}
                    disabled={busy}
                    className="px-2 py-1 rounded-md text-xs font-semibold bg-bg-elevated hover:bg-accent/20 transition disabled:opacity-40"
                  >
                    {p >= 1000 ? `${p / 1000}K` : p}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={flip}
              disabled={busy || balance < bet}
              className="btn-primary text-base flex items-center justify-center gap-2"
            >
              <Play size={16} /> {busy ? "Flipping..." : "Flip"}
            </button>
          </div>
        </div>
      </div>

      <aside className="card-base p-4">
        <h3 className="heading text-base mb-3">Recent flips</h3>
        {streak.length === 0 ? (
          <div className="text-sm text-text-secondary py-4 text-center">
            No flips yet.
          </div>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {streak.map((s, i) => (
              <span
                key={i}
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-extrabold ${
                  s === "tails"
                    ? "bg-amber-300 text-black"
                    : "bg-slate-200 text-black"
                }`}
              >
                {s === "tails" ? "T" : "H"}
              </span>
            ))}
          </div>
        )}
      </aside>
    </div>
  );
}
