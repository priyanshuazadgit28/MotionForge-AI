import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ClerkProvider } from "@clerk/nextjs";
import { AuthProvider } from "@/components/auth-provider";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-display",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "MotionForge AI — Forge Stunning Motion Graphics with AI",
  description:
    "MotionForge AI lets you create breathtaking motion graphics in seconds using AI. Describe your vision, choose duration and aspect ratio, and watch your ideas come to life.",
  keywords: ["AI motion graphics", "video generator", "animation AI", "MotionForge"],
  openGraph: {
    title: "MotionForge AI",
    description: "Forge stunning motion graphics with AI in seconds.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html
        lang="en"
        className={`${inter.variable} ${spaceGrotesk.variable} h-full antialiased`}
      >
        <body className="min-h-full flex flex-col">
          <AuthProvider>
            <TooltipProvider>{children}</TooltipProvider>
          </AuthProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
