/**
 * app/api/projects/[id]/route.ts
 *
 * GET    /api/projects/[id]     — Single project detail
 * PATCH  /api/projects/[id]     — Increment views or likes
 * DELETE /api/projects/[id]     — Delete a project
 */

import { prisma } from "@/lib/prisma";

type RouteContext = { params: Promise<{ id: string }> };

// ── GET ───────────────────────────────────────────────────────────────────────
export async function GET(_: Request, { params }: RouteContext) {
  try {
    const { id } = await params;

    const project = await prisma.project.findUnique({
      where: { id },
      include: { author: true },
    });

    if (!project) {
      return new Response("Project not found", { status: 404 });
    }

    return Response.json(project);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unexpected error";
    return new Response(message, { status: 500 });
  }
}

// ── PATCH — increment views or likes ─────────────────────────────────────────
export async function PATCH(request: Request, { params }: RouteContext) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { action } = body as { action: "view" | "like" };

    if (!["view", "like"].includes(action)) {
      return new Response('action must be "view" or "like"', { status: 400 });
    }

    const project = await prisma.project.update({
      where: { id },
      data:
        action === "view"
          ? { views: { increment: 1 } }
          : { likes: { increment: 1 } },
      include: { author: true },
    });

    return Response.json(project);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unexpected error";
    return new Response(message, { status: 500 });
  }
}

// ── DELETE ────────────────────────────────────────────────────────────────────
export async function DELETE(_: Request, { params }: RouteContext) {
  try {
    const { id } = await params;

    await prisma.project.delete({ where: { id } });

    return new Response(null, { status: 204 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unexpected error";
    return new Response(message, { status: 500 });
  }
}
