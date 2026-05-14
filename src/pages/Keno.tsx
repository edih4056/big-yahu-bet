import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, RotateCcw, Shuffle } from "lucide-react";
import { useWalletStore } from "@/store/walletStore";
import { formatMoney } from "@/lib/format";
import { playSfx } from "@/lib/sound";
import { fireConfetti } from "@/lib/confetti";
import {
  KENO_TOTAL,
  MAX_PICKS,
  MIN_PICKS,
  kenoMultiplier,
  settleKeno,
  type Risk,
} from "@/games/keno/engine";

const BET_PRESETS = [10, 100, 500, 1000, 5000];
const MAX_BET = 5000;

const RISK_INFO: Record<Risk, { label: string; color: string }> = {
  low: { label: "Low", color: "#22C55E" },
  medium: { label: "Medium", color: "#FBBF24" },
  high: { label: "High", color: "#EF4444" },
};

export default function Keno() {
  const balance = useWalletStore((s) => s.balance);
  const placeBet = useWalletStore((s) => s.bet);
  const winCoins = useWalletStore((s) => s.win);
  const pushHistory = useWalletStore((s) => s.pushHistory);
  const currency = useWalletStore((s) => s.currency);
  const fmt = (n: number) => formatMoney(n, currency);

  const [bet, setBet] = useState(100);
  const [risk, setRisk] = useState<Risk>("medium");
  const [picks, setPicks] = useState<Set<number>>(new Set());
  const [drawn, setDrawn] = useState<number[]>([]);
  const [revealStep, setRevealStep] = useState(0);
  const [busy, setBusy] = useState(false);
  const [lastResult, setLastResult] = useState<{
    hits: number;
    multiplier: number;
    payout: number;
  } | null>(null);

  function togglePick(n: number) {
    if (busy) return;
    setPicks((cur) => {
      const next = new Set(cur);
      if (next.has(n)) next.delete(n);
      else if (next.size < MAX_PICKS) next.add(n);
      return next;
    });
    setLastResult(null);
  }

  function clearPicks() {
    if (busy) return;
    setPicks(new Set());
    setLastResult(null);
  }

  function randomize() {
    if (busy) return;
    const out = new Set<number>();
    const target = Math.min(MAX_PICKS, Math.max(MIN_PICKS, 5));
    while (out.size < target) {
      out.add(1 + Math.floor(Math.random() * KENO_TOTAL));
    }
    setPicks(out);
    setLastResult(null);
  }

  function play() {
    if (busy) return;
    if (picks.size < MIN_PICKS) return;
    if (balance < bet) return;
    const ok = placeBet("keno", bet);
    if (!ok) return;
    setBusy(true);
    setRevealStep(0);

    const r = settleKeno(bet, [...picks], risk);
    setDrawn(r.drawn);
    playSfx("spin");

    // animate drawn numbers one by one
    const step = 110;
    let i = 0;
    const id = window.setInterval(() => {
      i++;
      setRevealStep(i);
      playSfx("click");
      if (i >= r.drawn.length) {
        clearInterval(id);
        setLastResult({
          hits: r.hits.length,
          multiplier: r.multiplier,
          payout: r.payout,
        });
        setBusy(false);
        if (r.payout > 0) {
          winCoins("keno", r.payout);
          if (r.multiplier >= 10) {
            playSfx("bigWin");
            fireConfetti(r.multiplier >= 100 ? "big" : "small");
          } else {
            playSfx("win");
          }
        } else {
          playSfx("lose");
        }
        pushHistory({
          game: "Keno",
          bet,
          result: r.payout,
          net: r.payout - bet,
        });
      }
    }, step);
  }

  const paytable = Array.from({ length: picks.size + 1 }, (_, h) => ({
    hits: h,
    mult: kenoMultiplier(risk, Math.max(1, picks.size), h),
  }));

  const drawnVisible = new Set(drawn.slice(0, revealStep));

  return (
    <div className="px-4 lg:px-6 py-4 grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-4">
      <div
        className="rounded-3xl p-4 sm:p-6 lg:p-8 border border-white/5"
        style={{
          background:
            "radial-gradient(ellipse at top, #0E2A40 0%, #0A1228 60%, #050816 100%)",
        }}
      >
        <div className="flex items-baseline gap-3 mb-4">
          <h1 className="heading text-2xl sm:text-3xl">Keno</h1>
          <div className="text-text-secondary text-sm">
            Pick {MIN_PICKS}–{MAX_PICKS} numbers from 1–{KENO_TOTAL}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_240px] gap-4">
          <div className="rounded-2xl bg-black/30 p-4 border border-white/5">
            <div
              className="grid gap-1.5 sm:gap-2"
              style={{ gridTemplateColumns: "repeat(8, minmax(0, 1fr))" }}
            >
              {Array.from({ length: KENO_TOTAL }).map((_, idx) => {
                const n = idx + 1;
                const isPicked = picks.has(n);
                const isDrawn = drawnVisible.has(n);
                const isHit = isPicked && isDrawn;
                const isMiss = !isPicked && isDrawn;
                return (
                  <motion.button
                    key={n}
                    whileHover={!busy ? { scale: 1.05 } : {}}
                    whileTap={!busy ? { scale: 0.95 } : {}}
                    onClick={() => togglePick(n)}
                    disabled={busy && !isPicked}
                    animate={isDrawn ? { scale: [1, 1.18, 1] } : { scale: 1 }}
                    transition={{ duration: 0.35 }}
                    className={`aspect-square rounded-lg font-bold text-sm sm:text-base border transition ${
                      isHit
                        ? "bg-win/40 border-win text-white shadow-[0_0_18px_rgba(0,230,118,0.55)]"
                        : isPicked && !isDrawn && revealStep > 0
                          ? "bg-bg-elevated border-accent/40 text-text-secondary opacity-50"
                          : isPicked
                            ? "bg-accent/25 border-accent text-white shadow-glow-sm"
                            : isMiss
                              ? "bg-rose-500/25 border-rose-500/40 text-rose-200"
                              : "bg-bg-elevated border-white/10 text-text-secondary hover:bg-bg-card"
                    }`}
                  >
                    {n}
                  </motion.button>
                );
              })}
            </div>

            <div className="mt-4 min-h-[28px] text-center text-sm">
              <AnimatePresence mode="wait">
                {lastResult && !busy ? (
                  <motion.div
                    key="result"
                    initial={{ y: 6, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className={`font-bold ${
                      lastResult.payout > 0 ? "text-win" : "text-rose-300"
                    }`}
                  >
                    {lastResult.hits} hit{lastResult.hits !== 1 ? "s" : ""} ·{" "}
                    {lastResult.multiplier > 0
                      ? `${lastResult.multiplier}× · +${fmt(lastResult.payout - bet)}`
                      : `0× · −${fmt(bet)}`}
                  </motion.div>
                ) : busy ? (
                  <motion.div key="busy" className="text-text-secondary">
                    Drawing numbers...
                  </motion.div>
                ) : picks.size === 0 ? (
                  <motion.div key="hint" className="text-text-secondary">
                    Tap up to {MAX_PICKS} numbers, then press Play.
                  </motion.div>
                ) : (
                  <motion.div key="ready" className="text-text-secondary">
                    {picks.size}/{MAX_PICKS} numbers selected
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

            <div className="flex gap-2">
              <button
                onClick={randomize}
                disabled={busy}
                className="btn-secondary text-sm flex-1 flex items-center justify-center gap-1"
              >
                <Shuffle size={14} /> Random
              </button>
              <button
                onClick={clearPicks}
                disabled={busy || picks.size === 0}
                className="btn-secondary text-sm flex items-center justify-center gap-1"
              >
                <RotateCcw size={14} />
              </button>
            </div>

            <button
              onClick={play}
              disabled={busy || balance < bet || picks.size === 0}
              className="btn-primary text-base flex items-center justify-center gap-2"
            >
              <Play size={16} /> {busy ? "Drawing..." : "Play"}
            </button>
          </div>
        </div>
      </div>

      <aside className="card-base p-4">
        <h3 className="heading text-base mb-3">Paytable</h3>
        {picks.size === 0 ? (
          <div className="text-sm text-text-secondary py-4 text-center">
            Pick some numbers to see your paytable.
          </div>
        ) : (
          <div className="space-y-1">
            {paytable.map(({ hits, mult }) => (
              <div
                key={hits}
                className={`flex items-center justify-between text-sm rounded-lg px-3 py-1.5 ${
                  lastResult?.hits === hits
                    ? "bg-emerald-500/15 border border-emerald-500/30"
                    : "bg-bg-elevated/60"
                }`}
              >
                <span className="text-text-secondary">
                  {hits} hit{hits !== 1 ? "s" : ""}
                </span>
                <span
                  className={`font-bold ${
                    mult > 0 ? "text-win" : "text-text-secondary"
                  }`}
                >
                  {mult > 0 ? `${mult}×` : "—"}
                </span>
              </div>
            ))}
          </div>
        )}
      </aside>
    </div>
  );
}
