"use client";

import Link from "next/link";
import { UserButton, useAuth } from "@clerk/nextjs";
import { Rocket } from "lucide-react";
import { Logo } from "./logo";

export function Navbar() {
  const { isSignedIn } = useAuth();

  return (
    <nav className="border-b border-border">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:h-16 sm:px-6">
        <Link href="/">
          <Logo size="small" />
        </Link>

        <div className="flex items-center gap-2 sm:gap-4">
          {isSignedIn ? (
            <>
              <Link
                href="/dashboard"
                className="hidden text-sm text-muted-foreground transition-colors hover:text-foreground sm:block"
              >
                Dashboard
              </Link>
              <Link
                href="/new"
                className="flex items-center gap-1.5 rounded-lg bg-primary px-2.5 py-1.5 text-xs font-medium text-primary-foreground transition-opacity hover:opacity-90 sm:px-3 sm:text-sm"
              >
                <Rocket size={14} fill="currentColor" />
                New
              </Link>
              <UserButton />
            </>
          ) : (
            <>
              <Link
                href="/sign-in"
                className="text-xs text-muted-foreground transition-colors hover:text-foreground sm:text-sm"
              >
                Sign in
              </Link>
              <Link
                href="/sign-up"
                className="rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-opacity hover:opacity-90 sm:px-4 sm:text-sm"
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
