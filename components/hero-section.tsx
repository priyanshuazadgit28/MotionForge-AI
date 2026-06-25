"use client"

import { useState, useRef, useTransition, useEffect } from "react"
import { useAuth, useClerk } from "@clerk/nextjs"
import { ArrowUp, Clock, MonitorPlay, Smartphone, Sparkles, Loader2 } from "lucide-react"
import { createProject } from "@/app/actions/project"
import { cn } from "@/lib/utils"

const SUGGESTED_PROMPTS = [
  "A futuristic cyberpunk city with neon lights",
  "Abstract geometric shapes flowing through a neon-lit tunnel",
]

export function HeroSection() {
  const [prompt, setPrompt] = useState("")
  const [duration, setDuration] = useState("10")
  const [ratio, setRatio] = useState("16:9")

  const [isPending, startTransition] = useTransition()
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  const { isSignedIn } = useAuth()
  const clerk = useClerk()

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let fadeReq: number;
    const updateOpacity = () => {
      if (!video) return;
      const t = video.currentTime;
      const d = video.duration;

      if (!d || isNaN(d)) {
        fadeReq = requestAnimationFrame(updateOpacity);
        return;
      }

      let opacity = 1;
      const fadeDur = 0.5;

      if (t < fadeDur) {
        opacity = t / fadeDur;
      } else if (d - t < fadeDur) {
        opacity = (d - t) / fadeDur;
      }

      video.style.opacity = Math.max(0, Math.min(1, opacity)).toString();
      fadeReq = requestAnimationFrame(updateOpacity);
    };

    const onEnded = () => {
      video.style.opacity = "0";
      setTimeout(() => {
        video.currentTime = 0;
        video.play().catch(console.error);
      }, 100);
    };

    video.addEventListener("ended", onEnded);
    video.play().catch(console.error);
    fadeReq = requestAnimationFrame(updateOpacity);

    return () => {
      video.removeEventListener("ended", onEnded);
      cancelAnimationFrame(fadeReq);
    };
  }, []);

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
    <section
      className="relative w-full min-h-screen overflow-hidden flex flex-col justify-center pt-24 pb-24 sm:pt-32 sm:pb-36"
      style={{ backgroundColor: "hsl(260 87% 3%)" }}
    >
      {/* Background Video */}
      <video
        ref={videoRef}
        src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260328_065045_c44942da-53c6-4804-b734-f9e07fc22e08.mp4"
        playsInline
        muted
        autoPlay
        className="absolute inset-0 w-full h-full object-cover z-0"
        style={{ opacity: 0 }}
      />

      {/* Blurred overlay shape */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[984px] h-[527px] opacity-90 bg-gray-950 blur-[82px] pointer-events-none z-0" />
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

      {/* ── Bottom fade transition ─── */}
      <div className="absolute bottom-0 left-0 w-full h-48 bg-gradient-to-t from-background to-transparent pointer-events-none z-0" aria-hidden />

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
          className="font-extrabold tracking-tight mb-6 opacity-0 animate-fade-in-up"
          style={{
            color: "hsl(40 6% 95%)",
            fontFamily: "'General Sans', system-ui",
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
            color: "hsl(40 6% 82%)",
            fontFamily: "'Geist Sans', system-ui",
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
          className="relative mx-auto max-w-2xl text-left bg-black/50 backdrop-blur-2xl border border-white/20 rounded-[1.25rem] p-1.5 glow-focus opacity-0 animate-fade-in-scale"
          style={{
            animationDelay: "0.35s",
            animationFillMode: "forwards",
          }}
        >
          <form onSubmit={handleSubmit} className="flex flex-col">

            {/* Top row: Duration & Ratio selects */}
            <div
              className="flex items-center gap-3 px-4 py-3 border-b"
              style={{ borderColor: "rgba(255,255,255,0.15)" }}
            >
              <div className="flex items-center gap-2">
                <Clock className="size-4" style={{ color: "rgba(255,255,255,0.7)" }} />
                <select
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="bg-transparent text-sm text-white font-medium focus:outline-none cursor-pointer appearance-none"
                >
                  <option value="5" style={{ background: "hsl(260 87% 10%)" }}>5 sec</option>
                  <option value="10" style={{ background: "hsl(260 87% 10%)" }}>10 sec</option>
                  <option value="15" style={{ background: "hsl(260 87% 10%)" }}>15 sec</option>
                </select>
              </div>

              <div className="w-px h-4" style={{ background: "rgba(255,255,255,0.2)" }} />

              <div className="flex items-center gap-2">
                {ratio === "16:9"
                  ? <MonitorPlay className="size-4" style={{ color: "rgba(255,255,255,0.7)" }} />
                  : <Smartphone className="size-4" style={{ color: "rgba(255,255,255,0.7)" }} />}
                <select
                  value={ratio}
                  onChange={(e) => setRatio(e.target.value)}
                  className="bg-transparent text-sm text-white font-medium focus:outline-none cursor-pointer appearance-none"
                >
                  <option value="16:9" style={{ background: "hsl(260 87% 10%)" }}>16:9 Landscape</option>
                  <option value="9:16" style={{ background: "hsl(260 87% 10%)" }}>9:16 Portrait</option>
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
                className="w-full min-h-[120px] resize-none bg-transparent px-2 py-4 text-base sm:text-lg text-white placeholder:text-white/50 focus:outline-none"
              />
            </div>

            {/* Bottom: Submit & Extras */}
            <div className="flex items-center justify-between px-3 pb-2">
              <div className="flex items-center gap-2 pl-1">
                <Sparkles className="size-3.5" style={{ color: "oklch(0.72 0.20 200)" }} />
                <span
                  className="text-[10px] font-semibold uppercase tracking-wider"
                  style={{ color: "rgba(255,255,255,0.6)" }}
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
            style={{ color: "rgba(255,255,255,0.7)" }}
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
              className="text-xs sm:text-sm px-4 py-2 rounded-full cursor-pointer btn-press glow-border transition-colors hover:bg-white/10"
              style={{
                background: "rgba(255, 255, 255, 0.08)",
                border: "1px solid rgba(255, 255, 255, 0.15)",
                color: "rgba(255, 255, 255, 0.95)",
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
