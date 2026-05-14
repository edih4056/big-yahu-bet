import { useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, PiggyBank, RotateCcw } from "lucide-react";
import { useWalletStore } from "@/store/walletStore";
import { formatMoney } from "@/lib/format";
import { playSfx } from "@/lib/sound";
import { fireConfetti } from "@/lib/confetti";
import {
  ChickenEngine,
  DIFFICULTIES,
  chickenLadder,
  MAX_LANES,
  type Difficulty,
} from "@/games/chicken/engine";

const BET_PRESETS = [10, 100, 500, 1000, 5000];
const MAX_BET = 5000;
const VISIBLE_LANES = 8; // how many lanes show on screen at once

const DIFF_COLOR: Record<Difficulty, string> = {
  easy: "#22C55E",
  medium: "#FBBF24",
  hard: "#F97316",
  daredevil: "#EF4444",
};

export default function Chicken() {
  const balance = useWalletStore((s) => s.balance);
  const placeBet = useWalletStore((s) => s.bet);
  const winCoins = useWalletStore((s) => s.win);
  const pushHistory = useWalletStore((s) => s.pushHistory);
  const currency = useWalletStore((s) => s.currency);
  const fmt = (n: number) => formatMoney(n, currency);

  const [bet, setBet] = useState(100);
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const engineRef = useRef<ChickenEngine | null>(null);
  const [, force] = useState(0);
  const refresh = () => force((n) => n + 1);
  const [message, setMessage] = useState<string | null>(
    "Pick a difficulty, set your bet, then cross."
  );

  const eng = engineRef.current;
  const inGame = eng?.status === "playing";
  const finished = eng && eng.status !== "playing";

  const ladder = useMemo(() => chickenLadder(difficulty), [difficulty]);

  function start() {
    if (inGame) return;
    if (balance < bet) {
      setMessage("Not enough coins for that bet.");
      return;
    }
    const ok = placeBet("chicken", bet);
    if (!ok) {
      setMessage("Not enough coins.");
      return;
    }
    engineRef.current = new ChickenEngine(difficulty, bet);
    setMessage("Click 'Cross' to advance.");
    playSfx("chip");
    refresh();
  }

  function cross() {
    if (!eng || eng.status !== "playing") return;
    const r = eng.cross();
    if (r.hit === "car") {
      setMessage(`💥 Splat! You lose ${fmt(bet)}.`);
      playSfx("lose");
      pushHistory({ game: "Chicken", bet, result: 0, net: -bet });
    } else {
      playSfx("click");
      const statusAfter: string = eng.status;
      if (statusAfter === "cashed") {
        // reached the other side
        const payout = eng.potentialPayout();
        winCoins("chicken", payout);
        playSfx("bigWin");
        fireConfetti("big");
        setMessage(`🏁 Reached the far side! +${fmt(payout - bet)}`);
        pushHistory({ game: "Chicken", bet, result: payout, net: payout - bet });
      } else {
        setMessage(
          `Safe! Cash out ${fmt(eng.potentialPayout())} or keep going.`
        );
      }
    }
    refresh();
  }

  function doCashOut() {
    if (!eng || eng.status !== "playing" || eng.level === 0) return;
    const payout = eng.cashOut();
    winCoins("chicken", payout);
    playSfx("win");
    if (payout >= bet * 3) fireConfetti("small");
    setMessage(`💰 Cashed out ${fmt(payout)}`);
    pushHistory({ game: "Chicken", bet, result: payout, net: payout - bet });
    refresh();
  }

  function reset() {
    engineRef.current = null;
    setMessage("Pick a difficulty, set your bet, then cross.");
    refresh();
  }

  const curLevel = eng?.level ?? 0;
  // Show a window of lanes centered around the chicken
  const startLane = Math.max(0, curLevel - 2);
  const visible = Array.from(
    { length: VISIBLE_LANES },
    (_, i) => startLane + i
  ).filter((n) => n < MAX_LANES);

  return (
    <div className="px-4 lg:px-6 py-4 grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-4">
      <div
        className="rounded-3xl p-4 sm:p-6 lg:p-8 border border-white/5"
        style={{
          background:
            "radial-gradient(ellipse at top, #1F2937 0%, #111827 60%, #0A0915 100%)",
        }}
      >
        <div className="flex items-baseline gap-3 mb-4">
          <h1 className="heading text-2xl sm:text-3xl">Chicken</h1>
          <div className="text-text-secondary text-sm">
            Cross the lanes · max {MAX_LANES} · 1% house edge
          </div>
          {eng && (
            <div className="ml-auto flex items-center gap-2 bg-bg-elevated/70 rounded-xl px-3 py-1.5 border border-white/10">
              <span className="text-[10px] uppercase tracking-wider text-text-secondary">
                Mult
              </span>
              <span className="text-lg font-extrabold text-accent-light">
                {eng.currentMultiplier().toFixed(2)}×
              </span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_240px] gap-4">
          <div
            className="rounded-2xl bg-black/40 p-4 border border-white/5"
            style={{
              boxShadow: "inset 0 4px 16px rgba(0,0,0,0.5)",
              minHeight: 220,
            }}
          >
            {/* Top: lane multiplier ladder */}
            <div
              className="grid gap-2 mb-3"
              style={{ gridTemplateColumns: `repeat(${visible.length}, minmax(0, 1fr))` }}
            >
              {visible.map((laneIdx) => {
                const m = ladder[laneIdx];
                const isCurrent = laneIdx === curLevel && inGame;
                const isPast = laneIdx < curLevel;
                return (
                  <div
                    key={laneIdx}
                    className={`text-center text-[10px] font-bold py-1 rounded-md ${
                      isCurrent
                        ? "bg-accent/30 text-accent-light"
                        : isPast
                          ? "bg-emerald-500/15 text-emerald-300"
                          : "bg-bg-elevated/40 text-text-secondary"
                    }`}
                  >
                    {m.toFixed(2)}×
                  </div>
                );
              })}
            </div>

            {/* Road lanes */}
            <div
              className="grid gap-2"
              style={{ gridTemplateColumns: `repeat(${visible.length}, minmax(0, 1fr))` }}
            >
              {visible.map((laneIdx) => {
                const state = eng?.lanes[laneIdx] ?? "hidden";
                const isCurrent = laneIdx === curLevel && inGame;
                const isFar = laneIdx === MAX_LANES - 1;
                return (
                  <Lane
                    key={laneIdx}
                    state={state}
                    isCurrent={isCurrent}
                    showChicken={isCurrent || (laneIdx === curLevel && !inGame)}
                    finalLane={isFar}
                  />
                );
              })}
            </div>

            {/* Status bar */}
            <AnimatePresence>
              {message && (
                <motion.div
                  key={message}
                  initial={{ y: 6, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="mt-4 text-center"
                >
                  <div className="inline-block px-4 py-1.5 rounded-full bg-black/50 backdrop-blur text-sm font-semibold border border-white/10">
                    {message}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="flex flex-col gap-3">
            <div className="card-base p-3">
              <div className="text-[10px] uppercase tracking-wider text-text-secondary mb-2">
                Difficulty
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                {(Object.keys(DIFFICULTIES) as Difficulty[]).map((d) => {
                  const cfg = DIFFICULTIES[d];
                  const active = d === difficulty;
                  return (
                    <button
                      key={d}
                      onClick={() => !inGame && setDifficulty(d)}
                      disabled={!!inGame}
                      className={`px-2.5 py-2 rounded-lg border text-xs font-bold transition text-left ${
                        active
                          ? "border-accent bg-accent/15 shadow-glow-sm"
                          : "border-white/10 bg-bg-elevated hover:bg-bg-card"
                      }`}
                      style={active ? { borderColor: DIFF_COLOR[d] } : undefined}
                    >
                      <div style={{ color: active ? DIFF_COLOR[d] : "white" }}>
                        {cfg.label}
                      </div>
                      <div className="text-[9px] text-text-secondary">
                        {Math.round(cfg.safeChance * 100)}% safe
                      </div>
                    </button>
                  );
                })}
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
                disabled={!!inGame}
                className="w-full bg-bg-elevated rounded-lg px-3 py-2 outline-none border border-white/5 focus:border-accent/50 disabled:opacity-50"
              />
              <div className="flex flex-wrap gap-1 mt-2">
                {BET_PRESETS.map((p) => (
                  <button
                    key={p}
                    onClick={() => setBet(p)}
                    disabled={!!inGame}
                    className="px-2 py-1 rounded-md text-xs font-semibold bg-bg-elevated hover:bg-accent/20 transition disabled:opacity-40"
                  >
                    {p >= 1000 ? `${p / 1000}K` : p}
                  </button>
                ))}
              </div>
            </div>

            <div className="card-base p-3 space-y-1.5 text-sm">
              <Stat label="Balance" value={fmt(balance)} />
              {eng && (
                <>
                  <Stat
                    label="Potential"
                    value={fmt(eng.potentialPayout())}
                    highlight
                  />
                  <Stat
                    label="Next ×"
                    value={
                      curLevel >= MAX_LANES ? "MAX" : `${eng.nextMultiplier().toFixed(2)}×`
                    }
                  />
                </>
              )}
            </div>

            {!inGame && (
              <button
                onClick={start}
                disabled={balance < bet}
                className="btn-primary text-base flex items-center justify-center gap-2"
              >
                <Play size={16} /> {finished ? "Play again" : "Bet"}
              </button>
            )}

            {inGame && (
              <>
                <button
                  onClick={cross}
                  className="px-5 py-3 rounded-2xl bg-accent-gradient text-white font-extrabold shadow-glow hover:scale-[1.03] active:scale-95 transition flex items-center justify-center gap-2"
                >
                  Cross ▶
                </button>
                {eng && eng.level > 0 && (
                  <button
                    onClick={doCashOut}
                    className="px-5 py-3 rounded-2xl bg-gold-gradient text-black font-extrabold shadow-glow-gold hover:scale-[1.03] active:scale-95 transition flex items-center justify-center gap-2"
                  >
                    <PiggyBank size={18} /> Cash out {fmt(eng.potentialPayout())}
                  </button>
                )}
              </>
            )}

            {finished && (
              <button onClick={reset} className="btn-secondary flex items-center justify-center gap-2">
                <RotateCcw size={14} /> Reset
              </button>
            )}
          </div>
        </div>
      </div>

      <aside className="card-base p-4">
        <h3 className="heading text-base mb-3">Lane Ladder</h3>
        <div className="text-xs text-text-secondary mb-3">
          Cross 1 lane at a time. Each safe crossing compounds your multiplier.
          Get hit by a car → lose your bet.
        </div>
        <div className="space-y-1 max-h-[440px] overflow-y-auto pr-1">
          {ladder.map((m, i) => {
            const lvl = i + 1;
            const reached = (eng?.level ?? 0) >= lvl;
            return (
              <div
                key={lvl}
                className={`flex items-center justify-between text-sm rounded-lg px-3 py-1.5 ${
                  reached ? "bg-emerald-500/10 text-win" : "bg-bg-elevated/60"
                }`}
              >
                <span className="text-text-secondary">Lane {lvl}</span>
                <span className="font-bold">{m.toFixed(2)}×</span>
              </div>
            );
          })}
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

function Lane({
  state,
  isCurrent,
  showChicken,
  finalLane,
}: {
  state: "hidden" | "safe" | "car";
  isCurrent: boolean;
  showChicken: boolean;
  finalLane: boolean;
}) {
  const isSafe = state === "safe";
  const isCar = state === "car";
  return (
    <div
      className={`h-20 sm:h-24 rounded-xl border-2 flex items-center justify-center text-3xl transition relative overflow-hidden ${
        isCar
          ? "bg-rose-500/25 border-rose-400/60 shadow-[0_0_20px_rgba(255,59,107,0.5)]"
          : isSafe
            ? "bg-emerald-500/15 border-emerald-400/40"
            : isCurrent
              ? "border-accent bg-accent/10 shadow-glow-sm"
              : "border-white/10 bg-bg-elevated/40"
      }`}
    >
      {/* Road markings */}
      <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-1 bg-white/15 rounded" />
      {isCar ? (
        <span aria-hidden>🚗</span>
      ) : isSafe ? (
        <span aria-hidden>✓</span>
      ) : showChicken ? (
        <motion.span
          animate={isCurrent ? { y: [0, -3, 0] } : undefined}
          transition={{ duration: 0.9, repeat: isCurrent ? Infinity : 0 }}
          aria-hidden
        >
          🐔
        </motion.span>
      ) : finalLane ? (
        <span className="text-xs uppercase tracking-wider text-gold/80">Finish</span>
      ) : null}
    </div>
  );
}
