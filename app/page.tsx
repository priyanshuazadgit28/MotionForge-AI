import { Header } from "@/components/header";
import { AntiGravityCanvas } from "@/components/ui/particle-effect-for-hero";
import { HeroSection } from "@/components/hero-section";
import { ProjectsGallery } from "@/components/projects-gallery";
import { prisma } from "@/lib/prisma";
import type { ProjectWithAuthor } from "@/components/projects-gallery";
import { auth } from "@clerk/nextjs/server";

/**
 * MotionForge AI — Landing Page
 *
 * This is a React Server Component. It fetches data directly from Prisma
 * and passes it to child components. No client-side fetch needed.
 *
 */
export default async function Home() {
  let projects: ProjectWithAuthor[] = [];
  const { userId } = await auth();

  if (userId) {
    // Fetch the logged-in user's personal projects using their clerkId
    const userRecord = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (userRecord) {
      projects = await prisma.project.findMany({
        where: { authorId: userRecord.id },
        include: { author: true },
        orderBy: { createdAt: "desc" },
      });
    }
  } else {
    // Fetch all community projects (those that have a demo author)
    projects = await prisma.project.findMany({
      where: {
        authorId: { not: null },
        author: {
          clerkId: {
            startsWith: "mock_clerk_",
          },
        },
      },
      include: { author: true },
      orderBy: { createdAt: "desc" },
    });
  }

  return (
    <div className="flex min-h-screen flex-col bg-background neon-bg">
      {/* Third neon orb (middle) */}
      <div className="neon-orb-accent" aria-hidden />

      {/* ── Header ─── */}
      <Header isLoggedIn={!!userId} />

      {/* ── Main Content ─── */}
      <main id="main-content" className="flex-1 relative z-10">
        {/* Hero — prompt input */}
        <HeroSection />

        {/* Gradient Divider */}
        <div
          className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"
          aria-hidden
        >
          <div
            className="h-px w-full"
            style={{
              background: "linear-gradient(90deg, transparent 0%, oklch(0.65 0.22 285 / 0.20) 30%, oklch(0.72 0.20 200 / 0.15) 50%, oklch(0.65 0.22 285 / 0.20) 70%, transparent 100%)",
            }}
          />
        </div>

        {/* Gallery — community or user projects from DB */}
        <div className="pt-16 relative">
          <div className="absolute inset-0 z-0 opacity-50 overflow-hidden">
            <AntiGravityCanvas />
          </div>
          <div className="relative z-10 pointer-events-none">
            <div className="pointer-events-auto">
              <ProjectsGallery projects={projects} isLoggedIn={!!userId} />
            </div>
          </div>
        </div>
      </main>

      {/* ── Footer ─── */}
      <footer
        className="relative z-10 px-4 py-10 text-center text-xs sm:px-6"
        style={{
          borderTop: "1px solid oklch(1 0 0 / 0.05)",
          color: "oklch(0.38 0.008 285)",
          background: "oklch(0.04 0.010 285 / 0.60)",
          backdropFilter: "blur(12px)",
        }}
      >
        <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <span>
            © {new Date().getFullYear()}{" "}
            <span className="text-shimmer font-semibold">MotionForge AI</span>
            . All rights reserved.
          </span>
          <nav className="flex items-center gap-5" aria-label="Footer navigation">
            {["Privacy", "Terms", "Blog", "Status"].map((item) => (
              <a
                key={item}
                href={`/${item.toLowerCase()}`}
                className="transition-colors duration-300 hover:text-foreground cursor-pointer"
                style={{ color: "oklch(0.38 0.008 285)" }}
              >
                {item}
              </a>
            ))}
          </nav>
        </div>
      </footer>
    </div>
  );
}
