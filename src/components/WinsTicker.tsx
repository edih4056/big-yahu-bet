import { useEffect, useState } from "react";
import { TrendingUp } from "lucide-react";
import { makeInitialTicker, makeTickerEntry, TickerEntry } from "@/lib/tickerData";
import { formatCoins } from "@/lib/format";

export function WinsTicker() {
  const [entries, setEntries] = useState<TickerEntry[]>(() =>
    makeInitialTicker(20)
  );

  useEffect(() => {
    const id = setInterval(() => {
      setEntries((cur) => [makeTickerEntry(), ...cur].slice(0, 20));
    }, 5000);
    return () => clearInterval(id);
  }, []);

  // duplicate to allow seamless loop
  const loop = [...entries, ...entries];

  return (
    <div className="mx-4 lg:mx-6 mt-6 rounded-2xl glass overflow-hidden">
      <div className="flex items-stretch">
        <div className="flex items-center gap-2 px-4 py-3 bg-accent-gradient text-white text-xs font-bold uppercase tracking-wider whitespace-nowrap">
          <TrendingUp size={14} />
          Recent Big Wins
        </div>
        <div className="relative flex-1 overflow-hidden">
          <div className="flex gap-6 py-3 animate-ticker-scroll whitespace-nowrap">
            {loop.map((e, i) => (
              <div
                key={`${e.id}-${i}`}
                className="flex items-center gap-2 text-sm"
              >
                <div className="w-6 h-6 rounded-full bg-accent-gradient text-[11px] font-bold flex items-center justify-center">
                  {e.user.charAt(0)}
                </div>
                <span className="text-text-secondary">{e.user}</span>
                <span className="text-text-secondary/60">won</span>
                <span className="font-bold text-win">
                  {formatCoins(e.amount)}
                </span>
                <span className="text-text-secondary/60">YAHU on</span>
                <span className="font-medium">{e.game}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
