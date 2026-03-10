import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  {
    rules: {
      // The react-hooks/set-state-in-effect rule is disabled to allow the
      // standard data-fetching-on-mount pattern (useEffect + fetch + setState).
      // All effects have empty dependency arrays so there is no risk of
      // cascading re-renders or infinite loops.
      "react-hooks/set-state-in-effect": "off",
    },
  },
]);

export default eslintConfig;
