"use client"

import { useState, useRef, useTransition } from "react"
import { useAuth, useClerk } from "@clerk/nextjs"
import { ArrowUp, Clock, MonitorPlay, Smartphone, Sparkles, Loader2 } from "lucide-react"
import { createProject } from "@/app/actions/project"
import { cn } from "@/lib/utils"

const SUGGESTED_PROMPTS = [
  "A futuristic cyberpunk city with neon lights",
  "Abstract geometric shapes flowing through a neon-lit tunnel",
]

export function HeroSection() {
  const [prompt,   setPrompt]   = useState("")
  const [duration, setDuration] = useState("10")
  const [ratio,    setRatio]    = useState("16:9")
  
  const [isPending, startTransition] = useTransition()
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const { isSignedIn } = useAuth()
  const clerk = useClerk()

  function handleSubmit(e?: React.FormEvent) {
    e?.preventDefault()
    if (!prompt.trim()) return
    
    if (!isSignedIn) {
      clerk.openSignIn()
      return
    }
    
    startTransition(() => {
      createProject(prompt, duration, ratio)
    })
  }

  function handleKey(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <section className="relative w-full overflow-hidden pt-24 pb-24 sm:pt-32 sm:pb-36">

      {/* ── Neon ambient orbs ─── */}
      <div
        className="absolute top-[-200px] left-1/2 -translate-x-1/2 w-[900px] h-[900px] pointer-events-none"
        style={{
          background: "radial-gradient(circle at center, oklch(0.65 0.22 285 / 0.14) 0%, transparent 60%)",
          filter: "blur(100px)",
          animation: "neon-drift-1 18s ease-in-out infinite",
        }}
        aria-hidden
      />
      <div
        className="absolute top-[100px] right-[-200px] w-[600px] h-[600px] pointer-events-none"
        style={{
          background: "radial-gradient(circle, oklch(0.72 0.20 200 / 0.10) 0%, transparent 60%)",
          filter: "blur(80px)",
          animation: "neon-drift-2 22s ease-in-out infinite",
        }}
        aria-hidden
      />
      <div
        className="absolute bottom-[-100px] left-[-100px] w-[500px] h-[500px] pointer-events-none"
        style={{
          background: "radial-gradient(circle, oklch(0.75 0.25 330 / 0.08) 0%, transparent 60%)",
          filter: "blur(80px)",
          animation: "neon-drift-3 26s ease-in-out infinite",
        }}
        aria-hidden
      />

      {/* ── Dot grid overlay ─── */}
      <div className="absolute inset-0 dot-grid pointer-events-none" aria-hidden />

      {/* ── Content ─── */}
      <div className="relative z-10 mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">

        {/* Badge */}
        <div className="mb-6 opacity-0 animate-fade-in-up" style={{ animationDelay: "0s", animationFillMode: "forwards" }}>
          <span
            className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-1 text-xs font-semibold uppercase tracking-widest"
            style={{
              background: "oklch(0.65 0.22 285 / 0.08)",
              border: "1px solid oklch(0.65 0.22 285 / 0.18)",
              color: "oklch(0.72 0.16 285)",
            }}
          >
            <Sparkles className="size-3" />
            AI-Powered Motion Design
          </span>
        </div>

        {/* Title */}
        <h1
          className="font-extrabold tracking-tight text-foreground mb-6 opacity-0 animate-fade-in-up"
          style={{
            fontFamily: "var(--font-display, 'Space Grotesk', system-ui)",
            fontSize: "clamp(2.5rem, 6vw, 5rem)",
            lineHeight: 1.05,
            animationDelay: "0.1s",
            animationFillMode: "forwards",
          }}
        >
          Motion Graphics{" "}
          <br className="hidden sm:block" />
          from{" "}
          <span className="text-shimmer">Imagination</span>
        </h1>

        {/* Subtitle */}
        <p
          className="text-lg sm:text-xl mb-12 max-w-2xl mx-auto font-medium opacity-0 animate-fade-in-up"
          style={{
            color: "oklch(0.60 0.012 285)",
            lineHeight: 1.7,
            animationDelay: "0.2s",
            animationFillMode: "forwards",
          }}
        >
          Describe your vision, and our AI will forge a stunning,
          high-fidelity motion graphic in seconds.
        </p>

        {/* ── Prompt Box ─── */}
        <div
          className="relative mx-auto max-w-2xl text-left glass rounded-[1.25rem] p-1.5 glow-focus opacity-0 animate-fade-in-scale"
          style={{
            animationDelay: "0.35s",
            animationFillMode: "forwards",
          }}
        >
          <form onSubmit={handleSubmit} className="flex flex-col">
            
            {/* Top row: Duration & Ratio selects */}
            <div
              className="flex items-center gap-3 px-4 py-3 border-b"
              style={{ borderColor: "oklch(1 0 0 / 0.06)" }}
            >
              <div className="flex items-center gap-2">
                <Clock className="size-4" style={{ color: "oklch(0.55 0.010 285)" }} />
                <select
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="bg-transparent text-sm text-foreground font-medium focus:outline-none cursor-pointer appearance-none"
                >
                  <option value="5" style={{ background: "oklch(0.09 0.014 285)" }}>5 sec</option>
                  <option value="10" style={{ background: "oklch(0.09 0.014 285)" }}>10 sec</option>
                  <option value="15" style={{ background: "oklch(0.09 0.014 285)" }}>15 sec</option>
                </select>
              </div>
              
              <div className="w-px h-4" style={{ background: "oklch(1 0 0 / 0.08)" }} />

              <div className="flex items-center gap-2">
                {ratio === "16:9"
                  ? <MonitorPlay className="size-4" style={{ color: "oklch(0.55 0.010 285)" }} />
                  : <Smartphone className="size-4" style={{ color: "oklch(0.55 0.010 285)" }} />}
                <select
                  value={ratio}
                  onChange={(e) => setRatio(e.target.value)}
                  className="bg-transparent text-sm text-foreground font-medium focus:outline-none cursor-pointer appearance-none"
                >
                  <option value="16:9" style={{ background: "oklch(0.09 0.014 285)" }}>16:9 Landscape</option>
                  <option value="9:16" style={{ background: "oklch(0.09 0.014 285)" }}>9:16 Portrait</option>
                </select>
              </div>
            </div>

            {/* Middle: Textarea */}
            <div className="relative px-2">
              <textarea
                ref={textareaRef}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={handleKey}
                placeholder="What do you want to create?"
                className="w-full min-h-[120px] resize-none bg-transparent px-2 py-4 text-base sm:text-lg text-foreground placeholder:text-muted-foreground/50 focus:outline-none"
              />
            </div>

            {/* Bottom: Submit & Extras */}
            <div className="flex items-center justify-between px-3 pb-2">
              <div className="flex items-center gap-2 pl-1">
                <Sparkles className="size-3.5" style={{ color: "oklch(0.72 0.20 200)" }} />
                <span
                  className="text-[10px] font-semibold uppercase tracking-wider"
                  style={{ color: "oklch(0.45 0.010 285)" }}
                >
                  AI Powered
                </span>
              </div>

              <button
                id="generate-button"
                type="submit"
                disabled={!prompt.trim() || isPending}
                aria-label="Generate video"
                className={cn(
                  "flex items-center gap-2 h-10 px-6 rounded-full text-sm font-semibold text-white cursor-pointer btn-press",
                  "disabled:opacity-30 disabled:cursor-not-allowed disabled:shadow-none",
                )}
                style={{
                  background: "linear-gradient(135deg, oklch(0.65 0.22 285) 0%, oklch(0.72 0.20 200) 50%, oklch(0.75 0.25 330) 100%)",
                  boxShadow: prompt.trim()
                    ? "0 0 24px oklch(0.65 0.22 285 / 0.35), 0 0 60px oklch(0.65 0.22 285 / 0.10)"
                    : "none",
                  transition: "box-shadow 0.4s ease, opacity 0.3s ease, transform 0.15s ease",
                }}
              >
                {isPending ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Generating…
                  </>
                ) : (
                  <>
                    <ArrowUp className="size-4" strokeWidth={2.5} />
                    Generate
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* ── Suggested Prompts ─── */}
        <div
          className="mt-8 flex flex-wrap items-center justify-center gap-3 opacity-0 animate-fade-in-up"
          style={{ animationDelay: "0.5s", animationFillMode: "forwards" }}
        >
          <span
            className="text-sm font-medium"
            style={{ color: "oklch(0.45 0.010 285)" }}
          >
            Try:
          </span>
          {SUGGESTED_PROMPTS.map((suggestion) => (
            <button
              key={suggestion}
              onClick={() => {
                setPrompt(suggestion)
                textareaRef.current?.focus()
              }}
              className="text-xs sm:text-sm px-4 py-2 rounded-full cursor-pointer btn-press glow-border"
              style={{
                background: "oklch(1 0 0 / 0.03)",
                border: "1px solid oklch(1 0 0 / 0.08)",
                color: "oklch(0.70 0.012 285)",
              }}
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}
