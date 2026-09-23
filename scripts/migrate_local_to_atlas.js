import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const LOCAL_URI = 'mongodb://127.0.0.1:27017/mb_services';
const ATLAS_URI = process.argv[2] || process.env.MONGO_URI;

if (!ATLAS_URI || ATLAS_URI.includes('127.0.0.1') || ATLAS_URI.includes('localhost')) {
  console.error('[Error] Please provide a valid MongoDB Atlas connection URI as an argument or in .env');
  console.log('Usage: node scripts/migrate_local_to_atlas.js "mongodb+srv://<user>:<password>@cluster.xxxx.mongodb.net/mb_services"');
  process.exit(1);
}

async function migrate() {
  console.log('--- Starting Migration from Local MongoDB Compass to MongoDB Atlas ---');
  console.log(`Source (Local): ${LOCAL_URI}`);
  console.log(`Target (Atlas): ${ATLAS_URI.replace(/:([^:@]+)@/, ':****@')}`);

  // 1. Connect to Local MongoDB
  console.log('\n[1/4] Connecting to Local MongoDB...');
  const localConn = await mongoose.createConnection(LOCAL_URI).asPromise();
  console.log('✔ Connected to Local MongoDB.');

  const collections = await localConn.db.listCollections().toArray();
  console.log(`Found ${collections.length} collections in local database:`, collections.map(c => c.name));

  // 2. Read all data from local collections
  const dataStore = {};
  for (const col of collections) {
    const docs = await localConn.db.collection(col.name).find({}).toArray();
    dataStore[col.name] = docs;
    console.log(`  Read ${docs.length} documents from [${col.name}]`);
  }
  await localConn.close();

  // 3. Connect to MongoDB Atlas
  console.log('\n[2/4] Connecting to MongoDB Atlas...');
  const atlasConn = await mongoose.createConnection(ATLAS_URI).asPromise();
  console.log('✔ Connected to MongoDB Atlas.');

  // 4. Migrate each collection
  console.log('\n[3/4] Migrating data to MongoDB Atlas...');
  for (const colName of Object.keys(dataStore)) {
    const docs = dataStore[colName];
    if (docs.length === 0) continue;

    console.log(`  Clearing & inserting ${docs.length} documents into Atlas collection [${colName}]...`);
    const targetCol = atlasConn.db.collection(colName);
    await targetCol.deleteMany({});
    await targetCol.insertMany(docs);
    console.log(`  ✔ Collection [${colName}] migrated successfully!`);
  }

  // 5. Verify Atlas count
  console.log('\n[4/4] Verifying Atlas Database state...');
  const atlasCollections = await atlasConn.db.listCollections().toArray();
  for (const c of atlasCollections) {
    const count = await atlasConn.db.collection(c.name).countDocuments();
    console.log(`  Atlas Collection [${c.name}]: ${count} documents`);
  }

  await atlasConn.close();
  console.log('\n🎉 MIGRATION SUCCESSFUL! All local Compass data has been migrated to MongoDB Atlas.');
  process.exit(0);
}

migrate().catch((err) => {
  console.error('\n❌ Migration Failed:', err.message);
  process.exit(1);
});
