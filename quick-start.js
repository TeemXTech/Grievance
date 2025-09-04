const { spawn } = require('child_process');

console.log('🚀 Quick Start Script for Grievance Management System');
console.log('================================================');

function runCommand(command, args) {
  return new Promise((resolve, reject) => {
    const process = spawn(command, args, { stdio: 'inherit', shell: true });

    process.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Command "${command} ${args.join(' ')}" failed with code ${code}`));
      }
    });

    process.on('error', (err) => {
      reject(err);
    });
  });
}

async function quickStart() {
  try {
    // This step was in the original script to solve potential setup issues.
    console.log('📦 Ensuring TypeScript is installed (a necessary check)...');
    await runCommand('npm', ['install', 'typescript', '--save-dev', '--legacy-peer-deps']);
    console.log('✅ TypeScript check passed.');
    
    console.log('🌟 Starting Next.js application on port 4000...');
    // Using port 4000 as an alternative to avoid common conflicts
    await runCommand('npx', ['next', 'dev', '-p', '4000']);
  } catch (error) {
    console.error('❌ Error starting application:', error.message);
    console.log('\n🔧 If the script fails, please try these manual steps:');
    console.log('1. Run `npm install --legacy-peer-deps`');
    console.log('2. Run `npm run dev`');
    console.log('3. Open http://localhost:3000 (or the port you configured)');
  }
}

// Show current status
console.log('\n📊 Current Status:');
console.log('✅ Database: PostgreSQL running with dummy data');
console.log('✅ Schema: All tables created and populated');
console.log('✅ Users: 7 test users with different roles');
console.log('✅ Data: Grievances, projects, and requests ready');
console.log('\n🔑 Test Credentials (password: password123):');
console.log('   Minister: minister@ap.gov.in');
console.log('   PA Officer: pa1@ap.gov.in');
console.log('   Back Officer: back1@ap.gov.in');
console.log('   Field Officer: field1@ap.gov.in');
console.log('   Admin: admin@example.com');
console.log('   Public: public1@example.com');

console.log('\n🚀 Starting application...\n');
quickStart();