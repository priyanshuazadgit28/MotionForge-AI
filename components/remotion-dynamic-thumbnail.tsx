"use client";

import { useEffect, useState } from "react";
import { Thumbnail } from "@remotion/player";
import * as React from "react";
import * as Remotion from "remotion";
import * as LucideReact from "lucide-react";

interface RemotionDynamicThumbnailProps {
  code: string;
  themeConfig: any;
  durationInSeconds: number;
  fps?: number;
  width?: number;
  height?: number;
  className?: string;
}

export function RemotionDynamicThumbnail({
  code,
  themeConfig,
  durationInSeconds,
  fps = 30,
  width = 1920,
  height = 1080,
  className = "",
}: RemotionDynamicThumbnailProps) {
  const [Component, setComponent] = useState<React.ComponentType<any> | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    
    // Dynamically import Babel to compile Remotion code
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

        const func = new Function("React", "Remotion", "LucideReact", executableCode);
        const DynamicallyGeneratedComponent = func(React, Remotion, LucideReact);

        if (DynamicallyGeneratedComponent && isMounted) {
          setComponent(() => DynamicallyGeneratedComponent);
          setError(null);
        }
      } catch (err: any) {
        console.error("Thumbnail compilation failed:", err);
        if (isMounted) setError(err.message || "Compilation failed");
      }
    });

    return () => { isMounted = false; };
  }, [code]);

  if (error) {
    return (
      <div className={`w-full h-full flex flex-col items-center justify-center p-4 text-center text-red-400 bg-red-400/10 ${className}`}>
        <LucideReact.AlertTriangle className="size-6 mb-2 text-red-500 opacity-80" />
        <span className="text-[10px] font-medium opacity-90 leading-tight">Video compilation failed</span>
      </div>
    );
  }

  if (!Component) {
    return <div className={`w-full h-full bg-black/40 animate-pulse ${className}`} />;
  }

  return (
    <ThumbnailErrorBoundary className={className}>
      <Thumbnail
        component={Component}
        inputProps={{ ...themeConfig }}
        compositionWidth={width}
        compositionHeight={height}
        frameToDisplay={30} // 1 second in, better than frame 0
        durationInFrames={durationInSeconds * fps}
        fps={fps}
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

// Simple Error Boundary to prevent user code from crashing the entire app
class ThumbnailErrorBoundary extends React.Component<{ children: React.ReactNode, className?: string }, { hasError: boolean }> {
  constructor(props: { children: React.ReactNode, className?: string }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error("Thumbnail rendering error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className={`w-full h-full flex flex-col items-center justify-center p-4 text-center text-red-400 bg-red-400/10 ${this.props.className || ''}`}>
          <LucideReact.AlertTriangle className="size-6 mb-2 text-red-500 opacity-80" />
          <span className="text-[10px] font-medium opacity-90 leading-tight">Render Error</span>
        </div>
      );
    }
    return this.props.children;
  }
}
