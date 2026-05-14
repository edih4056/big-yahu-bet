import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play } from "lucide-react";
import { useWalletStore } from "@/store/walletStore";
import { formatMoney } from "@/lib/format";
import { playSfx } from "@/lib/sound";
import { fireConfetti } from "@/lib/confetti";
import {
  settleRps,
  RPS_WIN_MULT,
  SIGNS,
  type Sign,
  type RpsResult,
} from "@/games/rps/engine";

const BET_PRESETS = [10, 100, 500, 1000, 5000];
const MAX_BET = 5000;

const ICON: Record<Sign, string> = {
  rock: "🪨",
  paper: "📄",
  scissors: "✂️",
};

const COLOR: Record<Sign, string> = {
  rock: "#4B5563",
  paper: "#FBBF24",
  scissors: "#EC4899",
};

export default function Rps() {
  const balance = useWalletStore((s) => s.balance);
  const placeBet = useWalletStore((s) => s.bet);
  const winCoins = useWalletStore((s) => s.win);
  const pushHistory = useWalletStore((s) => s.pushHistory);
  const currency = useWalletStore((s) => s.currency);
  const fmt = (n: number) => formatMoney(n, currency);

  const [bet, setBet] = useState(100);
  const [pick, setPick] = useState<Sign>("rock");
  const [busy, setBusy] = useState(false);
  const [serverSign, setServerSign] = useState<Sign | null>(null);
  const [last, setLast] = useState<RpsResult | null>(null);
  const [streak, setStreak] = useState<RpsResult[]>([]);

  function play() {
    if (busy || balance < bet) return;
    const ok = placeBet("rps", bet);
    if (!ok) return;
    setBusy(true);
    setLast(null);
    setServerSign(null);
    const r = settleRps(bet, pick);
    playSfx("chip");

    // brief "shuffle" through signs before revealing
    let i = 0;
    const cycle = ["rock", "paper", "scissors", "rock", "paper", "scissors", r.server] as Sign[];
    const id = window.setInterval(() => {
      setServerSign(cycle[i]);
      i++;
      if (i >= cycle.length) {
        clearInterval(id);
        setLast(r);
        setBusy(false);
        setStreak((s) => [r, ...s].slice(0, 20));
        if (r.outcome === "win") {
          winCoins("rps", r.payout);
          playSfx("win");
          fireConfetti("small");
        } else if (r.outcome === "tie") {
          // return stake
          winCoins("rps", r.payout);
          playSfx("click");
        } else {
          playSfx("lose");
        }
        pushHistory({
          game: "Rock Paper Scissors",
          bet,
          result: r.payout,
          net: r.payout - bet,
        });
      }
    }, 80);
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
          <h1 className="heading text-2xl sm:text-3xl">Rock Paper Scissors</h1>
          <div className="text-text-secondary text-sm">
            Win pays {RPS_WIN_MULT.toFixed(2)}× · ties return your stake
          </div>
        </div>

        <div className="rounded-2xl bg-black/30 p-6 border border-white/5 mb-4">
          <div className="grid grid-cols-2 gap-4 items-center min-h-[170px]">
            <div className="flex flex-col items-center gap-2">
              <div className="text-[10px] uppercase tracking-wider text-text-secondary">
                Your pick
              </div>
              <SignBubble sign={pick} />
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="text-[10px] uppercase tracking-wider text-text-secondary">
                Server
              </div>
              <AnimatePresence mode="wait">
                {serverSign ? (
                  <motion.div
                    key={serverSign + (busy ? "-busy" : "-final")}
                    initial={{ rotateY: 90, scale: 0.85, opacity: 0 }}
                    animate={{ rotateY: 0, scale: 1, opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.08 }}
                  >
                    <SignBubble sign={serverSign} />
                  </motion.div>
                ) : (
                  <SignPlaceholder />
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="mt-3 text-center text-sm">
            {last && !busy && (
              <span
                className={`font-bold ${
                  last.outcome === "win"
                    ? "text-win"
                    : last.outcome === "tie"
                      ? "text-text-secondary"
                      : "text-rose-300"
                }`}
              >
                {last.outcome === "win" && `You win! +${fmt(last.payout - bet)}`}
                {last.outcome === "tie" && "Tie — stake returned."}
                {last.outcome === "lose" && `Server wins — lost ${fmt(bet)}`}
              </span>
            )}
            {busy && <span className="text-text-secondary">Server picking...</span>}
            {!busy && !last && (
              <span className="text-text-secondary">Choose your sign and play.</span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_240px] gap-3">
          <div className="card-base p-3">
            <div className="text-[10px] uppercase tracking-wider text-text-secondary mb-2">
              Pick a sign
            </div>
            <div className="grid grid-cols-3 gap-2">
              {SIGNS.map((s) => (
                <button
                  key={s}
                  onClick={() => !busy && setPick(s)}
                  disabled={busy}
                  className={`flex flex-col items-center justify-center gap-1 py-4 rounded-xl border-2 transition ${
                    pick === s
                      ? "border-accent bg-accent/20 shadow-glow-sm"
                      : "border-white/10 bg-bg-elevated hover:bg-bg-card"
                  }`}
                >
                  <span className="text-3xl">{ICON[s]}</span>
                  <span className="text-[10px] uppercase tracking-wider font-bold">
                    {s}
                  </span>
                </button>
              ))}
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
              <Play size={16} /> {busy ? "Playing..." : "Play"}
            </button>
          </div>
        </div>
      </div>

      <aside className="card-base p-4">
        <h3 className="heading text-base mb-3">Recent rounds</h3>
        {streak.length === 0 ? (
          <div className="text-sm text-text-secondary py-4 text-center">
            No rounds yet.
          </div>
        ) : (
          <div className="space-y-1.5 max-h-[420px] overflow-y-auto pr-1">
            {streak.map((r, i) => (
              <div
                key={i}
                className={`flex items-center justify-between text-sm rounded-lg px-3 py-1.5 border ${
                  r.outcome === "win"
                    ? "bg-emerald-500/10 border-emerald-500/30"
                    : r.outcome === "tie"
                      ? "bg-bg-elevated/60 border-white/10"
                      : "bg-rose-500/10 border-rose-500/30"
                }`}
              >
                <span>
                  {ICON[r.pick]} vs {ICON[r.server]}
                </span>
                <span
                  className={`text-[10px] uppercase tracking-wider font-bold ${
                    r.outcome === "win"
                      ? "text-emerald-300"
                      : r.outcome === "tie"
                        ? "text-text-secondary"
                        : "text-rose-300"
                  }`}
                >
                  {r.outcome}
                </span>
              </div>
            ))}
          </div>
        )}
      </aside>
    </div>
  );
}

function SignBubble({ sign }: { sign: Sign }) {
  return (
    <div
      className="w-28 h-28 sm:w-32 sm:h-32 rounded-full flex items-center justify-center text-5xl sm:text-6xl shadow-glow-sm"
      style={{
        background: `radial-gradient(circle at 35% 30%, #FFFFFF, ${COLOR[sign]} 70%, #00000044)`,
      }}
    >
      {ICON[sign]}
    </div>
  );
}

function SignPlaceholder() {
  return (
    <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full border-2 border-dashed border-white/15 flex items-center justify-center text-text-secondary text-3xl">
      ?
    </div>
  );
}
