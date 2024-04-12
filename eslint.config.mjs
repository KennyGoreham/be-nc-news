import globals from "globals";
import pluginJs from "@eslint/js";


export default [
  {files: ["**/*.js"], languageOptions: {sourceType: "commonjs"}},
  {languageOptions: {globals: globals.node}},
  {"ignores": [
    "node_modules",
    ".github",
    ".husky",
    ".vscode",
    "__tests__",
  ]},
  pluginJs.configs.recommended,
  {rules: {
    "brace-style": ["error", "1tbs"],
    "comma-dangle": ["error", "always-multiline"],
    "eol-last": ["error"],
    "indent": ["error", 2],
    "no-console": ["warn"],
    "no-trailing-spaces": ["error"],
    "no-unused-vars": ["warn"],
    "object-curly-spacing": ["error", "never"],
    "quotes": ["error", "double"],
    "semi": ["error"],
  }},
];
