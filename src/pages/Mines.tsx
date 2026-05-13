import { useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bomb,
  ChevronUp,
  ChevronDown,
  Gem,
  PiggyBank,
  Play,
  RotateCcw,
} from "lucide-react";
import { useWalletStore } from "@/store/walletStore";
import { formatMoney } from "@/lib/format";
import { playSfx } from "@/lib/sound";
import { fireConfetti } from "@/lib/confetti";
import {
  MinesEngine,
  buildMultiplierTable,
  minesMultiplier,
} from "@/games/mines/engine";

const TOTAL = 25;
const COLS = 5;
const BET_PRESETS = [10, 100, 500, 1000, 2500, 5000];
const MAX_BET = 5000;

export default function Mines() {
  const balance = useWalletStore((s) => s.balance);
  const placeBet = useWalletStore((s) => s.bet);
  const winCoins = useWalletStore((s) => s.win);
  const pushHistory = useWalletStore((s) => s.pushHistory);
  const currency = useWalletStore((s) => s.currency);
  const fmt = (n: number) => formatMoney(n, currency);

  const [bet, setBet] = useState(100);
  const [bombs, setBombs] = useState(3);
  const engineRef = useRef<MinesEngine | null>(null);
  const [, force] = useState(0);
  const refresh = () => force((n) => n + 1);

  const eng = engineRef.current;
  const inGame = eng?.status === "playing";
  const finished = eng && eng.status !== "playing";

  const table = useMemo(() => buildMultiplierTable(TOTAL, bombs), [bombs]);

  function start() {
    if (inGame) return;
    if (balance < bet) return;
    const ok = placeBet("mines", bet);
    if (!ok) return;
    engineRef.current = new MinesEngine(TOTAL, bombs, bet);
    playSfx("chip");
    refresh();
  }

  function reveal(i: number) {
    if (!eng || eng.status !== "playing") return;
    if (eng.tiles[i] !== "hidden") return;
    const r = eng.pick(i);
    if (r.hit === "bomb") {
      playSfx("lose");
      pushHistory({ game: "Mines", bet: eng.bet, result: 0, net: -eng.bet });
    } else if ((eng.status as string) === "cashed") {
      const payout = eng.potentialPayout();
      winCoins("mines", payout);
      playSfx("bigWin");
      fireConfetti("big");
      pushHistory({ game: "Mines", bet: eng.bet, result: payout, net: payout - eng.bet });
    } else {
      playSfx("cardFlip");
    }
    refresh();
  }

  function cashOut() {
    if (!eng || eng.status !== "playing" || eng.revealedSafe === 0) return;
    const payout = eng.cashOut();
    winCoins("mines", payout);
    playSfx("win");
    if (payout >= eng.bet * 3) fireConfetti("small");
    pushHistory({ game: "Mines", bet: eng.bet, result: payout, net: payout - eng.bet });
    refresh();
  }

  function reset() {
    engineRef.current = null;
    refresh();
  }

  const curMult = eng?.currentMultiplier() ?? 1;
  const nextMult = eng
    ? minesMultiplier(TOTAL, eng.bombs, eng.revealedSafe + 1)
    : table[0];
  const safeRemaining = eng ? TOTAL - eng.bombs - eng.revealedSafe : TOTAL - bombs;

  return (
    <div className="px-4 lg:px-6 py-4 grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-4">
      <div
        className="rounded-3xl p-4 sm:p-6 lg:p-8 border border-white/5 relative overflow-hidden"
        style={{
          background:
            "radial-gradient(ellipse at top, #1B2540 0%, #0F1226 60%, #060916 100%)",
        }}
      >
        <div className="flex items-baseline gap-3 mb-4">
          <h1 className="heading text-2xl sm:text-3xl">Mines</h1>
          <div className="text-text-secondary text-sm">
            5×5 board · {bombs} bomb{bombs > 1 ? "s" : ""} · 1% house edge
          </div>
          {eng && (
            <div className="ml-auto flex items-center gap-2 bg-bg-elevated/70 rounded-xl px-3 py-1.5 border border-white/10">
              <span className="text-[10px] uppercase tracking-wider text-text-secondary">
                Mult
              </span>
              <span className="text-lg font-extrabold text-accent-light">
                {curMult.toFixed(2)}×
              </span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_220px] gap-6">
          <div
            className="rounded-2xl bg-black/30 p-3 border border-white/5"
            style={{
              boxShadow: "inset 0 4px 16px rgba(0,0,0,0.5)",
            }}
          >
            <div
              className="grid gap-2"
              style={{ gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))` }}
            >
              {Array.from({ length: TOTAL }).map((_, i) => {
                const state = eng?.tiles[i] ?? "hidden";
                return (
                  <TileBtn
                    key={i}
                    state={state}
                    onClick={() => reveal(i)}
                    disabled={!inGame || state !== "hidden"}
                  />
                );
              })}
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
                <button
                  onClick={() => setBet((b) => Math.max(1, Math.floor(b / 2)))}
                  disabled={!!inGame}
                  className="px-2 py-1 rounded-md text-xs font-semibold bg-bg-elevated hover:bg-accent/20 transition disabled:opacity-40"
                >
                  ½
                </button>
                <button
                  onClick={() =>
                    setBet((b) => Math.min(MAX_BET, Math.min(balance, b * 2)))
                  }
                  disabled={!!inGame}
                  className="px-2 py-1 rounded-md text-xs font-semibold bg-bg-elevated hover:bg-accent/20 transition disabled:opacity-40"
                >
                  2×
                </button>
              </div>
            </div>

            <div className="card-base p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] uppercase tracking-wider text-text-secondary flex items-center gap-1">
                  <Bomb size={11} /> Bombs
                </span>
                <span className="font-bold">{bombs}</span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => !inGame && setBombs((b) => Math.max(1, b - 1))}
                  disabled={!!inGame}
                  className="w-8 h-8 rounded-md bg-bg-elevated hover:bg-accent/20 disabled:opacity-40"
                >
                  <ChevronDown size={14} className="mx-auto" />
                </button>
                <input
                  type="range"
                  min={1}
                  max={24}
                  value={bombs}
                  onChange={(e) => !inGame && setBombs(Number(e.target.value))}
                  disabled={!!inGame}
                  className="flex-1 accent-accent"
                />
                <button
                  onClick={() => !inGame && setBombs((b) => Math.min(24, b + 1))}
                  disabled={!!inGame}
                  className="w-8 h-8 rounded-md bg-bg-elevated hover:bg-accent/20 disabled:opacity-40"
                >
                  <ChevronUp size={14} className="mx-auto" />
                </button>
              </div>
              <div className="flex justify-between text-[10px] text-text-secondary mt-1">
                <span>1</span>
                <span>24</span>
              </div>
            </div>

            <div className="card-base p-3 space-y-1.5 text-sm">
              <Stat label="Balance" value={fmt(balance)} />
              {eng && (
                <>
                  <Stat label="Safe left" value={String(safeRemaining)} />
                  <Stat label="Potential" value={fmt(eng.potentialPayout())} highlight />
                  <Stat
                    label="Next ×"
                    value={
                      safeRemaining > 0
                        ? `${nextMult.toFixed(2)}×`
                        : "MAX"
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
                <Play size={16} />
                {finished ? "Play again" : "Bet"}
              </button>
            )}

            {inGame && eng && eng.revealedSafe > 0 && (
              <button
                onClick={cashOut}
                className="px-5 py-3 rounded-2xl bg-gold-gradient text-black font-extrabold shadow-glow-gold hover:scale-[1.03] active:scale-95 transition flex items-center justify-center gap-2"
              >
                <PiggyBank size={18} /> Cash out {fmt(eng.potentialPayout())}
              </button>
            )}

            {finished && (
              <button onClick={reset} className="btn-secondary flex items-center justify-center gap-2">
                <RotateCcw size={14} /> Reset
              </button>
            )}
          </div>
        </div>

        <AnimatePresence>
          {finished && eng && (
            <motion.div
              key={eng.status}
              initial={{ y: 8, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mt-4 text-center"
            >
              <div
                className={`inline-block px-4 py-1.5 rounded-full backdrop-blur text-sm font-semibold border ${
                  eng.status === "cashed"
                    ? "bg-emerald-500/15 text-emerald-200 border-emerald-500/30"
                    : "bg-rose-500/15 text-rose-200 border-rose-500/30"
                }`}
              >
                {eng.status === "cashed"
                  ? `Cashed out ${fmt(eng.bet * eng.currentMultiplier())}`
                  : `Bomb! Lost ${fmt(eng.bet)}`}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <aside className="card-base p-4">
        <h3 className="heading text-base mb-3">Multiplier Ladder</h3>
        <div className="text-xs text-text-secondary mb-3">
          Cash out after each safe tile. With {bombs} bomb{bombs > 1 ? "s" : ""} on a {TOTAL}-tile board, your bet
          grows as shown below:
        </div>
        <div className="space-y-1 max-h-[440px] overflow-y-auto pr-1">
          {table.slice(0, 18).map((m, i) => {
            const k = i + 1;
            const reached = (eng?.revealedSafe ?? 0) >= k;
            return (
              <div
                key={k}
                className={`flex items-center justify-between text-sm rounded-lg px-3 py-1.5 ${
                  reached ? "bg-emerald-500/10 text-win" : "bg-bg-elevated/60"
                }`}
              >
                <span className="text-text-secondary">Safe {k}</span>
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
    <div className="flex items-center justify-between">
      <span className="text-text-secondary">{label}</span>
      <span
        className={`font-semibold ${highlight ? "text-accent-light" : "text-white"}`}
      >
        {value}
      </span>
    </div>
  );
}

function TileBtn({
  state,
  onClick,
  disabled,
}: {
  state: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  const isHidden = state === "hidden";
  const isSafe = state === "revealed-safe";
  const isBomb = state === "revealed-bomb";
  const isShownSafe = state === "safe";
  const isShownBomb = state === "bomb";

  return (
    <motion.button
      whileHover={!disabled ? { scale: 1.04 } : {}}
      whileTap={!disabled ? { scale: 0.94 } : {}}
      onClick={onClick}
      disabled={disabled}
      className={`aspect-square rounded-xl border flex items-center justify-center transition ${
        isHidden
          ? "bg-bg-elevated border-white/10 hover:border-accent/40 cursor-pointer"
          : isSafe
            ? "bg-emerald-500/30 border-emerald-400/60 shadow-[0_0_18px_rgba(0,230,118,0.4)]"
            : isShownSafe
              ? "bg-emerald-500/10 border-emerald-400/30"
              : isBomb
                ? "bg-rose-500/40 border-rose-400/70 shadow-[0_0_24px_rgba(255,59,107,0.6)]"
                : isShownBomb
                  ? "bg-rose-500/15 border-rose-400/40"
                  : "bg-bg-elevated/50 border-white/5"
      }`}
    >
      {isSafe || isShownSafe ? (
        <Gem size={22} className="text-emerald-200" />
      ) : isBomb ? (
        <Bomb size={26} className="text-white" />
      ) : isShownBomb ? (
        <Bomb size={20} className="text-rose-300" />
      ) : null}
    </motion.button>
  );
}
