import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Coins,
  Hand,
  RotateCw,
  Shield,
  HandMetal,
  Layers,
} from "lucide-react";
import { useWalletStore } from "@/store/walletStore";
import { formatMoney } from "@/lib/format";
import { playSfx } from "@/lib/sound";
import { fireConfetti } from "@/lib/confetti";
import {
  BlackjackEngine,
  handTotal,
  type PlayerHand,
} from "@/games/blackjack/engine";
import { PlayingCard } from "@/games/blackjack/Card";

const CHIP_VALUES = [5, 25, 100, 500, 1000, 5000];
const CHIP_COLORS: Record<number, string> = {
  5: "linear-gradient(135deg, #FFFFFF 0%, #C0C0C0 100%)",
  25: "linear-gradient(135deg, #FF3B6B 0%, #B8284D 100%)",
  100: "linear-gradient(135deg, #00E676 0%, #00A050 100%)",
  500: "linear-gradient(135deg, #2D2D2D 0%, #0D0D0D 100%)",
  1000: "linear-gradient(135deg, #C26BFF 0%, #7B61FF 100%)",
  5000: "linear-gradient(135deg, #FFE15A 0%, #FFC842 50%, #FF8A00 100%)",
};

export default function Blackjack() {
  const balance = useWalletStore((s) => s.balance);
  const placeBet = useWalletStore((s) => s.bet);
  const winCoins = useWalletStore((s) => s.win);
  const pushHistory = useWalletStore((s) => s.pushHistory);
  const currency = useWalletStore((s) => s.currency);
  const fmt = (n: number) => formatMoney(n, currency);

  const engineRef = useRef(new BlackjackEngine(6));
  const [, force] = useState(0);
  const refresh = () => force((n) => n + 1);

  const eng = engineRef.current;

  const [pendingBet, setPendingBet] = useState(0);
  const [originalBet, setOriginalBet] = useState(0);
  const [sessionLog, setSessionLog] = useState<
    Array<{ id: string; bet: number; net: number }>
  >([]);
  const [message, setMessage] = useState<string | null>("Place your bet");

  const totalActiveBet = useMemo(
    () => eng.hands.reduce((s, h) => s + h.bet, 0),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [eng.hands.length, eng.state]
  );

  const sessionTotalNet = sessionLog.reduce((s, e) => s + e.net, 0);

  function addChip(v: number) {
    if (eng.state !== "betting" && eng.state !== "settled") return;
    if (balance < pendingBet + v) {
      setMessage("Not enough for that chip.");
      return;
    }
    setPendingBet((b) => b + v);
    playSfx("chip");
  }
  function clearChips() {
    setPendingBet(0);
  }

  function deal() {
    if (pendingBet <= 0) {
      setMessage("Place a bet first.");
      return;
    }
    const ok = placeBet("blackjack", pendingBet);
    if (!ok) {
      setMessage("Not enough.");
      return;
    }
    eng.startHand(pendingBet);
    setOriginalBet(pendingBet);
    setMessage(eng.state === "settled" ? "Blackjack!" : "Your turn");
    playSfx("cardDeal");
    refresh();
    if (eng.state === "settled") settle();
  }

  function rebet(multiplier = 1) {
    if (sessionLog.length === 0) return;
    const last = Math.floor(sessionLog[0].bet * multiplier);
    if (balance < last) return;
    setPendingBet(last);
  }

  function halfBet() {
    setPendingBet((p) => Math.max(0, Math.floor(p / 2)));
  }
  function doubleBet() {
    setPendingBet((p) => Math.min(balance, p * 2 || 5));
  }
  function maxBet() {
    setPendingBet(Math.min(balance, 5000));
  }

  function endTurnSettle() {
    setTimeout(() => {
      refresh();
      if (eng.state === "settled") settle();
    }, 300);
  }

  function action(kind: "hit" | "stand" | "double" | "split") {
    if (eng.state !== "player") return;
    if (kind === "hit") {
      eng.hit();
      playSfx("cardDeal");
    } else if (kind === "stand") {
      eng.stand();
    } else if (kind === "double") {
      const extra = eng.hands[eng.activeHandIdx].bet;
      const ok = placeBet("blackjack", extra);
      if (!ok) {
        setMessage("Not enough to double.");
        return;
      }
      eng.double();
      playSfx("cardDeal");
    } else if (kind === "split") {
      const extra = eng.hands[eng.activeHandIdx].bet;
      const ok = placeBet("blackjack", extra);
      if (!ok) {
        setMessage("Not enough to split.");
        return;
      }
      eng.split();
      playSfx("cardDeal");
    }
    refresh();
    if (eng.state !== "player") {
      endTurnSettle();
    }
  }

  function settle() {
    const payout = eng.payout();
    const totalBetTaken = eng.hands.reduce((s, h) => s + h.bet, 0);
    if (payout > 0) winCoins("blackjack", payout);
    const net = payout - totalBetTaken;
    setSessionLog((l) =>
      [{ id: Math.random().toString(36).slice(2), bet: totalBetTaken, net }, ...l].slice(
        0,
        20
      )
    );
    pushHistory({
      game: "Blackjack",
      bet: totalBetTaken,
      result: payout,
      net,
    });

    const allBJ = eng.hands.every((h) => h.isBlackjack);
    if (allBJ) {
      setMessage("BLACKJACK! 3:2 pays out.");
      playSfx("bigWin");
      fireConfetti("big");
    } else if (net > 0) {
      setMessage(`You win ${fmt(net)}`);
      playSfx("win");
      if (net >= totalBetTaken * 1.5) fireConfetti("small");
    } else if (net === 0) {
      setMessage("Push.");
    } else {
      const allBust = eng.hands.every((h) => h.result === "bust");
      setMessage(allBust ? "Bust!" : "Dealer wins.");
      playSfx("lose");
    }
    setOriginalBet(0);
  }

  useEffect(() => {
    refresh();
  }, []);

  const dealerCards = eng.dealer.cards;
  const dealerTotal = handTotal(dealerCards.filter((c) => !c.hidden)).total;

  const canBet = eng.state === "betting" || eng.state === "settled";
  const inPlay = eng.state === "player";

  return (
    <div className="px-4 lg:px-6 py-4 grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-4">
      <div
        className="rounded-3xl p-4 sm:p-6 lg:p-8 relative overflow-hidden border border-white/5"
        style={{
          // Rainbet-inspired dark navy
          background:
            "radial-gradient(ellipse at top, #1B1F3A 0%, #0F1226 60%, #07091A 100%)",
        }}
      >
        {/* Subtle table outline */}
        <div className="absolute inset-x-6 top-24 bottom-44 rounded-[50%] border border-white/[0.06] pointer-events-none" />
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 text-center pointer-events-none select-none">
          <div className="text-[10px] uppercase tracking-[0.4em] text-white/15 font-semibold">
            BLACKJACK PAYS 3 TO 2
          </div>
          <div className="text-[10px] uppercase tracking-[0.4em] text-white/15 font-semibold mt-1">
            INSURANCE PAYS 2 TO 1
          </div>
        </div>

        <div className="relative flex items-center gap-2 mb-4">
          <div
            className="w-7 h-7 rounded-md flex items-center justify-center"
            style={{
              background:
                "linear-gradient(135deg, #7B61FF 0%, #C26BFF 100%)",
            }}
          >
            <span className="text-sm">♠</span>
          </div>
          <div>
            <h1 className="heading text-lg sm:text-xl leading-none">Blackjack</h1>
            <div className="text-[10px] uppercase tracking-wider text-text-secondary">
              6-Deck · S17 · BJ 3:2
            </div>
          </div>
          <div className="ml-auto flex items-center gap-1 text-[10px] uppercase tracking-wider text-emerald-300 bg-emerald-500/10 border border-emerald-500/30 px-2 py-1 rounded-md">
            <Shield size={11} /> Fair Play
          </div>
        </div>

        {/* Dealer */}
        <div className="relative mt-4 mb-8 min-h-[124px]">
          <div className="text-xs uppercase tracking-[0.3em] text-white/40 mb-3 text-center font-semibold">
            Dealer
            {dealerCards.length > 0 && (
              <span className="ml-2 px-2 py-0.5 rounded-md bg-bg-elevated/80 text-white text-xs">
                {eng.state === "player" || eng.state === "betting"
                  ? dealerTotal || "?"
                  : handTotal(dealerCards).total || "—"}
              </span>
            )}
          </div>
          <div className="flex justify-center gap-2">
            <AnimatePresence>
              {dealerCards.map((c, i) => (
                <PlayingCard key={c.id} card={c} delay={i * 0.12} />
              ))}
            </AnimatePresence>
            {dealerCards.length === 0 && (
              <div className="opacity-30 text-text-secondary text-xs">
                Waiting for deal
              </div>
            )}
          </div>
        </div>

        {/* Status */}
        <div className="relative text-center mb-6">
          <div className="inline-block px-4 py-1.5 rounded-full bg-black/50 backdrop-blur text-sm font-semibold border border-white/10">
            {message}
          </div>
        </div>

        {/* Player */}
        <div className="relative flex flex-wrap items-end justify-center gap-6 min-h-[160px]">
          {eng.hands.length === 0 ? (
            <BetSpot pending={pendingBet} fmt={fmt} />
          ) : (
            eng.hands.map((h, i) => (
              <PlayerHandView
                key={i}
                hand={h}
                isActive={i === eng.activeHandIdx && eng.state === "player"}
                index={i}
                fmt={fmt}
              />
            ))
          )}
        </div>

        {/* Chips */}
        <div className="mt-6 flex items-center justify-center gap-2 sm:gap-3 flex-wrap">
          {CHIP_VALUES.map((v) => (
            <ChipBtn
              key={v}
              value={v}
              onClick={() => addChip(v)}
              disabled={!canBet}
            />
          ))}
          <button
            onClick={clearChips}
            disabled={!canBet || pendingBet === 0}
            className="btn-secondary text-sm"
          >
            Clear
          </button>
          <button
            onClick={() => rebet(1)}
            disabled={!canBet || sessionLog.length === 0}
            className="btn-secondary text-sm flex items-center gap-1"
          >
            <RotateCw size={14} /> Rebet
          </button>
        </div>

        {/* Action row (Rainbet style) */}
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2 max-w-2xl mx-auto">
          {canBet && (
            <button
              onClick={deal}
              disabled={pendingBet <= 0}
              className="action-btn col-span-2 sm:col-span-4 bg-emerald-500/20 border-emerald-500/40 hover:bg-emerald-500/30"
            >
              <Hand size={18} className="mb-0.5 text-emerald-300" />
              <span className="font-bold">Deal</span>
            </button>
          )}
          {inPlay && (
            <>
              <ActBtn
                label="Double"
                icon={
                  <span className="font-extrabold text-emerald-300 text-base">
                    x2
                  </span>
                }
                onClick={() => action("double")}
                disabled={
                  !eng.canDouble() ||
                  balance < (eng.hands[eng.activeHandIdx]?.bet ?? 0)
                }
              />
              <ActBtn
                label="Hit"
                icon={<HandMetal size={18} className="text-sky-300" />}
                onClick={() => action("hit")}
              />
              <ActBtn
                label="Stand"
                icon={
                  <span className="w-4 h-4 rounded-sm bg-rose-400/80 inline-block" />
                }
                onClick={() => action("stand")}
              />
              <ActBtn
                label="Split"
                icon={<Layers size={18} className="text-amber-300" />}
                onClick={() => action("split")}
                disabled={
                  !eng.canSplit() ||
                  balance < (eng.hands[eng.activeHandIdx]?.bet ?? 0)
                }
              />
            </>
          )}
        </div>

        {/* Bet input row */}
        <div className="mt-4 max-w-2xl mx-auto">
          <div className="rounded-2xl bg-bg-card/60 border border-white/10 px-4 py-2.5 flex items-center gap-3">
            <span className="text-text-secondary text-sm">Bet</span>
            <input
              type="number"
              value={pendingBet}
              onChange={(e) =>
                setPendingBet(Math.max(0, Math.floor(Number(e.target.value) || 0)))
              }
              disabled={!canBet}
              className="bg-transparent outline-none text-lg font-bold flex-1 min-w-0"
              placeholder="0.00"
            />
            <span className="font-mono text-text-secondary text-sm">
              {fmt(pendingBet)}
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={halfBet}
                disabled={!canBet}
                className="px-2.5 py-1 rounded-md text-xs font-semibold bg-bg-elevated hover:bg-accent/20 transition disabled:opacity-40"
              >
                ½
              </button>
              <button
                onClick={doubleBet}
                disabled={!canBet}
                className="px-2.5 py-1 rounded-md text-xs font-semibold bg-bg-elevated hover:bg-accent/20 transition disabled:opacity-40"
              >
                2×
              </button>
              <button
                onClick={maxBet}
                disabled={!canBet}
                className="px-2.5 py-1 rounded-md text-xs font-semibold bg-bg-elevated hover:bg-accent/20 transition disabled:opacity-40"
              >
                Max
              </button>
            </div>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2 max-w-md mx-auto">
          <Stat label="Balance" value={fmt(balance)} />
          <Stat
            label="Pending"
            value={fmt(canBet ? pendingBet : totalActiveBet)}
          />
          <Stat label="Original" value={fmt(originalBet)} />
        </div>
      </div>

      <aside className="card-base p-4">
        <div className="flex items-center gap-2 mb-2">
          <Coins size={16} className="text-gold" />
          <h3 className="heading text-base">Session</h3>
        </div>
        <div className="text-sm flex justify-between mb-3">
          <span className="text-text-secondary">Net</span>
          <span
            className={`font-bold ${
              sessionTotalNet >= 0 ? "text-win" : "text-rose-300"
            }`}
          >
            {sessionTotalNet >= 0 ? "+" : ""}
            {fmt(sessionTotalNet)}
          </span>
        </div>
        <div className="text-xs uppercase tracking-wider text-text-secondary mb-2">
          Last 10 hands
        </div>
        <div className="space-y-1.5 max-h-[400px] overflow-y-auto pr-1">
          {sessionLog.length === 0 && (
            <div className="text-text-secondary text-sm py-4 text-center">
              No hands played yet.
            </div>
          )}
          {sessionLog.slice(0, 10).map((l) => (
            <div
              key={l.id}
              className="flex justify-between text-sm bg-bg-elevated/60 rounded-lg px-3 py-1.5"
            >
              <span className="text-text-secondary">Bet {fmt(l.bet)}</span>
              <span
                className={`font-semibold ${
                  l.net >= 0 ? "text-win" : "text-rose-300"
                }`}
              >
                {l.net >= 0 ? "+" : ""}
                {fmt(l.net)}
              </span>
            </div>
          ))}
        </div>
      </aside>
    </div>
  );
}

