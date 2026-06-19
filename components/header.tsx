"use client"

import Link from "next/link"
import { useState } from "react"
import { Zap, Menu, X, Settings } from "lucide-react"
import { cn } from "@/lib/utils"
import { SignInButton, UserButton } from "@clerk/nextjs"

const navLinks = [
  { label: "Home",       href: "/" },
  { label: "Pricing",    href: "/pricing" },
  { label: "Contact Us", href: "/contact" },
]

interface HeaderProps {
  isLoggedIn?: boolean
}

export function Header({
  isLoggedIn = false,
}: HeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header
      className="sticky top-0 z-50 w-full"
      style={{
        background: "oklch(0.09 0.012 285 / 0.80)",
        backdropFilter: "blur(20px) saturate(1.4)",
        WebkitBackdropFilter: "blur(20px) saturate(1.4)",
        borderBottom: "1px solid oklch(1 0 0 / 0.07)",
      }}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">

        {/* ── Logo ─────────────────────────────────────── */}
        <Link
          href="/"
          className="flex items-center gap-2.5 group select-none"
        >
          {/* Icon mark */}
          <div
            className="flex size-8 items-center justify-center rounded-lg gradient-brand shadow-lg"
            style={{
              boxShadow: "0 0 16px oklch(0.65 0.22 285 / 0.35)",
            }}
          >
            <Zap className="size-4 text-white fill-white" strokeWidth={2.5} />
          </div>

          {/* Wordmark */}
          <span
            className="text-lg font-bold tracking-tight"
            style={{
              fontFamily: "var(--font-display, 'Space Grotesk', system-ui)",
              color: "oklch(0.96 0.005 285)",
            }}
          >
            Motion
            <span className="gradient-text">Forge</span>
            {" "}
            <span style={{ color: "oklch(0.55 0.010 285)", fontWeight: 500 }}>AI</span>
          </span>
        </Link>

        {/* ── Desktop Nav ───────────────────────────────── */}
        <nav className="hidden md:flex items-center gap-1" aria-label="Main navigation">
          {navLinks.map((link) => (
            <NavLink key={link.href} href={link.href}>
              {link.label}
            </NavLink>
          ))}
        </nav>

        {/* ── Right Side ────────────────────────────────── */}
        <div className="flex items-center gap-3">
          {isLoggedIn ? (
            <UserButton appearance={{ elements: { userButtonAvatarBox: "size-8", userButtonPopoverCard: "shadow-2xl" } }}>
              <UserButton.MenuItems>
                <UserButton.Link
                  label="Settings"
                  labelIcon={<Settings className="size-4" />}
                  href="/settings"
                />
              </UserButton.MenuItems>
            </UserButton>
          ) : (
            <SignInButton mode="modal">
              <button
                id="get-started-button"
                className="hidden md:inline-flex h-9 items-center justify-center px-5 rounded-full gradient-brand text-white font-semibold text-sm hover:opacity-90 transition-opacity shadow-lg"
                style={{
                  boxShadow: "0 0 20px oklch(0.65 0.22 285 / 0.30)",
                }}
              >
                Get Started
              </button>
            </SignInButton>
          )}

          {/* Mobile menu toggle */}
          <button
            id="mobile-menu-toggle"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            className="flex md:hidden items-center justify-center size-9 rounded-lg transition-colors"
            style={{
              background: "oklch(1 0 0 / 0.06)",
              color: "oklch(0.70 0.012 285)",
            }}
          >
            {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {/* ── Mobile Dropdown ──────────────────────────────── */}
      {mobileOpen && (
        <div
          className="md:hidden border-t"
          style={{
            background: "oklch(0.11 0.013 285 / 0.95)",
            backdropFilter: "blur(16px)",
            borderColor: "oklch(1 0 0 / 0.07)",
          }}
        >
          <nav className="flex flex-col gap-1 px-4 py-3" aria-label="Mobile navigation">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="px-3 py-2.5 rounded-lg text-sm font-medium transition-colors"
                style={{ color: "oklch(0.70 0.012 285)" }}
              >
                {link.label}
              </Link>
            ))}
            {!isLoggedIn && (
              <SignInButton mode="modal">
                <button
                  onClick={() => setMobileOpen(false)}
                  className="mt-2 flex w-full items-center justify-center h-10 rounded-full gradient-brand text-white font-semibold text-sm"
                >
                  Get Started
                </button>
              </SignInButton>
            )}
          </nav>
        </div>
      )}
    </header>
  )
}

/* ── Internal sub-components ─────────────────────────── */

function NavLink({
  href,
  children,
}: {
  href: string
  children: React.ReactNode
}) {
  return (
    <Link
      href={href}
      className={cn(
        "relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
        "group"
      )}
      style={{ color: "oklch(0.70 0.012 285)" }}
    >
      <span className="relative z-10 group-hover:[color:oklch(0.96_0.005_285)] transition-colors duration-200">
        {children}
      </span>
      {/* Hover background */}
      <span
        className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200"
        style={{ background: "oklch(1 0 0 / 0.05)" }}
        aria-hidden
      />
      {/* Active underline indicator */}
      <span
        className="absolute bottom-1 left-4 right-4 h-px rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 gradient-brand"
        aria-hidden
      />
    </Link>
  )
}


