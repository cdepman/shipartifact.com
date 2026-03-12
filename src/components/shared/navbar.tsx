"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton, useAuth } from "@clerk/nextjs";
import { Plus } from "lucide-react";
import { Logo } from "./logo";

export function Navbar() {
  const pathname = usePathname();
  const { isSignedIn } = useAuth();
  const isDashboard =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/new") ||
    pathname.startsWith("/site");

  return (
    <nav className="border-b border-border">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href="/">
          <Logo />
        </Link>

        <div className="flex items-center gap-4">
          {isSignedIn ? (
            <>
              {isDashboard && (
                <>
                  <Link
                    href="/dashboard"
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/new"
                    className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
                  >
                    <Plus size={16} />
                    New Site
                  </Link>
                </>
              )}
              <UserButton />
            </>
          ) : (
            <>
              <Link
                href="/sign-in"
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                Sign in
              </Link>
              <Link
                href="/sign-up"
                className="rounded-lg bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