function ActBtn({
  label,
  icon,
  onClick,
  disabled,
}: {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="action-btn bg-bg-card/60 border-white/10 hover:bg-accent/15 hover:border-accent/40"
    >
      {icon}
      <span className="font-bold mt-0.5">{label}</span>
    </button>
  );
}

function ChipBtn({
  value,
  onClick,
  disabled,
}: {
  value: number;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="w-14 h-14 rounded-full font-extrabold text-xs shadow-lg border-4 border-white/30 hover:scale-110 active:scale-95 transition disabled:opacity-40 disabled:hover:scale-100 flex flex-col items-center justify-center"
      style={{ background: CHIP_COLORS[value] }}
    >
      <span className={value >= 5000 ? "text-[11px]" : ""}>
        {value >= 1000 ? `${value / 1000}K` : value}
      </span>
    </button>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-black/40 rounded-xl px-3 py-2 backdrop-blur text-center">
      <div className="text-[10px] uppercase tracking-wider text-white/40">
        {label}
      </div>
      <div className="font-semibold">{value}</div>
    </div>
  );
}

function BetSpot({
  pending,
  fmt,
}: {
  pending: number;
  fmt: (n: number) => string;
}) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className={`w-32 h-32 rounded-full border-2 border-dashed flex items-center justify-center text-text-secondary transition ${
          pending > 0
            ? "border-gold/60 shadow-glow-gold"
            : "border-white/15"
        }`}
      >
        {pending > 0 ? (
          <div className="text-center">
            <div className="text-xs uppercase tracking-wider">Bet</div>
            <div className="font-extrabold gold-text text-xl">
              {fmt(pending)}
            </div>
          </div>
        ) : (
          <div className="text-xs uppercase tracking-wider">Bet here</div>
        )}
      </div>
    </div>
  );
}

