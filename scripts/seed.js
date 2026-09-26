import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Service from '../models/Service.js';
import Booking from '../models/Booking.js';

dotenv.config();

const usersSeed = [
  {
    name: 'MB Administrator',
    email: 'admin@mbservices.com',
    password: 'admin123',
    phone: '9988776655',
    role: 'admin',
  },
  {
    name: 'Rajesh Kumar (Cleaning Pro)',
    email: 'rajesh.pro@mbservices.com',
    password: 'pro123',
    phone: '9876543211',
    role: 'professional',
  },
  {
    name: 'Sunil Verma (Repair & Electrical Expert)',
    email: 'sunil.pro@mbservices.com',
    password: 'pro123',
    phone: '9876543212',
    role: 'professional',
  },
  {
    name: 'Deepak Sharma (Plumbing Specialist)',
    email: 'deepak.pro@mbservices.com',
    password: 'pro123',
    phone: '9876543213',
    role: 'professional',
  },
  {
    name: 'Chef Anand (Gourmet Cook)',
    email: 'chef.pro@mbservices.com',
    password: 'pro123',
    phone: '9876543214',
    role: 'professional',
  },
  {
    name: 'Bhargava (Customer)',
    email: 'bhargava@gmail.com',
    password: '123456',
    phone: '9876543210',
    role: 'customer',
  },
];

