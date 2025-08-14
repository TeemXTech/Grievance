const { Client } = require('pg');

async function testDatabase() {
  const client = new Client({
    connectionString: 'postgresql://postgres:Password@localhost:5432/grievance_db'
  });

  try {
    await client.connect();
    console.log('✅ Database connection successful!');

    // Test data
    const users = await client.query('SELECT id, name, email, role FROM "User" LIMIT 5');
    console.log('\n👥 Users:', users.rows);

    const grievances = await client.query('SELECT id, "referenceNumber", title, status FROM "Grievance" LIMIT 5');
    console.log('\n📋 Grievances:', grievances.rows);

    const categories = await client.query('SELECT id, name FROM "Category"');
    console.log('\n📂 Categories:', categories.rows);

    const projects = await client.query('SELECT id, "referenceNumber", "projectName", status FROM "GovernmentProject"');
    console.log('\n🏗️ Projects:', projects.rows);

    console.log('\n🎉 Database is working with dummy data!');
    
  } catch (error) {
    console.error('❌ Database error:', error.message);
  } finally {
    await client.end();
  }
}

testDatabase();