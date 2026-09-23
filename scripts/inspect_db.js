import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/mb_services';

async function inspect() {
  console.log('Connecting to:', uri);
  await mongoose.connect(uri);
  const collections = await mongoose.connection.db.listCollections().toArray();
  console.log('--- MongoDB mb_services Collections ---');
  for (const c of collections) {
    const count = await mongoose.connection.db.collection(c.name).countDocuments();
    console.log(`Collection [${c.name}]: ${count} documents`);
  }

  // Sample service
  const service = await mongoose.connection.db.collection('services').findOne();
  console.log('\nSample Service Image:', service?.image);

  // Sample bookings
  const bookings = await mongoose.connection.db.collection('bookings').find().toArray();
  console.log('\nTotal Bookings in MongoDB:', bookings.length);
  bookings.forEach((b) => {
    console.log(`Booking ${b._id}: status=${b.status}, service=${b.service}, pro=${b.assignedProfessional}`);
  });

  process.exit(0);
}

inspect().catch((err) => {
  console.error(err);
  process.exit(1);
});
