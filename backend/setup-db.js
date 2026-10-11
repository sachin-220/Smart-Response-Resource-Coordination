const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: 'postgres',
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT || 5432,
});

async function setupDatabase() {
  try {
    console.log('Connecting to PostgreSQL...');
    await pool.query('CREATE DATABASE ' + (process.env.DB_NAME || 'urbanrescue_db'));
    console.log('Database created');
  } catch (err) {
    if (err.code === '42P04') {
      console.log('Database already exists');
    } else {
      console.error('Error creating database:', err);
    }
  } finally {
    await pool.end();
  }

  // Connect to target database and run schema
  const dbPool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'urbanrescue_db',
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT || 5432,
  });

  try {
    const schemaPath = path.join(__dirname, '..', 'final.sql');
    if (fs.existsSync(schemaPath)) {
      const schema = fs.readFileSync(schemaPath, 'utf8');
      await dbPool.query(schema);
      console.log('Database schema created successfully');
    } else {
      console.log('Schema file not found at:', schemaPath);
    }
  } catch (err) {
    console.error('Error running schema:', err);
  } finally {
    await dbPool.end();
  }
}

setupDatabase();
