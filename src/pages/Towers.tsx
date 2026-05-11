import { useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bomb,
  ChevronUp,
  Coins,
  Flame,
  Gem,
  PiggyBank,
  Play,
  Skull,
} from "lucide-react";
import { useWalletStore } from "@/store/walletStore";
import { formatCoins } from "@/lib/format";
import { playSfx } from "@/lib/sound";
import { fireConfetti } from "@/lib/confetti";
import {
  TowersEngine,
  DIFFICULTIES,
  buildMultipliers,
  type Difficulty,
} from "@/games/towers/engine";

const DIFF_LABELS: Record<Difficulty, { label: string; sub: string; color: string }> = {
  easy: { label: "Easy", sub: "3 safe / 1 bomb", color: "#00E676" },
  medium: { label: "Medium", sub: "2 safe / 1 bomb", color: "#FFC842" },
  hard: { label: "Hard", sub: "1 safe / 1 bomb", color: "#FF8A00" },
  extreme: { label: "Extreme", sub: "1 safe / 2 bombs", color: "#FF3B6B" },
};

const BET_PRESETS = [10, 25, 100, 500, 1000];

export default function Towers() {
  const balance = useWalletStore((s) => s.balance);
  const placeBet = useWalletStore((s) => s.bet);
  const winCoins = useWalletStore((s) => s.win);
  const pushHistory = useWalletStore((s) => s.pushHistory);

  const [bet, setBet] = useState(25);
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const engineRef = useRef<TowersEngine | null>(null);
  const [, force] = useState(0);
  const refresh = () => force((n) => n + 1);
  const [message, setMessage] = useState<string | null>(
    "Pick a difficulty, set your bet, and start climbing."
  );

  const eng = engineRef.current;
  const inGame = eng?.status === "playing";
  const finished = eng && eng.status !== "playing";

  const multipliers = useMemo(() => buildMultipliers(difficulty), [difficulty]);

  function startGame() {
    if (inGame) return;
    if (balance < bet) {
      setMessage("Not enough coins for that bet.");
      return;
    }
    const ok = placeBet("towers", bet);
    if (!ok) {
      setMessage("Not enough coins.");
      return;
    }
    engineRef.current = new TowersEngine(difficulty, bet);
    setMessage("Pick a tile in the active row.");
    playSfx("chip");
    refresh();
  }

  function pickTile(idx: number) {
    if (!eng || eng.status !== "playing") return;
    const r = eng.pick(idx);
    if (r.hit === "bomb") {
      eng.revealAll();
      setMessage(`💥 Bomb! You lose ${formatCoins(bet)} YAHU.`);
      playSfx("lose");
      pushHistory({
        game: "Towers",
        bet,
        result: 0,
        net: -bet,
      });
    } else {
      playSfx("cardFlip");
      const status: string = eng.status;
      if (status === "cashed") {
        // top reached
        const payout = eng.potentialPayout();
        winCoins("towers", payout);
        setMessage(
          `🏆 Tower conquered! You win ${formatCoins(payout - bet)} YAHU.`
        );
        playSfx("bigWin");
        fireConfetti("big");
        pushHistory({
          game: "Towers",
          bet,
          result: payout,
          net: payout - bet,
        });
      } else {
        setMessage(
          `Safe! Cash out ${formatCoins(eng.potentialPayout())} or climb higher.`
        );
      }
    }
    refresh();
  }

  function doCashOut() {
    if (!eng || eng.status !== "playing" || eng.level === 0) return;
    const payout = eng.cashOut();
    winCoins("towers", payout);
    setMessage(`💰 Cashed out for ${formatCoins(payout)} YAHU.`);
    playSfx("win");
    if (payout >= bet * 3) fireConfetti("small");
    pushHistory({
      game: "Towers",
      bet,
      result: payout,
      net: payout - bet,
    });
    refresh();
  }

  function reset() {
    engineRef.current = null;
    setMessage("Pick a difficulty, set your bet, and start climbing.");
    refresh();
  }

  const cfg = DIFFICULTIES[difficulty];
  const liveLevel = eng?.level ?? 0;
  // Render rows top-to-bottom: row 0 (bottom) → row N-1 (top)
  const renderRows: number[] = [];
  for (let r = cfg.rows - 1; r >= 0; r--) renderRows.push(r);

  return (
    <div className="px-4 lg:px-6 py-4 grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-4">
      <div
        className="rounded-3xl p-4 sm:p-6 lg:p-8 border border-accent/20 relative overflow-hidden"
        style={{
          background:
            "radial-gradient(ellipse at top, #2C0F6B 0%, #16142B 60%, #0A0915 100%)",
        }}
      >
        <div className="flex items-baseline gap-3 mb-4">
          <h1 className="heading text-2xl sm:text-3xl">Towers</h1>
          <div className="text-text-secondary text-sm">
            Climb the tower · 1% house edge
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_220px] gap-6">
          {/* Tower */}
          <div className="rounded-2xl bg-black/30 p-4 border border-white/5">
            <div className="flex flex-col gap-1.5">
              {renderRows.map((rIdx) => {
                const row = eng?.rows[rIdx];
                const isActive = inGame && rIdx === liveLevel;
                const isPast = eng && rIdx < liveLevel;
                const mult = multipliers[rIdx];
                return (
                  <div
                    key={rIdx}
                    className={`flex items-center gap-2 rounded-xl px-2 py-1.5 transition ${
                      isActive
                        ? "bg-accent/15 border border-accent/40 shadow-glow-sm"
                        : isPast
                          ? "bg-emerald-500/5"
                          : ""
                    }`}
                  >
                    <div className="w-14 text-right">
                      <span
                        className={`text-xs font-bold ${
                          isPast ? "text-win" : isActive ? "text-accent-light" : "text-text-secondary"
                        }`}
                      >
                        {mult.toFixed(2)}×
                      </span>
                    </div>
                    <div
                      className="flex-1 grid gap-2"
                      style={{
                        gridTemplateColumns: `repeat(${cfg.tilesPerRow}, minmax(0, 1fr))`,
                      }}
                    >
                      {Array.from({ length: cfg.tilesPerRow }).map((_, ti) => (
                        <Tile
                          key={ti}
                          row={rIdx}
                          tile={ti}
                          state={row?.tiles[ti] ?? "hidden"}
                          isActiveRow={isActive}
                          onClick={() => isActive && pickTile(ti)}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Side controls */}
          <div className="flex flex-col gap-3">
            <DifficultyPicker
              value={difficulty}
              onChange={(d) => !inGame && setDifficulty(d)}
              disabled={inGame}
            />

            <div className="card-base p-3">
              <div className="text-[10px] uppercase tracking-wider text-text-secondary mb-1">
                Bet (YAHU)
              </div>
              <input
                type="number"
                value={bet}
                onChange={(e) => setBet(Math.max(1, Math.floor(Number(e.target.value) || 1)))}
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
                    {p}
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
                  onClick={() => setBet((b) => Math.min(balance, b * 2))}
                  disabled={!!inGame}
                  className="px-2 py-1 rounded-md text-xs font-semibold bg-bg-elevated hover:bg-accent/20 transition disabled:opacity-40"
                >
                  2×
                </button>
              </div>
            </div>

            <div className="card-base p-3 space-y-1.5">
              <Stat label="Balance" value={`${formatCoins(balance)}`} />
              {eng && (
                <>
                  <Stat
                    label="Current ×"
                    value={`${eng.currentMultiplier().toFixed(2)}×`}
                    accent
                  />
                  <Stat
                    label="Potential payout"
                    value={`${formatCoins(eng.potentialPayout())}`}
                  />
                  <Stat
                    label="Next level ×"
                    value={
                      eng.level >= cfg.rows
                        ? "MAX"
                        : `${eng.nextMultiplier().toFixed(2)}×`
                    }
                  />
                </>
              )}
            </div>

            {!inGame && (
              <button
                onClick={startGame}
                disabled={balance < bet}
                className="btn-primary text-base flex items-center justify-center gap-2"
              >
                <Play size={16} />
                {finished ? "Play again" : "Start climbing"}
              </button>
            )}

            {inGame && eng && eng.level > 0 && (
              <button
                onClick={doCashOut}
                className="px-5 py-3 rounded-2xl bg-gold-gradient text-black font-extrabold shadow-glow-gold hover:scale-[1.03] active:scale-95 transition flex items-center justify-center gap-2"
              >
                <PiggyBank size={18} /> Cash out {formatCoins(eng.potentialPayout())}
              </button>
            )}

            {inGame && eng && eng.level === 0 && (
              <div className="text-xs text-text-secondary text-center">
                Pick a tile to start climbing — cash-out enabled after row 1.
              </div>
            )}

            {finished && (
              <button onClick={reset} className="btn-secondary">
                Reset board
              </button>
            )}
          </div>
        </div>

        <AnimatePresence>
          {message && (
            <motion.div
              key={message}
              initial={{ y: 8, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mt-4 text-center"
            >
              <div className="inline-block px-4 py-1.5 rounded-full bg-black/40 backdrop-blur text-sm font-semibold border border-white/10">
                {message}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Right column: paytable */}
      <aside className="card-base p-4">
        <div className="flex items-center gap-2 mb-3">
          <Coins size={16} className="text-gold" />
          <h3 className="heading text-base">Multiplier Ladder</h3>
        </div>
        <div className="text-xs text-text-secondary mb-3">
          Cash out at any level after the first safe pick. Multipliers below
          are bet × payout. Algorithm follows the standard Towers fair-odds
          model with 1% house edge: <code>(tiles / safe)^level × 0.99^level</code>.
        </div>
        <div className="space-y-1">
          {[...multipliers].reverse().map((m, i) => {
            const lvl = multipliers.length - i;
            const reached = (eng?.level ?? 0) >= lvl;
            return (
              <div
                key={lvl}
                className={`flex items-center justify-between text-sm rounded-lg px-3 py-1.5 ${
                  reached ? "bg-emerald-500/10 text-win" : "bg-bg-elevated/60"
                }`}
              >
                <span className="text-text-secondary">Level {lvl}</span>
                <span className="font-bold">{m.toFixed(2)}×</span>
              </div>
            );
          })}
        </div>
        <div className="text-[10px] text-text-secondary text-center mt-3">
          Demo only — no real money is involved.
        </div>
      </aside>
    </div>
  );
}

function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-text-secondary">{label}</span>
      <span
        className={`font-semibold ${accent ? "text-accent-light" : "text-white"}`}
      >
        {value}
      </span>
    </div>
  );
}

function Tile({
  state,
  isActiveRow,
  onClick,
}: {
  row: number;
  tile: number;
  state: string;
  isActiveRow: boolean;
  onClick: () => void;
}) {
  const isHidden = state === "hidden";
  const isRevealedSafe = state === "revealed-safe";
  const isRevealedBomb = state === "revealed-bomb";
  const isShownSafe = state === "safe";
  const isShownBomb = state === "bomb";
  const clickable = isActiveRow && isHidden;

  return (
    <motion.button
      whileHover={clickable ? { scale: 1.03 } : {}}
      whileTap={clickable ? { scale: 0.95 } : {}}
      onClick={onClick}
      disabled={!clickable}
      className={`relative h-12 sm:h-14 rounded-lg border transition flex items-center justify-center font-bold ${
        clickable
          ? "bg-bg-elevated border-white/10 hover:border-accent/50 hover:bg-accent/10 cursor-pointer"
          : isRevealedSafe
            ? "bg-emerald-500/30 border-emerald-400/60 shadow-[0_0_18px_rgba(0,230,118,0.45)]"
            : isShownSafe
              ? "bg-emerald-500/10 border-emerald-400/30"
              : isRevealedBomb
                ? "bg-rose-500/40 border-rose-400/70 shadow-[0_0_18px_rgba(255,59,107,0.55)]"
                : isShownBomb
                  ? "bg-rose-500/15 border-rose-400/40"
                  : "bg-bg-elevated/50 border-white/5"
      }`}
    >
      {isRevealedSafe || isShownSafe ? (
        <Gem size={16} className="text-emerald-300" />
      ) : isRevealedBomb ? (
        <Skull size={18} className="text-white" />
      ) : isShownBomb ? (
        <Bomb size={16} className="text-rose-300" />
      ) : isActiveRow ? (
        <ChevronUp size={16} className="text-accent-light/70" />
      ) : null}
    </motion.button>
  );
}

function DifficultyPicker({
  value,
  onChange,
  disabled,
}: {
  value: Difficulty;
  onChange: (d: Difficulty) => void;
  disabled?: boolean;
}) {
  return (
    <div className="card-base p-3">
      <div className="text-[10px] uppercase tracking-wider text-text-secondary mb-2 flex items-center gap-1.5">
        <Flame size={12} className="text-rose-400" /> Difficulty
      </div>
      <div className="grid grid-cols-2 gap-1.5">
        {(Object.keys(DIFF_LABELS) as Difficulty[]).map((d) => {
          const info = DIFF_LABELS[d];
          const active = value === d;
          return (
            <button
              key={d}
              onClick={() => onChange(d)}
              disabled={disabled}
              className={`text-left px-2.5 py-2 rounded-lg border transition ${
                active
                  ? "border-accent bg-accent/15 shadow-glow-sm"
                  : "border-white/10 bg-bg-elevated/60 hover:bg-bg-elevated"
              } disabled:opacity-50`}
              style={active ? { borderColor: info.color } : undefined}
            >
              <div
                className="font-bold text-sm"
                style={{ color: active ? info.color : "white" }}
              >
                {info.label}
              </div>
              <div className="text-[10px] text-text-secondary">{info.sub}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
