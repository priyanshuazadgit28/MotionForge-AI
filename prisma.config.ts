// This file configures the Prisma CLI for MotionForge AI.
// Uses dotenv to load DATABASE_URL from .env for the Prisma CLI tools
// (migrate, studio, generate, etc.)
import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env["DATABASE_URL"]!,
  },
});
