import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Coins, Hand, RotateCw } from "lucide-react";
import { useWalletStore } from "@/store/walletStore";
import { formatCoins } from "@/lib/format";
import { playSfx } from "@/lib/sound";
import { fireConfetti } from "@/lib/confetti";
import {
  BlackjackEngine,
  handTotal,
  type Card as TCard,
  type PlayerHand,
} from "@/games/blackjack/engine";
import { PlayingCard } from "@/games/blackjack/Card";

const CHIP_VALUES = [1, 5, 25, 100, 500, 1000];
const CHIP_COLORS: Record<number, string> = {
  1: "linear-gradient(135deg, #FFFFFF 0%, #C0C0C0 100%)",
  5: "linear-gradient(135deg, #FF3B6B 0%, #B8284D 100%)",
  25: "linear-gradient(135deg, #00E676 0%, #00A050 100%)",
  100: "linear-gradient(135deg, #2D2D2D 0%, #0D0D0D 100%)",
  500: "linear-gradient(135deg, #C26BFF 0%, #7B61FF 100%)",
  1000: "linear-gradient(135deg, #FFE15A 0%, #FFC842 100%)",
};

export default function Blackjack() {
  const balance = useWalletStore((s) => s.balance);
  const placeBet = useWalletStore((s) => s.bet);
  const winCoins = useWalletStore((s) => s.win);
  const pushHistory = useWalletStore((s) => s.pushHistory);

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
    [eng.hands.length, eng.state]
  );

  const sessionTotalNet = sessionLog.reduce((s, e) => s + e.net, 0);

  function addChip(v: number) {
    if (eng.state !== "betting" && eng.state !== "settled") return;
    if (balance < pendingBet + v) {
      setMessage("Not enough coins for that chip.");
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
      setMessage("Not enough coins.");
      return;
    }
    eng.startHand(pendingBet);
    setOriginalBet(pendingBet);
    setMessage(eng.state === "settled" ? "Blackjack!" : "Your turn");
    playSfx("cardDeal");
    refresh();
    if (eng.state === "settled") settle();
  }

  function rebet() {
    if (sessionLog.length === 0) return;
    const last = sessionLog[0].bet;
    if (balance < last) return;
    setPendingBet(last);
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
        setMessage("Not enough coins to double.");
        return;
      }
      eng.double();
      playSfx("cardDeal");
    } else if (kind === "split") {
      const extra = eng.hands[eng.activeHandIdx].bet;
      const ok = placeBet("blackjack", extra);
      if (!ok) {
        setMessage("Not enough coins to split.");
        return;
      }
      eng.split();
      playSfx("cardDeal");
    }
    refresh();
    if (eng.state !== "player") {
      // Dealer plays automatically inside settle path
      endTurnSettle();
    }
  }

  function settle() {
    const payout = eng.payout();
    const totalBetTaken = eng.hands.reduce(
      (s, h) => s + (h.doubled ? h.bet : h.bet),
      0
    );
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
      setMessage(`You win ${formatCoins(net)} YAHU`);
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

  // Periodic refresh for engine internals (no-op but keeps list reactive)
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
        className="rounded-3xl p-4 sm:p-6 lg:p-8 relative overflow-hidden border border-emerald-500/20"
        style={{
          background:
            "radial-gradient(ellipse at top, #14543A 0%, #0E2A1B 60%, #061811 100%)",
        }}
      >
        {/* Big Yahu watermark */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.06]">
          <div className="text-[140px] font-extrabold tracking-tight">
            BIG YAHU
          </div>
        </div>

        <div className="relative">
          <h1 className="heading text-2xl sm:text-3xl">Blackjack 21</h1>
          <div className="text-text-secondary text-sm">
            6-Deck shoe · S17 · Blackjack pays 3:2
          </div>
        </div>

        {/* Dealer */}
        <div className="relative mt-6 mb-8">
          <div className="text-xs uppercase tracking-wider text-emerald-200/60 mb-2 text-center">
            Dealer · {eng.state === "player" || eng.state === "betting"
              ? dealerCards.length > 0
                ? dealerTotal || "?"
                : "—"
              : handTotal(dealerCards).total || "—"}
          </div>
          <div className="flex justify-center gap-2 min-h-[112px]">
            <AnimatePresence>
              {dealerCards.map((c, i) => (
                <PlayingCard key={c.id} card={c} delay={i * 0.12} />
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Status */}
        <div className="text-center mb-4">
          <div className="inline-block px-4 py-1.5 rounded-full bg-black/40 backdrop-blur text-sm font-semibold border border-white/10">
            {message}
          </div>
        </div>

        {/* Player hands */}
        <div className="flex flex-wrap items-end justify-center gap-6 min-h-[120px]">
          {eng.hands.length === 0 ? (
            <BetSpot pending={pendingBet} />
          ) : (
            eng.hands.map((h, i) => (
              <PlayerHandView
                key={i}
                hand={h}
                isActive={i === eng.activeHandIdx && eng.state === "player"}
                index={i}
              />
            ))
          )}
        </div>

        {/* Chips */}
        <div className="mt-6 flex items-center justify-center gap-3 flex-wrap">
          {CHIP_VALUES.map((v) => (
            <button
              key={v}
              onClick={() => addChip(v)}
              disabled={!canBet}
              className="w-14 h-14 rounded-full font-extrabold text-sm shadow-lg border-4 border-white/30 hover:scale-110 active:scale-95 transition disabled:opacity-40 disabled:hover:scale-100"
              style={{ background: CHIP_COLORS[v] }}
            >
              {v}
            </button>
          ))}
          <button
            onClick={clearChips}
            disabled={!canBet || pendingBet === 0}
            className="btn-secondary text-sm"
          >
            Clear
          </button>
          <button
            onClick={rebet}
            disabled={!canBet || sessionLog.length === 0}
            className="btn-secondary text-sm flex items-center gap-1"
          >
            <RotateCw size={14} /> Rebet
          </button>
        </div>

        {/* Actions */}
        <div className="mt-4 flex items-center justify-center gap-2 flex-wrap">
          {(canBet || eng.state === "settled") && (
            <button
              onClick={deal}
              disabled={pendingBet <= 0}
              className="btn-primary text-base"
            >
              <Hand size={16} className="inline mr-2" /> Deal
            </button>
          )}
          {inPlay && (
            <>
              <ActBtn label="Hit" onClick={() => action("hit")} />
              <ActBtn label="Stand" onClick={() => action("stand")} />
              <ActBtn
                label="Double"
                onClick={() => action("double")}
                disabled={!eng.canDouble() || balance < (eng.hands[eng.activeHandIdx]?.bet ?? 0)}
              />
              <ActBtn
                label="Split"
                onClick={() => action("split")}
                disabled={!eng.canSplit() || balance < (eng.hands[eng.activeHandIdx]?.bet ?? 0)}
              />
            </>
          )}
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2 max-w-md mx-auto">
          <Stat label="Balance" value={formatCoins(balance)} />
          <Stat
            label="Pending"
            value={formatCoins(canBet ? pendingBet : totalActiveBet)}
          />
          <Stat label="Original" value={formatCoins(originalBet)} />
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
            {formatCoins(sessionTotalNet)}
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
              <span className="text-text-secondary">
                Bet {formatCoins(l.bet)}
              </span>
              <span
                className={`font-semibold ${
                  l.net >= 0 ? "text-win" : "text-rose-300"
                }`}
              >
                {l.net >= 0 ? "+" : ""}
                {formatCoins(l.net)}
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
  onClick,
  disabled,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="px-5 py-2.5 rounded-2xl bg-bg-card border border-white/10 hover:bg-accent/20 hover:border-accent/40 hover:shadow-glow-sm transition font-semibold text-sm disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-bg-card disabled:hover:border-white/10"
    >
      {label}
    </button>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-black/40 rounded-xl px-3 py-2 backdrop-blur text-center">
      <div className="text-[10px] uppercase tracking-wider text-emerald-200/60">
        {label}
      </div>
      <div className="font-semibold">{value}</div>
    </div>
  );
}

function BetSpot({ pending }: { pending: number }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className={`w-32 h-32 rounded-full border-2 border-dashed flex items-center justify-center text-text-secondary transition ${
          pending > 0
            ? "border-gold/60 shadow-glow-gold"
            : "border-emerald-300/30"
        }`}
      >
        {pending > 0 ? (
          <div className="text-center">
            <div className="text-xs uppercase tracking-wider">Bet</div>
            <div className="font-extrabold gold-text text-xl">
              {formatCoins(pending)}
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
}: {
  hand: PlayerHand;
  isActive: boolean;
  index: number;
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
        <div
          className="px-2.5 py-0.5 rounded-full bg-black/40 text-xs font-bold backdrop-blur border border-white/10"
        >
          {hand.cards.length > 0 ? total : "—"}
        </div>
        <div className="text-xs text-emerald-200/70">
          Hand {index + 1} · Bet {formatCoins(hand.bet)}
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
