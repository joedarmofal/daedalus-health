import { CompassStar } from "@/components/compass-star";
import Link from "next/link";

const legendItems = [
  {
    href: "/#services",
    label: "Services",
    symbol: (
      <path
        d="M1 8 Q6 2 12 8 T23 8"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
      />
    ),
  },
  {
    href: "/#governance",
    label: "AI Governance",
    symbol: (
      <>
        <circle cx="12" cy="6" r="5.25" fill="none" stroke="currentColor" strokeWidth="1" />
        <circle cx="12" cy="6" r="2.25" fill="none" stroke="currentColor" strokeWidth="1" />
      </>
    ),
  },
  {
    href: "/#about",
    label: "About",
    symbol: (
      <>
        <path d="M12 1 21 10 3 10Z" fill="currentColor" />
        <circle cx="12" cy="7.4" r="1" fill="#1A2B3C" />
      </>
    ),
  },
  {
    href: "/privacy",
    label: "Privacy Policy",
    symbol: (
      <line
        x1="1"
        y1="6"
        x2="23"
        y2="6"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeDasharray="3,2.5"
        strokeLinecap="round"
      />
    ),
  },
  {
    href: "/login",
    label: "Client Portal",
    symbol: (
      <path
        d="M12 1 17.5 6 12 11 6.5 6Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.25"
      />
    ),
  },
];

export function MapLegend({ className }: { className?: string }) {
  return (
    <div
      className={`rounded-sm border border-[#C4A574]/50 bg-[#1A2B3C]/55 px-4 py-3.5 backdrop-blur-[3px] ${className ?? ""}`}
    >
      <div className="flex items-center gap-2 border-b border-[#C4A574]/30 pb-2">
        <CompassStar className="size-4 text-[#C4A574]" />
        <p className="text-[10px] font-semibold tracking-[0.28em] text-[#C4A574]">
          LEGEND
        </p>
      </div>
      <ul className="mt-2 flex flex-col gap-1.5">
        {legendItems.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              className="group flex items-center gap-2.5 rounded-sm px-1 py-0.5 transition-colors hover:bg-[#C4A574]/10"
            >
              <svg
                viewBox="0 0 24 12"
                className="h-2.5 w-6 shrink-0 text-[#C4A574]/80 transition-colors group-hover:text-[#C4A574]"
                aria-hidden="true"
              >
                {item.symbol}
              </svg>
              <span className="text-[11px] tracking-wide text-[#F9F8F3]/80 transition-colors group-hover:text-[#F9F8F3]">
                {item.label}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
