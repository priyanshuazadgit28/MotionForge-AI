import arcjet, { slidingWindow } from "@arcjet/next";

// This creates an Arcjet client that protects your endpoints.
export const aj = arcjet({
  key: process.env.ARCJET_KEY!, // Found in your Arcjet Dashboard
  characteristics: ["userId"], // We will pass the Clerk userId dynamically
  rules: [
    // We use a sliding window to prevent double-click / rapid spamming
    // which could bypass the Prisma credit deduction checks.
    // 1 request every 5 seconds per userId.
    slidingWindow({
      mode: "LIVE",
      interval: 5,
      max: 1,
    }),
  ],
});
