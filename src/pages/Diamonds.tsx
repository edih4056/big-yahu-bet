import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play } from "lucide-react";
import { useWalletStore } from "@/store/walletStore";
import { formatMoney } from "@/lib/format";
import { playSfx } from "@/lib/sound";
import { fireConfetti } from "@/lib/confetti";
import {
  settleDiamonds,
  diamondsMultiplier,
  GEMS,
  GEM_INFO,
  GEM_RANK,
  DIAMONDS_REVEAL,
  type Gem,
} from "@/games/diamonds/engine";

const BET_PRESETS = [10, 100, 500, 1000, 5000];
const MAX_BET = 5000;

export default function Diamonds() {
  const balance = useWalletStore((s) => s.balance);
  const placeBet = useWalletStore((s) => s.bet);
  const winCoins = useWalletStore((s) => s.win);
  const pushHistory = useWalletStore((s) => s.pushHistory);
  const currency = useWalletStore((s) => s.currency);
  const fmt = (n: number) => formatMoney(n, currency);

  const [bet, setBet] = useState(100);
  const [reveal, setReveal] = useState<(Gem | null)[]>(Array(DIAMONDS_REVEAL).fill(null));
  const [busy, setBusy] = useState(false);
  const [lastResult, setLastResult] = useState<{
    winningGem: Gem | null;
    matchCount: number;
    mult: number;
    payout: number;
  } | null>(null);
  const [history, setHistory] = useState<number[]>([]);

  function play() {
    if (busy || balance < bet) return;
    const ok = placeBet("diamonds", bet);
    if (!ok) return;
    setBusy(true);
    setLastResult(null);
    setReveal(Array(DIAMONDS_REVEAL).fill(null));

    const r = settleDiamonds(bet);
    playSfx("spin");

    // reveal gems one by one
    r.reveal.forEach((gem, i) => {
      setTimeout(
        () => {
          setReveal((cur) => {
            const next = [...cur];
            next[i] = gem;
            return next;
          });
          playSfx("click");
        },
        180 * (i + 1)
      );
    });

    setTimeout(
      () => {
        setLastResult({
          winningGem: r.winningGem,
          matchCount: r.matchCount,
          mult: r.multiplier,
          payout: r.payout,
        });
        setHistory((h) => [r.multiplier, ...h].slice(0, 20));
        setBusy(false);
        if (r.payout > 0) {
          winCoins("diamonds", r.payout);
          if (r.matchCount === 5) {
            playSfx("bigWin");
            fireConfetti("big");
          } else if (r.matchCount === 4) {
            playSfx("bigWin");
            fireConfetti("small");
          } else {
            playSfx("win");
          }
        } else {
          playSfx("lose");
        }
        pushHistory({
          game: "Diamonds",
          bet,
          result: r.payout,
          net: r.payout - bet,
        });
      },
      180 * DIAMONDS_REVEAL + 240
    );
  }

  // Sorted gem list for the paytable
  const paytable = [...GEMS]
    .sort((a, b) => GEM_RANK[b] - GEM_RANK[a])
    .map((g) => ({
      gem: g,
      m3: diamondsMultiplier(g, 3),
      m4: diamondsMultiplier(g, 4),
      m5: diamondsMultiplier(g, 5),
    }));

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
          <h1 className="heading text-2xl sm:text-3xl">Diamonds</h1>
          <div className="text-text-secondary text-sm">
            Reveal 5 gems · win on 3 or more matching · rarer gems pay more.
          </div>
        </div>

        <div className="rounded-2xl bg-black/30 p-6 border border-white/5 mb-4">
          <div className="flex items-center justify-center gap-2 sm:gap-3 min-h-[140px]">
            {reveal.map((gem, i) => (
              <GemSlot key={i} gem={gem} delay={i * 0.08} />
            ))}
          </div>

          <div className="mt-4 min-h-[28px] text-center text-sm">
            {lastResult && !busy ? (
              lastResult.winningGem ? (
                <span className="font-bold text-win">
                  {lastResult.matchCount}× {lastResult.winningGem.toUpperCase()} ·{" "}
                  {lastResult.mult}× · +{fmt(lastResult.payout - bet)}
                </span>
              ) : (
                <span className="font-bold text-rose-300">
                  No match — lost {fmt(bet)}
                </span>
              )
            ) : busy ? (
              <span className="text-text-secondary">Revealing gems...</span>
            ) : (
              <span className="text-text-secondary">Place a bet and reveal.</span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_240px] gap-3">
          <div className="card-base p-3">
            <div className="text-[10px] uppercase tracking-wider text-text-secondary mb-2">
              How the gems pay
            </div>
            <div className="space-y-1">
              {paytable.map(({ gem, m3, m4, m5 }) => {
                const info = GEM_INFO[gem];
                return (
                  <div
                    key={gem}
                    className="flex items-center text-sm rounded-lg bg-bg-elevated/60 px-3 py-1.5"
                  >
                    <span className="text-base mr-2" aria-hidden>
                      {info.icon}
                    </span>
                    <span className="font-medium capitalize w-16">{gem}</span>
                    <span className="ml-auto text-xs text-text-secondary">
                      3: {m3}× · 4: {m4}× · 5: {m5}×
                    </span>
                  </div>
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
              <Play size={16} /> {busy ? "Revealing..." : "Reveal"}
            </button>
          </div>
        </div>
      </div>

      <aside className="card-base p-4">
        <h3 className="heading text-base mb-3">Recent reveals</h3>
        {history.length === 0 ? (
          <div className="text-sm text-text-secondary py-4 text-center">
            No reveals yet.
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

function GemSlot({ gem, delay }: { gem: Gem | null; delay: number }) {
  return (
    <div className="w-16 h-20 sm:w-20 sm:h-24 rounded-2xl bg-black/40 border border-white/10 flex items-center justify-center overflow-hidden">
      <AnimatePresence mode="wait">
        {gem ? (
          <motion.div
            key={gem + "-" + delay}
            initial={{ rotateY: 180, scale: 0.85, opacity: 0 }}
            animate={{ rotateY: 0, scale: 1, opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, type: "spring", stiffness: 280, damping: 22 }}
            className="text-3xl sm:text-4xl"
            style={{
              filter: `drop-shadow(0 0 10px ${GEM_INFO[gem].color})`,
            }}
          >
            {GEM_INFO[gem].icon}
          </motion.div>
        ) : (
          <span className="text-text-secondary text-xl">?</span>
        )}
      </AnimatePresence>
    </div>
  );
}
