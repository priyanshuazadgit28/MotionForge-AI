"use client";

import { useEffect, useState } from "react";
import { Player } from "@remotion/player";
import * as React from "react";
import * as Remotion from "remotion";
import * as LucideReact from "lucide-react";

/**
 * Create a safe wrapper around the Remotion module that patches
 * interpolate/spring to handle bad AI-generated arguments gracefully
 * instead of throwing and crashing the React render tree.
 */
function createSafeRemotionProxy() {
  const safeRemotionModule: Record<string, any> = { ...Remotion };

  // Patch interpolate — the #1 source of crashes from AI code
  const originalInterpolate = Remotion.interpolate;
  safeRemotionModule.interpolate = (
    input: number,
    inputRange: number[],
    outputRange: number[],
    options?: any
  ) => {
    try {
      // Validate inputRange/outputRange are iterable arrays
      if (!Array.isArray(inputRange) || !Array.isArray(outputRange)) {
        console.warn("[SafeRemotionProxy] interpolate: inputRange or outputRange is not an array, returning 0");
        return 0;
      }
      if (inputRange.length < 2 || outputRange.length < 2) {
        console.warn("[SafeRemotionProxy] interpolate: ranges too short, returning 0");
        return 0;
      }
      if (typeof input !== "number" || isNaN(input)) {
        return outputRange[0] ?? 0;
      }
      // Validate easing option if provided
      if (options?.easing && typeof options.easing !== "function") {
        const safeOptions = { ...options };
        delete safeOptions.easing;
        return originalInterpolate(input, inputRange, outputRange, safeOptions);
      }
      return originalInterpolate(input, inputRange, outputRange, options);
    } catch (e) {
      console.warn("[SafeRemotionProxy] interpolate error caught:", e);
      return outputRange?.[0] ?? 0;
    }
  };

  // Patch spring — another common crash source
  const originalSpring = Remotion.spring;
  safeRemotionModule.spring = (args: any) => {
    try {
      if (!args || typeof args !== "object") return 0;
      if (typeof args.frame !== "number" || isNaN(args.frame)) {
        return 0;
      }
      return originalSpring(args);
    } catch (e) {
      console.warn("[SafeRemotionProxy] spring error caught:", e);
      return 0;
    }
  };

  return safeRemotionModule;
}

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

        const executableCode = `
          const exports = {};
          const require = (moduleName) => {
            if (moduleName === "react") return arguments[0];
            if (moduleName === "remotion") return arguments[1];
            if (moduleName === "lucide-react") return arguments[2];
            throw new Error("Module '" + moduleName + "' not found. Only 'react', 'remotion', and 'lucide-react' are supported in this sandbox.");
          };
          
          ${transpiled}
          
          const validExports = Object.values(exports).filter(v => typeof v === "function" || (typeof v === "object" && v !== null));
          return exports.default || exports.GeneratedComposition || validExports[0];
        `;

        // Inject SAFE Remotion proxy instead of raw Remotion module
        const SafeRemotionModule = createSafeRemotionProxy();
        const func = new Function("React", "Remotion", "LucideReact", executableCode);
        const DynamicallyGeneratedComponent = func(React, SafeRemotionModule, LucideReact);

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
      <PlayerFallback message={error} />
    );
  }

  if (!Component) {
    return (
      <div className="w-full h-full flex items-center justify-center text-muted-foreground animate-pulse font-medium">
        Compiling AI Video…
      </div>
    );
  }

  // Ensure themeConfig is a valid object
  const safeThemeConfig = (themeConfig && typeof themeConfig === "object") ? themeConfig : {};
  const safeFrames = Math.max(1, Math.round(durationInSeconds * fps));

  return (
    <PlayerErrorBoundary>
      <Player
        component={Component}
        inputProps={{ ...safeThemeConfig }}
        durationInFrames={safeFrames}
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

/** Graceful fallback */
function PlayerFallback({ message }: { message?: string }) {
  return (
    <div
      className="w-full h-full flex flex-col items-center justify-center p-6 text-center rounded-2xl"
      style={{
        background: "linear-gradient(135deg, oklch(0.12 0.020 285), oklch(0.08 0.016 285))",
        border: "1px solid oklch(1 0 0 / 0.06)",
      }}
    >
      <LucideReact.AlertTriangle className="size-8 mb-3" style={{ color: "oklch(0.65 0.22 25)" }} />
      <h3 className="font-bold text-base mb-1" style={{ color: "oklch(0.85 0.005 285)" }}>Render Error</h3>
      <p className="text-sm max-w-sm" style={{ color: "oklch(0.50 0.010 285)" }}>
        {message || "The generated code crashed during playback. Try modifying the prompt to fix it."}
      </p>
    </div>
  );
}

// Error Boundary — last line of defense
class PlayerErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: any) {
    console.warn("Player rendering error (caught by boundary):", error?.message);
  }

  render() {
    if (this.state.hasError) {
      return <PlayerFallback />;
    }
    return this.props.children;
  }
}
