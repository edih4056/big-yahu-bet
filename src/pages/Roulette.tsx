import { useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Coins, RotateCw, Undo2, Trash2, Play } from "lucide-react";
import { useWalletStore } from "@/store/walletStore";
import { formatMoney } from "@/lib/format";
import { playSfx } from "@/lib/sound";
import { fireConfetti } from "@/lib/confetti";
import {
  RouletteEngine,
  PAYOUT,
  colorOf,
  type Bet,
  type BetKind,
} from "@/games/roulette/engine";
import { Wheel } from "@/games/roulette/Wheel";

const CHIP_VALUES = [1, 5, 25, 100, 500, 1000, 5000];
const CHIP_COLORS: Record<number, string> = {
  1: "linear-gradient(135deg, #FFFFFF 0%, #C0C0C0 100%)",
  5: "linear-gradient(135deg, #FF3B6B 0%, #B8284D 100%)",
  25: "linear-gradient(135deg, #00E676 0%, #00A050 100%)",
  100: "linear-gradient(135deg, #2D2D2D 0%, #0D0D0D 100%)",
  500: "linear-gradient(135deg, #C26BFF 0%, #7B61FF 100%)",
  1000: "linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)",
  5000: "linear-gradient(135deg, #FFE15A 0%, #FFC842 50%, #FF8A00 100%)",
};

// Numbers in standard roulette grid order (3 rows × 12 cols, 1-36)
const GRID_ROWS: number[][] = [
  [3, 6, 9, 12, 15, 18, 21, 24, 27, 30, 33, 36],
  [2, 5, 8, 11, 14, 17, 20, 23, 26, 29, 32, 35],
  [1, 4, 7, 10, 13, 16, 19, 22, 25, 28, 31, 34],
];

