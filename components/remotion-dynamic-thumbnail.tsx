"use client";

import { useEffect, useState } from "react";
import { Player, PlayerRef } from "@remotion/player";
import * as React from "react";
import * as Remotion from "remotion";
import * as LucideReact from "lucide-react";
import { createSafeRemotionProxy, createDeepSafeProxy } from "@/lib/remotion-safe-proxy";

interface RemotionDynamicThumbnailProps {
  code: string;
  themeConfig: any;
  durationInSeconds: number;
  fps?: number;
  width?: number;
  height?: number;
  className?: string;
  isPlaying?: boolean;
}

export function RemotionDynamicThumbnail({
  code,
  themeConfig,
  durationInSeconds,
  fps = 30,
  width = 1920,
  height = 1080,
  className = "",
  isPlaying = false,
}: RemotionDynamicThumbnailProps) {
  const [Component, setComponent] = useState<React.ComponentType<any> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const playerRef = React.useRef<PlayerRef>(null);

  useEffect(() => {
    let isMounted = true;
    
    import("@babel/standalone").then((Babel) => {
      try {
        const transpiled = Babel.transform(code, {
          presets: [
            ["react", { runtime: "classic" }], 
            "typescript", 
            ["env", { modules: "commonjs" }]
          ],
          filename: "GeneratedComposition.tsx",
        }).code;

        if (!transpiled) throw new Error("Compilation failed.");

        const executableCode = `
          const exports = {};
          const require = (moduleName) => {
            if (moduleName === "react") return arguments[0];
            if (moduleName === "remotion") return arguments[1];
            if (moduleName === "lucide-react") return arguments[2];
            throw new Error("Module '" + moduleName + "' not found.");
          };
          
          ${transpiled}
          
          const validExports = Object.values(exports).filter(v => typeof v === "function" || (typeof v === "object" && v !== null));
          return exports.default || exports.GeneratedComposition || validExports[0];
        `;

        // Inject SAFE Remotion proxy
        const SafeRemotionModule = createSafeRemotionProxy();
        const func = new Function("React", "Remotion", "LucideReact", executableCode);
        const DynamicallyGeneratedComponent = func(React, SafeRemotionModule, LucideReact);

        if (DynamicallyGeneratedComponent && isMounted) {
          setComponent(() => DynamicallyGeneratedComponent);
          setError(null);
        }
      } catch (err: any) {
        console.warn("Thumbnail compilation failed:", err?.message);
        if (isMounted) setError(err.message || "Compilation failed");
      }
    });

    return () => { isMounted = false; };
  }, [code]);

  const safeFrames = Math.max(1, Math.round(durationInSeconds * fps));
  const safeFrame = Math.min(30, Math.max(0, safeFrames - 1));

  useEffect(() => {
    if (!playerRef.current) return;
    if (isPlaying) {
      playerRef.current.play();
    } else {
      playerRef.current.pause();
      playerRef.current.seekTo(safeFrame);
    }
  }, [isPlaying, safeFrame]);

  if (error) {
    return <ThumbnailFallback className={className} />;
  }

  if (!Component) {
    return <div className={`w-full h-full bg-black/40 animate-pulse ${className}`} />;
  }

  const rawConfig = (themeConfig && typeof themeConfig === "object") ? themeConfig : {};
  const safeInputProps = createDeepSafeProxy(rawConfig);

  return (
    <ThumbnailErrorBoundary className={className}>
      <Player
        ref={playerRef}
        component={Component}
        inputProps={safeInputProps}
        compositionWidth={width}
        compositionHeight={height}
        durationInFrames={safeFrames}
        inFrame={0}
        outFrame={isPlaying ? Math.min(safeFrames - 1, 3 * fps) : safeFrames - 1}
        fps={fps}
        autoPlay={false}
        loop
        className={className}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
        }}
      />
    </ThumbnailErrorBoundary>
  );
}

/** Graceful fallback */
function ThumbnailFallback({ className = "" }: { className?: string }) {
  return (
    <div
      className={`w-full h-full flex items-center justify-center ${className}`}
      style={{
        background: "linear-gradient(135deg, oklch(0.12 0.020 285), oklch(0.08 0.016 285))",
      }}
    >
      <div
        className="flex size-10 items-center justify-center rounded-xl"
        style={{ background: "oklch(1 0 0 / 0.06)" }}
      >
        <LucideReact.Film className="size-5" style={{ color: "oklch(0.50 0.010 285)" }} />
      </div>
    </div>
  );
}

// Error Boundary — last line of defense
class ThumbnailErrorBoundary extends React.Component<{ children: React.ReactNode, className?: string }, { hasError: boolean }> {
  constructor(props: { children: React.ReactNode, className?: string }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: any) {
    console.warn("Thumbnail rendering error (caught):", error?.message);
  }

  render() {
    if (this.state.hasError) {
      return <ThumbnailFallback className={this.props.className} />;
    }
    return this.props.children;
  }
}
