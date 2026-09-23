async function testProJobs() {
  const loginRes = await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'rajesh.pro@mbservices.com', password: 'pro123' }),
  });
  const loginData = await loginRes.json();
  const token = loginData.data?.token || loginData.token;
  console.log('Login success:', loginData.data?.user?.name);

  const jobsRes = await fetch('http://localhost:5000/api/bookings/my-jobs', {
    headers: { Authorization: `Bearer ${token}` },
  });
  const jobsData = await jobsRes.json();
  const jobs = jobsData.data || jobsData;
  console.log('Jobs returned count:', jobs.length);
  jobs.forEach((j) => {
    console.log(
      `Job ID: ${j._id} | Service: ${j.service?.name} | Status: ${j.status} | Customer: ${j.customer?.name} | ₹${j.price}`
    );
  });
}

testProJobs().catch(console.error);
