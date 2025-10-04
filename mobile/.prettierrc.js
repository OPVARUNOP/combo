module.exports = {
  // Basic formatting
  printWidth: 100,
  tabWidth: 2,
  useTabs: false,
  semi: true,
  singleQuote: true,
  trailingComma: 'all',
  bracketSpacing: true,
  arrowParens: 'always',
  endOfLine: 'auto',

  // JSX/TSX specific
  jsxSingleQuote: true,
  jsxBracketSameLine: false,

  // Code wrapping
  proseWrap: 'preserve',

  // File handling
  requirePragma: false,
  insertPragma: false,

  // Language specific
  htmlWhitespaceSensitivity: 'css',
  vueIndentScriptAndStyle: false,
  embeddedLanguageFormatting: 'auto',

  // Override default options for specific file patterns
  overrides: [
    {
      files: '*.json',
      options: {
        parser: 'json',
        tabWidth: 2,
      },
    },
    {
      files: '*.{ts,tsx,js,jsx}',
      options: {
        parser: 'typescript',
      },
    },
  ],
};
