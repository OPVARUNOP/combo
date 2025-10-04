const fs = require('fs');
const path = require('path');

// Path to the new .env file
const envPath = path.join(__dirname, '../.env');

// Define the environment variables
const envVars = `# Backblaze B2 Configuration
B2_APPLICATION_KEY_ID=your_b2_key_id
B2_APPLICATION_KEY=your_b2_application_key
B2_BUCKET_NAME=your_b2_bucket_name
B2_BUCKET_ID=your_b2_bucket_id
B2_DOWNLOAD_URL=your_b2_download_url

# Server Configuration
PORT=8080
NODE_ENV=development

# Firebase Configuration
FIREBASE_PROJECT_ID=combo-624e1
FIREBASE_PRIVATE_KEY_ID=c041b569084663f2ccf7c680699524a582e9af20
FIREBASE_PRIVATE_KEY='-----BEGIN PRIVATE KEY-----\\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQDPmQXN7jqJ1FJK\\nmSUwQxAGEM4aKR58NYQ2iAyiaRN6xlUgHOqHV/eSg62Cqg+lWGWZgHtw5TJP48g9\\n+yPPfFfutM7J4M8+zenqp6JuV5E8E5kdNAVEs4fpz0fUbEAtiNWTKIpfy8sYt5jz\\nZZxj5jZ+vIfaAXTxFdS0mxCChPDLz0yAU7xstlSNAkATou8UW9YM9IsbxzopfabW\\nYSq4KCR+EkjeIe4Q0QUmJ0wC4WnQtlJ1y0OH1NS7tJA6UJpNrylxeD0jct6JlV+7\\nqAeZVIivf9tlB6PfzfGYNG2xFPidm3AXBw8IMZfbdnnpLxrDT5HQWpYuPBBZyK/E\\n7Saic1P3AgMBAAECggEAPvDoP52BBhTntlJkYhOTIiOqOWhKI+Kd6WKqYft1un2z\\nhX7+5HYZS8S8sKcbA0if1UCNLJdw/6PSLGieXOQYTPlo0PBmJWaNC2Yz6zyFfi96\\n9s204zWDebIs1wzTEHsyNeHOwmipdR8FMpaWKfu8fgRvM/vJFudFjFSPVuMzlrcB\\ncRmRBVl2DOHk1hosYG1kSy5YltJWUzG5WhYP0h2nNusrfqGRBI0gqacuwp5cO/7m\\nBYZ5XqgCxFJsk35UzjJbLrBzGcz/iqbIYf/EzZ7XsOOi3znGG1wvhG9zcMDPQrtp\\nPQL3vMopQYkPYyypZHInNrOsMFK3E7Mp1tikql5iwQKBgQDob7T8roSox9hTTEzy\\nV86jScyTFFkPdv1544NmFtCLBW6Jn9FWE9A5LNltoYdsmZ2bxBJFdCVn7XqOOXyI\\nzZv11j3HdzcXJGniCkms2cEMwNthrZ/GT5NBKz6Ibq3z5vh5e9g+rbi6sIlttxU7\\nrZZc3TotGEGqIb6pCjvu+QWw5wKBgQDkpLFgmPrEqDpD33D1qyK+VmIhCSusASsO\\n+8oVOolkEtplAhu5LOCSX5pkjd0BfPAGzMWol3FBaKldA9t1tAh27F/61gBXfdM/\\n8aF37M14RtPW1DsxeTcSBl4gaz2cIQwyt16uIyaP3n7anbSZD3EqUo7WpjZ/Lqgd\\nou2sm4AScQKBgB2Yw8n9CuVW9SO+LnoZVjWSmxsLVz/R3frcTon8U7ewDGA32ncE\\ndNoi7Ni53b2lXd1MvSrc3Dp8kcN0bHga/kXybtFsS7aFq3nd5328CInwML8iVZrx\\n3QVKVV8YAMxy16bYbzOj+UbEXet7iZecxe2zOcouMYZRX660n+cRDHl3AoGAPK4c\\nyScwflqrQ/Ib94cYrG0ek+fsKDUTKWHXivTDG8UJIv+BPg7T9uTag89GlSuERDm6\\nR3kRvKs7L41jhARorq8i9d4vrwictP66vKojCcW6WOxwXTvvSqBYAMCVVEdNBnS1\\n8v8vL8V74ycxk+GORg4tDHiGRBCs21ivPTzzq3ECgYAbPpW/b1U/t9sJMI2zjIDY\\nDm3VWLi0gagkMG8mZU8BZpqeEAtcYxcfBDgDZrMcIETIQFhzSEb20Fa7UzcN5hhS\\n8mDorX1FmfZNcopa1rtSQWsH84OUd3UGSSc9gRSpVKxr32j+BllNaqs1QMoQWuAI\\nw/nTr2YBK063oDR28Jha7Q==\\n-----END PRIVATE KEY-----'
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-fbsvc@combo-624e1.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=105380896171802347473
FIREBASE_AUTH_URI=https://accounts.google.com/o/oauth2/auth
FIREBASE_TOKEN_URI=https://oauth2.googleapis.com/token
FIREBASE_AUTH_PROVIDER_CERT_URL=https://www.googleapis.com/oauth2/v1/certs
FIREBASE_CLIENT_CERT_URL=https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40combo-624e1.iam.gserviceaccount.com
FIREBASE_DATABASE_URL=https://combo-624e1-default-rtdb.firebaseio.com
FIREBASE_STORAGE_BUCKET=combo-624e1.appspot.com

# JWT Configuration
JWT_SECRET=your_jwt_secret_key
JWT_ACCESS_EXPIRATION_MINUTES=1440 # 24 hours
JWT_REFRESH_EXPIRATION_DAYS=30

# CORS Configuration (comma-separated)
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:8080

# Application Settings
MAX_FILE_SIZE=10485760  # 10MB
`;

// Write the new .env file
fs.writeFileSync(envPath, envVars);
console.log('Successfully created a new .env file with proper formatting.');
console.log('Please review the file and update any placeholder values as needed.');
