/**
 * Remotion sandbox safety utilities.
 * Prevents AI-generated code from crashing with bad property access or API calls.
 */
import * as Remotion from "remotion";

/**
 * Creates a deep proxy that makes ALL nested property access safe.
 * Accessing `obj.anything.deep.nested.colors` on undefined paths
 * returns a safe empty proxy instead of throwing TypeError.
 */
export function createDeepSafeProxy(obj: any): any {
  if (obj === null || obj === undefined) {
    return createNullProxy();
  }
  if (typeof obj !== "object" && typeof obj !== "function") {
    return obj;
  }

  return new Proxy(obj, {
    get(target, prop) {
      // Allow symbol access and common meta-properties
      if (typeof prop === "symbol") return target[prop];
      if (prop === "$$typeof" || prop === "__proto__" || prop === "constructor") return target[prop];
      // React-specific: don't proxy these
      if (prop === "toJSON" || prop === "then" || prop === "$$typeof") return target[prop];

      const value = target[prop];

      if (value === undefined || value === null) {
        // Return a null-safe proxy for undefined nested paths
        return createNullProxy();
      }

      if (typeof value === "object" && !Array.isArray(value)) {
        return createDeepSafeProxy(value);
      }

      return value;
    },
  });
}

/**
 * A proxy that represents "undefined" but won't throw on property access.
 * Accessing `.colors`, `.background`, `.fontFamily` etc. all return safe defaults.
 */
function createNullProxy(): any {
  const handler: ProxyHandler<any> = {
    get(_, prop) {
      if (typeof prop === "symbol") return undefined;
      // Common property names that code expects to be strings
      if (prop === "toString" || prop === "valueOf") return () => "";
      if (prop === "length") return 0;
      // Return another null proxy for deeper nesting
      return createNullProxy();
    },
    // Make it behave like a string when used in template literals
    apply() { return ""; },
    // Make it iterable (for Array.isArray checks in user code)
    has() { return false; },
  };

  // Use a function as the proxy target so apply() handler works
  const target = function() { return ""; };
  Object.defineProperty(target, Symbol.toPrimitive, {
    value: () => "",
    configurable: true,
  });
  Object.defineProperty(target, Symbol.iterator, {
    value: function*() {},
    configurable: true,
  });

  return new Proxy(target, handler);
}

/**
 * Create a safe wrapper around the Remotion module that patches
 * interpolate/spring to handle bad AI-generated arguments gracefully.
 */
export function createSafeRemotionProxy() {
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
      if (!Array.isArray(inputRange) || !Array.isArray(outputRange)) return 0;
      if (inputRange.length < 2 || outputRange.length < 2) return 0;
      if (typeof input !== "number" || isNaN(input)) return outputRange[0] ?? 0;
      if (options?.easing && typeof options.easing !== "function") {
        const safeOptions = { ...options };
        delete safeOptions.easing;
        return originalInterpolate(input, inputRange, outputRange, safeOptions);
      }
      return originalInterpolate(input, inputRange, outputRange, options);
    } catch {
      return outputRange?.[0] ?? 0;
    }
  };

  // Patch spring
  const originalSpring = Remotion.spring;
  safeRemotionModule.spring = (args: any) => {
    try {
      if (!args || typeof args !== "object") return 0;
      if (typeof args.frame !== "number" || isNaN(args.frame)) return 0;
      return originalSpring(args);
    } catch {
      return 0;
    }
  };

  return safeRemotionModule;
}
