import { Header } from "@/components/header";
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
    // Fetch all community projects (those that have an author)
    projects = await prisma.project.findMany({
      where: { authorId: { not: null } },
      include: { author: true },
      orderBy: { createdAt: "desc" },
    });
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* ── Header ─── */}
      <Header isLoggedIn={!!userId} />

      {/* ── Main Content ─── */}
      <main id="main-content" className="flex-1">
        {/* Hero — prompt input */}
        <HeroSection />

        {/* Divider */}
        <div
          className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"
          aria-hidden
        >
          <div
            className="h-px w-full"
            style={{ background: "oklch(1 0 0 / 0.06)" }}
          />
        </div>

        {/* Gallery — community or user projects from DB */}
        <div className="pt-14">
          <ProjectsGallery projects={projects} isLoggedIn={!!userId} />
        </div>
      </main>

      {/* ── Footer ─── */}
      <footer
        className="border-t px-4 py-8 text-center text-xs sm:px-6"
        style={{
          borderColor: "oklch(1 0 0 / 0.07)",
          color: "oklch(0.40 0.008 285)",
        }}
      >
        <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-3">
          <span>
            © {new Date().getFullYear()}{" "}
            <span style={{ color: "oklch(0.65 0.22 285)" }}>MotionForge AI</span>
            . All rights reserved.
          </span>
          <nav className="flex items-center gap-5" aria-label="Footer navigation">
            {["Privacy", "Terms", "Blog", "Status"].map((item) => (
              <a
                key={item}
                href={`/${item.toLowerCase()}`}
                className="transition-colors hover:text-foreground"
                style={{ color: "oklch(0.40 0.008 285)" }}
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
