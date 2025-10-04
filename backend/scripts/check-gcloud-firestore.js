const { execSync } = require('child_process');

function checkFirestore() {
  try {
    console.log('🔍 Checking Firestore status using gcloud...');

    // Check if gcloud is installed
    try {
      execSync('gcloud --version');
    } catch (e) {
      console.error('❌ Google Cloud SDK (gcloud) is not installed.');
      console.log('Please install it from: https://cloud.google.com/sdk/docs/install');
      process.exit(1);
    }

    // Check if user is authenticated
    try {
      const authStatus = execSync(
        'gcloud auth list --filter=status:ACTIVE --format="value(account)"'
      )
        .toString()
        .trim();
      if (!authStatus) {
        console.log('🔐 Please authenticate with Google Cloud:');
        execSync('gcloud auth login', { stdio: 'inherit' });
      } else {
        console.log(`✅ Authenticated as: ${authStatus}`);
      }
    } catch (e) {
      console.error('❌ Error checking authentication status');
      process.exit(1);
    }

    // Set the project
    console.log('\n🔧 Setting project to combo-624e1...');
    execSync('gcloud config set project combo-624e1', { stdio: 'inherit' });

    // Check Firestore database
    console.log('\n🔍 Checking Firestore database...');
    try {
      const output = execSync('gcloud firestore databases list --format=json').toString();
      const databases = JSON.parse(output);

      if (databases.length === 0) {
        console.log('\n❌ No Firestore databases found in this project.');
        console.log('\nTo create a Firestore database, run:');
        console.log('1. gcloud firestore databases create --region=us-central1');
        console.log('   OR');
        console.log('2. Go to https://console.cloud.google.com/firestore and create a database');
      } else {
        console.log('\n✅ Found Firestore databases:');
        console.log(JSON.stringify(databases, null, 2));
      }
    } catch (e) {
      console.error('\n❌ Error checking Firestore databases:');
      console.error(e.stderr ? e.stderr.toString() : e.message);

      if (e.message.includes('does not match the pattern')) {
        console.log('\nIt seems Firestore is not enabled for this project.');
        console.log('Please enable Firestore by visiting:');
        console.log('https://console.cloud.google.com/firestore');
      }
    }
  } catch (error) {
    console.error('\n❌ An error occurred:');
    console.error(error.message);
    process.exit(1);
  }
}

checkFirestore();
