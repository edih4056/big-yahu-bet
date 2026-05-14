import { ClusterSlotUI } from "@/games/clusterSlot/ClusterSlotUI";
import {
  sweetBonanzaConfig,
  SWEET_BONANZA_INFO,
} from "@/games/clusterSlot/configs";

export default function SweetBonanza() {
  return (
    <div>
      <ClusterSlotUI
        gameKey="sweet-bonanza"
        title="Sweet Bonanza 1000"
        subtitle="PAY-ANYWHERE · TUMBLE · 6×5"
        config={sweetBonanzaConfig}
        cabinet="linear-gradient(180deg, #F472B6 0%, #BE185D 60%, #6B21A8 100%)"
        trim="#FFE15A"
        symbolInfo={SWEET_BONANZA_INFO}
      />
      <Paytable />
    </div>
  );
}

function Paytable() {
  return (
    <div className="px-4 lg:px-6 py-6 max-w-4xl mx-auto">
      <h2 className="heading text-lg mb-3">Paytable & rules</h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {Object.entries(SWEET_BONANZA_INFO).map(([sym, info]) => {
          const t = sweetBonanzaConfig.paytable[sym] ?? {};
          return (
            <div key={sym} className="card-base p-3 flex items-center gap-3">
              <div className="text-3xl">{sym}</div>
              <div>
                <div className="font-semibold text-sm">{info.label}</div>
                <div className="text-xs text-text-secondary">
                  8: {t[8] ?? 0}× · 10: {t[10] ?? 0}× · 12+: {t[12] ?? 0}×
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <p className="text-xs text-text-secondary mt-3 max-w-2xl">
        Pay-anywhere: 8 or more matching symbols anywhere on the 6×5 grid pay.
        After a win, the matching symbols disappear and the remaining ones drop
        — fresh symbols fill the top, and the grid is re-evaluated (tumble
        feature).
      </p>
    </div>
  );
}
