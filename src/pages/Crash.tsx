import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, PiggyBank, Rocket } from "lucide-react";
import { useWalletStore } from "@/store/walletStore";
import { formatMoney } from "@/lib/format";
import { playSfx } from "@/lib/sound";
import { fireConfetti } from "@/lib/confetti";
import { rollCrashPoint, settleCrash, crashWinChance } from "@/games/crash/engine";

const BET_PRESETS = [10, 100, 500, 1000, 5000];
const MAX_BET = 5000;
// How fast the multiplier climbs: m(t) = e^(t × GROWTH)
const GROWTH = 0.12; // exponent per second

export default function Crash() {
  const balance = useWalletStore((s) => s.balance);
  const placeBet = useWalletStore((s) => s.bet);
  const winCoins = useWalletStore((s) => s.win);
  const pushHistory = useWalletStore((s) => s.pushHistory);
  const currency = useWalletStore((s) => s.currency);
  const fmt = (n: number) => formatMoney(n, currency);

  const [bet, setBet] = useState(100);
  const [autoCashout, setAutoCashout] = useState<number | null>(2);
  const [phase, setPhase] = useState<"idle" | "running" | "crashed" | "cashed">(
    "idle"
  );
  const [mult, setMult] = useState(1);
  const [history, setHistory] = useState<number[]>([]);

  const crashAtRef = useRef<number>(1);
  const cashedAtRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);
  const startedAtRef = useRef<number>(0);

  function start() {
    if (phase === "running") return;
    if (balance < bet) return;
    const ok = placeBet("crash", bet);
    if (!ok) return;
    crashAtRef.current = rollCrashPoint();
    cashedAtRef.current = null;
    setMult(1);
    setPhase("running");
    startedAtRef.current = performance.now();
    playSfx("spin");
    loop();
  }

  function loop() {
    rafRef.current = requestAnimationFrame((t) => {
      const elapsed = (t - startedAtRef.current) / 1000;
      const m = Math.exp(elapsed * GROWTH);
      const crashAt = crashAtRef.current;

      // Auto cash-out check (only if user hasn't manually cashed)
      if (cashedAtRef.current === null && autoCashout && m >= autoCashout) {
        cashedAtRef.current = autoCashout;
        finalize(autoCashout, crashAt);
        return;
      }

      if (m >= crashAt) {
        setMult(crashAt);
        finalize(cashedAtRef.current, crashAt);
        return;
      }

      setMult(m);
      loop();
    });
  }

  function cashOut() {
    if (phase !== "running") return;
    cashedAtRef.current = mult;
    finalize(mult, crashAtRef.current);
  }

  function finalize(cashedAt: number | null, crashAt: number) {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    const outcome = settleCrash(bet, cashedAt, crashAt);
    setHistory((h) => [crashAt, ...h].slice(0, 20));
    pushHistory({
      game: "Crash",
      bet,
      result: outcome.payout,
      net: outcome.payout - bet,
    });
    if (outcome.win) {
      winCoins("crash", outcome.payout);
      setPhase("cashed");
      if ((cashedAt ?? 0) >= 5) {
        playSfx("bigWin");
        fireConfetti((cashedAt ?? 0) >= 20 ? "big" : "small");
      } else {
        playSfx("win");
      }
    } else {
      setPhase("crashed");
      playSfx("lose");
    }
  }

  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const inGame = phase === "running";
  const finished = phase === "crashed" || phase === "cashed";
  const cashedAt = cashedAtRef.current;
  const crashAt = crashAtRef.current;

  return (
    <div className="px-4 lg:px-6 py-4 grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-4">
      <div
        className="rounded-3xl p-4 sm:p-6 lg:p-8 border border-white/5"
        style={{
          background:
            "radial-gradient(ellipse at top, #0F2A4F 0%, #0A1228 60%, #050816 100%)",
        }}
      >
        <div className="flex items-baseline gap-3 mb-4">
          <h1 className="heading text-2xl sm:text-3xl">Crash</h1>
          <div className="text-text-secondary text-sm">
            Cash out before the rocket crashes. 1% house edge.
          </div>
        </div>

        <div className="rounded-2xl bg-black/40 p-8 border border-white/5 mb-4 relative overflow-hidden min-h-[260px]">
          {/* Rocket trail (only while running) */}
          {phase === "running" && (
            <div
              className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 bg-gradient-to-t from-transparent via-orange-400/30 to-transparent"
              style={{ height: `${Math.min(100, (mult - 1) * 50)}%` }}
            />
          )}
          <div className="text-center relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={
                  phase === "crashed"
                    ? "crashed"
                    : phase === "cashed"
                      ? "cashed"
                      : "running"
                }
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className={`text-7xl sm:text-8xl font-black ${
                  phase === "crashed"
                    ? "text-rose-400"
                    : phase === "cashed"
                      ? "text-win"
                      : "text-white"
                }`}
                style={{
                  textShadow:
                    phase === "crashed"
                      ? "0 0 30px rgba(255,59,107,0.5)"
                      : phase === "cashed"
                        ? "0 0 30px rgba(0,230,118,0.55)"
                        : "0 0 24px rgba(123,97,255,0.55)",
                }}
              >
                {mult.toFixed(2)}×
              </motion.div>
            </AnimatePresence>
            <div className="mt-3 flex items-center justify-center gap-2">
              <Rocket
                size={18}
                className={
                  phase === "running"
                    ? "text-orange-400 animate-pulse"
                    : "text-text-secondary"
                }
              />
              <div className="text-sm text-text-secondary">
                {phase === "idle" && "Ready to launch."}
                {phase === "running" && (
                  <>
                    Climbing… auto cash-out at{" "}
                    <span className="text-accent-light font-semibold">
                      {autoCashout ? `${autoCashout.toFixed(2)}×` : "off"}
                    </span>
                  </>
                )}
                {phase === "crashed" && (
                  <>
                    💥 Crashed at <strong>{crashAt.toFixed(2)}×</strong>.{" "}
                    {cashedAt ? `You cashed at ${cashedAt.toFixed(2)}×` : "You lost"}.
                  </>
                )}
                {phase === "cashed" && (
                  <>
                    🚀 Cashed at <strong>{(cashedAt ?? 0).toFixed(2)}×</strong>{" "}
                    — round crashed at {crashAt.toFixed(2)}×
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_240px] gap-3">
          <div className="card-base p-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] uppercase tracking-wider text-text-secondary">
                Auto cash-out
              </span>
              <span className="text-[10px] text-text-secondary">
                {autoCashout
                  ? `${(crashWinChance(autoCashout) * 100).toFixed(2)}% win chance`
                  : "manual only"}
              </span>
            </div>
            <input
              type="number"
              step="0.01"
              min={1.01}
              placeholder="2.00"
              value={autoCashout ?? ""}
              onChange={(e) => {
                const v = e.target.value === "" ? null : Number(e.target.value);
                setAutoCashout(v && v >= 1.01 ? v : null);
              }}
              disabled={inGame}
              className="w-full bg-bg-elevated rounded-lg px-3 py-2 outline-none border border-white/5 focus:border-accent/50 disabled:opacity-50"
            />
            <div className="flex flex-wrap gap-1 mt-2">
              {[1.5, 2, 3, 5, 10, 50].map((t) => (
                <button
                  key={t}
                  onClick={() => setAutoCashout(t)}
                  disabled={inGame}
                  className="px-2 py-1 rounded-md text-xs font-semibold bg-bg-elevated hover:bg-accent/20 transition disabled:opacity-40"
                >
                  {t}×
                </button>
              ))}
              <button
                onClick={() => setAutoCashout(null)}
                disabled={inGame}
                className="px-2 py-1 rounded-md text-xs font-semibold bg-bg-elevated hover:bg-rose-500/20 transition disabled:opacity-40"
              >
                Off
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
                disabled={inGame}
                className="w-full bg-bg-elevated rounded-lg px-3 py-2 outline-none border border-white/5 focus:border-accent/50 disabled:opacity-50"
              />
              <div className="flex flex-wrap gap-1 mt-2">
                {BET_PRESETS.map((p) => (
                  <button
                    key={p}
                    onClick={() => setBet(p)}
                    disabled={inGame}
                    className="px-2 py-1 rounded-md text-xs font-semibold bg-bg-elevated hover:bg-accent/20 transition disabled:opacity-40"
                  >
                    {p >= 1000 ? `${p / 1000}K` : p}
                  </button>
                ))}
              </div>
            </div>

            {!inGame ? (
              <button
                onClick={start}
                disabled={balance < bet}
                className="btn-primary text-base flex items-center justify-center gap-2"
              >
                <Play size={16} /> {finished ? "Play again" : "Launch"}
              </button>
            ) : (
              <button
                onClick={cashOut}
                className="px-5 py-3 rounded-2xl bg-gold-gradient text-black font-extrabold shadow-glow-gold hover:scale-[1.03] active:scale-95 transition flex items-center justify-center gap-2"
              >
                <PiggyBank size={18} /> Cash out {fmt(bet * mult)}
              </button>
            )}
          </div>
        </div>
      </div>

      <aside className="card-base p-4">
        <h3 className="heading text-base mb-3">Last 20 rounds</h3>
        {history.length === 0 ? (
          <div className="text-sm text-text-secondary py-4 text-center">
            No rounds played yet.
          </div>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {history.map((m, i) => (
              <span
                key={i}
                className={`px-1.5 py-0.5 rounded-md text-xs font-bold ${
                  m >= 10
                    ? "bg-gold/20 text-gold border border-gold/40"
                    : m >= 2
                      ? "bg-win/15 text-win border border-win/30"
                      : "bg-rose-500/15 text-rose-300 border border-rose-500/30"
                }`}
              >
                {m.toFixed(2)}×
              </span>
            ))}
          </div>
        )}
      </aside>
    </div>
  );
}
