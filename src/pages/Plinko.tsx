import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play } from "lucide-react";
import { useWalletStore } from "@/store/walletStore";
import { formatMoney } from "@/lib/format";
import { playSfx } from "@/lib/sound";
import { fireConfetti } from "@/lib/confetti";
import {
  dropBall,
  plinkoLayout,
  plinkoRtp,
  PLINKO_BUCKETS,
  PLINKO_ROWS,
  type Risk,
} from "@/games/plinko/engine";

const BET_PRESETS = [10, 100, 500, 1000, 5000];
const MAX_BET = 5000;

const RISK_INFO: Record<Risk, { label: string; color: string }> = {
  low: { label: "Low", color: "#22C55E" },
  medium: { label: "Medium", color: "#FBBF24" },
  high: { label: "High", color: "#EF4444" },
};

const BOARD_WIDTH = 480;
const BOARD_HEIGHT = 420;
const PEG_RADIUS = 3.5;
const BALL_RADIUS = 7;

export default function Plinko() {
  const balance = useWalletStore((s) => s.balance);
  const placeBet = useWalletStore((s) => s.bet);
  const winCoins = useWalletStore((s) => s.win);
  const pushHistory = useWalletStore((s) => s.pushHistory);
  const currency = useWalletStore((s) => s.currency);
  const fmt = (n: number) => formatMoney(n, currency);

  const [bet, setBet] = useState(100);
  const [risk, setRisk] = useState<Risk>("medium");
  const [busy, setBusy] = useState(false);
  /** Path of ball as (x, y) coordinates so motion.div can animate through them */
  const [ballSteps, setBallSteps] = useState<{ x: number; y: number }[] | null>(
    null
  );
  const [lastResult, setLastResult] = useState<{
    bucket: number;
    mult: number;
    win: boolean;
  } | null>(null);
  const [history, setHistory] = useState<number[]>([]);

  const layout = plinkoLayout(risk);
  const rtp = plinkoRtp(risk);

  // Geometry. Peg rows: row r has r+2 pegs (start with 2 at the top? Actually
  // Plinko traditionally has r+1 pegs in row r, with rows 0..ROWS-1, so the
  // last row has ROWS pegs and the buckets row has ROWS+1 buckets).
  // We use: row r has (r + 2) pegs.
  const yStep = (BOARD_HEIGHT - 60) / (PLINKO_ROWS + 1);
  const xStep = (BOARD_WIDTH - 40) / (PLINKO_ROWS + 1);
  const startX = BOARD_WIDTH / 2;
  const startY = 16;

  function pegX(row: number, idx: number) {
    const pegsInRow = row + 2;
    const totalWidth = (pegsInRow - 1) * xStep;
    const x = startX - totalWidth / 2 + idx * xStep;
    return x;
  }
  function pegY(row: number) {
    return startY + (row + 1) * yStep;
  }

  function play() {
    if (busy || balance < bet) return;
    const ok = placeBet("plinko", bet);
    if (!ok) return;
    setBusy(true);
    setLastResult(null);

    const result = dropBall(bet, risk);
    playSfx("chip");

    // Compute (x, y) waypoints. After row r the ball has taken r+1 deflections
    // (one per row entered). At rows from top to bottom, the ball is between
    // pegs. We pick a "between pegs" position based on the cumulative right-count.
    const steps: { x: number; y: number }[] = [{ x: startX, y: startY }];
    let rights = 0;
    for (let r = 0; r < PLINKO_ROWS; r++) {
      if (result.path[r] === 1) rights++;
      // The pegs in row r are at indices 0..(r+1). After r+1 deflections, the
      // ball sits between two adjacent pegs in row r+1 (or in the bucket lane
      // for the last row).
      const x = pegX(r + 1, rights);
      const y = pegY(r) + yStep / 2;
      steps.push({ x, y });
    }
    setBallSteps(steps);

    // Animation duration scales with rows (about 80ms per row).
    const dur = 80 * (steps.length - 1);
    setTimeout(() => {
      setBusy(false);
      setLastResult({
        bucket: result.bucket,
        mult: result.multiplier,
        win: result.payout > bet,
      });
      setHistory((h) => [result.multiplier, ...h].slice(0, 20));
      if (result.payout > 0) winCoins("plinko", result.payout);
      pushHistory({
        game: "Plinko",
        bet,
        result: result.payout,
        net: result.payout - bet,
      });
      if (result.payout >= bet * 5) {
        playSfx("bigWin");
        fireConfetti(result.payout >= bet * 30 ? "big" : "small");
      } else if (result.payout > 0) {
        playSfx("win");
      } else {
        playSfx("lose");
      }
    }, dur + 100);
  }

  return (
    <div className="px-4 lg:px-6 py-4 grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-4">
      <div
        className="rounded-3xl p-4 sm:p-6 lg:p-8 border border-white/5"
        style={{
          background:
            "radial-gradient(ellipse at top, #2A0F4A 0%, #14102B 60%, #0A0915 100%)",
        }}
      >
        <div className="flex items-baseline gap-3 mb-4">
          <h1 className="heading text-2xl sm:text-3xl">Plinko</h1>
          <div className="text-text-secondary text-sm">
            Drop the ball · {PLINKO_ROWS} rows · RTP ≈ {(rtp * 100).toFixed(1)}%
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_240px] gap-4 items-start">
          <div className="rounded-2xl bg-black/40 border border-white/5 p-3">
            <div
              className="relative mx-auto"
              style={{ width: BOARD_WIDTH, maxWidth: "100%", height: BOARD_HEIGHT }}
            >
              <svg
                viewBox={`0 0 ${BOARD_WIDTH} ${BOARD_HEIGHT}`}
                className="absolute inset-0 w-full h-full"
              >
                {/* Pegs */}
                {Array.from({ length: PLINKO_ROWS }).map((_, r) =>
                  Array.from({ length: r + 2 }).map((__, c) => (
                    <circle
                      key={`${r}-${c}`}
                      cx={pegX(r, c)}
                      cy={pegY(r)}
                      r={PEG_RADIUS}
                      fill="#FFFFFFE6"
                    />
                  ))
                )}
              </svg>

              {/* Ball */}
              <AnimatePresence>
                {ballSteps && (
                  <motion.div
                    key={ballSteps[0].x + "-" + ballSteps.length + "-" + Math.random()}
                    initial={{ x: ballSteps[0].x - BALL_RADIUS, y: ballSteps[0].y - BALL_RADIUS, opacity: 1 }}
                    animate={{
                      x: ballSteps.map((s) => s.x - BALL_RADIUS),
                      y: ballSteps.map((s) => s.y - BALL_RADIUS),
                    }}
                    exit={{ opacity: 0 }}
                    transition={{
                      duration: 0.08 * (ballSteps.length - 1),
                      times: ballSteps.map((_, i) => i / (ballSteps.length - 1)),
                      ease: "linear",
                    }}
                    style={{
                      position: "absolute",
                      width: BALL_RADIUS * 2,
                      height: BALL_RADIUS * 2,
                      borderRadius: "50%",
                      background: "radial-gradient(circle at 35% 35%, #FFD78A, #FFC842 60%, #B45309)",
                      boxShadow: "0 0 10px rgba(255,200,66,0.7)",
                      pointerEvents: "none",
                    }}
                  />
                )}
              </AnimatePresence>

              {/* Buckets */}
              <div
                className="absolute left-0 right-0 flex justify-center gap-[2px]"
                style={{ bottom: 0, height: 36 }}
              >
                {layout.map((m, i) => {
                  const isHighlight = lastResult?.bucket === i && !busy;
                  return (
                    <motion.div
                      key={i}
                      animate={
                        isHighlight
                          ? { scale: [1, 1.18, 1], y: [0, -4, 0] }
                          : { scale: 1, y: 0 }
                      }
                      transition={{ duration: 0.5, repeat: isHighlight ? 1 : 0 }}
                      className="flex items-center justify-center font-bold rounded-md text-[10px] sm:text-xs"
                      style={{
                        width: xStep - 2,
                        background: bucketColor(m),
                        color: m === 0 ? "#FFFFFF99" : "#0F0E1A",
                        boxShadow: isHighlight
                          ? `0 0 16px ${bucketColor(m)}, inset 0 -2px 4px rgba(0,0,0,0.3)`
                          : "inset 0 -2px 4px rgba(0,0,0,0.3)",
                      }}
                    >
                      {m === 0 ? "0" : `${m}×`}
                    </motion.div>
                  );
                })}
              </div>
            </div>

            <div className="mt-3 min-h-[28px] text-center text-sm">
              {lastResult ? (
                <span
                  className={
                    lastResult.win ? "text-win font-bold" : "text-rose-300 font-bold"
                  }
                >
                  {lastResult.mult === 0
                    ? `0× · Lost ${fmt(bet)}`
                    : lastResult.win
                      ? `${lastResult.mult}× · Won ${fmt(bet * lastResult.mult - bet)}`
                      : `${lastResult.mult}× · Net ${fmt(bet * lastResult.mult - bet)}`}
                </span>
              ) : busy ? (
                <span className="text-text-secondary">Falling...</span>
              ) : (
                <span className="text-text-secondary">Drop a ball.</span>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <div className="card-base p-3">
              <div className="text-[10px] uppercase tracking-wider text-text-secondary mb-2">
                Risk
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                {(Object.keys(RISK_INFO) as Risk[]).map((r) => {
                  const info = RISK_INFO[r];
                  const active = r === risk;
                  return (
                    <button
                      key={r}
                      onClick={() => !busy && setRisk(r)}
                      disabled={busy}
                      className={`px-2 py-2 rounded-lg border text-xs font-bold transition ${
                        active
                          ? "border-accent bg-accent/15 shadow-glow-sm"
                          : "border-white/10 bg-bg-elevated hover:bg-bg-card"
                      }`}
                      style={active ? { borderColor: info.color } : undefined}
                    >
                      <div style={{ color: active ? info.color : "white" }}>
                        {info.label}
                      </div>
                    </button>
                  );
                })}
              </div>
              <div className="text-[10px] text-text-secondary mt-2 text-center">
                Max payout: <strong>{Math.max(...layout)}×</strong>
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
              </div>
            </div>

            <button
              onClick={play}
              disabled={busy || balance < bet}
              className="btn-primary text-base flex items-center justify-center gap-2"
            >
              <Play size={16} /> {busy ? "Falling..." : "Drop ball"}
            </button>
          </div>
        </div>
      </div>

      <aside className="card-base p-4">
        <h3 className="heading text-base mb-3">Multipliers</h3>
        <div className="grid grid-cols-3 gap-1 mb-3">
          {layout.map((m, i) => (
            <div
              key={i}
              className="text-[10px] font-bold text-center rounded-md py-1"
              style={{
                background: bucketColor(m),
                color: m === 0 ? "#FFFFFF66" : "#0F0E1A",
              }}
            >
              {m === 0 ? "0" : `${m}×`}
            </div>
          ))}
        </div>
        <h3 className="heading text-base mb-2">Recent drops</h3>
        {history.length === 0 ? (
          <div className="text-sm text-text-secondary py-4 text-center">
            No drops yet.
          </div>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {history.map((m, i) => (
              <span
                key={i}
                className="px-1.5 py-0.5 rounded-md text-xs font-bold border"
                style={{
                  background: m === 0 ? "rgba(244,63,94,0.12)" : "rgba(0,230,118,0.15)",
                  borderColor: m === 0 ? "#F43F5E55" : "#10B98155",
                  color: m === 0 ? "#FDA4AF" : "#86EFAC",
                }}
              >
                {m === 0 ? "0" : `${m}×`}
              </span>
            ))}
          </div>
        )}
      </aside>
    </div>
  );
}

function bucketColor(m: number): string {
  if (m === 0) return "#312E45";
  if (m >= 50) return "#FFC842";
  if (m >= 10) return "#A855F7";
  if (m >= 3) return "#22C55E";
  if (m >= 1.5) return "#0EA5E9";
  if (m >= 1) return "#3B82F6";
  return "#1F2937";
}
