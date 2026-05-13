import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, TrendingUp } from "lucide-react";
import { useWalletStore } from "@/store/walletStore";
import { formatMoney } from "@/lib/format";
import { playSfx } from "@/lib/sound";
import { fireConfetti } from "@/lib/confetti";
import {
  settleLimbo,
  limboWinChance,
  MIN_TARGET,
  MAX_TARGET,
} from "@/games/limbo/engine";

const BET_PRESETS = [10, 100, 500, 1000, 5000];
const MAX_BET = 5000;

export default function Limbo() {
  const balance = useWalletStore((s) => s.balance);
  const placeBet = useWalletStore((s) => s.bet);
  const winCoins = useWalletStore((s) => s.win);
  const pushHistory = useWalletStore((s) => s.pushHistory);
  const currency = useWalletStore((s) => s.currency);
  const fmt = (n: number) => formatMoney(n, currency);

  const [bet, setBet] = useState(100);
  const [target, setTarget] = useState(2);
  const [busy, setBusy] = useState(false);
  const [roll, setRoll] = useState<number | null>(null);
  const [winLast, setWinLast] = useState<boolean | null>(null);
  const animRef = useRef<number | null>(null);

  const winChance = limboWinChance(target);
  const potential = bet * target;

  function play() {
    if (busy) return;
    if (balance < bet) return;
    const ok = placeBet("limbo", bet);
    if (!ok) return;
    setBusy(true);
    setWinLast(null);

    const result = settleLimbo(bet, target);

    // Animate from a low number up to the final roll value
    const start = performance.now();
    const duration = 1200;
    playSfx("spin");

    const tick = (t: number) => {
      const elapsed = t - start;
      const p = Math.min(1, elapsed / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      const cur = 1 + (result.roll - 1) * eased;
      setRoll(cur);
      if (p < 1) {
        animRef.current = requestAnimationFrame(tick);
      } else {
        setRoll(result.roll);
        setWinLast(result.win);
        setBusy(false);
        if (result.win) {
          winCoins("limbo", result.payout);
          if (target >= 5) {
            playSfx("bigWin");
            fireConfetti(target >= 50 ? "big" : "small");
          } else {
            playSfx("win");
          }
        } else {
          playSfx("lose");
        }
        pushHistory({
          game: "Limbo",
          bet,
          result: result.payout,
          net: result.payout - bet,
        });
      }
    };
    animRef.current = requestAnimationFrame(tick);
  }

  function setTargetSafe(n: number) {
    if (busy) return;
    const t = Math.min(MAX_TARGET, Math.max(MIN_TARGET, n));
    setTarget(Number(t.toFixed(2)));
  }

  return (
    <div className="px-4 lg:px-6 py-4 grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-4">
      <div
        className="rounded-3xl p-4 sm:p-6 lg:p-8 border border-white/5 relative overflow-hidden"
        style={{
          background:
            "radial-gradient(ellipse at top, #1B1F3A 0%, #0F1226 60%, #07091A 100%)",
        }}
      >
        <div className="flex items-baseline gap-3 mb-4">
          <h1 className="heading text-2xl sm:text-3xl">Limbo</h1>
          <div className="text-text-secondary text-sm">
            Pick a target. Roll above it to win bet × target. 1% house edge.
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_240px] gap-6">
          <div className="rounded-2xl bg-black/30 p-8 border border-white/5 flex flex-col items-center justify-center min-h-[300px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={busy ? "busy" : winLast === null ? "idle" : winLast ? "win" : "lose"}
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4 }}
                className={`text-7xl sm:text-8xl lg:text-9xl font-black tracking-tight ${
                  winLast === true
                    ? "text-win"
                    : winLast === false
                      ? "text-rose-400"
                      : "text-white"
                }`}
                style={{
                  textShadow:
                    winLast === true
                      ? "0 0 30px rgba(0,230,118,0.6)"
                      : winLast === false
                        ? "0 0 30px rgba(255,59,107,0.45)"
                        : "0 0 24px rgba(123,97,255,0.5)",
                }}
              >
                {(roll ?? target).toFixed(2)}×
              </motion.div>
            </AnimatePresence>
            <div className="text-text-secondary text-sm mt-3 flex items-center gap-2">
              <TrendingUp size={14} className="text-accent-light" /> Target:{" "}
              <span className="font-bold text-white">{target.toFixed(2)}×</span>
              <span className="text-text-secondary/70">
                · win chance {(winChance * 100).toFixed(2)}%
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <div className="card-base p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] uppercase tracking-wider text-text-secondary">
                  Target ×
                </span>
                <span className="text-[10px] text-text-secondary">
                  {(winChance * 100).toFixed(2)}% win
                </span>
              </div>
              <input
                type="number"
                step="0.01"
                min={MIN_TARGET}
                max={MAX_TARGET}
                value={target}
                onChange={(e) => setTargetSafe(Number(e.target.value) || MIN_TARGET)}
                disabled={busy}
                className="w-full bg-bg-elevated rounded-lg px-3 py-2 outline-none border border-white/5 focus:border-accent/50 disabled:opacity-50"
              />
              <div className="flex flex-wrap gap-1 mt-2">
                {[1.5, 2, 5, 10, 100, 1000].map((t) => (
                  <button
                    key={t}
                    onClick={() => setTargetSafe(t)}
                    disabled={busy}
                    className="px-2 py-1 rounded-md text-xs font-semibold bg-bg-elevated hover:bg-accent/20 transition disabled:opacity-40"
                  >
                    {t < 100 ? `${t}×` : `${t}×`}
                  </button>
                ))}
              </div>
            </div>

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
                <button
                  onClick={() => setBet((b) => Math.max(1, Math.floor(b / 2)))}
                  disabled={busy}
                  className="px-2 py-1 rounded-md text-xs font-semibold bg-bg-elevated hover:bg-accent/20 transition disabled:opacity-40"
                >
                  ½
                </button>
                <button
                  onClick={() => setBet((b) => Math.min(MAX_BET, b * 2))}
                  disabled={busy}
                  className="px-2 py-1 rounded-md text-xs font-semibold bg-bg-elevated hover:bg-accent/20 transition disabled:opacity-40"
                >
                  2×
                </button>
              </div>
            </div>

            <div className="card-base p-3 space-y-1.5 text-sm">
              <Stat label="Balance" value={fmt(balance)} />
              <Stat label="Win pays" value={fmt(potential)} highlight />
              <Stat
                label="Profit on win"
                value={fmt(potential - bet)}
              />
            </div>

            <button
              onClick={play}
              disabled={busy || balance < bet}
              className="btn-primary text-base flex items-center justify-center gap-2"
            >
              <Play size={16} /> {busy ? "Rolling..." : "Roll"}
            </button>
          </div>
        </div>
      </div>

      <aside className="card-base p-4">
        <h3 className="heading text-base mb-3">How it works</h3>
        <p className="text-sm text-text-secondary leading-relaxed">
          The server rolls a multiplier with a 99% RTP distribution.
          <br />
          <br />
          If the rolled multiplier is <strong>greater than or equal to</strong>{" "}
          your target, you win <strong>bet × target</strong>. The higher the
          target, the bigger the payout — and the lower the chance.
        </p>
        <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
          {[1.5, 2, 5, 10, 100].map((t) => (
            <div
              key={t}
              className="rounded-md bg-bg-elevated/60 px-2 py-1.5 text-center"
            >
              <div className="font-bold">{t}×</div>
              <div className="text-text-secondary">
                {(limboWinChance(t) * 100).toFixed(2)}%
              </div>
            </div>
          ))}
        </div>
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
