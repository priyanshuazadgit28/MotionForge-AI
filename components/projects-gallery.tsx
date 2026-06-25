"use client"

import { useState } from "react"
import { Play, Clock, MonitorPlay, Smartphone, Heart, Eye } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Project, User } from "@/lib/generated/prisma/client"
import { RemotionDynamicThumbnail } from "./remotion-dynamic-thumbnail"
import { SignInButton } from "@clerk/nextjs"

/* ── Types ───────────────────────────────────────────────── */

// The Prisma shape we receive (project + optional nested author)
export type ProjectWithAuthor = Project & { author: User | null }

/* ── Time formatting helper ──────────────────────────────── */
function formatRelativeTime(date: Date): string {
  const now = Date.now()
  const diff = now - new Date(date).getTime()
  const secs = Math.floor(diff / 1000)
  const mins = Math.floor(secs / 60)
  const hours = Math.floor(mins / 60)
  const days = Math.floor(hours / 24)

  if (days >= 2) return `${days}d ago`
  if (days === 1) return "Yesterday"
  if (hours >= 1) return `${hours}h ago`
  if (mins >= 1) return `${mins}m ago`
  return "Just now"
}

/* ── Helper ─────────────────────────────────────────────── */
function formatNumber(n: number): string {
  if (n >= 1000) return (n / 1000).toFixed(1) + "k"
  return String(n)
}

/* ── Video Card ─────────────────────────────────────────── */
import Link from "next/link"

function ProjectCard({
  project,
  showAuthor = true,
  animDelay = 0,
  isLoggedIn = false,
}: {
  project: ProjectWithAuthor
  showAuthor?: boolean
  animDelay?: number
  isLoggedIn?: boolean
}) {
  const isPortrait = project.ratio === "9:16"
  const [isHovered, setIsHovered] = useState(false)

  const CardWrapper = ({ children }: { children: React.ReactNode }) => {
    const cardClassName = "group relative flex flex-col rounded-2xl overflow-hidden card-hover glow-border border animate-fade-in-up opacity-0 cursor-pointer text-left w-full h-full"
    const cardStyle = {
      background: "oklch(0.09 0.014 285)",
      borderColor: "oklch(1 0 0 / 0.06)",
      animationDelay: `${animDelay}ms`,
      animationFillMode: "forwards" as const,
      boxShadow: "inset 0 1px 0 oklch(1 0 0 / 0.05)",
    }

    if (!isLoggedIn) {
      return (
        <SignInButton mode="modal">
          <button
            type="button"
            className={cardClassName}
            style={cardStyle}
            aria-label={`Sign in to view project: ${project.title}`}
          >
            {children}
          </button>
        </SignInButton>
      )
    }

    return (
      <Link
        href={`/project/${project.id}`}
        className={cardClassName}
        style={cardStyle}
        aria-label={`Project: ${project.title}`}
      >
        {children}
      </Link>
    )
  }

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="w-full h-full"
    >
      <CardWrapper>
        {/* Thumbnail */}
        <div
        className={cn(
          "relative overflow-hidden",
          isPortrait ? "aspect-[9/16] max-h-64" : "aspect-video"
        )}
        style={{ background: project.thumbnailGradient }}
      >
        {/* Dynamic Thumbnail */}
        {project.remotionCode && project.themeConfig && (
          <RemotionDynamicThumbnail
            code={project.remotionCode}
            themeConfig={project.themeConfig as any}
            durationInSeconds={parseInt(project.duration.match(/\d+/)?.[0] || "10")}
            width={isPortrait ? 1080 : 1920}
            height={isPortrait ? 1920 : 1080}
            fps={30}
            className="absolute inset-0 z-0"
            isPlaying={isHovered}
          />
        )}

        {/* Shimmer overlay on hover */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 animate-shimmer"
          aria-hidden
        />

        {/* Play button overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-400">
          <div
            className="flex size-14 items-center justify-center rounded-full transition-transform duration-300 group-hover:scale-110"
            style={{
              background: "oklch(0 0 0 / 0.45)",
              backdropFilter: "blur(8px)",
              border: "1px solid oklch(1 0 0 / 0.15)",
              boxShadow: "0 0 20px oklch(0.65 0.22 285 / 0.20)",
            }}
          >
            <Play className="size-5 fill-white text-white ml-0.5" />
          </div>
        </div>

        {/* Badges */}
        <div className="absolute bottom-2 left-2 right-2 flex items-end justify-between gap-1 pointer-events-none">
          <Badge>
            <Clock className="size-2.5" />
            {project.duration}
          </Badge>
          <Badge>
            {isPortrait
              ? <Smartphone className="size-2.5" />
              : <MonitorPlay className="size-2.5" />}
            {project.ratio}
          </Badge>
        </div>
      </div>

      {/* Card Footer */}
      <div className="flex flex-col gap-2.5 p-4">
        <h3
          className="text-sm font-semibold leading-snug line-clamp-1"
          style={{ color: "oklch(0.92 0.005 285)" }}
        >
          {project.title}
        </h3>
        <p
          className="text-xs leading-relaxed line-clamp-2"
          style={{ color: "oklch(0.50 0.008 285)" }}
        >
          {project.prompt}
        </p>

        {/* Meta row */}
        <div className="mt-1 flex items-center justify-between gap-2">
          {/* Author */}
          {showAuthor && project.author ? (
            <div className="flex items-center gap-1.5 min-w-0">
              <div
                className="flex size-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white"
                style={{
                  background: project.author.avatarGradient,
                  boxShadow: "0 0 8px oklch(0.65 0.22 285 / 0.15)",
                }}
              >
                {project.author.initial}
              </div>
              <span
                className="text-xs font-medium truncate"
                style={{ color: "oklch(0.62 0.008 285)" }}
              >
                {project.author.name}
              </span>
              <span
                className="text-xs shrink-0"
                style={{ color: "oklch(0.38 0.006 285)" }}
              >
                · {formatRelativeTime(project.createdAt)}
              </span>
            </div>
          ) : (
            <span
              className="text-xs"
              style={{ color: "oklch(0.42 0.006 285)" }}
            >
              {formatRelativeTime(project.createdAt)}
            </span>
          )}

          {/* Stats */}
          <div className="flex items-center gap-3 shrink-0">
            <Stat icon={Eye} value={formatNumber(project.views)} label="views" />
            <Stat icon={Heart} value={formatNumber(project.likes)} label="likes" />
          </div>
          </div>
        </div>
      </CardWrapper>
    </div>
  )
}

