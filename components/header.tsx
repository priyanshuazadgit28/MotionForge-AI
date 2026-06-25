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
    >
      {/* Floating glass bar with spacing */}
      <div
        className="mx-3 mt-3 sm:mx-4 sm:mt-4 rounded-2xl glass-strong"
        style={{
          borderBottom: "none",
        }}
      >
        <div className="mx-auto flex h-14 sm:h-16 max-w-7xl items-center justify-between px-4 sm:px-6">

          {/* ── Logo ─────────────────────────────────── */}
          <Link
            href="/"
            className="flex items-center gap-2.5 group select-none"
          >
            {/* Icon mark with breathing glow */}
            <div
              className="flex size-9 items-center justify-center rounded-xl gradient-brand glow-pulse"
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
              <span className="text-shimmer">Forge</span>
              {" "}
              <span style={{ color: "oklch(0.50 0.010 285)", fontWeight: 500 }}>AI</span>
            </span>
          </Link>

          {/* ── Desktop Nav ───────────────────────────── */}
          <nav className="hidden md:flex items-center gap-1" aria-label="Main navigation">
            {navLinks.map((link) => (
              <NavLink key={link.href} href={link.href}>
                {link.label}
              </NavLink>
            ))}
          </nav>

          {/* ── Right Side ────────────────────────────── */}
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
                  className="hidden md:inline-flex h-9 items-center justify-center px-5 rounded-full gradient-brand text-white font-semibold text-sm cursor-pointer btn-press btn-glow"
                  style={{
                    boxShadow: "0 0 24px oklch(0.65 0.22 285 / 0.30)",
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
              className="flex md:hidden items-center justify-center size-9 rounded-xl cursor-pointer btn-press"
              style={{
                background: "oklch(1 0 0 / 0.06)",
                color: "oklch(0.70 0.012 285)",
              }}
            >
              {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </div>

        {/* ── Mobile Dropdown ──────────────────────────── */}
        <div
          className={cn(
            "md:hidden overflow-hidden transition-all duration-500 ease-out",
            mobileOpen ? "max-h-80 opacity-100" : "max-h-0 opacity-0"
          )}
        >
          <div
            className="border-t"
            style={{
              borderColor: "oklch(1 0 0 / 0.06)",
            }}
          >
            <nav className="flex flex-col gap-1 px-4 py-3" aria-label="Mobile navigation">
              {navLinks.map((link, i) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="px-3 py-2.5 rounded-xl text-sm font-medium cursor-pointer animate-slide-in-left opacity-0"
                  style={{
                    color: "oklch(0.70 0.012 285)",
                    animationDelay: `${i * 80}ms`,
                    animationFillMode: "forwards",
                  }}
                >
                  {link.label}
                </Link>
              ))}
              {!isLoggedIn && (
                <SignInButton mode="modal">
                  <button
                    onClick={() => setMobileOpen(false)}
                    className="mt-2 flex w-full items-center justify-center h-10 rounded-full gradient-brand text-white font-semibold text-sm cursor-pointer btn-press animate-slide-in-left opacity-0"
                    style={{
                      animationDelay: `${navLinks.length * 80}ms`,
                      animationFillMode: "forwards",
                    }}
                  >
                    Get Started
                  </button>
                </SignInButton>
              )}
            </nav>
          </div>
        </div>
      </div>
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
        "relative px-4 py-2 rounded-xl text-sm font-medium nav-underline cursor-pointer",
        "group"
      )}
      style={{ color: "oklch(0.65 0.012 285)" }}
    >
      <span className="relative z-10 group-hover:[color:oklch(0.96_0.005_285)] transition-colors duration-300">
        {children}
      </span>
      {/* Hover background */}
      <span
        className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ background: "oklch(1 0 0 / 0.04)" }}
        aria-hidden
      />
    </Link>
  )
}
