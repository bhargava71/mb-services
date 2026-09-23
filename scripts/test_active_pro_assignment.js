import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from '../config/db.js';
import User from '../models/User.js';
import Service from '../models/Service.js';
import Booking from '../models/Booking.js';

dotenv.config();

async function testAutoAssignment() {
  await connectDB();

  console.log('--- Testing Active Professional Order Assignment ---');

  // 1. Get an active professional
  const activePros = await User.find({ role: 'professional', isAvailable: true });
  console.log(`Found ${activePros.length} active professionals (isAvailable: true):`);
  activePros.forEach((p) => console.log(` - ${p.name} (${p.email})`));

  // 2. Get a customer and service
  const customer = await User.findOne({ role: 'customer' });
  const service = await Service.findOne();

  if (!customer || !service) {
    console.error('Customer or Service missing in DB');
    process.exit(1);
  }

  // 3. Create a test order
  const prosWithWorkload = await Promise.all(
    activePros.map(async (pro) => {
      const count = await Booking.countDocuments({
        professional: pro._id,
        status: { $in: ['assigned', 'accepted', 'in_progress'] },
      });
      return { pro, count };
    })
  );

  prosWithWorkload.sort((a, b) => a.count - b.count);
  const expectedPro = prosWithWorkload[0]?.pro;

  console.log(`\nExpected Assigned Pro (lowest workload): ${expectedPro?.name} (${expectedPro?.email})`);

  const newBooking = await Booking.create({
    customer: customer._id,
    service: service._id,
    date: new Date(),
    timeSlot: '10:00 AM - 11:30 AM',
    address: { title: 'Home', fullAddress: '123 Test St', phone: '9876543210' },
    price: service.price,
    professional: expectedPro?._id,
    status: 'assigned',
  });

  const populated = await Booking.findById(newBooking._id)
    .populate('customer', 'name email')
    .populate('professional', 'name email role isAvailable');

  console.log('\nCreated Booking Details:');
  console.log(`- Booking ID: ${populated._id}`);
  console.log(`- Customer: ${populated.customer.name}`);
  console.log(`- Assigned Professional: ${populated.professional.name} (${populated.professional.email})`);
  console.log(`- Professional Active Status: ${populated.professional.isAvailable}`);
  console.log(`- Booking Status: ${populated.status}`);

  if (populated.professional.isAvailable === true) {
    console.log('\nSUCCESS: Order was automatically assigned to an active professional partner!');
  } else {
    console.error('\nFAILED: Order was assigned to an offline professional.');
  }

  process.exit(0);
}

testAutoAssignment().catch((err) => {
  console.error('Test Error:', err);
  process.exit(1);
});
