import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play,
  Zap,
  MoveRight,
  ChevronUp,
  ChevronDown,
  Maximize2,
  Minimize2,
} from "lucide-react";
import { useWalletStore } from "@/store/walletStore";
import { formatMoney } from "@/lib/format";
import { playSfx } from "@/lib/sound";
import { fireConfetti } from "@/lib/confetti";
import { SlotEngine } from "./engine";
import type { SlotConfig, SpinResult } from "./types";

/* -------------------------------------------------------------------------- */
/*  Public types                                                              */
/* -------------------------------------------------------------------------- */

export type SlotTheme = {
  name: string;
  /** Big cabinet outer frame gradient (mimics the painted slot machine body). */
  cabinet: string;
  /** Trim/border color (e.g. red for Sizzling Hot, gold for Book). */
  trim: string;
  /** Inner panel behind the reels. */
  panel: string;
  /** Single cell background tailwind class. */
  cell: string;
  /** Game title banner colors. */
  banner: string;
  /** Color for the start button glow. */
  glow: string;
};

type SymbolInfo = {
  label: string;
  emoji: string;
  color: string;
  isScatter?: boolean;
  isWild?: boolean;
};

type SlotMachineProps = {
  gameKey: string;
  title: string;
  subtitle: string;
  config: SlotConfig;
  symbolInfo: Record<string, SymbolInfo>;
  betPerLine: readonly number[];
  numLines: number;
  theme: SlotTheme;
  /** Optional Book-of-Yahu features */
  freeSpinReels?: string[][];
  pickExpandingSymbol?: () => string;
};

const ROWS = 3;
const REELS = 5;

/* Five colors used for the line badges on the left/right of the reels */
const LINE_BADGE_COLORS = [
  "#FFC842", // yellow (line 1)
  "#3B82F6", // blue   (line 2)
  "#F43F5E", // red    (line 3)
  "#10B981", // green  (line 4)
  "#EAB308", // amber  (line 5)
  "#A855F7", // purple (line 6)
  "#06B6D4", // cyan   (line 7)
  "#F97316", // orange (line 8)
  "#EC4899", // pink   (line 9)
  "#94A3B8", // slate  (line 10)
];

/* -------------------------------------------------------------------------- */
/*  Component                                                                 */
/* -------------------------------------------------------------------------- */