/* ── Small helpers ───────────────────────────────────────── */
function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium"
      style={{
        background: "oklch(0 0 0 / 0.55)",
        backdropFilter: "blur(8px)",
        color: "oklch(0.85 0.005 285)",
        border: "1px solid oklch(1 0 0 / 0.08)",
      }}
    >
      {children}
    </span>
  )
}

function Stat({
  icon: Icon,
  value,
  label,
}: {
  icon: React.ElementType
  value: string
  label: string
}) {
  return (
    <span
      className="flex items-center gap-1 text-xs"
      style={{ color: "oklch(0.45 0.008 285)" }}
      aria-label={`${value} ${label}`}
    >
      <Icon className="size-3" />
      {value}
    </span>
  )
}

/* ── Gallery Section ─────────────────────────────────────── */
interface ProjectsGalleryProps {
  projects: ProjectWithAuthor[]
  isLoggedIn?: boolean
}

export function ProjectsGallery({
  projects,
  isLoggedIn = false,
}: ProjectsGalleryProps) {
  return (
    <section
      id="projects-gallery"
      aria-labelledby="gallery-heading"
      className="mx-auto max-w-7xl px-4 pb-24 sm:px-6 lg:px-8"
    >
      {/* Section header */}
      <div className="mb-10 flex flex-col items-center gap-3 text-center">
        <div
          className="mb-1 inline-flex items-center rounded-full px-3.5 py-1 text-xs font-semibold uppercase tracking-widest"
          style={{
            background: "oklch(0.65 0.22 285 / 0.08)",
            border: "1px solid oklch(0.65 0.22 285 / 0.18)",
            color: "oklch(0.72 0.16 285)",
          }}
        >
          {isLoggedIn ? "My Projects" : "Community Showcase"}
        </div>

        <h2
          id="gallery-heading"
          className="text-2xl sm:text-3xl lg:text-4xl font-bold"
          style={{
            fontFamily: "var(--font-display, 'Space Grotesk', system-ui)",
            color: "oklch(0.94 0.005 285)",
          }}
        >
          {isLoggedIn
            ? "Your Created Videos"
            : (<>Made with <span className="text-shimmer">MotionForge AI</span></>)}
        </h2>
        <p
          className="max-w-lg text-sm leading-relaxed"
          style={{ color: "oklch(0.50 0.010 285)" }}
        >
          {isLoggedIn
            ? "All the motion graphics you've generated — click to preview or download."
            : "Explore stunning motion graphics created by our community. Get inspired and create your own."}
        </p>
      </div>

      {/* Grid */}
      <div
        className="grid gap-5"
        style={{
          gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 280px), 1fr))",
        }}
      >
        {projects.map((project, i) => (
          <ProjectCard
            key={project.id}
            project={project}
            showAuthor={!isLoggedIn}
            animDelay={i * 100}
            isLoggedIn={isLoggedIn}
          />
        ))}
      </div>

      {/* Load more (guest) */}
      {!isLoggedIn && projects.length > 0 && (
        <div className="mt-12 flex justify-center">
          <button
            id="load-more-button"
            type="button"
            className="inline-flex h-10 items-center gap-2 rounded-full px-7 text-sm font-semibold cursor-pointer btn-press glow-border"
            style={{
              background: "oklch(0.12 0.016 285)",
              border: "1px solid oklch(1 0 0 / 0.08)",
              color: "oklch(0.70 0.010 285)",
            }}
          >
            Load More
          </button>
        </div>
      )}

      {/* Empty state */}
      {projects.length === 0 && (
        <div
          className="flex flex-col items-center gap-5 rounded-2xl border py-20 text-center glass"
        >
          <div
            className="flex size-16 items-center justify-center rounded-2xl glow-pulse"
            style={{ background: "oklch(0.65 0.22 285 / 0.10)" }}
          >
            <Play className="size-7" style={{ color: "oklch(0.65 0.22 285)" }} />
          </div>
          <div>
            <p
              className="text-base font-semibold"
              style={{ color: "oklch(0.88 0.005 285)" }}
            >
              No projects yet
            </p>
            <p
              className="mt-1.5 text-sm"
              style={{ color: "oklch(0.50 0.010 285)" }}
            >
              {isLoggedIn
                ? "Generate your first motion graphic above!"
                : "No community projects found."}
            </p>
          </div>
        </div>
      )}
    </section>
  )
}