export default function Roulette() {
  const balance = useWalletStore((s) => s.balance);
  const placeBet = useWalletStore((s) => s.bet);
  const winCoins = useWalletStore((s) => s.win);
  const pushHistory = useWalletStore((s) => s.pushHistory);
  const currency = useWalletStore((s) => s.currency);
  const fmt = (n: number) => formatMoney(n, currency);

  const engineRef = useRef(new RouletteEngine());
  const [, force] = useState(0);
  const refresh = () => force((n) => n + 1);

  const [chip, setChip] = useState(5);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<number | null>(null);
  const [history, setHistory] = useState<number[]>([]);
  const [message, setMessage] = useState<string | null>(
    "Place your bets — choose a chip and click the table."
  );
  const [spinId, setSpinId] = useState(0);

  const bets = engineRef.current.bets;
  const totalStaked = engineRef.current.totalStaked();

  function placeChip(kind: BetKind, numbers: number[]) {
    if (spinning) return;
    if (chip <= 0) return;
    if (balance < chip) {
      setMessage("Not enough coins for that chip.");
      return;
    }
    const ok = placeBet("roulette", chip);
    if (!ok) {
      setMessage("Not enough coins.");
      return;
    }
    engineRef.current.placeBet({ kind, numbers, amount: chip });
    playSfx("chip");
    refresh();
  }

  function undo() {
    if (spinning) return;
    const popped = engineRef.current.popLastBet();
    if (popped) {
      // refund to wallet
      winCoins("roulette", popped.amount);
    }
    refresh();
  }

  function clearAll() {
    if (spinning) return;
    const refund = engineRef.current.totalStaked();
    if (refund > 0) winCoins("roulette", refund);
    engineRef.current.clearBets();
    refresh();
  }

  function rebet() {
    // Last spin's bets are no longer in the engine; we offer rebet only via history of bets placed before last spin.
    // For simplicity: this button replays the last set of stakes if user hasn't placed any new ones.
    // Implementation: we track lastBets snapshot.
    if (lastBetsRef.current.length === 0 || spinning) return;
    if (engineRef.current.bets.length > 0) return;
    const total = lastBetsRef.current.reduce((s, b) => s + b.amount, 0);
    if (balance < total) {
      setMessage("Not enough coins to rebet.");
      return;
    }
    placeBet("roulette", total);
    for (const b of lastBetsRef.current) {
      engineRef.current.placeBet({
        kind: b.kind,
        numbers: b.numbers,
        amount: b.amount,
      });
    }
    refresh();
  }

  const lastBetsRef = useRef<Bet[]>([]);

  function spin() {
    if (spinning) return;
    if (engineRef.current.bets.length === 0) {
      setMessage("Place a bet first.");
      return;
    }
    lastBetsRef.current = engineRef.current.bets.map((b) => ({ ...b }));
    setSpinning(true);
    setMessage("Spinning...");
    playSfx("wheel");

    const r = engineRef.current.spin();
    setResult(r.number);
    setSpinId((n) => n + 1);

    setTimeout(() => {
      setSpinning(false);
      setHistory((h) => [r.number, ...h].slice(0, 100));
      const totalBetThisSpin = engineRef.current.totalStaked();
      const totalReturn = r.totalWin;
      const net = totalReturn - totalBetThisSpin;
      if (totalReturn > 0) winCoins("roulette", totalReturn);
      pushHistory({
        game: "Roulette",
        bet: totalBetThisSpin,
        result: totalReturn,
        net,
      });
      if (net > 0) {
        playSfx("win");
        if (net >= totalBetThisSpin * 5) fireConfetti("big");
        else fireConfetti("small");
        setMessage(
          `Number ${r.number} (${r.color}) — you win ${fmt(net)}!`
        );
      } else if (net === 0) {
        setMessage(`Number ${r.number} (${r.color}) — break even.`);
      } else {
        playSfx("lose");
        setMessage(`Number ${r.number} (${r.color}) — house wins.`);
      }
      engineRef.current.clearBets();
      refresh();
    }, 4500);
  }

  const stats = useMemo(() => {
    const last100 = history.slice(0, 100);
    const counts = { red: 0, black: 0, green: 0, even: 0, odd: 0, low: 0, high: 0 };
    for (const n of last100) {
      const c = colorOf(n);
      counts[c]++;
      if (n !== 0) {
        if (n % 2 === 0) counts.even++;
        else counts.odd++;
        if (n <= 18) counts.low++;
        else counts.high++;
      }
    }
    const sorted = Object.entries(
      last100.reduce<Record<number, number>>((acc, n) => {
        acc[n] = (acc[n] ?? 0) + 1;
        return acc;
      }, {})
    ).sort((a, b) => b[1] - a[1]);
    const hot = sorted.slice(0, 5).map((s) => Number(s[0]));
    const cold = sorted.slice(-5).map((s) => Number(s[0])).reverse();
    return { counts, hot, cold, total: last100.length };
  }, [history]);

  function findBet(kind: BetKind, numbers: number[]): number {
    return bets
      .filter(
        (b) =>
          b.kind === kind &&
          b.numbers.length === numbers.length &&
          b.numbers.every((n, i) => n === numbers[i])
      )
      .reduce((s, b) => s + b.amount, 0);
  }

  return (
    <div className="px-4 lg:px-6 py-4 grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-4">
      <div
        className="rounded-3xl p-4 sm:p-6 lg:p-8 border border-rose-500/20 relative"
        style={{
          background:
            "radial-gradient(ellipse at top, #4D0F1B 0%, #1B0712 60%, #100308 100%)",
        }}
      >
        <h1 className="heading text-2xl sm:text-3xl">European Roulette</h1>
        <div className="text-text-secondary text-sm">
          Single zero · Multiple bets per spin
        </div>

        <div className="mt-4 grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6 items-start">
          <div>
            <Wheel
              spinning={spinning}
              result={result}
              spinId={spinId}
            />
            <div className="mt-3 text-center">
              <div className="text-xs uppercase tracking-wider text-text-secondary">
                Last result
              </div>
              <div
                className={`text-2xl font-extrabold mt-0.5 ${
                  result === null
                    ? "text-text-secondary"
                    : colorOf(result) === "red"
                      ? "text-rose-300"
                      : colorOf(result) === "green"
                        ? "text-emerald-300"
                        : "text-white"
                }`}
              >
                {result ?? "—"}
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <BettingTable
              onPlace={placeChip}
              findBet={findBet}
              chip={chip}
            />
          </div>
        </div>

        <div className="mt-3 text-center">
          <div className="inline-block px-4 py-1.5 rounded-full bg-black/40 backdrop-blur text-sm font-semibold border border-white/10">
            {message}
          </div>
        </div>

        {/* Chips */}
        <div className="mt-4 flex items-center justify-center gap-3 flex-wrap">
          {CHIP_VALUES.map((v) => (
            <button
              key={v}
              onClick={() => setChip(v)}
              className={`w-12 h-12 rounded-full font-extrabold text-xs shadow-lg border-4 transition ${
                chip === v
                  ? "border-gold scale-110 shadow-glow-gold"
                  : "border-white/30 hover:scale-105"
              }`}
              style={{ background: CHIP_COLORS[v] }}
            >
              {v}
            </button>
          ))}
        </div>

        {/* Action buttons */}
        <div className="mt-4 flex items-center justify-center gap-2 flex-wrap">
          <button
            onClick={spin}
            disabled={spinning || bets.length === 0}
            className="px-7 py-2.5 rounded-2xl bg-accent-gradient font-extrabold shadow-glow hover:scale-105 active:scale-95 transition disabled:opacity-40 disabled:hover:scale-100 flex items-center gap-2"
          >
            <Play size={16} /> SPIN
          </button>
          <button onClick={undo} className="btn-secondary flex items-center gap-1 text-sm">
            <Undo2 size={14} /> Undo
          </button>
          <button onClick={clearAll} className="btn-secondary flex items-center gap-1 text-sm">
            <Trash2 size={14} /> Clear all
          </button>
          <button onClick={rebet} className="btn-secondary flex items-center gap-1 text-sm">
            <RotateCw size={14} /> Rebet
          </button>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2 max-w-md mx-auto">
          <Stat label="Balance" value={fmt(balance)} />
          <Stat label="Total bet" value={fmt(totalStaked)} />
          <Stat label="Pos. payout" value={`up to ${maxPayout(bets)}×`} />
        </div>
      </div>

      <aside className="card-base p-4">
        <div className="flex items-center gap-2 mb-2">
          <Coins size={16} className="text-gold" />
          <h3 className="heading text-base">History & Stats</h3>
        </div>

        <div className="text-xs uppercase tracking-wider text-text-secondary mb-1.5">
          Last 20
        </div>
        <div className="flex flex-wrap gap-1 mb-3">
          {history.slice(0, 20).map((n, i) => (
            <span
              key={i}
              className={`text-xs font-bold w-7 h-7 rounded-md flex items-center justify-center ${
                colorOf(n) === "red"
                  ? "bg-rose-500/80"
                  : colorOf(n) === "green"
                    ? "bg-emerald-600/80"
                    : "bg-black/80 border border-white/10"
              }`}
            >
              {n}
            </span>
          ))}
          {history.length === 0 && (
            <span className="text-text-secondary text-sm">No spins yet.</span>
          )}
        </div>

        <Heat
          label="Red / Black / Zero"
          parts={[
            { label: "R", v: stats.counts.red, color: "#FF3B6B" },
            { label: "B", v: stats.counts.black, color: "#222" },
            { label: "0", v: stats.counts.green, color: "#00A050" },
          ]}
          total={stats.total}
        />
        <Heat
          label="Even / Odd"
          parts={[
            { label: "Even", v: stats.counts.even, color: "#7B61FF" },
            { label: "Odd", v: stats.counts.odd, color: "#FFC842" },
          ]}
          total={stats.total}
        />
        <Heat
          label="Low / High"
          parts={[
            { label: "1-18", v: stats.counts.low, color: "#00E676" },
            { label: "19-36", v: stats.counts.high, color: "#FF8AD4" },
          ]}
          total={stats.total}
        />

        <div className="mt-3 text-xs uppercase tracking-wider text-text-secondary">
          Hot
        </div>
        <div className="flex gap-1 flex-wrap mb-2">
          {stats.hot.map((n) => (
            <span
              key={n}
              className="px-1.5 py-0.5 rounded-md bg-rose-500/30 border border-rose-500/50 text-xs font-bold"
            >
              {n}
            </span>
          ))}
          {stats.hot.length === 0 && (
            <span className="text-text-secondary text-xs">—</span>
          )}
        </div>
        <div className="text-xs uppercase tracking-wider text-text-secondary">
          Cold
        </div>
        <div className="flex gap-1 flex-wrap">
          {stats.cold.map((n) => (
            <span
              key={n}
              className="px-1.5 py-0.5 rounded-md bg-blue-500/20 border border-blue-500/40 text-xs font-bold"
            >
              {n}
            </span>
          ))}
          {stats.cold.length === 0 && (
            <span className="text-text-secondary text-xs">—</span>
          )}
        </div>
      </aside>
    </div>
  );
}

