const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const SERVICE_ACCOUNT_PATH = path.join(__dirname, '../config/firebase-service-account.json');
const ENV_FILE = path.join(__dirname, '../.env');

console.log('🚀 Firebase Setup Wizard\n');

// Check if gcloud is installed
function checkGCloud() {
  try {
    execSync('gcloud --version', { stdio: 'ignore' });
    return true;
  } catch (error) {
    return false;
  }
}

// Check if user is logged into gcloud
function checkGCloudAuth() {
  try {
    execSync('gcloud auth print-identity-token', { stdio: 'ignore' });
    return true;
  } catch (error) {
    return false;
  }
}

// Create service account key using gcloud
function createServiceAccountWithGCloud() {
  console.log('\n🔧 Creating service account key using gcloud...');

  try {
    // Create a service account
    const serviceAccountEmail = `combo-backend@${process.env.GOOGLE_CLOUD_PROJECT}.iam.gserviceaccount.com`;

    // Check if service account exists, if not create it
    try {
      execSync(`gcloud iam service-accounts describe ${serviceAccountEmail}`, { stdio: 'ignore' });
      console.log('   ✅ Service account already exists');
    } catch (error) {
      console.log('   ℹ️ Creating new service account...');
      execSync(`gcloud iam service-accounts create combo-backend \
        --display-name="Combo Backend Service Account" \
        --description="Service account for Combo backend server"`);
    }

    // Add required roles
    const roles = [
      'roles/firebase.admin',
      'roles/cloudtasks.enqueuer',
      'roles/cloudtasks.viewer',
      'roles/cloudtasks.tasks.create',
      'roles/cloudtasks.tasks.get',
      'roles/cloudtasks.tasks.list',
      'roles/cloudtasks.queues.get',
      'roles/cloudtasks.queues.list',
    ];

    for (const role of roles) {
      try {
        execSync(`gcloud projects add-iam-policy-binding ${process.env.GOOGLE_CLOUD_PROJECT} \
          --member="serviceAccount:${serviceAccountEmail}" \
          --role="${role}"`);
        console.log(`   ✅ Added role: ${role}`);
      } catch (error) {
        console.log(`   ⚠️ Failed to add role ${role}: ${error.message}`);
      }
    }

    // Create and download the key
    console.log('\n🔑 Creating and downloading service account key...');
    execSync(`gcloud iam service-accounts keys create ${SERVICE_ACCOUNT_PATH} \
      --iam-account=${serviceAccountEmail}`);

    // Set secure permissions
    fs.chmodSync(SERVICE_ACCOUNT_PATH, 0o600);

    console.log(`\n✅ Service account key created at: ${SERVICE_ACCOUNT_PATH}`);
    return true;
  } catch (error) {
    console.error('❌ Error creating service account:', error.message);
    return false;
  }
}

// Manual setup instructions
function showManualSetupInstructions() {
  console.log('\n📝 Manual Setup Instructions:');
  console.log('1. Go to the Firebase Console: https://console.firebase.google.com/');
  console.log('2. Select your project (combo-624e1)');
  console.log('3. Click the gear icon ⚙️ > "Project settings"');
  console.log('4. Go to the "Service accounts" tab');
  console.log('5. Click "Generate new private key"');
  console.log(`6. Save the JSON file as: ${SERVICE_ACCOUNT_PATH}`);
  console.log('7. Set secure permissions: chmod 600 ' + SERVICE_ACCOUNT_PATH);
  console.log('\nAfter completing these steps, run this script again.');
}

// Update .env file
function updateEnvFile() {
  const envContent = `# Firebase Configuration
FIREBASE_DATABASE_URL=https://combo-624e1-default-rtdb.firebaseio.com
FIREBASE_STORAGE_BUCKET=combo-624e1.appspot.com
FIREBASE_PROJECT_ID=combo-624e1

# Application
NODE_ENV=development
PORT=3000
`;

  fs.writeFileSync(ENV_FILE, envContent);
  console.log(`\n✅ Updated ${ENV_FILE} with Firebase configuration`);
}

// Main function
async function main() {
  // Check if service account already exists
  if (fs.existsSync(SERVICE_ACCOUNT_PATH)) {
    console.log('✅ Service account key already exists at:', SERVICE_ACCOUNT_PATH);

    const { default: inquirer } = await import('inquirer');
    const { confirm } = await inquirer.createPromptModule()([
      {
        type: 'confirm',
        name: 'overwrite',
        message: 'Do you want to generate a new service account key?',
        default: false,
      },
    ]);

    if (!confirm) {
      console.log('Using existing service account key.');
      updateEnvFile();
      process.exit(0);
    }
  }

  // Check if gcloud is available
  const gcloudInstalled = checkGCloud();

  if (gcloudInstalled) {
    console.log('✅ Google Cloud SDK is installed');

    const gcloudAuthed = checkGCloudAuth();

    if (gcloudAuthed) {
      console.log('✅ Successfully authenticated with Google Cloud');

      // Get current project
      try {
        const projectId = execSync('gcloud config get-value project').toString().trim();
        console.log(`   Current project: ${projectId}`);
        process.env.GOOGLE_CLOUD_PROJECT = projectId;

        const { default: inquirer } = await import('inquirer');
        const { useCurrentProject } = await inquirer.createPromptModule()([
          {
            type: 'confirm',
            name: 'useCurrentProject',
            message: `Do you want to use the current Google Cloud project (${projectId})?`,
            default: true,
          },
        ]);

        if (!useCurrentProject) {
          const { projectId: newProjectId } = await inquirer.createPromptModule()([
            {
              type: 'input',
              name: 'projectId',
              message: 'Enter the Google Cloud project ID to use:',
              default: 'combo-624e1',
            },
          ]);
          process.env.GOOGLE_CLOUD_PROJECT = newProjectId;
        }

        // Try to create service account with gcloud
        if (await createServiceAccountWithGCloud()) {
          updateEnvFile();
          process.exit(0);
        }
      } catch (error) {
        console.error('❌ Error getting Google Cloud project:', error.message);
      }
    } else {
      console.log('⚠️  Not authenticated with Google Cloud. Please run:');
      console.log('   gcloud auth login');
      console.log('   gcloud config set project YOUR_PROJECT_ID');
    }
  } else {
    console.log('ℹ️  Google Cloud SDK is not installed or not in PATH');
    console.log('   You can install it from: https://cloud.google.com/sdk/docs/install');
  }

  // Fall back to manual setup
  showManualSetupInstructions();
  process.exit(1);
}

// Run the setup
main().catch(console.error);
