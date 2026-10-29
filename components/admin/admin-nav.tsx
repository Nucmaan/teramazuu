"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, ListChecks, QrCode, Settings, Store, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

const ITEMS = [
  { href: "/admin", label: "Overview", icon: BarChart3 },
  { href: "/admin/votes", label: "Votes", icon: ListChecks },
  { href: "/admin/restaurants", label: "Restaurants", icon: Store },
  { href: "/admin/qr", label: "QR codes", icon: QrCode },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export function AdminNav() {
  return <AdminNavLinks pathname={usePathname()} />;
}

/** Pure link list — also the static fallback before the pathname is known. */
export function AdminNavLinks({ pathname }: { pathname?: string }) {
  return (
    <nav aria-label="Admin" className="flex gap-1 overflow-x-auto [scrollbar-width:none] lg:flex-col lg:overflow-visible [&::-webkit-scrollbar]:hidden">
      {ITEMS.map(({ href, label, icon: Icon }) => {
        const active = pathname ? (href === "/admin" ? pathname === "/admin" : pathname.startsWith(href)) : false;
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex shrink-0 items-center gap-3 rounded-[3px] px-3 py-2 text-sm transition-colors",
              active ? "bg-ivory/12 text-ivory" : "text-ivory/65 hover:bg-ivory/6 hover:text-ivory",
            )}
          >
            <Icon aria-hidden className="size-4" />
            {label}
          </Link>
        );
      })}
      <Link
        href="/"
        target="_blank"
        className="flex shrink-0 items-center gap-3 rounded-[3px] px-3 py-2 text-sm text-ivory/50 hover:text-ivory lg:mt-4"
      >
        <ExternalLink aria-hidden className="size-4" />
        View site
      </Link>
    </nav>
  );
}
