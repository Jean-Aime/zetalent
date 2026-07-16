interface LogoProps {
  size?: number;
  withText?: boolean;
  className?: string;
}

export function ZTLogo({ size = 40, withText = true, className = '' }: LogoProps) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <img
        src="/logo.jpeg"
        alt="ZeTalent Media"
        width={size}
        height={size}
        className="shrink-0 rounded-xl object-contain"
        style={{ width: size, height: size }}
      />
      {withText && (
        <div className="flex flex-col leading-none">
          <span className="font-display text-lg font-bold tracking-tight text-ink-900 dark:text-white">
            Ze<span className="text-gold-400">Talent</span>
          </span>
          <span className="text-[9px] font-semibold uppercase tracking-[0.25em] text-ink-400 dark:text-ink-500">
            Media
          </span>
        </div>
      )}
    </div>
  );
}
