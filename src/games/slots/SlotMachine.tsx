import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Coins, Play, Zap, MoveRight } from "lucide-react";
import { useWalletStore } from "@/store/walletStore";
import { formatCoins } from "@/lib/format";
import { playSfx } from "@/lib/sound";
import { fireConfetti } from "@/lib/confetti";
import { SlotEngine } from "./engine";
import type { SlotConfig, SpinResult } from "./types";

export type SlotTheme = {
  name: string;
  bg: string; // CSS background for the cabinet
  frame: string; // border tint
  symbolBg: string;
  glow: string;
  cell: string; // tw class for cell bg
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
  // Optional Book-of-Yahu style features
  freeSpinReels?: string[][];
  pickExpandingSymbol?: () => string;
  // For the paytable side panel
  premiumOrder?: string[];
};

const ROWS = 3;
const REELS = 5;

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
  const [message, setMessage] = useState<string | null>(null);

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
        setMessage("Not enough coins. Reload your wallet.");
        return;
      }
    }
    setMessage(null);
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

    // Stagger reel stops for the visual effect
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
      } else {
        playSfx("win");
      }
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

    // Free-spins handling
    if (result.freeSpinsTriggered) {
      const sym = pickExpandingSymbol ? pickExpandingSymbol() : undefined;
      setExpanding(sym);
      setFreeSpinsLeft((n) => n + (result.freeSpinsTriggered ?? 0));
      setMessage(
        `🎉 ${result.freeSpinsTriggered} Free Spins triggered!${
          sym ? ` Expanding symbol: ${symbolInfo[sym]?.label ?? sym}` : ""
        }`
      );
    } else if (inFreeSpins) {
      setFreeSpinsLeft((n) => Math.max(0, n - 1));
    }
  }

  // Auto-play
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

  // Continue free spins automatically
  useEffect(() => {
    if (inFreeSpins && !spinning) {
      const id = setTimeout(doSpin, 900);
      return () => clearTimeout(id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [freeSpinsLeft, spinning]);

  // Spacebar to spin
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

  return (
    <div className="px-4 lg:px-6 py-4">
      <div
        className="rounded-3xl p-4 sm:p-6 lg:p-8 border-2"
        style={{
          background: theme.bg,
          borderColor: theme.frame,
          boxShadow: `0 0 40px ${theme.glow}`,
        }}
      >
        <div className="flex items-baseline gap-3 mb-4">
          <h1 className="heading text-2xl sm:text-3xl">{title}</h1>
          <div className="text-text-secondary text-sm">{subtitle}</div>
          {inFreeSpins && (
            <div className="ml-auto flex items-center gap-2 px-3 py-1 rounded-full bg-gold/20 text-gold border border-gold/40 text-sm font-semibold">
              <Zap size={14} /> {freeSpinsLeft} Free Spins
              {expanding && symbolInfo[expanding] && (
                <span className="ml-1 text-base">
                  {symbolInfo[expanding].emoji}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Reel area */}
        <div
          className="rounded-2xl p-3 sm:p-4 mx-auto"
          style={{
            background: theme.symbolBg,
            border: `1px solid ${theme.frame}`,
          }}
        >
          <div className="grid grid-cols-5 gap-2">
            {matrix.map((reel, c) => (
              <Reel
                key={c}
                reel={reel}
                isSpinning={spinning && c >= stoppedReels}
                symbolInfo={symbolInfo}
                strip={(inFreeSpins && freeSpinReels ? freeSpinReels : config.reels)[c]}
                cellClass={theme.cell}
                highlightSet={highlight}
                reelIndex={c}
              />
            ))}
          </div>
        </div>

        {/* Status bar */}
        <div className="grid grid-cols-3 gap-2 mt-4">
          <Stat label="Balance" value={`${formatCoins(balance)} YAHU`} />
          <Stat label="Total Bet" value={`${formatCoins(totalBet)}`} />
          <Stat
            label="Last Win"
            value={`${formatCoins(lastWin)}`}
            highlight={lastWin > 0}
          />
        </div>

        {/* Controls */}
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1 bg-bg-card rounded-xl p-1">
            <span className="text-xs text-text-secondary px-2">Per line:</span>
            {betPerLine.map((b, i) => (
              <button
                key={b}
                onClick={() => setBetIdx(i)}
                className={`px-2.5 py-1 text-sm font-semibold rounded-lg transition ${
                  i === betIdx
                    ? "bg-accent-gradient text-white"
                    : "text-text-secondary hover:text-white"
                }`}
              >
                {b}
              </button>
            ))}
          </div>

          <button
            onClick={() => setBetIdx(betPerLine.length - 1)}
            className="btn-secondary text-sm"
          >
            <MoveRight size={14} className="inline mr-1" />
            Max Bet
          </button>

          <button
            onClick={doSpin}
            disabled={!canSpin}
            className="ml-auto px-8 py-3 rounded-2xl bg-accent-gradient font-extrabold text-base shadow-glow hover:scale-105 active:scale-95 transition disabled:opacity-40 disabled:hover:scale-100 flex items-center gap-2"
            aria-label="Spin"
          >
            <Play size={18} />
            SPIN
          </button>

          <div className="flex items-center gap-1">
            {[10, 25, 50, 100].map((n) => (
              <button
                key={n}
                onClick={() => setAuto(n)}
                disabled={spinning || auto > 0 || inFreeSpins}
                className="btn-secondary text-xs"
              >
                Auto {n}
              </button>
            ))}
            {auto > 0 && (
              <button
                onClick={() => setAuto(0)}
                className="btn-secondary text-xs text-rose-300"
              >
                Stop ({auto})
              </button>
            )}
          </div>
        </div>

        {message && (
          <div className="mt-3 text-center text-sm text-gold font-semibold">
            {message}
          </div>
        )}

        {lastWin > 0 && winLines.length > 0 && (
          <AnimatePresence>
            <motion.div
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="mt-3 text-center font-bold"
            >
              <span className="text-win">
                <Coins size={16} className="inline mr-1.5 mb-1" />
                +{formatCoins(lastWin)} on{" "}
                {winLines.length === 1 ? "line" : "lines"}{" "}
                {winLines.map((n) => n + 1).join(", ")}
              </span>
            </motion.div>
          </AnimatePresence>
        )}
      </div>
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
    <div className="bg-bg-card rounded-xl px-3 py-2">
      <div className="text-[10px] uppercase tracking-wider text-text-secondary">
        {label}
      </div>
      <div
        className={`font-semibold ${highlight ? "text-win" : "text-white"}`}
      >
        {value}
      </div>
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
      <div className="overflow-hidden h-[300px] sm:h-[330px] rounded-xl bg-black/30">
        <motion.div
          animate={{ y: [-1200, 0] }}
          transition={{ duration: 0.6, repeat: Infinity, ease: "linear" }}
        >
          {long.map((s, i) => (
            <Cell key={i} sym={s} info={symbolInfo[s]} cellClass={cellClass} />
          ))}
        </motion.div>
      </div>
    );
  }

  return (
    <div className="grid grid-rows-3 gap-2">
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
  sym,
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
          ? { scale: [1, 1.12, 1], filter: ["brightness(1)", "brightness(1.5)", "brightness(1)"] }
          : { scale: 1 }
      }
      transition={{ duration: 0.6, repeat: highlight ? Infinity : 0 }}
      className={`relative h-24 sm:h-28 rounded-xl flex items-center justify-center text-4xl sm:text-5xl ${cellClass}`}
      style={
        highlight
          ? {
              boxShadow: `0 0 24px ${info?.color ?? "#FFC842"}, inset 0 0 24px ${info?.color ?? "#FFC842"}40`,
              borderColor: info?.color ?? "#FFC842",
            }
          : undefined
      }
      data-sym={sym}
    >
      <span className="drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]">
        {info?.emoji ?? sym}
      </span>
    </motion.div>
  );
}
