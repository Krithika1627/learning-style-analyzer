"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/profile", label: "Profile", match: "/profile" },
  { href: "/dashboard", label: "Dashboard", match: "/dashboard" },
  { href: "/assessment/instructions", label: "Assessment", match: "/assessment" },
  { href: "/analysis", label: "Analysis", match: "/analysis" },
  { href: "/results", label: "Results", match: "/results" },
  { href: "/resources", label: "Resources", match: "/resources" },
  { href: "/tracker", label: "Tracker", match: "/tracker" },
  { href: "/calendar", label: "Calendar", match: "/calendar" },
];

export default function Navbar() {
  const pathname = usePathname();

  const hideNavbar = pathname?.startsWith("/sign-in") || pathname?.startsWith("/sign-up");

  if (hideNavbar) {
    return null;
  }

  return (
    <nav className="fixed inset-x-0 top-0 z-50 border-b border-border bg-[#0f172a]/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/dashboard" className="text-lg font-semibold text-white">
          Learning Style Analyzer
        </Link>

        <ul className="flex flex-wrap items-center gap-2 text-sm">
          {links.map((link) => {
            const isActive = pathname === link.match || pathname.startsWith(`${link.match}/`);

            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={`rounded-lg px-3 py-1.5 transition ${
                    isActive
                      ? "bg-accent text-white"
                      : "text-slate-300 hover:bg-card hover:text-white"
                  }`}
                >
                  {link.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
