import React, { useEffect, useState } from "react";
import { AbsoluteFill, continueRender, delayRender } from "remotion";
import * as Remotion from "remotion";
import * as LucideReact from "lucide-react";
import * as Babel from "@babel/standalone";

export const DynamicExportComposition: React.FC<{
  code: string;
  themeConfig: any;
}> = ({ code, themeConfig }) => {
  const [handle] = useState(() => delayRender("Compiling AI Code"));
  const [Component, setComponent] = useState<React.ComponentType<any> | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
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

      if (!DynamicallyGeneratedComponent) {
        throw new Error("The AI did not export a valid React Component.");
      }

      setComponent(() => DynamicallyGeneratedComponent);
      continueRender(handle);
    } catch (err: any) {
      console.error("Failed to compile Remotion code:", err);
      setError(err.message || "An error occurred while compiling the video.");
      continueRender(handle); // Let it render the error
    }
  }, [code, handle]);

  if (error) {
    return (
      <AbsoluteFill style={{ backgroundColor: "red", color: "white", padding: 40 }}>
        <h1>Render Error</h1>
        <p>{error}</p>
      </AbsoluteFill>
    );
  }

  if (!Component) {
    return <AbsoluteFill style={{ backgroundColor: "black" }} />;
  }

  return <Component {...themeConfig} />;
};
