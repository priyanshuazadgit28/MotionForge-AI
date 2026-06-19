"use client";

import { useEffect, useState } from "react";
import { Player } from "@remotion/player";
import * as React from "react";
import * as Remotion from "remotion";
import * as LucideReact from "lucide-react";

interface RemotionDynamicPlayerProps {
  code: string;
  themeConfig: any;
  durationInSeconds: number;
  fps?: number;
  width?: number;
  height?: number;
}

export function RemotionDynamicPlayer({
  code,
  themeConfig,
  durationInSeconds,
  fps = 30,
  width = 1920,
  height = 1080,
}: RemotionDynamicPlayerProps) {
  const [Component, setComponent] = useState<React.ComponentType<any> | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    
    // We dynamically import babel so it doesn't heavily block initial page load
    import("@babel/standalone").then((Babel) => {
      try {
        // Transpile the raw React/TS string to executable ES5/ES6 Javascript
        const transpiled = Babel.transform(code, {
          presets: [
            ["react", { runtime: "classic" }], 
            "typescript", 
            ["env", { modules: "commonjs" }]
          ],
          filename: "GeneratedComposition.tsx",
        }).code;

        if (!transpiled) throw new Error("Compilation failed. No output.");

        // Create a function scope that injects React and Remotion.
        // We simulate a CommonJS environment for the transpiled module.
        const executableCode = `
          const exports = {};
          const require = (moduleName) => {
            if (moduleName === "react") return arguments[0];
            if (moduleName === "remotion") return arguments[1];
            if (moduleName === "lucide-react") return arguments[2];
            throw new Error("Module '" + moduleName + "' not found. Only 'react', 'remotion', and 'lucide-react' are supported in this sandbox.");
          };
          
          ${transpiled}
          
          // Filter out Babel's __esModule flag or other primitive exports
          const validExports = Object.values(exports).filter(v => typeof v === "function" || (typeof v === "object" && v !== null));
          return exports.default || exports.GeneratedComposition || validExports[0];
        `;

        const func = new Function("React", "Remotion", "LucideReact", executableCode);
        const DynamicallyGeneratedComponent = func(React, Remotion, LucideReact);

        if (!DynamicallyGeneratedComponent) {
          throw new Error("The AI did not export a valid React Component.");
        }

        if (isMounted) {
          setComponent(() => DynamicallyGeneratedComponent);
          setError(null);
        }
      } catch (err: any) {
        console.error("Failed to compile Remotion code:", err);
        if (isMounted) setError(err.message || "An error occurred while compiling the video.");
      }
    });

    return () => {
      isMounted = false;
    };
  }, [code]);

  if (error) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center text-red-400 bg-red-400/10 rounded-2xl border border-red-400/20 backdrop-blur-md">
        <h3 className="font-bold text-lg mb-2 text-red-500">Video Compilation Error</h3>
        <p className="text-sm opacity-90 whitespace-pre-wrap max-w-sm">{error}</p>
      </div>
    );
  }

  if (!Component) {
    return (
      <div className="w-full h-full flex items-center justify-center text-muted-foreground animate-pulse font-medium">
        Compiling AI Video...
      </div>
    );
  }

  return (
    <PlayerErrorBoundary>
      <Player
        component={Component}
        inputProps={{ ...themeConfig }}
        durationInFrames={durationInSeconds * fps}
        compositionWidth={width}
        compositionHeight={height}
        fps={fps}
        controls
        autoPlay
        loop
        style={{
          width: "100%",
          height: "100%",
          borderRadius: "1rem",
        }}
      />
    </PlayerErrorBoundary>
  );
}

// Simple Error Boundary to prevent user code from crashing the entire app
class PlayerErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error("Player rendering error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center text-red-400 bg-red-400/10 rounded-2xl border border-red-400/20 backdrop-blur-md">
          <LucideReact.AlertTriangle className="size-8 mb-2 text-red-500 opacity-80" />
          <h3 className="font-bold text-lg mb-1 text-red-500">Render Error</h3>
          <p className="text-sm opacity-90 max-w-sm">The generated code crashed during playback. Try modifying the prompt to fix it.</p>
        </div>
      );
    }
    return this.props.children;
  }
}
