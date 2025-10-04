const fs = require('fs');
const path = require('path');

// Path to the .env file
const envPath = path.join(__dirname, '../.env');

// Read the current .env file
let envContent = fs.readFileSync(envPath, 'utf8');

// Define the correct private key with proper escaping
const privateKey =
  '-----BEGIN PRIVATE KEY-----\\n' +
  'MIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQDPmQXN7jqJ1FJK\\n' +
  'mSUwQxAGEM4aKR58NYQ2iAyiaRN6xlUgHOqHV/eSg62Cqg+lWGWZgHtw5TJP48g9\\n' +
  '+yPPfFfutM7J4M8+zenqp6JuV5E8E5kdNAVEs4fpz0fUbEAtiNWTKIpfy8sYt5jz\\n' +
  'ZZxj5jZ+vIfaAXTxFdS0mxCChPDLz0yAU7xstlSNAkATou8UW9YM9IsbxzopfabW\\n' +
  'YSq4KCR+EkjeIe4Q0QUmJ0wC4WnQtlJ1y0OH1NS7tJA6UJpNrylxeD0jct6JlV+7\\n' +
  'qAeZVIivf9tlB6PfzfGYNG2xFPidm3AXBw8IMZfbdnnpLxrDT5HQWpYuPBBZyK/E\\n' +
  '7Saic1P3AgMBAAECggEAPvDoP52BBhTntlJkYhOTIiOqOWhKI+Kd6WKqYft1un2z\\n' +
  'hX7+5HYZS8S8sKcbA0if1UCNLJdw/6PSLGieXOQYTPlo0PBmJWaNC2Yz6zyFfi96\\n' +
  '9s204zWDebIs1wzTEHsyNeHOwmipdR8FMpaWKfu8fgRvM/vJFudFjFSPVuMzlrcB\\n' +
  'cRmRBVl2DOHk1hosYG1kSy5YltJWUzG5WhYP0h2nNusrfqGRBI0gqacuwp5cO/7m\\n' +
  'BYZ5XqgCxFJsk35UzjJbLrBzGcz/iqbIYf/EzZ7XsOOi3znGG1wvhG9zcMDPQrtp\\n' +
  'PQL3vMopQYkPYyypZHInNrOsMFK3E7Mp1tikql5iwQKBgQDob7T8roSox9hTTEzy\\n' +
  'V86jScyTFFkPdv1544NmFtCLBW6Jn9FWE9A5LNltoYdsmZ2bxBJFdCVn7XqOOXyI\\n' +
  'zZv11j3HdzcXJGniCkms2cEMwNthrZ/GT5NBKz6Ibq3z5vh5e9g+rbi6sIlttxU7\\n' +
  'rZZc3TotGEGqIb6pCjvu+QWw5wKBgQDkpLFgmPrEqDpD33D1qyK+VmIhCSusASsO\\n' +
  '+8oVOolkEtplAhu5LOCSX5pkjd0BfPAGzMWol3FBaKldA9t1tAh27F/61gBXfdM/\\n' +
  '8aF37M14RtPW1DsxeTcSBl4gaz2cIQwyt16uIyaP3n7anbSZD3EqUo7WpjZ/Lqgd\\n' +
  'ou2sm4AScQKBgB2Yw8n9CuVW9SO+LnoZVjWSmxsLVz/R3frcTon8U7ewDGA32ncE\\n' +
  'dNoi7Ni53b2lXd1MvSrc3Dp8kcN0bHga/kXybtFsS7aFq3nd5328CInwML8iVZrx\\n' +
  '3QVKVV8YAMxy16bYbzOj+UbEXet7iZecxe2zOcouMYZRX660n+cRDHl3AoGAPK4c\\n' +
  'yScwflqrQ/Ib94cYrG0ek+fsKDUTKWHXivTDG8UJIv+BPg7T9uTag89GlSuERDm6\\n' +
  'R3kRvKs7L41jhARorq8i9d4vrwictP66vKojCcW6WOxwXTvvSqBYAMCVVEdNBnS1\\n' +
  '8v8vL8V74ycxk+GORg4tDHiGRBCs21ivPTzzq3ECgYAbPpW/b1U/t9sJMI2zjIDY\\n' +
  'Dm3VWLi0gagkMG8mZU8BZpqeEAtcYxcfBDgDZrMcIETIQFhzSEb20Fa7UzcN5hhS\\n' +
  '8mDorX1FmfZNcopa1rtSQWsH84OUd3UGSSc9gRSpVKxr32j+BllNaqs1QMoQWuAI\\n' +
  'w/nTr2YBK063oDR28Jha7Q==\\n' +
  '-----END PRIVATE KEY-----';

// Update the FIREBASE_PRIVATE_KEY line in the .env file
const updatedEnvContent = envContent.replace(
  /^FIREBASE_PRIVATE_KEY=.*$/m,
  `FIREBASE_PRIVATE_KEY='${privateKey}'`
);

// Write the updated content back to .env
fs.writeFileSync(envPath, updatedEnvContent);
console.log('Successfully updated Firebase private key in .env file.');
