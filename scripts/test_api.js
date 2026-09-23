// Automated verification of MB Services Endpoints
const BASE = 'http://localhost:5000';

async function runTests() {
  console.log('=== Starting MB Services Automated Backend Verification ===\n');

  try {
    // 1. Root Endpoint
    console.log('[Test 1] Testing Root Endpoint GET /');
    const rootRes = await fetch(`${BASE}/`);
    const rootData = await rootRes.json();
    console.log('  Root response:', rootData);
    if (rootData.message !== 'MB Services API is running') {
      throw new Error('Root endpoint message mismatch');
    }
    console.log('  PASSED\n');

    // 2. Customer Registration
    console.log('[Test 2] Testing Customer Registration POST /api/auth/register');
    const testEmail = `testuser_${Date.now()}@example.com`;
    const regRes = await fetch(`${BASE}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test Customer',
        email: testEmail,
        password: 'password123',
        phone: '9876500000',
      }),
    });
    const regData = await regRes.json();
    console.log('  Register status:', regRes.status, 'Success:', regData.success);
    if (!regData.success || !regData.data.token) {
      throw new Error('Customer registration failed');
    }
    const customerToken = regData.data.token;
    const customerId = regData.data.user.id;
    console.log('  PASSED\n');

    // 3. Login Admin, Professional, Customer
    console.log('[Test 3] Testing Login for all 3 roles');
    const adminLoginRes = await fetch(`${BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@mbservices.com', password: 'admin123' }),
    });
    const adminLoginData = await adminLoginRes.json();
    if (!adminLoginData.success || adminLoginData.data.user.role !== 'admin') {
      throw new Error('Admin login failed');
    }
    const adminToken = adminLoginData.data.token;
    console.log('  Admin login: SUCCESS');

    const proLoginRes = await fetch(`${BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'rajesh.pro@mbservices.com', password: 'pro123' }),
    });
    const proLoginData = await proLoginRes.json();
    if (!proLoginData.success || proLoginData.data.user.role !== 'professional') {
      throw new Error('Professional login failed');
    }
    const proToken = proLoginData.data.token;
    const proId = proLoginData.data.user.id;
    console.log('  Professional login: SUCCESS');

    const custLoginRes = await fetch(`${BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'bhargava@gmail.com', password: '123456' }),
    });
    const custLoginData = await custLoginRes.json();
    if (!custLoginData.success || custLoginData.data.user.role !== 'customer') {
      throw new Error('Customer login failed');
    }
    const demoCustomerToken = custLoginData.data.token;
    console.log('  Customer login: SUCCESS');
    console.log('  PASSED\n');

    // 4. Services API
    console.log('[Test 4] Testing GET /api/services');
    const servicesRes = await fetch(`${BASE}/api/services`);
    const servicesData = await servicesRes.json();
    if (!servicesData.success || !Array.isArray(servicesData.data) || servicesData.data.length === 0) {
      throw new Error('Failed to fetch services');
    }
    console.log(`  Fetched ${servicesData.data.length} services`);
    const testService = servicesData.data[0];
    console.log(`  Sample service: "${testService.name}" - ₹${testService.price}`);
    console.log('  PASSED\n');

    // 5. Role authorization check (Customer attempting to call Admin API -> 403)
    console.log('[Test 5] Testing Role Authorization Security (Customer calling /api/admin/bookings)');
    const authForbiddenRes = await fetch(`${BASE}/api/admin/bookings`, {
      headers: { Authorization: `Bearer ${customerToken}` },
    });
    console.log('  Customer -> Admin endpoint status:', authForbiddenRes.status);
    if (authForbiddenRes.status !== 403) {
      throw new Error(`Expected 403 Forbidden, got ${authForbiddenRes.status}`);
    }
    console.log('  PASSED (Security enforced)\n');

    // 6. Customer creates a booking (Status: pending)
    console.log('[Test 6] Testing Customer creating a booking POST /api/bookings');
    const bookingRes = await fetch(`${BASE}/api/bookings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customerToken}`,
      },
      body: JSON.stringify({
        service: testService._id,
        date: '2026-09-25',
        timeSlot: '10:00 AM - 12:00 PM',
        address: 'Vijayawada, Flat 101, Green Meadows',
      }),
    });
    const bookingData = await bookingRes.json();
    console.log('  Booking creation status:', bookingRes.status, 'Status:', bookingData.data?.status);
    if (!bookingData.success || bookingData.data.status !== 'pending') {
      throw new Error('Booking creation failed or status is not pending');
    }
    const bookingId = bookingData.data._id;
    console.log(`  Booking ID created: ${bookingId} with price: ₹${bookingData.data.price}`);
    console.log('  PASSED\n');

    // 7. Admin views all bookings & assigns professional (Status: pending -> assigned)
    console.log('[Test 7] Testing Admin assigns professional PUT /api/admin/bookings/:id/assign');
    const assignRes = await fetch(`${BASE}/api/admin/bookings/${bookingId}/assign`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ professionalId: proId }),
    });
    const assignData = await assignRes.json();
    console.log('  Assign status:', assignRes.status, 'New status:', assignData.data?.status);
    if (!assignData.success || assignData.data.status !== 'assigned') {
      throw new Error('Professional assignment failed');
    }
    console.log('  PASSED\n');

    // 8. Professional views assigned jobs
    console.log('[Test 8] Testing Professional GET /api/bookings/my-jobs');
    const jobsRes = await fetch(`${BASE}/api/bookings/my-jobs`, {
      headers: { Authorization: `Bearer ${proToken}` },
    });
    const jobsData = await jobsRes.json();
    console.log('  My jobs count:', jobsData.data?.length);
    const foundJob = jobsData.data?.find((j) => j._id === bookingId);
    if (!foundJob) {
      throw new Error('Assigned booking not found in professional jobs');
    }
    console.log('  PASSED\n');

    // 9. Professional accepts job (Status: assigned -> accepted)
    console.log('[Test 9] Testing Professional accepts job PUT /api/bookings/:id/status (assigned -> accepted)');
    const acceptRes = await fetch(`${BASE}/api/bookings/${bookingId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${proToken}`,
      },
      body: JSON.stringify({ status: 'accepted' }),
    });
    const acceptData = await acceptRes.json();
    if (!acceptData.success || acceptData.data.status !== 'accepted') {
      throw new Error('Failed to accept job');
    }
    console.log('  Job status now:', acceptData.data.status);
    console.log('  PASSED\n');

    // 10. Professional starts job (Status: accepted -> in-progress)
    console.log('[Test 10] Testing Professional starts job (accepted -> in-progress)');
    const startRes = await fetch(`${BASE}/api/bookings/${bookingId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${proToken}`,
      },
      body: JSON.stringify({ status: 'in-progress' }),
    });
    const startData = await startRes.json();
    if (!startData.success || startData.data.status !== 'in-progress') {
      throw new Error('Failed to start job');
    }
    console.log('  Job status now:', startData.data.status);
    console.log('  PASSED\n');

    // 11. Professional completes job (Status: in-progress -> completed)
    console.log('[Test 11] Testing Professional completes job (in-progress -> completed)');
    const completeRes = await fetch(`${BASE}/api/bookings/${bookingId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${proToken}`,
      },
      body: JSON.stringify({ status: 'completed' }),
    });
    const completeData = await completeRes.json();
    if (!completeData.success || completeData.data.status !== 'completed') {
      throw new Error('Failed to complete job');
    }
    console.log('  Job status now:', completeData.data.status);
    console.log('  PASSED\n');

    // 12. Customer checks their booking status
    console.log('[Test 12] Customer verifies booking status is completed GET /api/bookings/:id');
    const custCheckRes = await fetch(`${BASE}/api/bookings/${bookingId}`, {
      headers: { Authorization: `Bearer ${customerToken}` },
    });
    const custCheckData = await custCheckRes.json();
    console.log('  Customer retrieved booking status:', custCheckData.data?.status);
    if (custCheckData.data?.status !== 'completed') {
      throw new Error('Customer booking does not reflect completed status');
    }
    console.log('  PASSED\n');

    // 13. Customer cancellation check (create a new pending booking and cancel it)
    console.log('[Test 13] Testing Customer cancellation of pending booking (pending -> cancelled)');
    const b2Res = await fetch(`${BASE}/api/bookings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customerToken}`,
      },
      body: JSON.stringify({
        service: testService._id,
        date: '2026-09-28',
        timeSlot: '02:30 PM - 04:00 PM',
        address: 'Vijayawada, Test Colony',
      }),
    });
    const b2Data = await b2Res.json();
    const b2Id = b2Data.data._id;

    const cancelRes = await fetch(`${BASE}/api/bookings/${b2Id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customerToken}`,
      },
      body: JSON.stringify({ status: 'cancelled' }),
    });
    const cancelData = await cancelRes.json();
    if (!cancelData.success || cancelData.data.status !== 'cancelled') {
      throw new Error('Cancellation failed');
    }
    console.log('  Cancelled booking status:', cancelData.data.status);
    console.log('  PASSED\n');

    console.log('=====================================================');
    console.log('🎉 ALL BACKEND TESTS PASSED SUCCESSFULLY! (Phases 2-8 COMPLETE)');
    console.log('=====================================================');
  } catch (err) {
    console.error('\n❌ TEST FAILED:', err.message);
    process.exit(1);
  }
}

runTests();
