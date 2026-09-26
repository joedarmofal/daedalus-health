"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const SECTIONS = [
  { href: "", label: "Overview" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/policy", label: "Policy" },
  { href: "/governance", label: "Governance" },
  { href: "/toolkit", label: "Toolkit" },
  { href: "/legal", label: "Legal / Compliance" },
];

export function PortalNav({ orgSlug }: { orgSlug: string }) {
  const pathname = usePathname();
  const base = `/${orgSlug}`;

  return (
    <nav className="flex gap-1 overflow-x-auto pb-1">
      {SECTIONS.map((section) => {
        const href = `${base}${section.href}`;
        const isActive =
          section.href === ""
            ? pathname === base
            : pathname === href || pathname.startsWith(`${href}/`);

        return (
          <Link
            key={section.label}
            href={href}
            className={`whitespace-nowrap rounded-sm px-4 py-2 text-sm font-medium tracking-wide transition ${
              isActive
                ? "bg-[#1F6A64] text-[#F9F8F3]"
                : "text-[#1A2B3C]/70 hover:bg-[#1A2B3C]/5 hover:text-[#1A2B3C]"
            }`}
          >
            {section.label}
          </Link>
        );
      })}
    </nav>
  );
}