function maxPayout(bets: Bet[]): number {
  let max = 0;
  for (const b of bets) {
    const m = PAYOUT[b.kind];
    if (m > max) max = m;
  }
  return max;
}

function Heat({
  label,
  parts,
  total,
}: {
  label: string;
  parts: { label: string; v: number; color: string }[];
  total: number;
}) {
  const sum = parts.reduce((s, p) => s + p.v, 0) || 1;
  return (
    <div className="mt-2">
      <div className="flex justify-between text-[10px] uppercase tracking-wider text-text-secondary">
        <span>{label}</span>
        <span>n={total}</span>
      </div>
      <div className="h-1.5 rounded-full overflow-hidden bg-bg-elevated mt-1 flex">
        {parts.map((p) => (
          <div
            key={p.label}
            style={{ width: `${(p.v / sum) * 100}%`, background: p.color }}
            title={`${p.label}: ${p.v}`}
          />
        ))}
      </div>
      <div className="flex justify-between text-[10px] text-text-secondary mt-0.5">
        {parts.map((p) => (
          <span key={p.label}>
            {p.label}: {p.v}
          </span>
        ))}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-black/40 rounded-xl px-3 py-2 backdrop-blur text-center">
      <div className="text-[10px] uppercase tracking-wider text-rose-200/60">
        {label}
      </div>
      <div className="font-semibold">{value}</div>
    </div>
  );
}

