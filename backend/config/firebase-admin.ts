import * as admin from 'firebase-admin';
import * as fs from 'fs';
import * as path from 'path';

// Get the path to the service account key from environment variable
const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH || 
    path.join(process.cwd(), 'firebase-service-account.json');

// Check if service account file exists
if (!fs.existsSync(serviceAccountPath)) {
    console.error(`❌ Firebase service account file not found at: ${serviceAccountPath}`);
    process.exit(1);
}

// Read the service account file
let serviceAccount;
try {
    const serviceAccountFile = fs.readFileSync(serviceAccountPath, 'utf8');
    serviceAccount = JSON.parse(serviceAccountFile);
} catch (error) {
    console.error('❌ Error reading service account file:', error);
    process.exit(1);
}

// Initialize Firebase Admin
let app;

try {
    // Check if any app is already initialized
    if (admin.apps.length === 0) {
        console.log('ℹ️ Initializing Firebase Admin...');
        
        // Format the private key correctly (handle escaped newlines)
        const privateKey = serviceAccount.private_key.replace(/\\n/g, '\n');
        
        const config = {
            credential: admin.credential.cert({
                projectId: serviceAccount.project_id,
                clientEmail: serviceAccount.client_email,
                privateKey: privateKey
            }),
            databaseURL: `https://${serviceAccount.project_id}.firebaseio.com`,
            storageBucket: `${serviceAccount.project_id}.appspot.com`
        };
        
        app = admin.initializeApp(config);
        console.log('✅ Firebase Admin initialized successfully');
    } else {
        app = admin.app();
        console.log('ℹ️ Using existing Firebase Admin instance');
    }
} catch (error) {
    console.error('❌ Failed to initialize Firebase Admin:');
    console.error(error);
    process.exit(1);
}

// Export the initialized services
try {
    const auth = admin.auth(app);
    const firestore = admin.firestore();
    firestore.settings({ ignoreUndefinedProperties: true });
    const storage = admin.storage();
    const database = admin.database();

    // Test the connection
    (async () => {
        try {
            await auth.listUsers(1);
            console.log('✅ Successfully connected to Firebase Auth');
        } catch (error) {
            console.error('❌ Failed to connect to Firebase Auth:', error.message);
        }
    })();

    module.exports = {
        adminAuth: auth,
        adminFirestore: firestore,
        adminStorage: storage,
        adminDatabase: database,
        admin: admin
    };
} catch (error) {
    console.error('❌ Failed to initialize Firebase services:');
    console.error(error);
    process.exit(1);
}
