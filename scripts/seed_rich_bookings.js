import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/mb_services';

async function seedBookings() {
  console.log('Connecting to MongoDB at:', uri);
  await mongoose.connect(uri);

  const db = mongoose.connection.db;

  const users = await db.collection('users').find().toArray();
  const services = await db.collection('services').find().toArray();

  const customer = users.find((u) => u.email === 'bhargava@gmail.com');
  const proRajesh = users.find((u) => u.email === 'rajesh.pro@mbservices.com');
  const proSunil = users.find((u) => u.email === 'sunil.pro@mbservices.com');
  const proDeepak = users.find((u) => u.email === 'deepak.pro@mbservices.com');

  if (!customer || !proRajesh) {
    console.error('Customer or Rajesh pro not found');
    process.exit(1);
  }

  // Find suitable services
  const cleaningService1 = services.find((s) => s.category === 'Home Cleaning') || services[0];
  const cleaningService2 = services.find((s) => s.name.includes('Bathroom')) || services[1];
  const repairService = services.find((s) => s.category === 'Repairs & Handyman') || services[4];
  const plumbingService = services.find((s) => s.category === 'Plumbing Solutions') || services[8];
  const cookingService = services.find((s) => s.category === 'Cooking') || services[0];

  // Clean old sample bookings to avoid duplicates
  await db.collection('bookings').deleteMany({});
  console.log('Cleared existing bookings collection');

  const now = new Date();
  const yesterday = new Date(Date.now() - 24 * 3600 * 1000);
  const tomorrow = new Date(Date.now() + 24 * 3600 * 1000);
  const nextWeek = new Date(Date.now() + 3 * 24 * 3600 * 1000);

  const bookingsToInsert = [
    // Rajesh (Cleaning Pro) - 1 Assigned (Pending)
    {
      customer: customer._id,
      professional: proRajesh._id,
      service: cleaningService1._id,
      status: 'assigned',
      date: tomorrow,
      timeSlot: '10:00 AM - 12:00 PM',
      price: cleaningService1.price || 899,
      address: {
        street: 'Flat 402, Green Glen Layout, Outer Ring Road',
        city: 'Bengaluru',
        pincode: '560103',
        landmark: 'Near Bellandur Junction',
      },
      paymentMethod: 'cash',
      paymentStatus: 'pending',
      notes: 'Customer requested eco-friendly cleaning liquid if possible.',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    // Rajesh - 1 In-Progress (Active)
    {
      customer: customer._id,
      professional: proRajesh._id,
      service: cleaningService2._id,
      status: 'in-progress',
      date: now,
      timeSlot: '02:00 PM - 04:00 PM',
      price: cleaningService2.price || 499,
      address: {
        street: 'Villa 12, Indiranagar 100ft Road',
        city: 'Bengaluru',
        pincode: '560038',
        landmark: 'Behind Toit Pub',
      },
      paymentMethod: 'online',
      paymentStatus: 'paid',
      notes: 'Deep stain removal for master bathroom floor and tile scaling.',
      createdAt: yesterday,
      updatedAt: now,
    },
    // Rajesh - 1 Accepted (Active)
    {
      customer: customer._id,
      professional: proRajesh._id,
      service: cleaningService1._id,
      status: 'accepted',
      date: nextWeek,
      timeSlot: '04:00 PM - 06:00 PM',
      price: cleaningService1.price || 899,
      address: {
        street: 'Apartment 7B, Koramangala 4th Block',
        city: 'Bengaluru',
        pincode: '560034',
        landmark: 'Opposite Wipro Park',
      },
      paymentMethod: 'online',
      paymentStatus: 'paid',
      notes: 'Full living room deep vacuuming and sofa upholstery.',
      createdAt: now,
      updatedAt: now,
    },
    // Rajesh - 2 Completed
    {
      customer: customer._id,
      professional: proRajesh._id,
      service: cleaningService1._id,
      status: 'completed',
      date: new Date(Date.now() - 3 * 24 * 3600 * 1000),
      timeSlot: '09:00 AM - 11:00 AM',
      price: cleaningService1.price || 899,
      address: {
        street: 'Flat 204, HSR Layout Sector 2',
        city: 'Bengaluru',
        pincode: '560102',
        landmark: 'Near BDA Complex',
      },
      paymentMethod: 'online',
      paymentStatus: 'paid',
      notes: 'Completed with 5-star customer feedback.',
      createdAt: new Date(Date.now() - 4 * 24 * 3600 * 1000),
      updatedAt: new Date(Date.now() - 3 * 24 * 3600 * 1000),
    },
    {
      customer: customer._id,
      professional: proRajesh._id,
      service: cleaningService2._id,
      status: 'completed',
      date: new Date(Date.now() - 5 * 24 * 3600 * 1000),
      timeSlot: '11:00 AM - 01:00 PM',
      price: cleaningService2.price || 499,
      address: {
        street: 'House 55, Whitefield Main Road',
        city: 'Bengaluru',
        pincode: '560066',
        landmark: 'Near Hope Farm',
      },
      paymentMethod: 'cash',
      paymentStatus: 'paid',
      notes: 'Completed successfully.',
      createdAt: new Date(Date.now() - 6 * 24 * 3600 * 1000),
      updatedAt: new Date(Date.now() - 5 * 24 * 3600 * 1000),
    },
    // Sunil (Repair Expert) - 1 Assigned, 1 In-Progress, 1 Completed
    {
      customer: customer._id,
      professional: proSunil._id,
      service: repairService._id,
      status: 'assigned',
      date: tomorrow,
      timeSlot: '11:00 AM - 01:00 PM',
      price: repairService.price || 599,
      address: {
        street: 'Tower 4, Prestige Tech Park',
        city: 'Bengaluru',
        pincode: '560103',
        landmark: 'Kadubeesanahalli',
      },
      paymentMethod: 'online',
      paymentStatus: 'pending',
      notes: 'Ceiling fan wobble repair and new regulator wiring.',
      createdAt: now,
      updatedAt: now,
    },
    {
      customer: customer._id,
      professional: proSunil._id,
      service: repairService._id,
      status: 'completed',
      date: new Date(Date.now() - 2 * 24 * 3600 * 1000),
      timeSlot: '03:00 PM - 05:00 PM',
      price: repairService.price || 599,
      address: {
        street: 'Flat 101, Electronic City Phase 1',
        city: 'Bengaluru',
        pincode: '560100',
        landmark: 'Near Wipro Gate 5',
      },
      paymentMethod: 'online',
      paymentStatus: 'paid',
      notes: 'Appliance check complete.',
      createdAt: new Date(Date.now() - 3 * 24 * 3600 * 1000),
      updatedAt: new Date(Date.now() - 2 * 24 * 3600 * 1000),
    },
    // Deepak (Plumbing Specialist) - 1 Assigned, 1 Completed
    {
      customer: customer._id,
      professional: proDeepak._id,
      service: plumbingService._id,
      status: 'assigned',
      date: tomorrow,
      timeSlot: '01:00 PM - 03:00 PM',
      price: plumbingService.price || 399,
      address: {
        street: 'Flat 303, Jayanagar 4th Block',
        city: 'Bengaluru',
        pincode: '560041',
        landmark: 'Near Cosmopolitan Club',
      },
      paymentMethod: 'cash',
      paymentStatus: 'pending',
      notes: 'Kitchen sink drain line unclogging and trap seal replacement.',
      createdAt: now,
      updatedAt: now,
    },
    {
      customer: customer._id,
      professional: proDeepak._id,
      service: plumbingService._id,
      status: 'completed',
      date: new Date(Date.now() - 1 * 24 * 3600 * 1000),
      timeSlot: '10:00 AM - 12:00 PM',
      price: plumbingService.price || 399,
      address: {
        street: 'Plot 89, BTM Layout 2nd Stage',
        city: 'Bengaluru',
        pincode: '560076',
        landmark: 'Near Udupi Garden',
      },
      paymentMethod: 'online',
      paymentStatus: 'paid',
      notes: 'Bathroom mixer faucet replaced.',
      createdAt: new Date(Date.now() - 2 * 24 * 3600 * 1000),
      updatedAt: new Date(Date.now() - 1 * 24 * 3600 * 1000),
    },
    // 1 Cooking Booking
    {
      customer: customer._id,
      professional: proRajesh._id,
      service: cookingService._id,
      status: 'assigned',
      date: nextWeek,
      timeSlot: '12:00 PM - 02:00 PM',
      price: cookingService.price || 699,
      address: {
        street: 'Apartment 5A, Domlur Layout',
        city: 'Bengaluru',
        pincode: '560071',
        landmark: 'Near EGL Campus',
      },
      paymentMethod: 'online',
      paymentStatus: 'paid',
      notes: 'Cooking for 4 guests. North Indian paneer and dal tadka.',
      createdAt: now,
      updatedAt: now,
    },
  ];

  const result = await db.collection('bookings').insertMany(bookingsToInsert);
  console.log(`Successfully seeded ${result.insertedCount} real-time bookings into MongoDB!`);

  // Verify Rajesh jobs breakdown
  const rajeshJobs = await db.collection('bookings').find({ professional: proRajesh._id }).toArray();
  console.log('\n--- Rajesh Pro Dashboard Status in MongoDB ---');
  console.log(`Total Assigned Jobs: ${rajeshJobs.length}`);
  console.log(`Pending Action ('assigned'): ${rajeshJobs.filter((j) => j.status === 'assigned').length}`);
  console.log(`Active In-Progress ('accepted' | 'in-progress'): ${rajeshJobs.filter((j) => j.status === 'accepted' || j.status === 'in-progress').length}`);
  console.log(`Completed: ${rajeshJobs.filter((j) => j.status === 'completed').length}`);
  const rajeshEarnings = rajeshJobs.filter((j) => j.status === 'completed').reduce((sum, j) => sum + j.price, 0);
  console.log(`Total Completed Earnings: ₹${rajeshEarnings}`);

  process.exit(0);
}

seedBookings().catch((err) => {
  console.error('Seeding error:', err);
  process.exit(1);
});
