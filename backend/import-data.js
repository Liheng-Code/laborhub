const fs = require('fs');
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://postgres.wijpikhfiupzztqcxjes:HyVs4skQ4N01J0A0@aws-1-ap-northeast-1.pooler.supabase.com:5432/postgres',
  ssl: { rejectUnauthorized: false }
});

async function importSQL(filePath, setSearchPath) {
  if (!fs.existsSync(filePath)) {
    console.log(`Skipping ${filePath} (not found)`);
    return;
  }
  const sql = fs.readFileSync(filePath, 'utf8');
  const client = await pool.connect();
  try {
    if (setSearchPath) {
      await client.query(`SET search_path TO ${setSearchPath}, public`);
    }
    await client.query('SET session_replication_role = replica;');
    await client.query(sql);
    await client.query('SET session_replication_role = DEFAULT;');
    console.log(`✓ Imported: ${filePath}`);
  } catch (err) {
    console.error(`✗ Error importing ${filePath}:`, err.message);
  } finally {
    client.release();
  }
}

async function main() {
  console.log('Starting import to Supabase...');
  
  console.log('Importing public schema...');
  await importSQL('./public_inserts.sql');
  
  const tenants = [
    { slug: 'test_company', schema: 'tenant_test_company' },
    { slug: 'supabase_test', schema: 'tenant_supabase_test' },
    { slug: 'acme_construction_building_co_ltd_', schema: 'tenant_acme_construction_building_co_ltd_' }
  ];
  
  for (const tenant of tenants) {
    console.log(`Importing ${tenant.schema}...`);
    await importSQL(`./tenant_${tenant.slug}_inserts.sql`, tenant.schema);
  }
  
  console.log('Import complete!');
  await pool.end();
}

main().catch(console.error);
