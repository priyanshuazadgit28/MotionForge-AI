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
    <section className="relative w-full overflow-hidden bg-background pt-16 pb-20 sm:pt-24 sm:pb-32">
      {/* Background glow effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-[500px] opacity-20 pointer-events-none blur-[100px]" style={{ background: "radial-gradient(circle at top, oklch(0.65 0.22 285) 0%, transparent 60%)" }} />

      <div className="relative mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
        {/* Title & Subtitle */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground mb-6">
          Motion Graphics from <span className="text-transparent bg-clip-text" style={{ backgroundImage: "linear-gradient(135deg, oklch(0.65 0.22 285) 0%, oklch(0.72 0.20 200) 100%)" }}>Imagination</span>
        </h1>
        <p className="text-lg sm:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto font-medium">
          Describe your vision, and our AI will forge a stunning, high-fidelity motion graphic in seconds.
        </p>

        {/* The Generator Form */}
        <div className="relative mx-auto max-w-2xl text-left bg-white/5 border border-white/10 backdrop-blur-2xl shadow-2xl rounded-3xl p-2 transition-shadow focus-within:ring-2 focus-within:ring-white/20">
          <form onSubmit={handleSubmit} className="flex flex-col">
            
            {/* Top row: Duration & Ratio selects */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-white/5">
              <div className="flex items-center gap-2">
                <Clock className="size-4 text-muted-foreground" />
                <select
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="bg-transparent text-sm text-foreground font-medium focus:outline-none cursor-pointer appearance-none"
                >
                  <option value="5" className="bg-zinc-900">5 sec</option>
                  <option value="10" className="bg-zinc-900">10 sec</option>
                  <option value="15" className="bg-zinc-900">15 sec</option>
                </select>
              </div>
              
              <div className="w-px h-4 bg-white/10" />

              <div className="flex items-center gap-2">
                {ratio === "16:9" ? <MonitorPlay className="size-4 text-muted-foreground" /> : <Smartphone className="size-4 text-muted-foreground" />}
                <select
                  value={ratio}
                  onChange={(e) => setRatio(e.target.value)}
                  className="bg-transparent text-sm text-foreground font-medium focus:outline-none cursor-pointer appearance-none"
                >
                  <option value="16:9" className="bg-zinc-900">16:9 Landscape</option>
                  <option value="9:16" className="bg-zinc-900">9:16 Portrait</option>
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
                className="w-full min-h-[120px] resize-none bg-transparent px-2 py-4 text-base sm:text-lg text-foreground placeholder:text-muted-foreground/60 focus:outline-none"
              />
            </div>

            {/* Bottom: Submit & Extras */}
            <div className="flex items-center justify-between px-2 pb-2">
              <div className="flex items-center gap-2 pl-2">
                <Sparkles className="size-4 text-indigo-400" />
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">AI Powered</span>
              </div>

              <button
                id="generate-button"
                type="submit"
                disabled={!prompt.trim() || isPending}
                aria-label="Generate video"
                className={cn(
                  "flex items-center gap-2 h-10 px-6 rounded-full text-sm font-semibold text-white transition-all duration-200",
                  "disabled:opacity-40 disabled:cursor-not-allowed",
                  "enabled:hover:opacity-90 enabled:active:scale-95"
                )}
                style={{
                  background: "linear-gradient(135deg, oklch(0.65 0.22 285) 0%, oklch(0.72 0.20 200) 50%, oklch(0.75 0.25 330) 100%)",
                  boxShadow: prompt.trim()
                    ? "0 0 20px oklch(0.65 0.22 285 / 0.35)"
                    : "none",
                }}
              >
                {isPending ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Generating...
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

        {/* Suggested Prompts */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <span className="text-sm text-muted-foreground font-medium">Try:</span>
          {SUGGESTED_PROMPTS.map((suggestion) => (
            <button
              key={suggestion}
              onClick={() => {
                setPrompt(suggestion)
                textareaRef.current?.focus()
              }}
              className="text-xs sm:text-sm px-3 py-1.5 rounded-full border border-white/10 bg-white/5 text-foreground/80 hover:bg-white/10 hover:text-foreground transition-colors"
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}
