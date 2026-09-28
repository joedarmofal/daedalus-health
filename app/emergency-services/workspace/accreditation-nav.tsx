"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/emergency-services/workspace", label: "Overview", exact: true },
  { href: "/emergency-services/workspace/policies", label: "Policies" },
  { href: "/emergency-services/workspace/pif", label: "PIF builder" },
  { href: "/emergency-services/workspace/standards", label: "Standards map" },
  { href: "/emergency-services/workspace/gaps", label: "Gaps" },
  { href: "/emergency-services/workspace/export", label: "PIF outline" },
];

export function AccreditationNav() {
  const pathname = usePathname();

  return (
    <nav className="flex gap-1 overflow-x-auto pb-1">
      {LINKS.map((link) => {
        const isActive = link.exact
          ? pathname === link.href
          : pathname === link.href || pathname.startsWith(`${link.href}/`);

        return (
          <Link
            key={link.href}
            href={link.href}
            className={`whitespace-nowrap rounded-sm px-4 py-2 text-sm font-medium tracking-wide transition ${
              isActive
                ? "bg-[#1F6A64] text-[#F9F8F3]"
                : "text-[#1A2B3C]/70 hover:bg-[#1A2B3C]/5 hover:text-[#1A2B3C]"
            }`}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
