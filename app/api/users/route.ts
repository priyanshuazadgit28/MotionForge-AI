/**
 * app/api/users/route.ts
 *
 * GET  /api/users   — List all users
 */

import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: "asc" },
    });
    return Response.json(users);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unexpected error";
    return new Response(message, { status: 500 });
  }
}
