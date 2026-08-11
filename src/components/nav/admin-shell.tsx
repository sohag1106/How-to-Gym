"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { Dumbbell } from "lucide-react";
import { cn } from "@/lib/utils";

export function AdminShell({
  title,
  navItems,
  children,
}: {
  title: string;
  navItems: { href: string; label: string }[];
  children: React.ReactNode;
}) {
  const activePath = usePathname();
  return (
    <div className="min-h-dvh flex flex-col">
      <header className="border-b border-border bg-card/60 backdrop-blur sticky top-0 z-20">
        <div className="max-w-4xl mx-auto w-full px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Dumbbell className="size-5 text-brand" strokeWidth={2.5} />
            <span className="font-semibold tracking-tight">{title}</span>
          </div>
          <UserButton />
        </div>
        <nav className="max-w-4xl mx-auto w-full px-4 sm:px-6 flex gap-1 overflow-x-auto pb-2 -mt-1">
          {navItems.map((item) => {
            const active = activePath.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "px-3 py-1.5 rounded-full text-sm whitespace-nowrap transition-colors",
                  active
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </header>
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-6">
        {children}
      </main>
    </div>
  );
}