function BettingTable({
  onPlace,
  findBet,
  chip: _chip,
}: {
  onPlace: (kind: BetKind, numbers: number[]) => void;
  findBet: (kind: BetKind, numbers: number[]) => number;
  chip: number;
}) {
  return (
    <div className="min-w-[640px] select-none">
      <div className="flex">
        {/* Zero */}
        <BetCell
          kind="straight"
          numbers={[0]}
          onPlace={onPlace}
          amount={findBet("straight", [0])}
          color="#0E5A36"
          tall
          tooltip="Straight 0 (35:1)"
        >
          0
        </BetCell>

        <div className="flex flex-col flex-1">
          {/* Numbers grid */}
          {GRID_ROWS.map((row, ri) => (
            <div key={ri} className="flex">
              {row.map((n) => (
                <BetCell
                  key={n}
                  kind="straight"
                  numbers={[n]}
                  onPlace={onPlace}
                  amount={findBet("straight", [n])}
                  color={
                    colorOf(n) === "red"
                      ? "#B22340"
                      : colorOf(n) === "black"
                        ? "#161618"
                        : "#0E5A36"
                  }
                  tooltip={`Straight ${n} (35:1)`}
                >
                  {n}
                </BetCell>
              ))}
              {/* Column bet */}
              <BetCell
                kind={(["col3", "col2", "col1"] as const)[ri]}
                numbers={
                  ri === 0
                    ? [3, 6, 9, 12, 15, 18, 21, 24, 27, 30, 33, 36]
                    : ri === 1
                      ? [2, 5, 8, 11, 14, 17, 20, 23, 26, 29, 32, 35]
                      : [1, 4, 7, 10, 13, 16, 19, 22, 25, 28, 31, 34]
                }
                onPlace={onPlace}
                amount={findBet(
                  ri === 0 ? "col3" : ri === 1 ? "col2" : "col1",
                  ri === 0
                    ? [3, 6, 9, 12, 15, 18, 21, 24, 27, 30, 33, 36]
                    : ri === 1
                      ? [2, 5, 8, 11, 14, 17, 20, 23, 26, 29, 32, 35]
                      : [1, 4, 7, 10, 13, 16, 19, 22, 25, 28, 31, 34]
                )}
                color="#1A1530"
                small
                tooltip="Column (2:1)"
              >
                2:1
              </BetCell>
            </div>
          ))}

          {/* Dozens */}
          <div className="flex">
            <DozenCell label="1st 12" kind="dozen1" range={range(1, 12)} onPlace={onPlace} amount={findBet("dozen1", range(1, 12))} />
            <DozenCell label="2nd 12" kind="dozen2" range={range(13, 24)} onPlace={onPlace} amount={findBet("dozen2", range(13, 24))} />
            <DozenCell label="3rd 12" kind="dozen3" range={range(25, 36)} onPlace={onPlace} amount={findBet("dozen3", range(25, 36))} />
          </div>

          {/* Outside bets */}
          <div className="flex">
            <OutsideCell label="1-18" kind="low" range={range(1, 18)} onPlace={onPlace} amount={findBet("low", range(1, 18))} />
            <OutsideCell label="EVEN" kind="even" range={range(2, 36, 2)} onPlace={onPlace} amount={findBet("even", range(2, 36, 2))} />
            <OutsideCell
              label="◆ RED"
              kind="red"
              range={Array.from(
                { length: 18 },
                (_, i) =>
                  [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36][i]
              )}
              onPlace={onPlace}
              amount={findBet(
                "red",
                Array.from(
                  { length: 18 },
                  (_, i) =>
                    [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36][i]
                )
              )}
              bg="#B22340"
            />
            <OutsideCell
              label="◆ BLACK"
              kind="black"
              range={Array.from(
                { length: 18 },
                (_, i) =>
                  [2, 4, 6, 8, 10, 11, 13, 15, 17, 20, 22, 24, 26, 28, 29, 31, 33, 35][i]
              )}
              onPlace={onPlace}
              amount={findBet(
                "black",
                Array.from(
                  { length: 18 },
                  (_, i) =>
                    [2, 4, 6, 8, 10, 11, 13, 15, 17, 20, 22, 24, 26, 28, 29, 31, 33, 35][i]
                )
              )}
              bg="#161618"
            />
            <OutsideCell label="ODD" kind="odd" range={range(1, 35, 2)} onPlace={onPlace} amount={findBet("odd", range(1, 35, 2))} />
            <OutsideCell label="19-36" kind="high" range={range(19, 36)} onPlace={onPlace} amount={findBet("high", range(19, 36))} />
          </div>
        </div>
      </div>
    </div>
  );
}

