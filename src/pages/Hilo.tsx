import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUp, ArrowDown, PiggyBank, Play, RotateCcw } from "lucide-react";
import { useWalletStore } from "@/store/walletStore";
import { formatMoney } from "@/lib/format";
import { playSfx } from "@/lib/sound";
import { fireConfetti } from "@/lib/confetti";
import {
  HiloEngine,
  rankLabel,
  stepMultiplier,
  type CardRank,
  type Direction,
} from "@/games/hilo/engine";

const BET_PRESETS = [10, 100, 500, 1000, 5000];
const MAX_BET = 5000;
const SUITS = ["♠", "♥", "♦", "♣"] as const;

export default function Hilo() {
  const balance = useWalletStore((s) => s.balance);
  const placeBet = useWalletStore((s) => s.bet);
  const winCoins = useWalletStore((s) => s.win);
  const pushHistory = useWalletStore((s) => s.pushHistory);
  const currency = useWalletStore((s) => s.currency);
  const fmt = (n: number) => formatMoney(n, currency);

  const [bet, setBet] = useState(100);
  const engineRef = useRef<HiloEngine | null>(null);
  const [, force] = useState(0);
  const refresh = () => force((n) => n + 1);
  const [lastCard, setLastCard] = useState<{ rank: CardRank; suit: string } | null>(null);
  const [busy, setBusy] = useState(false);

  const eng = engineRef.current;
  const inGame = eng?.status === "playing";
  const finished = eng && eng.status !== "playing";

  function start() {
    if (balance < bet) return;
    const ok = placeBet("hilo", bet);
    if (!ok) return;
    engineRef.current = new HiloEngine(bet);
    setLastCard(null);
    playSfx("chip");
    refresh();
  }

  function pick(dir: Direction) {
    if (!eng || eng.status !== "playing" || busy) return;
    setBusy(true);
    const before = eng.current;
    const step = eng.pick(dir);
    playSfx("cardFlip");
    setLastCard({ rank: step.after, suit: SUITS[Math.floor(Math.random() * 4)] });
    void before;
    setTimeout(() => {
      setBusy(false);
      if (!step.correct) {
        playSfx("lose");
        pushHistory({
          game: "Hilo",
          bet: eng.bet,
          result: 0,
          net: -eng.bet,
        });
      }
      refresh();
    }, 400);
  }

  function cashOut() {
    if (!eng || eng.status !== "playing" || eng.steps.length === 0) return;
    const payout = eng.cashOut();
    winCoins("hilo", payout);
    playSfx("win");
    if (payout >= eng.bet * 3) fireConfetti("small");
    pushHistory({
      game: "Hilo",
      bet: eng.bet,
      result: payout,
      net: payout - eng.bet,
    });
    refresh();
  }

  function reset() {
    engineRef.current = null;
    setLastCard(null);
    refresh();
  }

  const current = eng?.current ?? 7;
  const higherChance = eng ? eng.guessChance("higher") : (13 - 7) / 12;
  const lowerChance = eng ? eng.guessChance("lower") : (7 - 1) / 12;
  const higherMult = stepMultiplier(current as CardRank, "higher");
  const lowerMult = stepMultiplier(current as CardRank, "lower");

  return (
    <div className="px-4 lg:px-6 py-4 grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-4">
      <div
        className="rounded-3xl p-4 sm:p-6 lg:p-8 border border-white/5"
        style={{
          background:
            "radial-gradient(ellipse at top, #0E2A1B 0%, #082E1A 60%, #051811 100%)",
        }}
      >
        <div className="flex items-baseline gap-3 mb-4">
          <h1 className="heading text-2xl sm:text-3xl">Hilo</h1>
          <div className="text-text-secondary text-sm">
            Will the next card be higher or lower? Ties lose · 1% house edge.
          </div>
        </div>

        <div className="rounded-2xl bg-black/30 p-6 border border-white/5 mb-4">
          <div className="flex items-end justify-center gap-6 min-h-[170px]">
            {/* Current card */}
            <div className="flex flex-col items-center gap-2">
              <div className="text-[10px] uppercase tracking-wider text-text-secondary">
                Current
              </div>
              <Card rank={current as CardRank} />
            </div>

            {/* Last drawn card */}
            <div className="flex flex-col items-center gap-2">
              <div className="text-[10px] uppercase tracking-wider text-text-secondary">
                Last draw
              </div>
              <AnimatePresence mode="wait">
                {lastCard ? (
                  <motion.div
                    key={`${lastCard.rank}-${lastCard.suit}-${eng?.steps.length}`}
                    initial={{ rotateY: 180, scale: 0.9, opacity: 0 }}
                    animate={{ rotateY: 0, scale: 1, opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.45, type: "spring", stiffness: 260, damping: 22 }}
                  >
                    <Card rank={lastCard.rank} suit={lastCard.suit} />
                  </motion.div>
                ) : (
                  <CardPlaceholder />
                )}
              </AnimatePresence>
            </div>
          </div>

          {eng && (
            <div className="mt-4 text-center text-sm">
              <span className="text-text-secondary">Multiplier:</span>{" "}
              <span className="text-accent-light font-extrabold">
                {eng.multiplier.toFixed(2)}×
              </span>{" "}
              · <span className="text-text-secondary">Potential:</span>{" "}
              <span className="font-bold gold-text">
                {fmt(eng.bet * eng.multiplier)}
              </span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_240px] gap-3">
          <div className="card-base p-3">
            <div className="text-[10px] uppercase tracking-wider text-text-secondary mb-2">
              Pick the next card direction
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => pick("higher")}
                disabled={!inGame || busy}
                className="flex items-center justify-between px-4 py-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 hover:bg-emerald-500/25 transition disabled:opacity-40"
              >
                <span className="flex items-center gap-2 font-bold">
                  <ArrowUp size={16} className="text-emerald-300" /> Higher
                </span>
                <span className="text-emerald-200 font-semibold">
                  {higherMult.toFixed(2)}×
                </span>
              </button>
              <button
                onClick={() => pick("lower")}
                disabled={!inGame || busy}
                className="flex items-center justify-between px-4 py-3 rounded-xl bg-rose-500/15 border border-rose-500/30 hover:bg-rose-500/25 transition disabled:opacity-40"
              >
                <span className="flex items-center gap-2 font-bold">
                  <ArrowDown size={16} className="text-rose-300" /> Lower
                </span>
                <span className="text-rose-200 font-semibold">
                  {lowerMult.toFixed(2)}×
                </span>
              </button>
            </div>
            <div className="text-[10px] text-text-secondary mt-2">
              Higher chance {(higherChance * 100).toFixed(1)}% · Lower chance{" "}
              {(lowerChance * 100).toFixed(1)}%
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

            {!inGame && (
              <button
                onClick={start}
                disabled={balance < bet}
                className="btn-primary text-base flex items-center justify-center gap-2"
              >
                <Play size={16} /> {finished ? "Play again" : "Bet"}
              </button>
            )}

            {inGame && eng && eng.steps.length > 0 && (
              <button
                onClick={cashOut}
                className="px-5 py-3 rounded-2xl bg-gold-gradient text-black font-extrabold shadow-glow-gold hover:scale-[1.03] active:scale-95 transition flex items-center justify-center gap-2"
              >
                <PiggyBank size={18} /> Cash out {fmt(eng.bet * eng.multiplier)}
              </button>
            )}

            {finished && (
              <button onClick={reset} className="btn-secondary flex items-center justify-center gap-2">
                <RotateCcw size={14} /> Reset
              </button>
            )}
          </div>
        </div>

        {finished && eng && (
          <div className="mt-4 text-center">
            <div
              className={`inline-block px-4 py-1.5 rounded-full backdrop-blur text-sm font-semibold border ${
                eng.status === "cashed"
                  ? "bg-emerald-500/15 text-emerald-200 border-emerald-500/30"
                  : "bg-rose-500/15 text-rose-200 border-rose-500/30"
              }`}
            >
              {eng.status === "cashed"
                ? `Cashed out ${fmt(eng.bet * eng.multiplier)}`
                : `Wrong guess! Lost ${fmt(eng.bet)}`}
            </div>
          </div>
        )}
      </div>

      <aside className="card-base p-4">
        <h3 className="heading text-base mb-3">Round history</h3>
        {!eng || eng.steps.length === 0 ? (
          <div className="text-sm text-text-secondary py-4 text-center">
            No guesses yet.
          </div>
        ) : (
          <div className="space-y-1.5 max-h-[400px] overflow-y-auto pr-1">
            {eng.steps.map((s, i) => (
              <div
                key={i}
                className={`flex items-center justify-between text-sm rounded-lg px-3 py-1.5 border ${
                  s.correct
                    ? "bg-emerald-500/10 border-emerald-500/30"
                    : "bg-rose-500/10 border-rose-500/30"
                }`}
              >
                <span className="text-text-secondary">#{i + 1}</span>
                <span className="font-bold">
                  {rankLabel(s.before)} → {rankLabel(s.after)}
                </span>
                <span className="text-[11px] uppercase tracking-wider">
                  {s.dir} {s.correct ? "✓" : "✗"}
                </span>
              </div>
            ))}
          </div>
        )}
      </aside>
    </div>
  );
}

function Card({ rank, suit }: { rank: CardRank; suit?: string }) {
  const s = suit ?? "♠";
  const isRed = s === "♥" || s === "♦";
  return (
    <div className="w-[88px] h-[120px] rounded-xl bg-white shadow-lg p-2 flex flex-col">
      <div className={`text-lg font-extrabold leading-none ${isRed ? "text-rose-600" : "text-slate-900"}`}>
        {rankLabel(rank)}
      </div>
      <div className={`text-sm leading-none ${isRed ? "text-rose-600" : "text-slate-900"}`}>{s}</div>
      <div className={`flex-1 flex items-center justify-center text-4xl ${isRed ? "text-rose-600" : "text-slate-900"}`}>
        {s}
      </div>
      <div className={`text-lg font-extrabold leading-none rotate-180 self-end ${isRed ? "text-rose-600" : "text-slate-900"}`}>
        {rankLabel(rank)}
      </div>
    </div>
  );
}

function CardPlaceholder() {
  return (
    <div
      className="w-[88px] h-[120px] rounded-xl border-2 border-dashed border-white/15 flex items-center justify-center text-text-secondary"
      style={{ background: "rgba(255,255,255,0.02)" }}
    >
      ?
    </div>
  );
}
