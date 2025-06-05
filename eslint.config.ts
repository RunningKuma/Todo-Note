import js from "@eslint/js";
import globals from "globals";
import pluginVue from "eslint-plugin-vue";
import { defineConfig } from "eslint/config";


export default defineConfig([
  {
    files: ["src/**/*.{js,mjs,cjs,ts,mts,cts,vue}"],
    plugins: { js },
    extends: ["js/recommended"],
    rules: {
      "indent": ["error", 2],
      "semi": ["error", "always"],
    },
  },
  {
    files: ["src/**/*.{js,mjs,cjs,vue}"],
    languageOptions: { globals: globals.node },
  },
  pluginVue.configs["flat/essential"],
]);