function PlayerHandView({
  hand,
  isActive,
  index,
  fmt,
}: {
  hand: PlayerHand;
  isActive: boolean;
  index: number;
  fmt: (n: number) => string;
}) {
  const total = handTotal(hand.cards).total;
  const resultColor =
    hand.result === "win" || hand.result === "blackjack"
      ? "text-win"
      : hand.result === "lose" || hand.result === "bust"
        ? "text-rose-300"
        : hand.result === "push"
          ? "text-text-secondary"
          : "";
  return (
    <motion.div
      animate={isActive ? { scale: [1, 1.04, 1] } : { scale: 1 }}
      transition={{ duration: 1.4, repeat: isActive ? Infinity : 0 }}
      className={`flex flex-col items-center gap-2 ${isActive ? "" : "opacity-95"}`}
    >
      <div className="flex gap-2 min-h-[96px]">
        {hand.cards.map((c, i) => (
          <PlayingCard key={c.id} card={c} delay={i * 0.1} />
        ))}
      </div>
      <div className="flex items-center gap-2">
        <div className="px-2.5 py-0.5 rounded-md bg-bg-elevated/80 text-xs font-bold border border-white/10">
          {hand.cards.length > 0 ? total : "—"}
        </div>
        <div className="text-xs text-white/50">
          Hand {index + 1} · Bet {fmt(hand.bet)}
        </div>
      </div>
      {hand.result && (
        <div className={`text-sm font-bold uppercase tracking-wider ${resultColor}`}>
          {hand.isBlackjack ? "Blackjack" : hand.result}
        </div>
      )}
    </motion.div>
  );
}
