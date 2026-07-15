interface LogoProps {
  size?: number;
  withText?: boolean;
  className?: string;
}

export function ZTLogo({ size = 40, withText = true, className = '' }: LogoProps) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0"
        aria-label="ZT Media logo"
      >
        <defs>
          <linearGradient id="zt-gold" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#FFE080" />
            <stop offset="0.5" stopColor="#F4B400" />
            <stop offset="1" stopColor="#B88600" />
          </linearGradient>
        </defs>
        <rect width="64" height="64" rx="16" fill="#0A0A0A" />
        <rect x="2" y="2" width="60" height="60" rx="14" stroke="url(#zt-gold)" strokeWidth="1.5" strokeOpacity="0.4" />
        <path
          d="M16 22 L30 22 L16 38 L30 38"
          stroke="url(#zt-gold)"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <path
          d="M34 22 L48 22 L34 42 L48 42"
          stroke="url(#zt-gold)"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <circle cx="48" cy="22" r="3" fill="#F4B400" />
      </svg>
      {withText && (
        <div className="flex flex-col leading-none">
          <span className="font-display text-lg font-bold tracking-tight text-ink-900 dark:text-white">
            ZT <span className="text-gold-400">MEDIA</span>
          </span>
          <span className="text-[9px] font-semibold uppercase tracking-[0.25em] text-ink-400 dark:text-ink-500">
            Zetalent Media
          </span>
        </div>
      )}
    </div>
  );
}
