/**
 * app/api/users/[id]/projects/route.ts
 *
 * GET  /api/users/[id]/projects   — All projects belonging to a specific user
 * Used for the "My Projects" dashboard view.
 */

import { prisma } from "@/lib/prisma";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_: Request, { params }: RouteContext) {
  try {
    const { id } = await params;

    // Verify user exists
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return new Response("User not found", { status: 404 });
    }

    const projects = await prisma.project.findMany({
      where: { authorId: id },
      include: { author: true },
      orderBy: { createdAt: "desc" },
    });

    return Response.json(projects);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unexpected error";
    return new Response(message, { status: 500 });
  }
}
