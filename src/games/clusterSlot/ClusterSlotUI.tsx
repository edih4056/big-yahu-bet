import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Zap } from "lucide-react";
import { useWalletStore } from "@/store/walletStore";
import { formatMoney } from "@/lib/format";
import { playSfx } from "@/lib/sound";
import { fireConfetti } from "@/lib/confetti";
import {
  ClusterSlot,
  COLS,
  ROWS,
  type ClusterSlotConfig,
  type Grid,
  type SpinResult,
  type TumbleStep,
} from "./engine";

const BET_PRESETS = [10, 50, 100, 500, 1000, 5000];
const MAX_BET = 5000;

export type ClusterSlotUIProps = {
  gameKey: string;
  title: string;
  subtitle: string;
  config: ClusterSlotConfig;
  /** Background gradient for the cabinet */
  cabinet: string;
  /** Border / trim color */
  trim: string;
  /** Symbol info for rendering hints (label, color) */
  symbolInfo: Record<string, { label: string; color: string; isHigh?: boolean }>;
  /** Orb emoji & label (Gates of Olympus only) */
  orbInfo?: { symbol: string; label: string };
};

const TUMBLE_DELAY_MS = 900;

export function ClusterSlotUI(props: ClusterSlotUIProps) {
  const {
    gameKey,
    title,
    subtitle,
    config,
    cabinet,
    trim,
    symbolInfo,
    orbInfo,
  } = props;

  const balance = useWalletStore((s) => s.balance);
  const placeBet = useWalletStore((s) => s.bet);
  const winCoins = useWalletStore((s) => s.win);
  const pushHistory = useWalletStore((s) => s.pushHistory);
  const currency = useWalletStore((s) => s.currency);
  const fmt = (n: number) => formatMoney(n, currency);

  const engineRef = useRef(new ClusterSlot(config));

  const [bet, setBet] = useState(100);
  const [grid, setGrid] = useState<Grid>(() => engineRef.current.makeGrid());
  const [busy, setBusy] = useState(false);
  const [lastResult, setLastResult] = useState<SpinResult | null>(null);
  /** Index of the tumble currently visible (-1 = idle, 0..n-1 = tumbles) */
  const [tumbleIdx, setTumbleIdx] = useState(-1);
  const [auto, setAuto] = useState(0);

  function showSpin(result: SpinResult) {
    // Display each tumble step in sequence
    setLastResult(result);
    setTumbleIdx(0);
    setGrid(result.tumbles[0].grid);
    let i = 0;
    function step() {
      const isLast = i >= result.tumbles.length - 1;
      const cur = result.tumbles[i];
      if (cur.wins.length > 0) {
        playSfx("win");
      }
      if (isLast) {
        // Settle
        if (result.totalWin > 0) winCoins(gameKey, result.totalWin);
        if (result.totalWin >= bet * 50) {
          playSfx("bigWin");
          fireConfetti(result.totalWin >= bet * 200 ? "big" : "small");
        }
        pushHistory({
          game: title,
          bet,
          result: result.totalWin,
          net: result.totalWin - bet,
        });
        setBusy(false);
        return;
      }
      // Schedule next tumble
      setTimeout(() => {
        i++;
        setTumbleIdx(i);
        setGrid(result.tumbles[i].grid);
        step();
      }, TUMBLE_DELAY_MS);
    }
    step();
  }

  function spinOnce() {
    if (busy || balance < bet) return;
    const ok = placeBet(gameKey, bet);
    if (!ok) return;
    setBusy(true);
    playSfx("spin");

    // First show a quick "shuffle" placeholder grid before the first tumble
    const placeholder = engineRef.current.makeGrid();
    setGrid(placeholder);
    setTumbleIdx(-1);
    setLastResult(null);

    setTimeout(() => {
      const r = engineRef.current.spin(bet);
      showSpin(r);
    }, 350);
  }

  function autoSpin() {
    if (auto > 0) {
      setAuto(0);
      return;
    }
    setAuto(10);
  }

  // Auto-spin trigger
  useEffect(() => {
    if (auto > 0 && !busy && balance >= bet) {
      const id = setTimeout(() => {
        setAuto((n) => n - 1);
        spinOnce();
      }, 350);
      return () => clearTimeout(id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auto, busy]);

  const currentTumble: TumbleStep | undefined =
    lastResult && tumbleIdx >= 0 ? lastResult.tumbles[tumbleIdx] : undefined;

  const winningSymbols = new Set(currentTumble?.wins.map((w) => w.symbol) ?? []);

  return (
    <div className="px-4 lg:px-6 py-4">
      <div
        className="rounded-[28px] p-4 sm:p-5 lg:p-6 mx-auto relative"
        style={{
          background: cabinet,
          maxWidth: 980,
          boxShadow: `inset 0 0 0 4px ${trim}, inset 0 0 0 8px rgba(0,0,0,0.4)`,
        }}
      >
        <div className="text-center mb-3">
          <h1
            className="text-2xl sm:text-3xl font-black tracking-wider italic"
            style={{
              color: "#FFFFFF",
              textShadow:
                "0 0 8px rgba(255,200,66,0.7), 0 2px 0 rgba(0,0,0,0.5), 0 4px 12px rgba(0,0,0,0.5)",
            }}
          >
            {title.toUpperCase()}
          </h1>
          <div className="text-[10px] text-white/70 mt-0.5">{subtitle}</div>
        </div>

        {/* Grid */}
        <div
          className="rounded-2xl p-3 mx-auto"
          style={{
            background: "rgba(0,0,0,0.55)",
            boxShadow: "inset 0 4px 16px rgba(0,0,0,0.55)",
          }}
        >
          <div
            className="grid gap-1.5"
            style={{ gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))` }}
          >
            {Array.from({ length: COLS * ROWS }).map((_, idx) => {
              const c = Math.floor(idx / ROWS);
              const r = idx % ROWS;
              // Transpose: we stored [col][row], but render row-by-row.
              const cell = grid[c]?.[r];
              const isWinning =
                cell?.kind === "symbol" && winningSymbols.has(cell.symbol);
              return (
                <Cell
                  key={idx}
                  cell={cell}
                  highlight={isWinning}
                  symbolInfo={symbolInfo}
                  orbInfo={orbInfo}
                />
              );
            })}
          </div>
        </div>

        {/* Status bar */}
        <div className="mt-3 grid grid-cols-3 gap-2">
          <Display label="Balance" value={fmt(balance)} />
          <Display label="Bet" value={fmt(bet)} />
          <Display
            label="Last win"
            value={fmt(lastResult?.totalWin ?? 0)}
            highlight={(lastResult?.totalWin ?? 0) > 0}
          />
        </div>

        {currentTumble && currentTumble.orbMultiplier > 0 && (
          <div className="mt-2 flex items-center justify-center gap-2">
            <span className="px-3 py-1 rounded-full bg-gold/20 text-gold border border-gold/40 text-sm font-bold flex items-center gap-1">
              <Zap size={14} /> ×{currentTumble.orbMultiplier} multiplier!
            </span>
          </div>
        )}

        {/* Controls */}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 bg-bg-card/70 rounded-xl p-1 border border-white/10">
            <span className="text-[10px] text-text-secondary px-2">Bet</span>
            {BET_PRESETS.map((p) => (
              <button
                key={p}
                onClick={() => setBet(p)}
                disabled={busy}
                className={`px-2 py-1 text-xs font-bold rounded-md transition ${
                  bet === p
                    ? "bg-accent-gradient text-white"
                    : "text-text-secondary hover:text-white hover:bg-white/5"
                }`}
              >
                {p >= 1000 ? `${p / 1000}K` : p}
              </button>
            ))}
            <input
              type="number"
              value={bet}
              onChange={(e) =>
                setBet(
                  Math.min(MAX_BET, Math.max(1, Math.floor(Number(e.target.value) || 1)))
                )
              }
              disabled={busy}
              className="bg-bg-elevated rounded-md px-2 py-1 text-xs w-16 outline-none border border-white/5 focus:border-accent/50 disabled:opacity-50"
            />
          </div>

          <button
            onClick={autoSpin}
            disabled={busy && auto === 0}
            className={`cabinet-btn-sm ${auto > 0 ? "bg-rose-500/20 text-rose-200" : ""}`}
            style={
              auto > 0
                ? { borderColor: "#F87171" }
                : { background: "linear-gradient(180deg,#FBBF24,#B45309)", color: "#1F1300" }
            }
          >
            {auto > 0 ? `Stop (${auto})` : "Auto"}
          </button>

          <motion.button
            onClick={spinOnce}
            disabled={busy || balance < bet}
            whileTap={{ scale: 0.95 }}
            className="ml-auto relative flex items-center justify-center gap-2 px-7 sm:px-9 py-3 rounded-2xl font-black tracking-widest text-base disabled:opacity-40"
            style={{
              background:
                "radial-gradient(circle at 30% 30%, #34D399, #059669 60%, #064E3B)",
              color: "white",
              boxShadow:
                "0 0 28px rgba(16,185,129,0.55), inset 0 -3px 8px rgba(0,0,0,0.35), inset 0 2px 3px rgba(255,255,255,0.35)",
              textShadow: "0 1px 0 rgba(0,0,0,0.5)",
            }}
          >
            <motion.div
              animate={busy ? { rotate: 360 } : { rotate: 0 }}
              transition={{ duration: 0.6, repeat: busy ? Infinity : 0, ease: "linear" }}
            >
              <Play size={18} fill="white" />
            </motion.div>
            SPIN
          </motion.button>
        </div>
      </div>

      <div className="text-center text-[11px] text-text-secondary mt-3">
        Pay-anywhere · 8+ matching symbols pay · Tumble: winning symbols disappear and the rest drop
      </div>
    </div>
  );
}

function Display({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="rounded-lg bg-black/55 border border-white/10 px-3 py-1.5">
      <div className="text-[9px] uppercase tracking-widest text-white/55 font-semibold">
        {label}
      </div>
      <div
        className={`font-mono font-bold text-sm sm:text-base leading-tight ${
          highlight ? "text-win" : "text-gold"
        }`}
      >
        {value}
      </div>
    </div>
  );
}

function Cell({
  cell,
  highlight,
  symbolInfo,
  orbInfo,
}: {
  cell: Grid[number][number] | undefined;
  highlight: boolean;
  symbolInfo: Record<string, { label: string; color: string }>;
  orbInfo?: { symbol: string; label: string };
}) {
  return (
    <motion.div
      animate={highlight ? { scale: [1, 1.1, 1] } : { scale: 1 }}
      transition={{ duration: 0.55, repeat: highlight ? 1 : 0 }}
      className="aspect-square rounded-lg flex items-center justify-center text-3xl sm:text-4xl relative"
      style={{
        background: highlight
          ? "linear-gradient(180deg, rgba(255,255,255,0.18), rgba(255,200,66,0.15))"
          : "linear-gradient(180deg, rgba(255,255,255,0.06), rgba(0,0,0,0.25))",
        border: highlight ? "2px solid #FFC842" : "1px solid rgba(255,255,255,0.08)",
        boxShadow: highlight
          ? "0 0 18px rgba(255,200,66,0.6), inset 0 0 14px rgba(255,200,66,0.35)"
          : "inset 0 -2px 6px rgba(0,0,0,0.35)",
      }}
    >
      <AnimatePresence>
        {cell ? (
          cell.kind === "orb" ? (
            <motion.div
              key={`orb-${cell.value}`}
              initial={{ rotate: -180, scale: 0.5, opacity: 0 }}
              animate={{ rotate: 0, scale: 1, opacity: 1 }}
              exit={{ opacity: 0, scale: 0.6 }}
              className="flex flex-col items-center justify-center"
              style={{
                filter: "drop-shadow(0 0 10px rgba(255,200,66,0.6))",
              }}
              title={orbInfo?.label ?? "Multiplier"}
            >
              <div className="text-2xl sm:text-3xl">⚡</div>
              <div className="text-[10px] font-extrabold text-gold leading-none mt-0.5">
                {cell.value}×
              </div>
            </motion.div>
          ) : (
            <motion.span
              key={`sym-${cell.symbol}`}
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 12, opacity: 0 }}
              transition={{ type: "spring", stiffness: 280, damping: 22 }}
              className="drop-shadow-[0_3px_6px_rgba(0,0,0,0.55)]"
              title={symbolInfo[cell.symbol]?.label ?? cell.symbol}
            >
              {cell.symbol}
            </motion.span>
          )
        ) : null}
      </AnimatePresence>
    </motion.div>
  );
}

