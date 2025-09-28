// Temporary Jest configuration fix
const fs = require('fs');

// Read current package.json
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));

// Fix Jest configuration
packageJson.jest = {
  "testEnvironment": "node",
  "testMatch": [
    "**/__tests__/**/*.js",
    "**/?(*.)+(spec|test).js"
  ],
  "testPathIgnorePatterns": [
    "/node_modules/",
    "/scripts/"
  ],
  "collectCoverageFrom": [
    "src/**/*.{js,jsx}",
    "!src/**/*.test.{js,jsx}",
    "!src/**/index.js"
  ],
  "collectCoverage": true,
  "coverageReporters": [
    "text",
    "lcov"
  ]
};

// Write back
fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2));

console.log('??? Jest configuration fixed!');
