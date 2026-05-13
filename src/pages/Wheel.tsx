import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play } from "lucide-react";
import { useWalletStore } from "@/store/walletStore";
import { formatMoney } from "@/lib/format";
import { playSfx } from "@/lib/sound";
import { fireConfetti } from "@/lib/confetti";
import {
  spinWheel,
  wheelLayout,
  wheelRtp,
  type Risk,
} from "@/games/wheel/engine";

const BET_PRESETS = [10, 100, 500, 1000, 5000];
const MAX_BET = 5000;

const RISK_INFO: Record<Risk, { label: string; sub: string; color: string }> = {
  low: { label: "Low", sub: "Frequent small wins", color: "#22C55E" },
  medium: { label: "Medium", sub: "Balanced", color: "#FBBF24" },
  high: { label: "High", sub: "Big rare spikes", color: "#EF4444" },
};

const SIZE = 280;

export default function Wheel() {
  const balance = useWalletStore((s) => s.balance);
  const placeBet = useWalletStore((s) => s.bet);
  const winCoins = useWalletStore((s) => s.win);
  const pushHistory = useWalletStore((s) => s.pushHistory);
  const currency = useWalletStore((s) => s.currency);
  const fmt = (n: number) => formatMoney(n, currency);

  const [bet, setBet] = useState(100);
  const [risk, setRisk] = useState<Risk>("medium");
  const [busy, setBusy] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [winLast, setWinLast] = useState<boolean | null>(null);
  const [multLast, setMultLast] = useState<number | null>(null);
  const [history, setHistory] = useState<number[]>([]);
  const rotRef = useRef(0);

  const layout = wheelLayout(risk);
  const segCount = layout.length;
  const degPer = 360 / segCount;

  function play() {
    if (busy || balance < bet) return;
    const ok = placeBet("wheel", bet);
    if (!ok) return;
    setBusy(true);
    setWinLast(null);
    setMultLast(null);
    const r = spinWheel(bet, risk);
    playSfx("wheel");

    // Animate to the target segment center (top = 0deg).
    const target = -(r.segmentIndex * degPer) - degPer / 2;
    const fullTurns = Math.floor(rotRef.current / 360) + 6;
    const final = fullTurns * 360 + target;
    rotRef.current = final;
    setRotation(final);

    setTimeout(() => {
      setMultLast(r.multiplier);
      setWinLast(r.win);
      setBusy(false);
      setHistory((h) => [r.multiplier, ...h].slice(0, 20));
      if (r.win) {
        winCoins("wheel", r.payout);
        if (r.multiplier >= 5) {
          playSfx("bigWin");
          fireConfetti(r.multiplier >= 20 ? "big" : "small");
        } else {
          playSfx("win");
        }
      } else {
        playSfx("lose");
      }
      pushHistory({
        game: "Wheel",
        bet,
        result: r.payout,
        net: r.payout - bet,
      });
    }, 3700);
  }

  return (
    <div className="px-4 lg:px-6 py-4 grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-4">
      <div
        className="rounded-3xl p-4 sm:p-6 lg:p-8 border border-white/5"
        style={{
          background:
            "radial-gradient(ellipse at top, #2C0F6B 0%, #16142B 60%, #0A0915 100%)",
        }}
      >
        <div className="flex items-baseline gap-3 mb-4">
          <h1 className="heading text-2xl sm:text-3xl">Wheel</h1>
          <div className="text-text-secondary text-sm">
            Spin the wheel · RTP ≈ {(wheelRtp(risk) * 100).toFixed(1)}%
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_240px] gap-6 items-start">
          <div className="rounded-2xl bg-black/30 p-4 border border-white/5 flex flex-col items-center">
            <div
              className="relative mx-auto"
              style={{ width: SIZE, height: SIZE }}
            >
              {/* Top pointer */}
              <div
                className="absolute left-1/2 -top-1 -translate-x-1/2 z-20"
                style={{
                  width: 0,
                  height: 0,
                  borderLeft: "10px solid transparent",
                  borderRight: "10px solid transparent",
                  borderTop: "16px solid #FFC842",
                  filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.6))",
                }}
              />
              <motion.div
                animate={{ rotate: rotation }}
                transition={{
                  duration: busy ? 3.6 : 0,
                  ease: [0.18, 0.7, 0.3, 1],
                }}
                className="relative w-full h-full rounded-full"
                style={{
                  boxShadow:
                    "0 0 36px rgba(123,97,255,0.4), inset 0 0 24px rgba(0,0,0,0.6)",
                }}
              >
                <svg viewBox="-150 -150 300 300" className="absolute inset-0 w-full h-full">
                  {layout.map((m, i) => {
                    const a0 = i * degPer - 90 - degPer / 2;
                    const a1 = a0 + degPer;
                    const r = 140;
                    const rIn = 50;
                    const rad = (d: number) => (d * Math.PI) / 180;
                    const p0 = [Math.cos(rad(a0)) * r, Math.sin(rad(a0)) * r];
                    const p1 = [Math.cos(rad(a1)) * r, Math.sin(rad(a1)) * r];
                    const p2 = [Math.cos(rad(a1)) * rIn, Math.sin(rad(a1)) * rIn];
                    const p3 = [Math.cos(rad(a0)) * rIn, Math.sin(rad(a0)) * rIn];
                    const fill = colorForMult(m);
                    const lA = (a0 + a1) / 2;
                    const lR = 100;
                    const lx = Math.cos(rad(lA)) * lR;
                    const ly = Math.sin(rad(lA)) * lR;
                    return (
                      <g key={i}>
                        <path
                          d={`M ${p0[0]} ${p0[1]} L ${p1[0]} ${p1[1]} L ${p2[0]} ${p2[1]} L ${p3[0]} ${p3[1]} Z`}
                          fill={fill}
                          stroke="#00000055"
                          strokeWidth={0.5}
                        />
                        <text
                          x={lx}
                          y={ly}
                          fill={m === 0 ? "#FFFFFFAA" : "white"}
                          fontSize="10"
                          fontWeight="800"
                          textAnchor="middle"
                          alignmentBaseline="middle"
                          transform={`rotate(${lA + 90}, ${lx}, ${ly})`}
                        >
                          {m === 0 ? "0" : `${m}×`}
                        </text>
                      </g>
                    );
                  })}
                  <circle r="45" fill="#16142B" stroke="#FFC842" strokeWidth="2" />
                  <text y="4" textAnchor="middle" fontSize="9" fontWeight="800" fill="#FFC842">
                    YAHU
                  </text>
                </svg>
              </motion.div>
            </div>

            <div className="mt-4 min-h-[40px] text-center">
              <AnimatePresence mode="wait">
                {winLast !== null && (
                  <motion.div
                    key={String(multLast)}
                    initial={{ y: 6, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className={`text-xl font-extrabold ${
                      winLast ? "text-win" : "text-rose-300"
                    }`}
                  >
                    {winLast ? `${multLast}× — +${fmt((multLast ?? 0) * bet - bet)}` : `0× — −${fmt(bet)}`}
                  </motion.div>
                )}
                {busy && (
                  <motion.div
                    key="spinning"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-sm text-text-secondary"
                  >
                    Spinning...
                  </motion.div>
                )}
              </AnimatePresence>
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
                      <div className="text-[9px] text-text-secondary">
                        {info.sub}
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
              <Play size={16} /> {busy ? "Spinning..." : "Spin"}
            </button>
          </div>
        </div>
      </div>

      <aside className="card-base p-4">
        <h3 className="heading text-base mb-3">Last 20 spins</h3>
        {history.length === 0 ? (
          <div className="text-sm text-text-secondary py-4 text-center">
            No spins yet.
          </div>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {history.map((m, i) => (
              <span
                key={i}
                className="px-1.5 py-0.5 rounded-md text-xs font-bold border"
                style={{
                  background:
                    m === 0
                      ? "rgba(244,63,94,0.12)"
                      : "rgba(0,230,118,0.15)",
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

function colorForMult(m: number): string {
  if (m === 0) return "#1F1F33";
  if (m >= 25) return "#FFC842"; // gold
  if (m >= 5) return "#A855F7";  // purple
  if (m >= 2) return "#22C55E";  // green
  return "#3B82F6";              // blue
}
