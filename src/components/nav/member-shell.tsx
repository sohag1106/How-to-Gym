"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { Home, CalendarDays, User } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Today", icon: Home },
  { href: "/plan", label: "Plan", icon: CalendarDays },
  { href: "/profile", label: "Profile", icon: User },
];

export function MemberShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-dvh flex flex-col">
      <header className="sticky top-0 z-20 bg-background/80 backdrop-blur border-b border-border">
        <div className="max-w-md mx-auto w-full px-5 py-3 flex items-center justify-between">
          <span className="font-semibold tracking-tight">How to Gym</span>
          <UserButton />
        </div>
      </header>

      <main className="flex-1 max-w-md mx-auto w-full px-5 py-6 pb-28">
        {children}
      </main>

      <nav className="fixed bottom-0 inset-x-0 z-20 bg-background/95 backdrop-blur border-t border-border pb-[env(safe-area-inset-bottom)]">
        <div className="max-w-md mx-auto w-full grid grid-cols-3">
          {NAV_ITEMS.map((item) => {
            const active = pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-1 py-2.5 text-xs font-medium transition-colors",
                  active ? "text-brand" : "text-muted-foreground"
                )}
              >
                <Icon className="size-5" strokeWidth={active ? 2.5 : 2} />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
