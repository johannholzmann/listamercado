"use client";

import Image from "next/image";

type BrandMarkProps = {
  className?: string;
  size?: "sm" | "md";
  subtitle?: string;
};

const SIZE_MAP = {
  sm: {
    image: 48,
    titleClass: "text-sm tracking-[0.18em]",
    subtitleClass: "text-xs",
  },
  md: {
    image: 96,
    titleClass: "text-2xl sm:text-3xl",
    subtitleClass: "text-sm",
  },
} as const;

export function BrandMark({
  className,
  size = "sm",
  subtitle,
}: BrandMarkProps) {
  const config = SIZE_MAP[size];

  return (
    <div className={`flex items-center gap-3 ${className ?? ""}`.trim()}>
      <Image
        src="/quecompramos.png"
        alt="que compramos"
        width={config.image}
        height={config.image}
        className="h-auto w-auto rounded-full border border-[color:var(--border)] object-cover shadow-[0_10px_24px_rgba(20,16,12,0.12)]"
        priority={size === "md"}
        quality={100}
      />
      <div className="space-y-1">
        <p className={`font-display leading-none text-[color:var(--foreground)] ${config.titleClass}`}>
          que compramos
        </p>
        {subtitle ? (
          <p className={`max-w-xs leading-5 text-[color:var(--muted)] ${config.subtitleClass}`}>
            {subtitle}
          </p>
        ) : null}
      </div>
    </div>
  );
}
