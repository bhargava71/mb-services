import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from '../config/db.js';
import authRoutes from '../routes/authRoutes.js';
import User from '../models/User.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/auth', authRoutes);

async function testEndpoints() {
  await connectDB();
  
  const server = app.listen(5009, async () => {
    console.log('Test server running on port 5009');

    const registerEmail = `api.partner.${Date.now()}@mbservices.com`;

    try {
      // 1. Test Registration Endpoint
      const regRes = await fetch('http://localhost:5009/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'API Registered Pro Partner',
          email: registerEmail,
          password: 'propassword123',
          phone: '9876543210',
          role: 'professional',
        }),
      });

      const regData = await regRes.json();
      console.log('HTTP Registration Response:', regData);

      if (!regData.success) {
        throw new Error('Registration HTTP endpoint failed!');
      }

      // 2. Verify in MongoDB directly
      const savedUser = await User.findOne({ email: registerEmail });
      console.log('Database User check:', {
        email: savedUser.email,
        role: savedUser.role,
        savedInDB: !!savedUser,
      });

      // 3. Test Login Endpoint
      const loginRes = await fetch('http://localhost:5009/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: registerEmail,
          password: 'propassword123',
        }),
      });

      const loginData = await loginRes.json();
      console.log('HTTP Login Response:', loginData);

      if (loginData.success && loginData.data.user.role === 'professional') {
        console.log('SUCCESS: API HTTP Registration & Pro Login verified end-to-end!');
      } else {
        console.error('FAILED: Login HTTP endpoint verification failed.');
      }
    } catch (err) {
      console.error('API Test Error:', err);
    } finally {
      server.close();
      process.exit(0);
    }
  });
}

testEndpoints();
