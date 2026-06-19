/**
 * lib/prisma.ts
 *
 * Singleton PrismaClient for MotionForge AI.
 *
 * Prisma v7 uses driver adapters. We use @prisma/adapter-pg (PrismaPg factory)
 * which connects to the Prisma Postgres (pooled) instance via DATABASE_URL.
 *
 * Prevents multiple client instances during Next.js hot-reload in development.
 */

import { Pool } from "pg";
import { PrismaClient } from "@/lib/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL!;
  const pool = new Pool({ connectionString });
  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
