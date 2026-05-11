import { SlotMachine } from "@/games/slots/SlotMachine";
import {
  sizzlingFruitsConfig,
  FRUIT_SYMBOL_INFO,
} from "@/games/slots/sizzlingFruits";

const theme = {
  name: "Sizzling Fruits",
  bg: "linear-gradient(135deg, #4D0F1B 0%, #B22340 50%, #FF8A00 100%)",
  frame: "#FFD600",
  symbolBg: "#1a0a0a",
  glow: "rgba(255, 138, 0, 0.4)",
  cell:
    "bg-gradient-to-br from-[#FFE15A]/10 to-[#FF3B6B]/10 border border-[#FFD600]/30",
};

export default function SizzlingFruits() {
  return (
    <div>
      <SlotMachine
        gameKey="sizzling-fruits"
        title="Sizzling Fruits"
        subtitle="Classic 5×3 fruit slot · 5 lines"
        config={sizzlingFruitsConfig}
        symbolInfo={FRUIT_SYMBOL_INFO}
        betPerLine={[1, 2, 5, 10, 25, 50, 100]}
        numLines={5}
        theme={theme}
      />
      <Paytable />
    </div>
  );
}

function Paytable() {
  const items: Array<{
    sym: string;
    pays: { count: number; mult: number }[];
  }> = [
    { sym: "7", pays: [{ count: 5, mult: 1000 }, { count: 4, mult: 200 }, { count: 3, mult: 50 }] },
    { sym: "W", pays: [{ count: 5, mult: 200 }, { count: 4, mult: 50 }, { count: 3, mult: 20 }] },
    { sym: "G", pays: [{ count: 5, mult: 200 }, { count: 4, mult: 50 }, { count: 3, mult: 20 }] },
    { sym: "O", pays: [{ count: 5, mult: 100 }, { count: 4, mult: 30 }, { count: 3, mult: 10 }] },
    { sym: "P", pays: [{ count: 5, mult: 100 }, { count: 4, mult: 30 }, { count: 3, mult: 10 }] },
    { sym: "L", pays: [{ count: 5, mult: 100 }, { count: 4, mult: 30 }, { count: 3, mult: 10 }] },
    { sym: "C", pays: [{ count: 5, mult: 100 }, { count: 4, mult: 30 }, { count: 3, mult: 10 }, { count: 2, mult: 5 }] },
    { sym: "S", pays: [{ count: 5, mult: 100 }, { count: 4, mult: 20 }, { count: 3, mult: 10 }] },
  ];

  return (
    <div className="px-4 lg:px-6 py-6">
      <h2 className="heading text-lg mb-3">Paytable</h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 max-w-3xl">
        {items.map(({ sym, pays }) => {
          const info = FRUIT_SYMBOL_INFO[sym];
          return (
            <div key={sym} className="card-base p-3 flex items-center gap-3">
              <div className="text-3xl">{info.emoji}</div>
              <div>
                <div className="font-semibold text-sm">{info.label}</div>
                <div className="text-xs text-text-secondary">
                  {pays.map((p, i) => (
                    <span key={i}>
                      {i > 0 && " · "}
                      {p.count}×: {p.mult}
                    </span>
                  ))}
                </div>
                {info.isScatter && (
                  <div className="text-[10px] text-gold uppercase tracking-wider">
                    Scatter (× total bet)
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      <p className="text-xs text-text-secondary mt-3 max-w-3xl">
        Multipliers shown apply to the per-line bet. Scatter pays on total bet.
        5 fixed paylines, left-to-right wins.
      </p>
    </div>
  );
}
