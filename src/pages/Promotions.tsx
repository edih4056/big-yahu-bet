import { PromoCards } from "@/components/PromoCards";

export default function Promotions() {
  return (
    <div className="px-4 lg:px-6 py-6">
      <h1 className="heading text-2xl sm:text-3xl mb-2">Promotions</h1>
      <p className="text-text-secondary text-sm mb-2 max-w-2xl">
        These promos are part of the demo experience. No real money or prizes
        are awarded — they reset your demo coin balance for entertainment.
      </p>
      <PromoCards />

      <div className="mt-10 px-1">
        <h2 className="heading text-lg mb-3">Responsible Gaming</h2>
        <p className="text-sm text-text-secondary leading-relaxed max-w-3xl">
          Even though Big Yahu Bet is a demo with no real money involved, we
          encourage healthy attitudes toward gambling. If you or someone you
          know struggles with real-money gambling, support is available — for
          example via{" "}
          <span className="text-accent-light">BZgA (Germany)</span>,{" "}
          <span className="text-accent-light">GamCare (UK)</span>, or local
          equivalents.
        </p>
      </div>
    </div>
  );
}