function range(from: number, to: number, step = 1): number[] {
  const out: number[] = [];
  for (let i = from; i <= to; i += step) out.push(i);
  return out;
}

function BetCell({
  children,
  onPlace,
  kind,
  numbers,
  amount,
  color,
  tall,
  small,
  tooltip,
}: {
  children: React.ReactNode;
  onPlace: (k: BetKind, n: number[]) => void;
  kind: BetKind;
  numbers: number[];
  amount: number;
  color: string;
  tall?: boolean;
  small?: boolean;
  tooltip?: string;
}) {
  return (
    <button
      onClick={() => onPlace(kind, numbers)}
      title={tooltip}
      className={`relative font-bold text-white text-sm border border-white/10 hover:brightness-125 transition flex items-center justify-center ${
        tall ? "h-[120px] w-10" : small ? "h-10 w-12" : "h-10 w-12"
      }`}
      style={{ background: color }}
    >
      {children}
      {amount > 0 && <ChipBadge amount={amount} />}
    </button>
  );
}

function DozenCell({
  label,
  kind,
  range,
  onPlace,
  amount,
}: {
  label: string;
  kind: BetKind;
  range: number[];
  onPlace: (k: BetKind, n: number[]) => void;
  amount: number;
}) {
  return (
    <button
      onClick={() => onPlace(kind, range)}
      className="relative flex-1 h-10 bg-[#1A1530] border border-white/10 hover:brightness-125 transition text-sm font-semibold"
    >
      {label}
      {amount > 0 && <ChipBadge amount={amount} />}
    </button>
  );
}

function OutsideCell({
  label,
  kind,
  range,
  onPlace,
  amount,
  bg,
}: {
  label: string;
  kind: BetKind;
  range: number[];
  onPlace: (k: BetKind, n: number[]) => void;
  amount: number;
  bg?: string;
}) {
  return (
    <button
      onClick={() => onPlace(kind, range)}
      className="relative flex-1 h-10 border border-white/10 hover:brightness-125 transition text-sm font-semibold"
      style={{ background: bg ?? "#1A1530" }}
    >
      {label}
      {amount > 0 && <ChipBadge amount={amount} />}
    </button>
  );
}

function ChipBadge({ amount }: { amount: number }) {
  return (
    <motion.span
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      className="absolute right-1 bottom-1 px-1.5 py-0.5 rounded-full bg-gold text-black text-[10px] font-extrabold shadow-glow-gold"
    >
      {amount}
    </motion.span>
  );
}
