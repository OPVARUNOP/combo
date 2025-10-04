module.exports = {
  root: true,
  extends: [
    "@react-native",
    "eslint:recommended",
    "plugin:react/recommended",
    "plugin:react-native/all",
    "plugin:@typescript-eslint/recommended",
    "plugin:import/errors",
    "plugin:import/warnings",
    "plugin:import/typescript",
  ],
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint", "react", "react-native", "react-hooks", "import"],
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 2021,
    sourceType: "module",
  },
  env: {
    "react-native/react-native": true,
    es6: true,
    node: true,
    jest: true,
  },
  settings: {
    "import/resolver": {
      node: {
        extensions: [".js", ".jsx", ".ts", ".tsx"],
        moduleDirectory: ["node_modules", "src/"],
      },
    },
    react: {
      version: "detect",
    },
  },
  rules: {
    // General
    quotes: ["warn", "single", { avoidEscape: true, allowTemplateLiterals: true }],
    semi: ["error", "always"],
    "comma-dangle": ["error", "only-multiline"],
    "no-console": "warn",
    "no-var": "error",
    "prefer-const": "error",
    "object-curly-spacing": ["error", "always"],
    "array-bracket-spacing": ["error", "never"],
    "arrow-parens": ["error", "always"],
    "arrow-spacing": "error",
    "no-multiple-empty-lines": ["error", { max: 1, maxEOF: 1 }],
    "no-trailing-spaces": "error",
    "eol-last": ["error", "always"],

    // TypeScript
    "@typescript-eslint/no-unused-vars": "warn",
    "@typescript-eslint/explicit-function-return-type": "off",
    "@typescript-eslint/explicit-module-boundary-types": "off",
    "@typescript-eslint/no-explicit-any": "warn",

    // React
    "react/react-in-jsx-scope": "off",
    "react/prop-types": "off",
    "react/display-name": "off",
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "warn",

    // React Native
    "react-native/no-unused-styles": "warn",
    "react-native/split-platform-components": "off",
    "react-native/no-inline-styles": "warn",
    "react-native/no-color-literals": "warn",
    "react-native/no-raw-text": [
      "warn",
      {
        skip: ["CustomText"],
      },
    ],

    // Import
    "import/order": [
      "error",
      {
        "groups": ["builtin", "external", "internal"],
        "pathGroups": [
          {
            "pattern": "react",
            "group": "external",
            "position": "before"
          }
        ],
        "pathGroupsExcludeImportTypes": ["react"],
        "newlines-between": "always",
        "alphabetize": {
          "order": "asc",
          "caseInsensitive": true
        }
      }
    ],
    "import/no-unresolved": ["error", { "ignore": ["^@/.*$"] }],
  },
  globals: {
    __DEV__: "readonly",
  },
};
