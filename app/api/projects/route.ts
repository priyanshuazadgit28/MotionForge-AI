/**
 * app/api/projects/route.ts
 *
 * GET  /api/projects          — List community projects (with author)
 * POST /api/projects          — Create a new project
 */

import { prisma } from "@/lib/prisma";

// ── GET — list all community projects (have an author) ────────────────────────
export async function GET() {
  try {
    const projects = await prisma.project.findMany({
      where: { authorId: { not: null } },
      include: { author: true },
      orderBy: { createdAt: "desc" },
    });

    return Response.json(projects);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unexpected error";
    return new Response(message, { status: 500 });
  }
}

// ── POST — create a new project ───────────────────────────────────────────────
export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { title, prompt, duration, ratio, thumbnailGradient, authorId } =
      body as {
        title: string;
        prompt: string;
        duration: string;
        ratio: string;
        thumbnailGradient?: string;
        authorId?: string;
      };

    if (!title || !prompt || !duration || !ratio) {
      return new Response("Missing required fields: title, prompt, duration, ratio", {
        status: 400,
      });
    }

    const project = await prisma.project.create({
      data: {
        title,
        prompt,
        duration,
        ratio,
        thumbnailGradient:
          thumbnailGradient ??
          "linear-gradient(135deg, oklch(0.13 0.014 285) 0%, oklch(0.20 0.10 285) 100%)",
        authorId: authorId ?? null,
      },
      include: { author: true },
    });

    return Response.json(project, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unexpected error";
    return new Response(message, { status: 500 });
  }
}
