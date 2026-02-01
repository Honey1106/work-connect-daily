/* eslint-disable no-console */

const API_BASE = process.env.API_BASE || 'http://localhost:5000/api';

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function httpJson(method, url, body, token) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { raw: text };
  }

  if (!res.ok) {
    const message = data?.message || res.statusText || 'Request failed';
    const err = new Error(`${method} ${url} -> ${res.status}: ${message}`);
    err.status = res.status;
    err.data = data;
    throw err;
  }

  return data;
}

function rand6() {
  return Math.floor(100000 + Math.random() * 900000);
}

async function main() {
  // Check health first
  await httpJson('GET', `${API_BASE}/health`);

  const rand = rand6();
  const seekerPhone = `902${rand}`;
  const providerPhone = `802${rand}`;

  const seekerReg = await httpJson('POST', `${API_BASE}/auth/register`, {
    name: `Seeker ${rand}`,
    phone: seekerPhone,
    password: 'pass1234',
    role: 'seeker',
  });

  const providerReg = await httpJson('POST', `${API_BASE}/auth/register`, {
    name: `Provider ${rand}`,
    phone: providerPhone,
    password: 'pass1234',
    role: 'provider',
  });

  const seekerToken = seekerReg.token;
  const providerToken = providerReg.token;
  const seekerId = seekerReg.user.id;

  await httpJson(
    'POST',
    `${API_BASE}/seeker/profile`,
    {
      workTypes: ['Construction', 'Painting'],
      expectedWage: 900,
      hoursAvailability: 'Full day',
      customHours: '',
      availableDays: ['Today', 'Weekdays'],
      location: 'Hyderabad',
      experience: '1-3 years',
    },
    seekerToken
  );

  await httpJson(
    'POST',
    `${API_BASE}/provider/profile`,
    {
      workType: 'Construction',
      budgetPerDay: 1000,
      workersNeeded: 1,
      workingHours: 'Full day',
      customHours: '',
      location: 'Hyderabad',
      workStartTime: '09:00',
    },
    providerToken
  );

  const search = await httpJson(
    'GET',
    `${API_BASE}/provider/seekers?workType=Construction&maxBudget=1000&location=Hyder`,
    undefined,
    providerToken
  );

  const send = await httpJson(
    'POST',
    `${API_BASE}/provider/send-request`,
    { seekerId, message: 'Job offer from employer' },
    providerToken
  );

  await sleep(150);

  const offersBefore = await httpJson(
    'GET',
    `${API_BASE}/seeker/job-requests`,
    undefined,
    seekerToken
  );

  const offerId = offersBefore.requests?.[0]?.id;
  if (!offerId) throw new Error('No offer found after sending request');

  const respond = await httpJson(
    'POST',
    `${API_BASE}/seeker/respond-request`,
    { requestId: offerId, status: 'accepted' },
    seekerToken
  );

  const offersAfter = await httpJson(
    'GET',
    `${API_BASE}/seeker/job-requests`,
    undefined,
    seekerToken
  );

  const latestStatus = offersAfter.requests?.[0]?.status;

  const out = {
    ok: true,
    apiBase: API_BASE,
    seekerPhone,
    providerPhone,
    seekersFound: Array.isArray(search.seekers) ? search.seekers.length : 0,
    sendMessage: send.message,
    offerCount: Array.isArray(offersBefore.requests) ? offersBefore.requests.length : 0,
    respondMessage: respond.message,
    latestStatus,
  };

  console.log(JSON.stringify(out));
}

main().catch((err) => {
  const out = {
    ok: false,
    apiBase: API_BASE,
    error: err.message,
    status: err.status,
    data: err.data,
  };

  console.error(JSON.stringify(out));
  process.exit(1);
});