const servicesSeed = [
  // 1. COOKING & CHEF SERVICES
  {
    name: 'Daily Family Meal Prep & Cooking',
    description: 'Professional home cook for 3-course breakfast, lunch, or dinner preparation. Fresh, hygienic cooking customized to your dietary preferences.',
    price: 349,
    originalPrice: 499,
    image: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=800&q=80',
    category: 'cooking',
    subcategory: 'Daily Cook / Meal Prep',
    badge: 'Bestseller',
    rating: 4.88,
    reviewCount: 18200,
    duration: 60,
    shortDescription: 'Professional home cook for fresh 3-course daily family meals.',
    fullDescription: 'Professional home cook for 3-course breakfast, lunch, or dinner preparation. Fresh, hygienic cooking customized to your dietary preferences.',
    whatsIncluded: [
      'Fresh cooking in your home kitchen',
      'Customized spice & health preferences',
      'Post-cooking kitchen counter wipe',
    ],
    whatsExcluded: ['Grocery shopping (available upon request)'],
  },
  {
    name: 'Party & Event Private Master Chef',
    description: 'Exquisite multi-cuisine chef for birthday parties, family gatherings, and home events. Includes menu planning, live cooking & presentation.',
    price: 1499,
    originalPrice: 1999,
    image: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&w=800&q=80',
    category: 'cooking',
    subcategory: 'Party & Event Chef',
    badge: 'Top Rated',
    rating: 4.92,
    reviewCount: 6500,
    duration: 180,
    shortDescription: 'Multi-cuisine master chef for private home parties and family gatherings.',
    fullDescription: 'Exquisite multi-cuisine chef for birthday parties, family gatherings, and home events. Includes menu planning, live cooking & presentation.',
    whatsIncluded: [
      'Multi-course custom menu preparation',
      'Plating & live buffet presentation',
      'Chef helper & kitchen cleanup',
    ],
    whatsExcluded: ['Catering cutlery rental'],
  },
  {
    name: 'North & South Indian Speciality Cook',
    description: 'Authentic regional Indian delicacies prepared at your home kitchen. From rich butter chicken & paneer gravies to crispy dosas and sambar.',
    price: 599,
    originalPrice: 799,
    image: 'https://images.unsplash.com/photo-1610192244261-3f33de3f55e4?auto=format&fit=crop&w=800&q=80',
    category: 'cooking',
    subcategory: 'North & South Indian Speciality',
    badge: 'Popular',
    rating: 4.85,
    reviewCount: 12400,
    duration: 90,
    shortDescription: 'Authentic regional gravies, biryanis, dosas, and thali dishes.',
    fullDescription: 'Authentic regional Indian delicacies prepared at your home kitchen. From rich butter chicken & paneer gravies to crispy dosas and sambar.',
    whatsIncluded: ['Authentic regional spice blending', 'Gravies & bread/rice items'],
    whatsExcluded: ['Specialty clay oven setup'],
  },

  // 2. HOME CLEANING SERVICES
  {
    name: 'Intense Bathroom Deep Cleaning',
    description: 'Comprehensive deep cleaning of hard water stains, yellow tile grout, shower glasses, taps, and mirror. High-power eco-friendly solutions ensure zero chemical odor.',
    price: 499,
    originalPrice: 699,
    image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80',
    category: 'home-cleaning',
    subcategory: 'Bathroom Cleaning',
    badge: 'Bestseller',
    rating: 4.86,
    reviewCount: 42150,
    duration: 50,
    shortDescription: 'Deep scrubbing, descaling of tiles & fixtures, and sanitization.',
    fullDescription: 'Comprehensive deep cleaning of hard water stains, yellow tile grout, shower glasses, taps, and mirror. High-power eco-friendly solutions ensure zero chemical odor.',
    whatsIncluded: [
      'Tile scrubbing and yellow scale removal',
      'Descaling & polishing of taps & shower fixtures',
      'Mirror cleaning & streak-free glass polishing',
      'Toilet bowl and exhaust fan deep degreasing',
      'Hospital-grade sanitization finish',
    ],
    whatsExcluded: ['Removal of stubborn physical paint marks'],
  },
  {
    name: 'Full Home Deep Cleaning (2 BHK)',
    description: 'Every corner of your 2 BHK deep cleaned from ceiling fans to skirting boards. Includes mechanized scrubbing machines, heavy-duty vacuuming of upholstery, and sanitization.',
    price: 3499,
    originalPrice: 4499,
    image: 'https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?auto=format&fit=crop&w=800&q=80',
    category: 'home-cleaning',
    subcategory: 'Full Home Deep Cleaning',
    badge: 'Recommended',
    rating: 4.89,
    reviewCount: 18920,
    duration: 270,
    shortDescription: '3-person pro team with mechanized floor buffing and dry vacuuming.',
    fullDescription: 'Every corner of your 2 BHK deep cleaned from ceiling fans to skirting boards. Includes mechanized scrubbing machines, heavy-duty vacuuming of upholstery, and sanitization.',
    whatsIncluded: [
      'All bedrooms, living room, dining area & kitchen',
      'Mechanized floor scrubbing and buffing',
      'Dry vacuuming of sofas & mattresses',
    ],
    whatsExcluded: ['Interior cleaning of locked cupboards'],
  },
  {
    name: 'Modular Kitchen Deep Degreasing',
    description: 'Tough oil and grime deposits eliminated from backsplash tiles, gas burner stovetops, sink drains, and exterior kitchen trolley cabinets.',
    price: 1299,
    originalPrice: 1699,
    image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=800&q=80',
    category: 'home-cleaning',
    subcategory: 'Kitchen Degreasing',
    badge: 'Popular',
    rating: 4.82,
    reviewCount: 24300,
    duration: 120,
    shortDescription: 'Intense oil & grease removal from tiles, stove, countertop and cabinets.',
    fullDescription: 'Tough oil and grime deposits eliminated from backsplash tiles, gas burner stovetops, sink drains, and exterior kitchen trolley cabinets.',
    whatsIncluded: [
      'Countertop, sink & backsplash degreasing',
      'Gas stove, knobs & burner plate wash',
      'Exterior trolley cabinet wiping',
    ],
    whatsExcluded: ['Inside filled drawers without emptying'],
  },
  {
    name: 'Fabric Sofa Shampoo & Stain Treatment',
    description: 'Restore your fabric sofa to vibrant cleanliness. Powerful suction removes dirt, mite allergens, and stubborn beverage spills while keeping fabrics soft.',
    price: 699,
    originalPrice: 899,
    image: 'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&w=800&q=80',
    category: 'home-cleaning',
    subcategory: 'Sofa & Carpet Cleaning',
    badge: 'Special Offer',
    rating: 4.79,
    reviewCount: 15400,
    duration: 60,
    shortDescription: 'Injection-extraction shampooing for deep stain removal & deodorizing.',
    fullDescription: 'Restore your fabric sofa to vibrant cleanliness. Powerful suction removes dirt, mite allergens, and stubborn beverage spills while keeping fabrics soft.',
    whatsIncluded: [
      'Deep industrial vacuuming',
      'Fabric-safe foaming chemical scrub',
      'High-suction water extraction treatment',
    ],
    whatsExcluded: ['Leather polishing (available as separate pack)'],
  },

  // 3. REPAIRS & MAINTENANCE
  {
    name: 'AC Master Jet Service & Diagnostics',
    description: 'High-pressure jet pump coil washing, indoor blower cleaning, gas pressure inspection, and electrical check for maximum chilling efficiency.',
    price: 599,
    originalPrice: 849,
    image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=800&q=80',
    category: 'repairs',
    subcategory: 'AC Service & Repair',
    badge: 'Bestseller',
    rating: 4.91,
    reviewCount: 78500,
    duration: 45,
    shortDescription: 'High-pressure foam jet cleaning of indoor coils & outdoor unit check.',
    fullDescription: 'Intense 2x cooling restoration! High-pressure water jet technology dislodges deep mold and dust from cooling fins. Includes 360° gas pressure and electrical diagnostic.',
    whatsIncluded: [
      'Indoor unit disassembly and jet wash',
      'Air filter & blower wheel cleaning',
      'Gas pressure level measurement',
      '30-day cooling assurance warranty',
    ],
    whatsExcluded: ['Freon gas refill (charged separately)'],
  },
  {
    name: 'Electrician Visit & Minor Fixes',
    description: 'Certified electrician for fan regulator replacements, capacitor fixes, spark troubleshooting, and circuit breaker diagnostic testing.',
    price: 199,
    originalPrice: 299,
    image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80',
    category: 'repairs',
    subcategory: 'Electrical Wiring & Fixes',
    badge: '30-Min Arrival',
    rating: 4.84,
    reviewCount: 39400,
    duration: 30,
    shortDescription: 'Switchboard repair, tripping MCB, light fixture or ceiling fan fixing.',
    fullDescription: 'Government-certified technicians equipped with multimeters and safety gear. Prompt doorstep arrival to troubleshoot any power cuts, short circuits, or appliance wiring.',
    whatsIncluded: [
      'Wiring fault diagnosis',
      'Fixing up to 2 switchboards or 1 fan install',
      'Safety earthing test',
    ],
    whatsExcluded: ['Major internal wall conduit rewiring'],
  },
  {
    name: 'Water Purifier (RO) Service & Filter Check',
    description: 'Keep your drinking water 100% pure. Complete check of booster pump, RO membrane performance, auto-shutoff sensor, and electrical connections.',
    price: 349,
    originalPrice: 499,
    image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80',
    category: 'repairs',
    subcategory: 'Appliance Repair',
    badge: 'Popular',
    rating: 4.83,
    reviewCount: 21100,
    duration: 40,
    shortDescription: 'TDS testing, sediment filter flush, membrane inspection & leakage check.',
    fullDescription: 'Keep your drinking water 100% pure. Complete check of booster pump, RO membrane performance, auto-shutoff sensor, and electrical connections.',
    whatsIncluded: [
      'Digital TDS level reading',
      'Pre-filter and carbon chamber flush',
      'Booster pump pressure test',
    ],
    whatsExcluded: ['New RO filter cartridges (billed at MRP)'],
  },
  {
    name: 'Furniture & Door Lock Carpentry Visit',
    description: 'Precision carpentry for wardrobe sliding channels, hydraulic hinges, bed frame assembly, and door lock installations.',
    price: 249,
    originalPrice: 349,
    image: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=800&q=80',
    category: 'repairs',
    subcategory: 'Carpentry & Furniture',
    badge: 'Verified Pro',
    rating: 4.77,
    reviewCount: 12800,
    duration: 45,
    shortDescription: 'Door alignment, lock installation, hinge repair, or shelf assembly.',
    fullDescription: 'Skilled carpenters for quick repairs, squeaking doors, handle replacements, drawer slides adjustment, or flat-pack furniture mounting.',
    whatsIncluded: ['Up to 2 hinges or 1 door lock fix', 'Sagging door alignment'],
    whatsExcluded: ['Hardware materials (billed at actuals)'],
  },

  // 4. PLUMBING SOLUTIONS (EXPANDED URBAN COMPANY DATA)
  {
    name: 'Plumbing Inspection & Leakage Fix',
    description: 'Stop water wastage and damp walls. Expert plumbers inspect exposed and concealed piping, fix cracked PVC or copper connections, and seal joint threads.',
    price: 199,
    originalPrice: 299,
    image: 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?auto=format&fit=crop&w=800&q=80',
    category: 'plumbing',
    subcategory: 'Leak Detection & Pipe Repair',
    badge: 'Top Rated',
    rating: 4.88,
    reviewCount: 36200,
    duration: 35,
    shortDescription: 'Fast detection and fix for leaking joints, dripping pipes & valves.',
    fullDescription: 'Stop water wastage and damp walls. Expert plumbers inspect exposed and concealed piping, fix cracked PVC or copper connections, and seal joint threads with Teflon tape.',
    whatsIncluded: [
      'Water pressure and leak diagnostic',
      'Teflon tape thread sealing',
      'Washer or gasket change for minor drippings',
      '30-day post-service leakage warranty',
    ],
    whatsExcluded: ['Major wall demolition or excavation work'],
    addOns: [
      { id: 'addon-angle-valve', name: 'Angle Valve Replacement', price: 149, duration: 15 },
      { id: 'addon-connection-pipe', name: 'Braided Connection Pipe Install', price: 99, duration: 10 },
    ],
  },
  {
    name: 'Tap / Shower Mixer Repair & Installation',
    description: 'Restore steady water flow or upgrade to modern quarter-turn taps and thermostatic shower diverters with precision alignment and zero leakage.',
    price: 199,
    originalPrice: 299,
    image: 'https://images.unsplash.com/photo-1507652313519-d4e9174996dd?auto=format&fit=crop&w=800&q=80',
    category: 'plumbing',
    subcategory: 'Tap & Mixer Fixes',
    badge: 'Popular',
    rating: 4.85,
    reviewCount: 28900,
    duration: 30,
    shortDescription: 'Fix low water flow, spindle replacement, or install brand new taps.',
    fullDescription: 'Restore steady water flow or upgrade to modern quarter-turn taps and thermostatic shower diverters with precision alignment.',
    whatsIncluded: [
      'Faulty spindle or cartridge removal',
      'Aerator descaling to boost water flow',
      'Leak-proof sealing of tap or shower mixer',
    ],
    whatsExcluded: ['Cost of new tap or faucet hardware'],
    addOns: [
      { id: 'addon-overhead-shower', name: 'Overhead Rain Shower Fitting', price: 199, duration: 20 },
      { id: 'addon-health-faucet', name: 'Health Faucet (Jet Spray) Install', price: 149, duration: 15 },
    ],
  },
  {
    name: 'Severe Drain & Sink Unclogging',
    description: 'Get standing water flowing instantly! Uses professional drain snake augers and organic dissolving enzymes to clear hair, soap scum, and food grease.',
    price: 399,
    originalPrice: 599,
    image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80',
    category: 'plumbing',
    subcategory: 'Drain Unclogging',
    badge: 'Emergency Pro',
    rating: 4.87,
    reviewCount: 31400,
    duration: 40,
    shortDescription: 'Mechanized spiral cable clearing for kitchen sinks, bathrooms & traps.',
    fullDescription: 'Get standing water flowing instantly! Uses professional drain snake augers and organic dissolving enzymes to clear hair, soap scum, and food grease without pipe damage.',
    whatsIncluded: [
      'Rotary spring cable blockage removal up to 15 feet',
      'Trap dismantling, sludge wash & reassembly',
      'Flow testing & odor neutralization flush',
    ],
    whatsExcluded: ['Main municipal sewer pipe line blockages'],
    addOns: [
      { id: 'addon-anti-odor-valve', name: 'Anti-Odor Floor Drain Trap Install', price: 299, duration: 20 },
      { id: 'addon-grease-trap-clean', name: 'Kitchen Grease Trap Clean', price: 249, duration: 20 },
    ],
  },
  {
    name: 'Toilet Flush Tank & Commode Repair',
    description: 'Fix irritating flush leaks that spike water bills. Replacement of siphon valves, ball cocks, push buttons, or loose wall-hung commode brackets.',
    price: 299,
    originalPrice: 449,
    image: 'https://images.unsplash.com/photo-1620626011761-996317b8d101?auto=format&fit=crop&w=800&q=80',
    category: 'plumbing',
    subcategory: 'Toilet & Sanitaryware',
    badge: 'Essential',
    rating: 4.81,
    reviewCount: 19200,
    duration: 45,
    shortDescription: 'Continuous water running fix, flush siphon, float valve or seat cover.',
    fullDescription: 'Fix irritating flush leaks that spike water bills. Replacement of siphon valves, ball cocks, push buttons, or loose wall-hung commode brackets.',
    whatsIncluded: [
      'Flush cistern internal mechanism tuning',
      'Float valve adjustment & water fill calibration',
      'Base wax seal or silicone sealant touchup',
    ],
    whatsExcluded: ['New cistern body purchase'],
    addOns: [
      { id: 'addon-flush-siphon', name: 'Dual Flush Siphon Mechanism Fit', price: 249, duration: 20 },
      { id: 'addon-seat-cover', name: 'Soft-Close Seat Cover Install', price: 149, duration: 15 },
    ],
  },
  {
    name: 'Overhead Water Tank Deep Cleaning (1000L)',
    description: 'High-pressure mechanized cleaning of rooftop plastic or concrete water tanks. Removes algae, mud sludge, bacteria, and sanitizes tank walls with UV treatment.',
    price: 799,
    originalPrice: 1199,
    image: 'https://images.unsplash.com/photo-1541888946425-d0fbb186a5b7?auto=format&fit=crop&w=800&q=80',
    category: 'plumbing',
    subcategory: 'Water Tank Cleaning',
    badge: 'Hygiene Special',
    rating: 4.90,
    reviewCount: 14200,
    duration: 90,
    shortDescription: 'Mechanized sludge extraction, high-pressure jet wash & anti-bacterial spray.',
    fullDescription: 'Ensure 100% clean water supply for your home. 6-stage mechanized cleaning process includes dewatering, sludge vacuuming, pressure jet washing, and anti-bacterial spray.',
    whatsIncluded: [
      'Mechanized dewatering pump extraction',
      'Sludge and sediment removal from bottom',
      'High-pressure water jet wall scrubbing',
      'Anti-bacterial & UV spray sanitization',
    ],
    whatsExcluded: ['Tank structural crack repair or plastering'],
    addOns: [
      { id: 'addon-sump-clean', name: 'Underground Water Sump Clean (2000L)', price: 999, duration: 120 },
    ],
  },
  {
    name: 'Wash Basin Installation & Waste Pipe Fitting',
    description: 'Professional mounting of pedestal or counter wash basins, bottle trap fitting, and replacement of leaking flexible waste pipes with heavy-duty PVC fittings.',
    price: 249,
    originalPrice: 399,
    image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80',
    category: 'plumbing',
    subcategory: 'Basin & Waste Pipe',
    badge: 'Popular',
    rating: 4.84,
    reviewCount: 16800,
    duration: 40,
    shortDescription: 'Basin mounting, waste coupling, bottle trap & flexible pipe replacement.',
    fullDescription: 'Fix water pooling under wash basins. Clean installation of waste coupling, anti-clog bottle traps, and leak-proof sealing with silicone sealant.',
    whatsIncluded: [
      'Old waste pipe removal & new pipe installation',
      'Bottle trap fitting & alignment',
      'Silicone sealant waterproofing at basin joints',
    ],
    whatsExcluded: ['Cost of ceramic wash basin or marble countertop cutting'],
  },
  {
    name: 'Water Heater / Geyser Service & Installation',
    description: 'Complete inspection and installation of instant or storage electric geysers. Includes heating element descaling, thermostat check, and inlet/outlet pipe fitting.',
    price: 399,
    originalPrice: 599,
    image: 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?auto=format&fit=crop&w=800&q=80',
    category: 'plumbing',
    subcategory: 'Geyser & Water Heater',
    badge: 'Expert Choice',
    rating: 4.89,
    reviewCount: 22100,
    duration: 50,
    shortDescription: 'Geyser wall mounting, pipe connection, descaling & heating coil check.',
    fullDescription: 'Stay safe with expert geyser installation and servicing. Check pressure relief valve, flush hard water scale from heating rod, and verify earth grounding connection.',
    whatsIncluded: [
      'Wall mounting with heavy-duty anchor bolts',
      'Inlet/outlet connection pipe fitting',
      'Thermostat & safety valve testing',
    ],
    whatsExcluded: ['New geyser appliance purchase'],
  },
  {
    name: 'Health Faucet (Jet Spray) Repair & Fitting',
    description: 'Quick fixing of leaking toilet jet sprays, cracked flexible hoses, or installation of new premium stainless steel health faucets.',
    price: 149,
    originalPrice: 249,
    image: 'https://images.unsplash.com/photo-1507652313519-d4e9174996dd?auto=format&fit=crop&w=800&q=80',
    category: 'plumbing',
    subcategory: 'Tap & Mixer Fixes',
    badge: 'Express 20-min',
    rating: 4.82,
    reviewCount: 25400,
    duration: 25,
    shortDescription: 'Fix leaking jet spray, trigger hook, or install new health faucet hose.',
    fullDescription: 'Fix leaking toilet jet sprays, cracked flexible hoses, or installation of new premium stainless steel health faucets.',
    whatsIncluded: [
      'Jet spray nozzle & trigger inspection',
      'Flexible hose connection & washer fit',
      'Wall hook mounting',
    ],
    whatsExcluded: ['Cost of new health faucet hardware kit'],
  },
];

