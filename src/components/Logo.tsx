export function Logo({ size = 32 }: { size?: number }) {
  return (
    <div className="flex items-center gap-2.5 select-none">
      <svg
        width={size}
        height={size}
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden
      >
        <defs>
          <linearGradient id="logo-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#7B61FF" />
            <stop offset="100%" stopColor="#C26BFF" />
          </linearGradient>
        </defs>
        <rect x="2" y="2" width="60" height="60" rx="14" fill="#16142B" />
        <path
          d="M14 14 L32 32 L50 14 L42 14 L32 24 L22 14 Z"
          fill="url(#logo-grad)"
        />
        <rect x="28" y="30" width="8" height="20" rx="2" fill="url(#logo-grad)" />
        <circle cx="32" cy="9" r="3" fill="#FFC842" />
      </svg>
      <div className="leading-tight">
        <div className="text-[15px] font-extrabold tracking-wide brand-gradient">
          BIG YAHU
        </div>
        <div className="text-[11px] font-bold tracking-[0.25em] gold-text -mt-0.5">
          BET
        </div>
      </div>
    </div>
  );
}
