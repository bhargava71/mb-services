import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from '../config/db.js';
import User from '../models/User.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '..', '.env') });

async function runTest() {
  console.log('--- Starting User Registration & DB Verification Test ---');
  await connectDB();

  const testEmail = 'propartner.test@mbservices.com';
  
  // Clean up any existing test user
  await User.deleteOne({ email: testEmail });

  // 1. Create a new Pro Partner User
  const newUser = await User.create({
    name: 'Test Pro Partner',
    email: testEmail,
    password: 'propassword123',
    phone: '9988776655',
    role: 'professional',
  });

  console.log('User created in DB:', {
    id: newUser._id,
    name: newUser.name,
    email: newUser.email,
    role: newUser.role,
  });

  // 2. Fetch from database to verify persistence
  const dbUser = await User.findOne({ email: testEmail });
  if (!dbUser) {
    throw new Error('FAILED: User was not persisted in database!');
  }

  console.log('Verified persisted user from MongoDB:', {
    _id: dbUser._id,
    email: dbUser.email,
    role: dbUser.role,
  });

  // 3. Check password match
  const isMatch = await dbUser.matchPassword('propassword123');
  console.log('Password verification result:', isMatch);

  if (dbUser.role === 'professional' && isMatch) {
    console.log('SUCCESS: Pro Partner registered in DB and has role "professional"!');
  } else {
    console.error('FAILED: Role or password verification failed.');
  }

  process.exit(0);
}

runTest().catch((err) => {
  console.error('TEST ERROR:', err);
  process.exit(1);
});
