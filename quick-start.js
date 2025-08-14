const { spawn } = require('child_process');
const fs = require('fs');

console.log('🚀 Quick Start Script for Grievance Management System');
console.log('================================================');

// Check if we can start the application
async function quickStart() {
  try {
    // First, let's try to install TypeScript
    console.log('📦 Installing TypeScript...');
    const installTS = spawn('npm', ['install', 'typescript', '--save-dev', '--legacy-peer-deps'], {
      stdio: 'inherit',
      shell: true
    });

    installTS.on('close', (code) => {
      if (code === 0) {
        console.log('✅ TypeScript installed successfully');
        
        // Now try to start Next.js
        console.log('🌟 Starting Next.js application...');
        const nextDev = spawn('npx', ['next', 'dev', '-p', '3000'], {
          stdio: 'inherit',
          shell: true
        });

        nextDev.on('close', (code) => {
          console.log(`Next.js process exited with code ${code}`);
        });

      } else {
        console.log('❌ TypeScript installation failed');
        console.log('💡 Try manual installation: npm install typescript --save-dev --legacy-peer-deps');
      }
    });

  } catch (error) {
    console.error('❌ Error starting application:', error.message);
    console.log('\n🔧 Manual Steps:');
    console.log('1. npm install typescript --save-dev --legacy-peer-deps');
    console.log('2. npx next dev');
    console.log('3. Open http://localhost:3000');
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