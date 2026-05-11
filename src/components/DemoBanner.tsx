import { Sparkles } from "lucide-react";

export function DemoBanner() {
  return (
    <div className="bg-accent-gradient/20 bg-bg-secondary border-b border-accent/20">
      <div className="px-4 py-2 flex items-center justify-center gap-2 text-xs">
        <Sparkles size={14} className="text-accent-light" />
        <span className="font-medium tracking-wide">
          DEMO MODE — PLAY MONEY ONLY — NOT REAL GAMBLING
        </span>
      </div>
    </div>
  );
}
