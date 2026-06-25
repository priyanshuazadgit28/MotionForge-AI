/**
 * prisma/seed.ts
 *
 * Seeds the PostgreSQL database with the initial community projects and
 * a demo user's personal projects.
 *
 * Run with: npm run db:seed
 */

import "dotenv/config";
import { prisma } from "../lib/prisma";

async function main() {
  console.log("🌱  Seeding MotionForge AI database…");

  // ── Clear existing data ───────────────────────────────────
  await prisma.project.deleteMany();
  await prisma.user.deleteMany();

  // ── Community authors ─────────────────────────────────────
  const alex = await prisma.user.create({
    data: {
      clerkId: "mock_clerk_alex",
      email: "alex@example.com",
      name: "Alex Rivera",
      initial: "A",
      avatarGradient:
        "linear-gradient(135deg, oklch(0.65 0.22 285), oklch(0.72 0.20 200))",
    },
  });

  const maria = await prisma.user.create({
    data: {
      clerkId: "mock_clerk_maria",
      email: "maria@example.com",
      name: "Maria Chen",
      initial: "M",
      avatarGradient:
        "linear-gradient(135deg, oklch(0.72 0.20 200), oklch(0.75 0.25 330))",
    },
  });

  const sam = await prisma.user.create({
    data: {
      clerkId: "mock_clerk_sam",
      email: "sam@example.com",
      name: "Sam Torres",
      initial: "S",
      avatarGradient:
        "linear-gradient(135deg, oklch(0.75 0.25 330), oklch(0.65 0.22 285))",
    },
  });

  const jordan = await prisma.user.create({
    data: {
      clerkId: "mock_clerk_jordan",
      email: "jordan@example.com",
      name: "Jordan Lee",
      initial: "J",
      avatarGradient:
        "linear-gradient(135deg, oklch(0.72 0.18 155), oklch(0.72 0.20 200))",
    },
  });

  const priya = await prisma.user.create({
    data: {
      clerkId: "mock_clerk_priya",
      email: "priya@example.com",
      name: "Priya Sharma",
      initial: "P",
      avatarGradient:
        "linear-gradient(135deg, oklch(0.65 0.22 25), oklch(0.70 0.18 225))",
    },
  });

  const chris = await prisma.user.create({
    data: {
      clerkId: "mock_clerk_chris",
      email: "chris@example.com",
      name: "Chris Morgan",
      initial: "C",
      avatarGradient:
        "linear-gradient(135deg, oklch(0.70 0.18 225), oklch(0.65 0.22 285))",
    },
  });


  // ── Community projects ─────────────────────────────────────
  await prisma.project.createMany({
    data: [
      {
        title: "Cosmic Nebula City",
        prompt:
          "A cosmic nebula morphing into a neon digital cityscape at midnight",
        duration: "10 sec",
        ratio: "16:9",
        thumbnailGradient:
          "linear-gradient(135deg, oklch(0.15 0.05 285) 0%, oklch(0.25 0.15 285) 40%, oklch(0.20 0.12 200) 100%)",
        views: 12400,
        likes: 834,
        authorId: alex.id,
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2h ago
      },
      {
        title: "Liquid Metal Logo",
        prompt: "Chrome liquid metal flowing and reshaping into a futuristic logo",
        duration: "5 sec",
        ratio: "16:9",
        thumbnailGradient:
          "linear-gradient(135deg, oklch(0.18 0.02 200) 0%, oklch(0.35 0.10 200) 50%, oklch(0.45 0.08 285) 100%)",
        views: 9800,
        likes: 621,
        authorId: maria.id,
        createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5h ago
      },
      {
        title: "Neon Geometry",
        prompt: "Abstract neon geometric shapes floating through an infinite tunnel",
        duration: "15 sec",
        ratio: "9:16",
        thumbnailGradient:
          "linear-gradient(160deg, oklch(0.12 0.06 330) 0%, oklch(0.22 0.15 330) 40%, oklch(0.18 0.10 285) 100%)",
        views: 7200,
        likes: 445,
        authorId: sam.id,
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1d ago
      },
      {
        title: "Aurora Waves",
        prompt:
          "Northern lights aurora waves dancing over a dark mountain landscape",
        duration: "20 sec",
        ratio: "16:9",
        thumbnailGradient:
          "linear-gradient(135deg, oklch(0.10 0.04 155) 0%, oklch(0.25 0.14 155) 40%, oklch(0.35 0.10 200) 100%)",
        views: 15600,
        likes: 1203,
        authorId: jordan.id,
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2d ago
      },
      {
        title: "Fire & Ice",
        prompt:
          "Fire and ice collision creating steam crystals in slow motion macro",
        duration: "10 sec",
        ratio: "9:16",
        thumbnailGradient:
          "linear-gradient(160deg, oklch(0.12 0.08 25) 0%, oklch(0.25 0.18 25) 40%, oklch(0.20 0.08 200) 100%)",
        views: 8900,
        likes: 712,
        authorId: priya.id,
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3d ago
      },
      {
        title: "Data Flow",
        prompt:
          "Glowing data streams flowing through a futuristic server room in deep space",
        duration: "15 sec",
        ratio: "16:9",
        thumbnailGradient:
          "linear-gradient(135deg, oklch(0.08 0.04 225) 0%, oklch(0.20 0.14 225) 40%, oklch(0.28 0.10 285) 100%)",
        views: 6500,
        likes: 389,
        authorId: chris.id,
        createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), // 4d ago
      },
    ],
  });


  const projectCount = await prisma.project.count();
  const userCount = await prisma.user.count();
  console.log(
    `✅  Done! Seeded ${userCount} users and ${projectCount} projects.`
  );
}

main()
  .catch((e) => {
    console.error("❌  Seed failed:", e);
    process.exit(1);
  })
  .finally(() => {
    process.exit(0);
  });
