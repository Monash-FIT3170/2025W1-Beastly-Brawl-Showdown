import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import { defineConfig } from "eslint/config";


export default defineConfig([
  { files: ["**/*.{js,mjs,cjs,ts,mts,cts}"], plugins: { js }, extends: ["js/recommended"] },
  { files: ["**/*.{js,mjs,cjs,ts,mts,cts}"], languageOptions: { globals: globals.node } },
  tseslint.configs.recommended,
  {
    files: ["**/*.{js,mjs,cjs,ts,mts,cts}"], rules: {
      ...tseslint.configs.recommended.rules,
      "@typescript-eslint/explicit-function-return-type": "error",
      "@typescript-eslint/typedef": ["error", { "variableDeclaration": true }],
      "eqeqeq": "error",
      "block-scoped-var": "error",
      "no-var": "error",
      '@typescript-eslint/no-unused-vars': ['warn', {
        args: 'after-used', // only warn for unused parameters
        vars: 'none'        // ignore unused variables
      }]
    },
  }
]);
