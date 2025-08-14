import { DataSource } from 'typeorm';

async function dropAllTables() {
  // Load environment variables
  require('dotenv').config();
  
  const AppDataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_NAME || 'foodee_db',
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
    synchronize: false,
    logging: true,
  });

  try {
    await AppDataSource.initialize();
    console.log('📊 Database connection initialized');

    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();

    console.log('🗑️ Dropping all tables...');

    // Get all table names
    const tables = await queryRunner.query(`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public'
    `);

    console.log(`Found ${tables.length} tables to drop`);

    // Drop each table with CASCADE to handle foreign keys
    for (const table of tables) {
      const tableName = table.tablename;
      try {
        console.log(`Dropping table: ${tableName}`);
        await queryRunner.query(`DROP TABLE IF EXISTS "${tableName}" CASCADE;`);
        console.log(`✓ Dropped: ${tableName}`);
      } catch (error) {
        console.log(`⚠️ Failed to drop ${tableName}:`, error.message);
      }
    }

    // Drop sequences that might be left over
    const sequences = await queryRunner.query(`
      SELECT sequence_name 
      FROM information_schema.sequences 
      WHERE sequence_schema = 'public'
    `);

    for (const seq of sequences) {
      try {
        await queryRunner.query(`DROP SEQUENCE IF EXISTS "${seq.sequence_name}" CASCADE;`);
        console.log(`✓ Dropped sequence: ${seq.sequence_name}`);
      } catch (error) {
        console.log(`⚠️ Failed to drop sequence ${seq.sequence_name}:`, error.message);
      }
    }

    await queryRunner.release();
    await AppDataSource.destroy();

    console.log('✅ All tables dropped successfully!');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error dropping tables:', error);
    process.exit(1);
  }
}

dropAllTables();