const seedDatabase = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/mb_services';
    await mongoose.connect(mongoUri);
    console.log(`[Seed] Connected to MongoDB at ${mongoUri}`);

    console.log('[Seed] Seeding users...');
    const userDocs = {};
    for (const u of usersSeed) {
      let existing = await User.findOne({ email: u.email });
      if (!existing) {
        existing = await User.create(u);
        console.log(`  + Created user: ${u.email} (${u.role})`);
      } else {
        existing.password = u.password;
        await existing.save();
        console.log(`  = User password updated for: ${u.email}`);
      }
      userDocs[u.role] = existing;
    }

    console.log('[Seed] Seeding services...');
    await Service.deleteMany({});
    const insertedServices = await Service.insertMany(servicesSeed);
    console.log(`  + Seeded ${insertedServices.length} MongoDB services.`);

    // Seed initial bookings
    console.log('[Seed] Seeding initial bookings in MongoDB...');
    await Booking.deleteMany({});

    const customerUser = await User.findOne({ email: 'bhargava@gmail.com' });
    const proUser = await User.findOne({ email: 'rajesh.pro@mbservices.com' });
    const acProUser = await User.findOne({ email: 'sunil.pro@mbservices.com' });

    if (customerUser && insertedServices.length > 0) {
      await Booking.create([
        {
          customer: customerUser._id,
          professional: proUser?._id || null,
          service: insertedServices[0]._id, // Daily Cook / Bathroom
          date: new Date(Date.now() + 86400000),
          timeSlot: '10:00 AM - 11:30 AM',
          address: {
            title: 'Home',
            fullAddress: 'Flat 402, Oakwood Greens, 100 Feet Road, Indiranagar, Bengaluru - 560038',
            phone: '+91 98765 43210',
          },
          price: insertedServices[0].price,
          status: 'assigned',
        },
        {
          customer: customerUser._id,
          professional: acProUser?._id || null,
          service: insertedServices[insertedServices.length - 1]._id,
          date: new Date(Date.now() - 172800000),
          timeSlot: '02:00 PM - 03:30 PM',
          address: {
            title: 'Home',
            fullAddress: 'Flat 402, Oakwood Greens, 100 Feet Road, Indiranagar, Bengaluru - 560038',
            phone: '+91 98765 43210',
          },
          price: insertedServices[insertedServices.length - 1].price,
          status: 'completed',
        },
      ]);
      console.log('  + Seeded initial MongoDB bookings.');
    }

    console.log('[Seed] Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('[Seed Error]', error);
    process.exit(1);
  }
};

seedDatabase();
