import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, ArrowUp, ArrowDown } from "lucide-react";
import { useWalletStore } from "@/store/walletStore";
import { formatMoney } from "@/lib/format";
import { playSfx } from "@/lib/sound";
import { fireConfetti } from "@/lib/confetti";
import {
  diceMultiplier,
  diceWinChance,
  settleDice,
  type Direction,
} from "@/games/dice/engine";

const BET_PRESETS = [10, 100, 500, 1000, 5000];
const MAX_BET = 5000;

export default function Dice() {
  const balance = useWalletStore((s) => s.balance);
  const placeBet = useWalletStore((s) => s.bet);
  const winCoins = useWalletStore((s) => s.win);
  const pushHistory = useWalletStore((s) => s.pushHistory);
  const currency = useWalletStore((s) => s.currency);
  const fmt = (n: number) => formatMoney(n, currency);

  const [bet, setBet] = useState(100);
  const [dir, setDir] = useState<Direction>("over");
  const [threshold, setThreshold] = useState(50);
  const [busy, setBusy] = useState(false);
  const [roll, setRoll] = useState<number | null>(null);
  const [winLast, setWinLast] = useState<boolean | null>(null);
  const animRef = useRef<number | null>(null);

  const wc = diceWinChance(threshold, dir);
  const mult = diceMultiplier(threshold, dir);
  const potential = bet * mult;

  function play() {
    if (busy) return;
    if (balance < bet) return;
    const ok = placeBet("dice", bet);
    if (!ok) return;
    setBusy(true);
    setWinLast(null);
    const result = settleDice(bet, threshold, dir);
    playSfx("spin");

    // animate the rolling number
    const start = performance.now();
    const dur = 900;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      const cur = result.roll * eased + (Math.random() * 100 * (1 - eased));
      setRoll(Math.round(cur * 100) / 100);
      if (p < 1) {
        animRef.current = requestAnimationFrame(tick);
      } else {
        setRoll(result.roll);
        setWinLast(result.win);
        setBusy(false);
        if (result.win) {
          winCoins("dice", result.payout);
          if (mult >= 5) {
            playSfx("bigWin");
            fireConfetti(mult >= 20 ? "big" : "small");
          } else {
            playSfx("win");
          }
        } else {
          playSfx("lose");
        }
        pushHistory({
          game: "Dice",
          bet,
          result: result.payout,
          net: result.payout - bet,
        });
      }
    };
    animRef.current = requestAnimationFrame(tick);
  }

  // Visual: a horizontal slider from 0 to 100 with a colored win zone
  const winZoneStart = dir === "over" ? threshold : 0;
  const winZoneEnd = dir === "over" ? 100 : threshold;

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
          <h1 className="heading text-2xl sm:text-3xl">Dice</h1>
          <div className="text-text-secondary text-sm">
            Roll over/under a target. 1% house edge.
          </div>
        </div>

        <div className="rounded-2xl bg-black/30 p-6 border border-white/5 mb-4">
          {/* Big roll display */}
          <div className="text-center mb-6 min-h-[110px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={busy ? "busy" : winLast === null ? "idle" : winLast ? "win" : "lose"}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={`text-6xl sm:text-7xl font-black tracking-tight ${
                  winLast === true
                    ? "text-win"
                    : winLast === false
                      ? "text-rose-400"
                      : "text-white"
                }`}
                style={{
                  textShadow:
                    winLast === true
                      ? "0 0 24px rgba(0,230,118,0.5)"
                      : winLast === false
                        ? "0 0 24px rgba(255,59,107,0.45)"
                        : "0 0 18px rgba(123,97,255,0.45)",
                }}
              >
                {(roll ?? 50).toFixed(2)}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Slider with win zone */}
          <div className="relative h-3 rounded-full bg-rose-500/40 overflow-hidden">
            <div
              className="absolute top-0 bottom-0 bg-emerald-500/70"
              style={{
                left: `${winZoneStart}%`,
                width: `${winZoneEnd - winZoneStart}%`,
              }}
            />
            {roll !== null && (
              <div
                className="absolute -top-1.5 w-6 h-6 -translate-x-1/2 rounded-full bg-white shadow-glow-sm border-2"
                style={{
                  left: `${roll}%`,
                  borderColor:
                    winLast === true ? "#00E676" : winLast === false ? "#FF3B6B" : "#7B61FF",
                }}
              />
            )}
          </div>
          <div className="flex justify-between mt-2 text-[10px] uppercase tracking-wider text-text-secondary">
            <span>0</span>
            <span>25</span>
            <span>50</span>
            <span>75</span>
            <span>100</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_240px] gap-3">
          <div className="card-base p-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] uppercase tracking-wider text-text-secondary">
                Threshold ({dir})
              </span>
              <span className="text-[10px] text-text-secondary">
                {threshold.toFixed(2)} · {(wc * 100).toFixed(2)}% win
              </span>
            </div>
            <input
              type="range"
              min={1}
              max={99}
              step={0.01}
              value={threshold}
              onChange={(e) => !busy && setThreshold(Number(e.target.value))}
              disabled={busy}
              className="w-full accent-accent"
            />
            <div className="flex gap-1 mt-2">
              <button
                onClick={() => setDir("over")}
                disabled={busy}
                className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded-md text-xs font-semibold transition ${
                  dir === "over"
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                    : "bg-bg-elevated text-text-secondary hover:bg-bg-card"
                }`}
              >
                <ArrowUp size={12} /> Roll over
              </button>
              <button
                onClick={() => setDir("under")}
                disabled={busy}
                className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded-md text-xs font-semibold transition ${
                  dir === "under"
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                    : "bg-bg-elevated text-text-secondary hover:bg-bg-card"
                }`}
              >
                <ArrowDown size={12} /> Roll under
              </button>
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

            <div className="card-base p-3 space-y-1.5 text-sm">
              <Stat label="Multiplier" value={`${mult.toFixed(4)}×`} highlight />
              <Stat label="Profit on win" value={fmt(potential - bet)} />
              <Stat label="Balance" value={fmt(balance)} />
            </div>

            <button
              onClick={play}
              disabled={busy || balance < bet}
              className="btn-primary text-base flex items-center justify-center gap-2"
            >
              <Play size={16} /> {busy ? "Rolling..." : "Roll dice"}
            </button>
          </div>
        </div>
      </div>

      <aside className="card-base p-4">
        <h3 className="heading text-base mb-3">How it works</h3>
        <p className="text-sm text-text-secondary leading-relaxed">
          The server rolls a number 0.00 – 100.00. Choose whether the roll will
          land <strong>above</strong> or <strong>below</strong> your threshold.
          Your win chance and payout always satisfy{" "}
          <code>mult × p ≈ 0.99</code>.
        </p>
      </aside>
    </div>
  );
}

function Stat({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex justify-between">
      <span className="text-text-secondary">{label}</span>
      <span
        className={`font-semibold ${highlight ? "text-accent-light" : "text-white"}`}
      >
        {value}
      </span>
    </div>
  );
}
