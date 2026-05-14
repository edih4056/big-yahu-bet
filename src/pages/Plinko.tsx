import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Zap } from "lucide-react";
import { useWalletStore } from "@/store/walletStore";
import { formatMoney, uid } from "@/lib/format";
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
const BOARD_HEIGHT = 460;
const PEG_RADIUS = 3.5;
const BALL_RADIUS = 7;
const ROW_DURATION_MS = 95; // time per row — slightly slower for cleaner feel
const SETTLE_PAUSE_MS = 220;

// Tunable bounce on each peg (in px)
const BOUNCE_AMPLITUDE = 5;

type ActiveBall = {
  id: string;
  /** Geometry: (x, y) at the moment the ball passes between two pegs in each row */
  waypoints: { x: number; y: number }[];
  /** Cached at drop time — used when settling */
  bet: number;
  bucket: number;
  multiplier: number;
  payout: number;
  /** Wall-clock the animation began (ms) */
  startedAt: number;
};

type BucketHighlight = { bucket: number; key: string };

export default function Plinko() {
  const balance = useWalletStore((s) => s.balance);
  const placeBet = useWalletStore((s) => s.bet);
  const winCoins = useWalletStore((s) => s.win);
  const pushHistory = useWalletStore((s) => s.pushHistory);
  const currency = useWalletStore((s) => s.currency);
  const fmt = (n: number) => formatMoney(n, currency);

  const [bet, setBet] = useState(100);
  const [risk, setRisk] = useState<Risk>("medium");
  /** Balls currently in flight on the board */
  const [active, setActive] = useState<ActiveBall[]>([]);
  /** Buckets currently highlighted (last few landings) */
  const [highlights, setHighlights] = useState<BucketHighlight[]>([]);
  /** Last 20 multipliers, for the side panel */
  const [history, setHistory] = useState<number[]>([]);
  /** Optional auto-drop run (count remaining) */
  const [autoRemaining, setAutoRemaining] = useState(0);

  const balanceRef = useRef(balance);
  balanceRef.current = balance;

  const layout = plinkoLayout(risk);
  const rtp = plinkoRtp(risk);

  // Geometry helpers
  const yStep = (BOARD_HEIGHT - 70) / (PLINKO_ROWS + 1);
  const xStep = (BOARD_WIDTH - 40) / (PLINKO_ROWS + 1);
  const startX = BOARD_WIDTH / 2;
  const startY = 18;

  function pegX(row: number, idx: number) {
    const pegsInRow = row + 2;
    const totalWidth = (pegsInRow - 1) * xStep;
    return startX - totalWidth / 2 + idx * xStep;
  }
  function pegY(row: number) {
    return startY + (row + 1) * yStep;
  }

  function computeWaypoints(path: (-1 | 1)[]) {
    const wp: { x: number; y: number }[] = [{ x: startX, y: startY }];
    let rights = 0;
    for (let r = 0; r < PLINKO_ROWS; r++) {
      if (path[r] === 1) rights++;
      const x = pegX(r + 1, rights);
      const y = pegY(r) + yStep / 2;
      wp.push({ x, y });
    }
    // Final point: drop straight down into the bucket row
    const lastY = BOARD_HEIGHT - 30;
    wp.push({ x: wp[wp.length - 1].x, y: lastY });
    return wp;
  }

  function dropOne() {
    // Use ref to avoid stale closure in auto mode
    if (balanceRef.current < bet) return false;
    const ok = placeBet("plinko", bet);
    if (!ok) return false;
    const result = dropBall(bet, risk);
    const wp = computeWaypoints(result.path);

    const ball: ActiveBall = {
      id: uid(),
      waypoints: wp,
      bet,
      bucket: result.bucket,
      multiplier: result.multiplier,
      payout: result.payout,
      startedAt: performance.now(),
    };
    setActive((cur) => [...cur, ball]);
    playSfx("click");

    // Schedule settlement when this ball completes its journey
    const totalDur = ROW_DURATION_MS * (wp.length - 1) + SETTLE_PAUSE_MS;
    setTimeout(() => onSettle(ball), totalDur);
    return true;
  }

  function onSettle(ball: ActiveBall) {
    setActive((cur) => cur.filter((b) => b.id !== ball.id));
    setHistory((h) => [ball.multiplier, ...h].slice(0, 30));
    setHighlights((cur) => [...cur, { bucket: ball.bucket, key: ball.id }]);
    // Remove the highlight after the pulse
    setTimeout(() => {
      setHighlights((cur) => cur.filter((h) => h.key !== ball.id));
    }, 700);

    if (ball.payout > 0) {
      winCoins("plinko", ball.payout);
      if (ball.payout >= ball.bet * 10) {
        playSfx("bigWin");
        fireConfetti(ball.payout >= ball.bet * 50 ? "big" : "small");
      } else if (ball.payout >= ball.bet) {
        playSfx("win");
      } else {
        playSfx("click"); // small fractional return
      }
    } else {
      playSfx("lose");
    }
    pushHistory({
      game: "Plinko",
      bet: ball.bet,
      result: ball.payout,
      net: ball.payout - ball.bet,
    });
  }

  // Auto-drop loop
  useEffect(() => {
    if (autoRemaining <= 0) return;
    const id = window.setTimeout(() => {
      const ok = dropOne();
      setAutoRemaining((n) => (ok ? n - 1 : 0));
    }, 120);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoRemaining, active.length]);

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
            Drop multiple balls · {PLINKO_ROWS} rows · RTP ≈ {(rtp * 100).toFixed(1)}%
          </div>
          {active.length > 0 && (
            <div className="ml-auto flex items-center gap-1 px-2.5 py-1 rounded-full bg-accent/15 border border-accent/30 text-[10px] uppercase tracking-wider font-bold text-accent-light">
              <Zap size={11} /> {active.length} in flight
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_240px] gap-4 items-start">
          <div className="rounded-2xl bg-black/40 border border-white/5 p-3 overflow-hidden">
            <div
              className="relative mx-auto"
              style={{ width: BOARD_WIDTH, maxWidth: "100%", height: BOARD_HEIGHT }}
            >
              <svg
                viewBox={`0 0 ${BOARD_WIDTH} ${BOARD_HEIGHT}`}
                className="absolute inset-0 w-full h-full"
                preserveAspectRatio="xMidYMid meet"
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

              {/* Active balls */}
              <AnimatePresence>
                {active.map((ball) => (
                  <BallDot key={ball.id} ball={ball} radius={BALL_RADIUS} />
                ))}
              </AnimatePresence>

              {/* Buckets */}
              <div
                className="absolute left-0 right-0 flex justify-center gap-[2px]"
                style={{ bottom: 0, height: 38 }}
              >
                {layout.map((m, i) => {
                  const isHot = highlights.some((h) => h.bucket === i);
                  return (
                    <motion.div
                      key={i}
                      animate={
                        isHot
                          ? { scale: [1, 1.18, 1], y: [0, -4, 0] }
                          : { scale: 1, y: 0 }
                      }
                      transition={{ duration: 0.55 }}
                      className="flex items-center justify-center font-bold rounded-md text-[10px] sm:text-xs"
                      style={{
                        width: xStep - 2,
                        background: bucketColor(m),
                        color: m === 0 ? "#FFFFFF99" : "#0F0E1A",
                        boxShadow: isHot
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

            <div className="mt-3 flex items-center gap-2">
              <button
                onClick={dropOne}
                disabled={balance < bet}
                className="flex-1 btn-primary text-base flex items-center justify-center gap-2"
              >
                <Play size={16} /> Drop ball
              </button>
              <button
                onClick={() =>
                  setAutoRemaining((cur) =>
                    cur > 0 ? 0 : Math.min(50, Math.floor(balance / bet))
                  )
                }
                disabled={balance < bet}
                className={`px-3 py-2 rounded-2xl text-sm font-semibold border transition disabled:opacity-40 ${
                  autoRemaining > 0
                    ? "bg-rose-500/15 border-rose-500/40 text-rose-200"
                    : "bg-bg-elevated border-white/10 hover:bg-accent/20 hover:border-accent/40"
                }`}
                title="Drop a stream of balls automatically"
              >
                {autoRemaining > 0 ? `Stop (${autoRemaining})` : "Auto × 50"}
              </button>
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
                      onClick={() => setRisk(r)}
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
                  Bet per ball
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
                className="w-full bg-bg-elevated rounded-lg px-3 py-2 outline-none border border-white/5 focus:border-accent/50"
              />
              <div className="flex flex-wrap gap-1 mt-2">
                {BET_PRESETS.map((p) => (
                  <button
                    key={p}
                    onClick={() => setBet(p)}
                    className="px-2 py-1 rounded-md text-xs font-semibold bg-bg-elevated hover:bg-accent/20 transition"
                  >
                    {p >= 1000 ? `${p / 1000}K` : p}
                  </button>
                ))}
              </div>
            </div>
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

/**
 * A single ball animated through its waypoints. Each segment between two pegs
 * uses an easeOut + tiny bounce so the motion feels like a physical fall.
 */
function BallDot({
  ball,
  radius,
}: {
  ball: ActiveBall;
  radius: number;
}) {
  // Build the keyframe sequences once per mount
  const xKey = ball.waypoints.map((p) => p.x - radius);
  const yKey = ball.waypoints.map((p) => p.y - radius);
  const totalDur = ROW_DURATION_MS * (ball.waypoints.length - 1);
  // Mirror the dur into seconds and build evenly spaced times
  const times = ball.waypoints.map((_, i) => i / (ball.waypoints.length - 1));

  return (
    <motion.div
      initial={{ x: xKey[0], y: yKey[0], opacity: 1 }}
      animate={{
        x: xKey,
        y: yKey,
        // Tiny bounce at each peg via a single keyframed scale
        scale: ball.waypoints.map((_, i) => (i % 2 === 0 ? 1 : 0.92)),
      }}
      exit={{ opacity: 0, scale: 0.6 }}
      transition={{
        duration: totalDur / 1000,
        times,
        ease: "easeIn",
        scale: { duration: totalDur / 1000, times, ease: "easeOut" },
      }}
      style={{
        position: "absolute",
        width: radius * 2,
        height: radius * 2,
        borderRadius: "50%",
        pointerEvents: "none",
        background:
          "radial-gradient(circle at 30% 30%, #FFE7A5, #FFC842 55%, #B45309)",
        boxShadow:
          "0 0 12px rgba(255,200,66,0.7), inset -1px -2px 3px rgba(0,0,0,0.35)",
      }}
      // disable layout animation overhead
      layout={false}
    />
  );
  void BOUNCE_AMPLITUDE; // referenced for future physical bounce tuning
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
