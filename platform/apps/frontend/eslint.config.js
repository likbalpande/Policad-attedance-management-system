const baseConfig = require("@platform/eslint-config/base.js");
const reactHooks = require("eslint-plugin-react-hooks");
// ESM-only package required from this CJS config - the plugin object lands on `.default`.
const reactRefresh = require("eslint-plugin-react-refresh").default;

module.exports = [
  ...baseConfig,
  {
    files: ["src/**/*.{ts,tsx}"],
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": ["warn", { allowConstantExport: true }]
    }
  }
];
