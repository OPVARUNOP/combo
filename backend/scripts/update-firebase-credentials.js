const fs = require('fs');
const path = require('path');

// Path to the .env file
const envPath = path.join(__dirname, '../.env');

// Read the current .env file
let envContent = fs.readFileSync(envPath, 'utf8');

// Update Firebase configuration with the provided credentials
const updates = {
  FIREBASE_PROJECT_ID: 'combo-624e1',
  FIREBASE_PRIVATE_KEY_ID: 'c041b569084663f2ccf7c680699524a582e9af20',
  FIREBASE_PRIVATE_KEY:
    '-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQDPmQXN7jqJ1FJK\nmSUwQxAGEM4aKR58NYQ2iAyiaRN6xlUgHOqHV/eSg62Cqg+lWGWZgHtw5TJP48g9\n+yPPfFfutM7J4M8+zenqp6JuV5E8E5kdNAVEs4fpz0fUbEAtiNWTKIpfy8sYt5jz\nZZxj5jZ+vIfaAXTxFdS0mxCChPDLz0yAU7xstlSNAkATou8UW9YM9IsbxzopfabW\nYSq4KCR+EkjeIe4Q0QUmJ0wC4WnQtlJ1y0OH1NS7tJA6UJpNrylxeD0jct6JlV+7\nqAeZVIivf9tlB6PfzfGYNG2xFPidm3AXBw8IMZfbdnnpLxrDT5HQWpYuPBBZyK/E\n7Saic1P3AgMBAAECggEAPvDoP52BBhTntlJkYhOTIiOqOWhKI+Kd6WKqYft1un2z\nhX7+5HYZS8S8sKcbA0if1UCNLJdw/6PSLGieXOQYTPlo0PBmJWaNC2Yz6zyFfi96\n9s204zWDebIs1wzTEHsyNeHOwmipdR8FMpaWKfu8fgRvM/vJFudFjFSPVuMzlrcB\ncRmRBVl2DOHk1hosYG1kSy5YltJWUzG5WhYP0h2nNusrfqGRBI0gqacuwp5cO/7m\nBYZ5XqgCxFJsk35UzjJbLrBzGcz/iqbIYf/EzZ7XsOOi3znGG1wvhG9zcMDPQrtp\nPQL3vMopQYkPYyypZHInNrOsMFK3E7Mp1tikql5iwQKBgQDob7T8roSox9hTTEzy\nV86jScyTFFkPdv1544NmFtCLBW6Jn9FWE9A5LNltoYdsmZ2bxBJFdCVn7XqOOXyI\nzZv11j3HdzcXJGniCkms2cEMwNthrZ/GT5NBKz6Ibq3z5vh5e9g+rbi6sIlttxU7\nrZZc3TotGEGqIb6pCjvu+QWw5wKBgQDkpLFgmPrEqDpD33D1qyK+VmIhCSusASsO\n+8oVOolkEtplAhu5LOCSX5pkjd0BfPAGzMWol3FBaKldA9t1tAh27F/61gBXfdM/\n8aF37M14RtPW1DsxeTcSBl4gaz2cIQwyt16uIyaP3n7anbSZD3EqUo7WpjZ/Lqgd\nou2sm4AScQKBgB2Yw8n9CuVW9SO+LnoZVjWSmxsLVz/R3frcTon8U7ewDGA32ncE\ndNoi7Ni53b2lXd1MvSrc3Dp8kcN0bHga/kXybtFsS7aFq3nd5328CInwML8iVZrx\n3QVKVV8YAMxy16bYbzOj+UbEXet7iZecxe2zOcouMYZRX660n+cRDHl3AoGAPK4c\nyScwflqrQ/Ib94cYrG0ek+fsKDUTKWHXivTDG8UJIv+BPg7T9uTag89GlSuERDm6\nR3kRvKs7L41jhARorq8i9d4vrwictP66vKojCcW6WOxwXTvvSqBYAMCVVEdNBnS1\n8v8vL8V74ycxk+GORg4tDHiGRBCs21ivPTzzq3ECgYAbPpW/b1U/t9sJMI2zjIDY\nDm3VWLi0gagkMG8mZU8BZpqeEAtcYxcfBDgDZrMcIETIQFhzSEb20Fa7UzcN5hhS\n8mDorX1FmfZNcopa1rtSQWsH84OUd3UGSSc9gRSpVKxr32j+BllNaqs1QMoQWuAI\nw/nTr2YBK063oDR28Jha7Q==\n-----END PRIVATE KEY-----',
  FIREBASE_CLIENT_EMAIL: 'firebase-adminsdk-fbsvc@combo-624e1.iam.gserviceaccount.com',
  FIREBASE_CLIENT_ID: '105380896171802347473',
  FIREBASE_AUTH_URI: 'https://accounts.google.com/o/oauth2/auth',
  FIREBASE_TOKEN_URI: 'https://oauth2.googleapis.com/token',
  FIREBASE_AUTH_PROVIDER_CERT_URL: 'https://www.googleapis.com/oauth2/v1/certs',
  FIREBASE_CLIENT_CERT_URL:
    'https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40combo-624e1.iam.gserviceaccount.com',
  FIREBASE_DATABASE_URL: 'https://combo-624e1-default-rtdb.firebaseio.com',
  FIREBASE_STORAGE_BUCKET: 'combo-624e1.appspot.com',
};

// Update each environment variable
Object.entries(updates).forEach(([key, value]) => {
  const regex = new RegExp(`^${key}=.*$`, 'm');
  const newLine = `${key}=${value}`.replace(/\n/g, '\\n');

  if (envContent.match(regex)) {
    envContent = envContent.replace(regex, newLine);
  } else {
    envContent += `\n${newLine}`;
  }
});

// Write the updated content back to .env
fs.writeFileSync(envPath, envContent);
console.log('Successfully updated Firebase credentials in .env file.');
console.log('Please ensure the .env file is not committed to version control!');