export function SlotMachine(props: SlotMachineProps) {
  const {
    gameKey,
    title,
    subtitle,
    config,
    symbolInfo,
    betPerLine,
    numLines,
    theme,
    freeSpinReels,
    pickExpandingSymbol,
  } = props;

  const balance = useWalletStore((s) => s.balance);
  const placeBet = useWalletStore((s) => s.bet);
  const winCoins = useWalletStore((s) => s.win);
  const pushHistory = useWalletStore((s) => s.pushHistory);
  const currency = useWalletStore((s) => s.currency);
  const fmt = (n: number) => formatMoney(n, currency);

  const engineRef = useRef<SlotEngine>(new SlotEngine(config));
  const [betIdx, setBetIdx] = useState(2);
  const [spinning, setSpinning] = useState(false);
  const [matrix, setMatrix] = useState<string[][]>(() =>
    placeholderMatrix(config.reels)
  );
  const [lastWin, setLastWin] = useState(0);
  const [winLines, setWinLines] = useState<number[]>([]);
  const [auto, setAuto] = useState(0);
  const [freeSpinsLeft, setFreeSpinsLeft] = useState(0);
  const [expanding, setExpanding] = useState<string | undefined>(undefined);
  const [highlight, setHighlight] = useState<Set<string>>(new Set());
  const [stoppedReels, setStoppedReels] = useState<number>(REELS);
  const [message, setMessage] = useState<string | null>("PLEASE PLACE YOUR BET");
  const [fullscreen, setFullscreen] = useState(false);
  const cabinetRef = useRef<HTMLDivElement>(null);

  const linePerBet = betPerLine[betIdx];
  const totalBet = linePerBet * numLines;

  const inFreeSpins = freeSpinsLeft > 0;
  const canSpin = !spinning && (inFreeSpins || balance >= totalBet);

  function placeholderMatrix(reels: string[][]): string[][] {
    const m: string[][] = [];
    for (let c = 0; c < REELS; c++) {
      m[c] = [reels[c][0], reels[c][1] ?? reels[c][0], reels[c][2] ?? reels[c][0]];
    }
    return m;
  }

  function doSpin() {
    if (spinning) return;
    if (!inFreeSpins) {
      const ok = placeBet(gameKey, totalBet);
      if (!ok) {
        setMessage("INSUFFICIENT FUNDS");
        return;
      }
    }
    setMessage("SPINNING...");
    setLastWin(0);
    setWinLines([]);
    setHighlight(new Set());
    setSpinning(true);
    setStoppedReels(0);

    let result: SpinResult;
    if (inFreeSpins && freeSpinReels) {
      result = engineRef.current.spinFree(
        freeSpinReels,
        linePerBet,
        totalBet,
        expanding
      );
    } else {
      result = engineRef.current.spin(linePerBet, totalBet);
    }

    playSfx("spin");

    for (let c = 0; c < REELS; c++) {
      setTimeout(
        () => {
          setStoppedReels((n) => n + 1);
          playSfx("reelStop");
        },
        500 + c * 220
      );
    }

    setTimeout(
      () => {
        setMatrix(result.matrix);
        finalizeSpin(result);
      },
      500 + REELS * 220 + 100
    );
  }

  function finalizeSpin(result: SpinResult) {
    setSpinning(false);
    const won = result.totalWin;
    setLastWin(won);
    if (result.wins.length) {
      const ids = new Set<string>();
      for (const w of result.wins) {
        for (const [c, r] of w.positions) ids.add(`${c}-${r}`);
      }
      if (result.scatter) {
        for (const [c, r] of result.scatter.positions) ids.add(`${c}-${r}`);
      }
      setHighlight(ids);
      setWinLines(result.wins.map((w) => w.lineIndex));
    } else if (result.scatter) {
      const ids = new Set<string>();
      for (const [c, r] of result.scatter.positions) ids.add(`${c}-${r}`);
      setHighlight(ids);
    }

    if (won > 0) {
      winCoins(gameKey, won);
      if (won >= totalBet * 10) {
        playSfx("bigWin");
        fireConfetti(won >= totalBet * 30 ? "big" : "small");
        setMessage(`BIG WIN! ${fmt(won)}`);
      } else {
        playSfx("win");
        setMessage(`WIN ${fmt(won)}`);
      }
    } else if (!inFreeSpins) {
      setMessage("PLEASE PLACE YOUR BET");
    } else {
      setMessage("FREE SPIN");
    }

    if (!inFreeSpins) {
      pushHistory({
        game: title,
        bet: totalBet,
        result: won,
        net: won - totalBet,
      });
    } else {
      pushHistory({
        game: `${title} (FS)`,
        bet: 0,
        result: won,
        net: won,
      });
    }

    if (result.freeSpinsTriggered) {
      const sym = pickExpandingSymbol ? pickExpandingSymbol() : undefined;
      setExpanding(sym);
      setFreeSpinsLeft((n) => n + (result.freeSpinsTriggered ?? 0));
      setMessage(
        `🎉 ${result.freeSpinsTriggered} FREE SPINS!${
          sym ? ` EXPANDING: ${symbolInfo[sym]?.label ?? sym}` : ""
        }`
      );
    } else if (inFreeSpins) {
      setFreeSpinsLeft((n) => Math.max(0, n - 1));
    }
  }

  useEffect(() => {
    if (auto > 0 && !spinning && canSpin) {
      const id = setTimeout(() => {
        setAuto((n) => n - 1);
        doSpin();
      }, 700);
      return () => clearTimeout(id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auto, spinning]);

  useEffect(() => {
    if (inFreeSpins && !spinning) {
      const id = setTimeout(doSpin, 900);
      return () => clearTimeout(id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [freeSpinsLeft, spinning]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.code === "Space" && !spinning && canSpin) {
        e.preventDefault();
        doSpin();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spinning, canSpin]);

  function toggleFullscreen() {
    if (!cabinetRef.current) return;
    if (!document.fullscreenElement) {
      cabinetRef.current.requestFullscreen?.().then(() => setFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen?.().then(() => setFullscreen(false)).catch(() => {});
    }
  }

  /* The five line definitions in the engine determine where badges light up */
  const activeLineRowsLeft = useMemo(
    () => config.paylines.map((line) => line[0]),
    [config.paylines]
  );
  const activeLineRowsRight = useMemo(
    () => config.paylines.map((line) => line[REELS - 1]),
    [config.paylines]
  );
  const lineColors = useMemo(
    () => Array.from({ length: numLines }, (_, i) => LINE_BADGE_COLORS[i % LINE_BADGE_COLORS.length]),
    [numLines]
  );

  return (
    <div className="px-4 lg:px-6 py-4">
      <div
        ref={cabinetRef}
        className="rounded-[28px] p-4 sm:p-5 lg:p-6 mx-auto relative"
        style={{
          background: theme.cabinet,
          maxWidth: 980,
          boxShadow: `0 0 60px ${theme.glow}, inset 0 0 0 4px ${theme.trim}, inset 0 0 0 8px rgba(0,0,0,0.4)`,
        }}
      >
        {/* Title banner */}
        <div className="relative h-14 sm:h-16 flex items-center justify-center mb-3">
          <div
            className="absolute inset-x-8 inset-y-0 rounded-2xl"
            style={{
              background: theme.banner,
              boxShadow: "inset 0 -4px 8px rgba(0,0,0,0.35)",
            }}
          />
          <div className="relative text-center">
            <div
              className="text-2xl sm:text-3xl font-black tracking-wider"
              style={{
                color: "#FFFFFF",
                textShadow:
                  "0 0 8px rgba(255,200,66,0.7), 0 2px 0 rgba(0,0,0,0.5), 0 4px 12px rgba(0,0,0,0.5)",
                fontStyle: "italic",
              }}
            >
              {title.toUpperCase()}
            </div>
            <div className="text-[10px] text-white/70 -mt-0.5">{subtitle}</div>
          </div>
          {inFreeSpins && (
            <div className="absolute top-1 right-2 flex items-center gap-1.5 px-2 py-1 rounded-full bg-gold/90 text-black text-xs font-bold">
              <Zap size={12} /> {freeSpinsLeft} FS
              {expanding && symbolInfo[expanding] && (
                <span className="ml-0.5">{symbolInfo[expanding].emoji}</span>
              )}
            </div>
          )}
        </div>

        {/* Reels area with line badges on both sides */}
        <div className="flex gap-1.5 sm:gap-2">
          {/* Left badges column */}
          <div className="flex flex-col py-1 sm:py-2 justify-around w-7 sm:w-8">
            {Array.from({ length: numLines }).map((_, i) => {
              const row = activeLineRowsLeft[i];
              return (
                <LineBadge
                  key={i}
                  num={i + 1}
                  color={lineColors[i]}
                  row={row}
                  active={winLines.includes(i)}
                />
              );
            })}
          </div>

          {/* Reels panel */}
          <div
            className="flex-1 rounded-2xl p-2 sm:p-3"
            style={{
              background: theme.panel,
              boxShadow:
                "inset 0 4px 16px rgba(0,0,0,0.55), 0 0 0 2px rgba(0,0,0,0.35)",
            }}
          >
            <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
              {matrix.map((reel, c) => (
                <Reel
                  key={c}
                  reel={reel}
                  isSpinning={spinning && c >= stoppedReels}
                  symbolInfo={symbolInfo}
                  strip={
                    (inFreeSpins && freeSpinReels ? freeSpinReels : config.reels)[c]
                  }
                  cellClass={theme.cell}
                  highlightSet={highlight}
                  reelIndex={c}
                />
              ))}
            </div>
          </div>

          {/* Right badges column */}
          <div className="flex flex-col py-1 sm:py-2 justify-around w-7 sm:w-8">
            {Array.from({ length: numLines }).map((_, i) => {
              const row = activeLineRowsRight[i];
              return (
                <LineBadge
                  key={i}
                  num={i + 1}
                  color={lineColors[i]}
                  row={row}
                  active={winLines.includes(i)}
                />
              );
            })}
          </div>
        </div>

        {/* Status bar + bottom control deck */}
        <div className="mt-3 rounded-2xl p-3" style={{ background: theme.banner, boxShadow: "inset 0 2px 8px rgba(0,0,0,0.5)" }}>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
            <Display label="CREDIT" value={fmt(balance)} />
            <Display label="BET" value={fmt(totalBet)} />
            <Display label="WIN" value={fmt(lastWin)} highlight={lastWin > 0} />
            <Display label="LINES" value={String(numLines)} />
          </div>

          <div className="rounded-xl bg-black/40 text-center py-2 mb-3 border border-white/10">
            <span
              className={`text-sm sm:text-base font-bold tracking-wider ${
                lastWin > 0
                  ? "text-win"
                  : message?.includes("INSUFFICIENT")
                    ? "text-rose-300"
                    : "text-gold"
              }`}
            >
              {message}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <BetStepper
              current={betPerLine[betIdx]}
              steps={betPerLine}
              onChange={setBetIdx}
              disabled={spinning || inFreeSpins}
            />

            <button
              onClick={() => setBetIdx(betPerLine.length - 1)}
              disabled={spinning || inFreeSpins}
              className="cabinet-btn"
              style={cabinetBtnStyle(theme.trim, "#FFD600")}
            >
              <MoveRight size={14} />
              MAX&nbsp;BET
            </button>

            <div className="flex items-center gap-1">
              {[10, 25, 50, 100].map((n) => (
                <button
                  key={n}
                  onClick={() => setAuto(n)}
                  disabled={spinning || auto > 0 || inFreeSpins}
                  className="cabinet-btn-sm"
                  style={cabinetBtnStyle(theme.trim, "#FFD600")}
                >
                  AUTO {n}
                </button>
              ))}
              {auto > 0 && (
                <button onClick={() => setAuto(0)} className="cabinet-btn-sm" style={cabinetBtnStyle("#7f1d1d", "#FCA5A5")}>
                  STOP {auto}
                </button>
              )}
            </div>

            <button
              onClick={toggleFullscreen}
              className="cabinet-btn-sm"
              style={cabinetBtnStyle(theme.trim, "#FFD600")}
              aria-label="Toggle fullscreen"
            >
              {fullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
            </button>

            <motion.button
              onClick={doSpin}
              disabled={!canSpin}
              whileTap={{ scale: 0.95 }}
              className="ml-auto relative flex items-center justify-center gap-2 px-7 sm:px-9 py-3.5 rounded-2xl font-black tracking-widest text-base disabled:opacity-40"
              style={{
                background:
                  "radial-gradient(circle at 30% 30%, #34D399, #059669 60%, #064E3B)",
                color: "white",
                boxShadow:
                  "0 0 32px rgba(16,185,129,0.6), inset 0 -4px 12px rgba(0,0,0,0.35), inset 0 2px 4px rgba(255,255,255,0.4)",
                textShadow: "0 1px 0 rgba(0,0,0,0.5)",
              }}
              aria-label="Spin"
            >
              <motion.div
                animate={spinning ? { rotate: 360 } : { rotate: 0 }}
                transition={{ duration: 0.6, repeat: spinning ? Infinity : 0, ease: "linear" }}
              >
                <Play size={18} fill="white" />
              </motion.div>
              START
            </motion.button>
          </div>
        </div>

        {lastWin > 0 && winLines.length > 0 && (
          <AnimatePresence>
            <motion.div
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="mt-2 text-center font-bold text-xs uppercase tracking-wider text-win"
            >
              Win on {winLines.length === 1 ? "line" : "lines"}{" "}
              {winLines.map((n) => n + 1).join(", ")}
            </motion.div>
          </AnimatePresence>
        )}
      </div>

      {/* Bottom hint */}
      <div className="text-center text-[11px] text-text-secondary mt-3">
        Spacebar to spin · Demo coins only · No real gambling
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Sub components                                                             */
/* -------------------------------------------------------------------------- */

function cabinetBtnStyle(borderHex: string, glowHex: string): React.CSSProperties {
  return {
    background: "linear-gradient(180deg, #FBBF24 0%, #F59E0B 60%, #B45309 100%)",
    color: "#1F1300",
    border: `2px solid ${borderHex}`,
    boxShadow: `inset 0 -3px 6px rgba(0,0,0,0.35), inset 0 2px 3px rgba(255,255,255,0.5), 0 0 8px ${glowHex}40`,
  };
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
        style={{
          textShadow: highlight
            ? "0 0 8px rgba(0,230,118,0.7)"
            : "0 0 6px rgba(255,200,66,0.5)",
        }}
      >
        {value}
      </div>
    </div>
  );
}

function LineBadge({
  num,
  color,
  active,
}: {
  num: number;
  color: string;
  row: number;
  active: boolean;
}) {
  return (
    <div
      className="w-6 h-6 sm:w-7 sm:h-7 rounded-md flex items-center justify-center text-[10px] sm:text-xs font-black"
      style={{
        background: color,
        color: "#000",
        boxShadow: active
          ? `0 0 14px ${color}, inset 0 -2px 4px rgba(0,0,0,0.35)`
          : "inset 0 -2px 4px rgba(0,0,0,0.35)",
        outline: active ? "2px solid white" : undefined,
      }}
    >
      {num}
    </div>
  );
}

function BetStepper({
  current,
  steps,
  onChange,
  disabled,
}: {
  current: number;
  steps: readonly number[];
  onChange: (i: number) => void;
  disabled?: boolean;
}) {
  const idx = steps.indexOf(current);
  return (
    <div className="flex items-center gap-1 bg-black/45 rounded-xl p-1 border border-white/10">
      <button
        onClick={() => onChange(Math.max(0, idx - 1))}
        disabled={disabled || idx === 0}
        className="w-7 h-7 rounded-md bg-bg-elevated hover:bg-accent/20 disabled:opacity-30"
      >
        <ChevronDown size={14} className="mx-auto" />
      </button>
      <div className="px-2.5 min-w-[80px] text-center">
        <div className="text-[9px] uppercase tracking-widest text-white/55 font-semibold">
          BET/LINE
        </div>
        <div className="font-mono font-bold text-gold">{current}</div>
      </div>
      <button
        onClick={() => onChange(Math.min(steps.length - 1, idx + 1))}
        disabled={disabled || idx === steps.length - 1}
        className="w-7 h-7 rounded-md bg-bg-elevated hover:bg-accent/20 disabled:opacity-30"
      >
        <ChevronUp size={14} className="mx-auto" />
      </button>
    </div>
  );
}

function Reel({
  reel,
  isSpinning,
  symbolInfo,
  strip,
  cellClass,
  highlightSet,
  reelIndex,
}: {
  reel: string[];
  isSpinning: boolean;
  symbolInfo: Record<string, SymbolInfo>;
  strip: string[];
  cellClass: string;
  highlightSet: Set<string>;
  reelIndex: number;
}) {
  const long = useMemo(() => {
    const out: string[] = [];
    for (let i = 0; i < 30; i++) out.push(strip[i % strip.length]);
    return out;
  }, [strip]);

  if (isSpinning) {
    return (
      <div className="overflow-hidden h-[210px] sm:h-[260px] lg:h-[300px] rounded-md bg-white/95 border border-black/30">
        <motion.div
          animate={{ y: [-1300, 0] }}
          transition={{ duration: 0.55, repeat: Infinity, ease: "linear" }}
        >
          {long.map((s, i) => (
            <Cell key={i} sym={s} info={symbolInfo[s]} cellClass={cellClass} />
          ))}
        </motion.div>
      </div>
    );
  }

  return (
    <div className="grid grid-rows-3 gap-1 rounded-md bg-white/95 p-1 border border-black/30">
      {reel.map((s, r) => (
        <Cell
          key={r}
          sym={s}
          info={symbolInfo[s]}
          cellClass={cellClass}
          highlight={highlightSet.has(`${reelIndex}-${r}`)}
        />
      ))}
    </div>
  );
}

function Cell({
  sym: _sym,
  info,
  cellClass,
  highlight,
}: {
  sym: string;
  info?: SymbolInfo;
  cellClass: string;
  highlight?: boolean;
}) {
  return (
    <motion.div
      animate={
        highlight
          ? {
              scale: [1, 1.08, 1],
              filter: ["brightness(1)", "brightness(1.5)", "brightness(1)"],
            }
          : { scale: 1 }
      }
      transition={{ duration: 0.6, repeat: highlight ? Infinity : 0 }}
      className={`relative h-[64px] sm:h-[80px] lg:h-[92px] rounded-sm flex items-center justify-center text-3xl sm:text-4xl lg:text-5xl ${cellClass}`}
      style={
        highlight
          ? {
              boxShadow: `0 0 18px ${info?.color ?? "#FFC842"}, inset 0 0 18px ${info?.color ?? "#FFC842"}66`,
              outline: `2px solid ${info?.color ?? "#FFC842"}`,
            }
          : undefined
      }
    >
      <span
        className="drop-shadow-[0_3px_6px_rgba(0,0,0,0.55)]"
        style={{ filter: "drop-shadow(0 0 4px rgba(255,255,255,0.6))" }}
      >
        {info?.emoji ?? "?"}
      </span>
    </motion.div>
  );
}
