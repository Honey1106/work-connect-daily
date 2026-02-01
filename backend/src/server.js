require('dotenv').config();

const path = require('path');
const crypto = require('crypto');
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');

const { openDb, initDb } = require('./db');
const { signToken, authRequired, requireRole } = require('./auth');

const PORT = Number(process.env.PORT || 5000);

function normalizePhone(phone) {
  return String(phone || '').trim();
}

function getOtpTtlSeconds() {
  const v = Number(process.env.OTP_TTL_SECONDS || 300);
  return Number.isFinite(v) && v > 30 ? Math.trunc(v) : 300;
}

function otpDevReturnCodeEnabled() {
  const v = String(process.env.OTP_DEV_RETURN_CODE || '').trim().toLowerCase();
  return v === 'true' || v === '1' || v === 'yes';
}

function toIntOrNull(value) {
  if (value === undefined || value === null || value === '') return null;
  const n = Number(value);
  return Number.isFinite(n) ? Math.trunc(n) : null;
}

function safeJsonParseArray(text) {
  try {
    const val = JSON.parse(text);
    return Array.isArray(val) ? val : [];
  } catch {
    return [];
  }
}

async function main() {
  const db = await openDb();
  await initDb(db);

  const app = express();

  app.use(cors({ origin: '*', methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'], allowedHeaders: ['Content-Type','Authorization'] }));
  app.use(express.json({ limit: '1mb' }));

  // Serve the frontend single-page app
  const frontendIndex = path.resolve(__dirname, '..', '..', 'index.html');
  app.get('/', (req, res) => res.sendFile(frontendIndex));
  app.get('/index.html', (req, res) => res.sendFile(frontendIndex));

  app.get('/api/health', (req, res) => res.json({ ok: true }));

  // ------------------------------
  // CALL LOGS (optional)
  // ------------------------------
  app.post('/api/calls/log', authRequired, async (req, res) => {
    try {
      const toUserId = toIntOrNull(req.body?.toUserId);
      const toPhone = String(req.body?.toPhone || '').trim();
      const context = String(req.body?.context || '').trim();

      await db.run(
        `INSERT INTO call_logs (from_user_id, to_user_id, to_phone, context)
         VALUES (?, ?, ?, ?)`,
        [req.auth.userId, toUserId, toPhone || null, context || null]
      );

      return res.json({ message: 'Call logged' });
    } catch (err) {
      console.error('call log error', err);
      return res.status(500).json({ message: 'Server error' });
    }
  });

  // ------------------------------
  // AUTH
  // ------------------------------
  app.post('/api/auth/send-otp', async (req, res) => {
    try {
      const phone = normalizePhone(req.body?.phone);
      if (!phone) return res.status(400).json({ message: 'Phone is required' });

      // Only for existing users (password registration remains supported)
      const user = await db.get('SELECT id FROM users WHERE phone = ?', [phone]);

      // Rate limit: if OTP sent in last 30 seconds, don't spam
      const recent = await db.get(
        `SELECT id
         FROM otp_codes
         WHERE phone = ?
           AND consumed_at IS NULL
           AND datetime(created_at) > datetime('now', '-30 seconds')
         ORDER BY id DESC
         LIMIT 1`,
        [phone]
      );

      if (recent) {
        return res.json({ message: 'OTP already sent. Please wait.' });
      }

      // If phone isn't registered, respond generically (avoid enumeration)
      if (!user) {
        return res.json({ message: 'If the phone is registered, OTP has been sent.' });
      }

      const code = String(crypto.randomInt(100000, 1000000));
      const codeHash = await bcrypt.hash(code, 10);
      const ttl = getOtpTtlSeconds();

      await db.run(
        `INSERT INTO otp_codes (phone, code_hash, purpose, expires_at)
         VALUES (?, ?, 'login', datetime('now', ?))`,
        [phone, codeHash, `+${ttl} seconds`]
      );

      const payload = { message: 'OTP sent' };
      if (otpDevReturnCodeEnabled()) payload.devOtp = code;
      return res.json(payload);
    } catch (err) {
      console.error('send-otp error', err);
      return res.status(500).json({ message: 'Server error' });
    }
  });

  app.post('/api/auth/verify-otp', async (req, res) => {
    try {
      const phone = normalizePhone(req.body?.phone);
      const code = String(req.body?.code || '').trim();
      if (!phone) return res.status(400).json({ message: 'Phone is required' });
      if (!code) return res.status(400).json({ message: 'Code is required' });

      const otp = await db.get(
        `SELECT id, phone, code_hash, attempts, expires_at, consumed_at
         FROM otp_codes
         WHERE phone = ?
           AND purpose = 'login'
           AND consumed_at IS NULL
           AND datetime(expires_at) > datetime('now')
         ORDER BY id DESC
         LIMIT 1`,
        [phone]
      );

      if (!otp) return res.status(401).json({ message: 'Invalid or expired OTP' });
      if ((otp.attempts ?? 0) >= 5) return res.status(429).json({ message: 'Too many attempts. Request a new OTP.' });

      const match = await bcrypt.compare(code, otp.code_hash);
      await db.run(
        `UPDATE otp_codes
         SET attempts = attempts + 1
         WHERE id = ?`,
        [otp.id]
      );

      if (!match) return res.status(401).json({ message: 'Invalid or expired OTP' });

      await db.run(
        `UPDATE otp_codes
         SET consumed_at = datetime('now')
         WHERE id = ?`,
        [otp.id]
      );

      const userRow = await db.get('SELECT id, name, phone, role FROM users WHERE phone = ?', [phone]);
      if (!userRow) return res.status(401).json({ message: 'User not found. Please register first.' });

      const userOut = { id: userRow.id, name: userRow.name, phone: userRow.phone, role: userRow.role };
      const token = signToken(userOut);
      return res.json({ token, user: userOut });
    } catch (err) {
      console.error('verify-otp error', err);
      return res.status(500).json({ message: 'Server error' });
    }
  });

  app.post('/api/auth/register', async (req, res) => {
    try {
      const name = String(req.body?.name || '').trim();
      const phone = normalizePhone(req.body?.phone);
      const password = String(req.body?.password || '');
      const role = String(req.body?.role || '').trim();

      if (!name) return res.status(400).json({ message: 'Name is required' });
      if (!phone) return res.status(400).json({ message: 'Phone is required' });
      if (!password || password.length < 4) return res.status(400).json({ message: 'Password must be at least 4 characters' });
      if (!['seeker', 'provider'].includes(role)) return res.status(400).json({ message: 'Role must be seeker or provider' });

      const existing = await db.get('SELECT id FROM users WHERE phone = ?', [phone]);
      if (existing) return res.status(409).json({ message: 'Phone already registered' });

      const passwordHash = await bcrypt.hash(password, 10);
      const result = await db.run(
        'INSERT INTO users (name, phone, password_hash, role) VALUES (?, ?, ?, ?)',
        [name, phone, passwordHash, role]
      );

      const user = { id: result.lastID, name, phone, role };
      const token = signToken(user);
      return res.json({ token, user });
    } catch (err) {
      console.error('register error', err);
      return res.status(500).json({ message: 'Server error' });
    }
  });

  app.post('/api/auth/login', async (req, res) => {
    try {
      const phone = normalizePhone(req.body?.phone);
      const password = String(req.body?.password || '');
      if (!phone || !password) return res.status(400).json({ message: 'Phone and password required' });

      const userRow = await db.get('SELECT id, name, phone, password_hash, role FROM users WHERE phone = ?', [phone]);
      if (!userRow) return res.status(401).json({ message: 'Invalid credentials' });

      const ok = await bcrypt.compare(password, userRow.password_hash);
      if (!ok) return res.status(401).json({ message: 'Invalid credentials' });

      const user = { id: userRow.id, name: userRow.name, phone: userRow.phone, role: userRow.role };
      const token = signToken(user);
      return res.json({ token, user });
    } catch (err) {
      console.error('login error', err);
      return res.status(500).json({ message: 'Server error' });
    }
  });

  // ------------------------------
  // SEEKER
  // ------------------------------
  app.get('/api/seeker/profile', authRequired, requireRole('seeker'), async (req, res) => {
    try {
      const row = await db.get('SELECT * FROM seeker_profiles WHERE user_id = ?', [req.auth.userId]);
      if (!row) return res.json({});

      return res.json({
        workTypes: safeJsonParseArray(row.work_types_json),
        expectedWage: row.expected_wage ?? '',
        hoursAvailability: row.hours_availability ?? 'Full day',
        customHours: row.custom_hours ?? '',
        availableDays: safeJsonParseArray(row.available_days_json),
        location: row.location ?? '',
        experience: row.experience ?? ''
      });
    } catch (err) {
      console.error('get seeker profile error', err);
      return res.status(500).json({ message: 'Server error' });
    }
  });

  app.post('/api/seeker/profile', authRequired, requireRole('seeker'), async (req, res) => {
    try {
      const workTypes = Array.isArray(req.body?.workTypes) ? req.body.workTypes : [];
      const expectedWage = toIntOrNull(req.body?.expectedWage);
      const hoursAvailability = String(req.body?.hoursAvailability || '');
      const customHours = String(req.body?.customHours || '');
      const availableDays = Array.isArray(req.body?.availableDays) ? req.body.availableDays : [];
      const location = String(req.body?.location || '').trim();
      const experience = String(req.body?.experience || '');

      if (!location) return res.status(400).json({ message: 'Location is required' });
      if (expectedWage === null) return res.status(400).json({ message: 'Expected wage is required' });

      const existing = await db.get('SELECT id FROM seeker_profiles WHERE user_id = ?', [req.auth.userId]);
      if (existing) {
        await db.run(
          `UPDATE seeker_profiles
           SET work_types_json = ?, expected_wage = ?, hours_availability = ?, custom_hours = ?, available_days_json = ?, location = ?, experience = ?, updated_at = datetime('now')
           WHERE user_id = ?`,
          [JSON.stringify(workTypes), expectedWage, hoursAvailability, customHours, JSON.stringify(availableDays), location, experience, req.auth.userId]
        );
      } else {
        await db.run(
          `INSERT INTO seeker_profiles (user_id, work_types_json, expected_wage, hours_availability, custom_hours, available_days_json, location, experience, rating)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, NULL)`,
          [req.auth.userId, JSON.stringify(workTypes), expectedWage, hoursAvailability, customHours, JSON.stringify(availableDays), location, experience]
        );
      }

      return res.json({ message: 'Profile saved' });
    } catch (err) {
      console.error('save seeker profile error', err);
      return res.status(500).json({ message: 'Server error' });
    }
  });

  app.get('/api/seeker/job-requests', authRequired, requireRole('seeker'), async (req, res) => {
    try {
      const rows = await db.all(
        `SELECT id, provider_name, provider_phone, status, message, work_type, budget_per_day, location, working_hours, work_start_time, created_at
         FROM job_requests
         WHERE seeker_id = ?
         ORDER BY id DESC`,
        [req.auth.userId]
      );

      const requests = rows.map(r => ({
        id: r.id,
        provider_name: r.provider_name,
        provider_phone: r.provider_phone,
        status: r.status,
        message: r.message,
        work_type: r.work_type,
        budget_per_day: r.budget_per_day,
        location: r.location,
        working_hours: r.working_hours,
        work_start_time: r.work_start_time,
        created_at: r.created_at
      }));

      return res.json({ requests });
    } catch (err) {
      console.error('get job requests error', err);
      return res.status(500).json({ message: 'Server error' });
    }
  });

  app.post('/api/seeker/respond-request', authRequired, requireRole('seeker'), async (req, res) => {
    try {
      const requestId = toIntOrNull(req.body?.requestId);
      const status = String(req.body?.status || '').trim();
      if (!requestId) return res.status(400).json({ message: 'requestId is required' });
      if (!['accepted', 'rejected'].includes(status)) return res.status(400).json({ message: 'status must be accepted or rejected' });

      const row = await db.get('SELECT id, seeker_id, status FROM job_requests WHERE id = ?', [requestId]);
      if (!row) return res.status(404).json({ message: 'Request not found' });
      if (row.seeker_id !== req.auth.userId) return res.status(403).json({ message: 'Forbidden' });
      if (row.status !== 'pending') return res.status(400).json({ message: 'Request already responded' });

      await db.run(
        "UPDATE job_requests SET status = ?, updated_at = datetime('now') WHERE id = ?",
        [status, requestId]
      );

      return res.json({ message: status === 'accepted' ? 'Offer accepted' : 'Offer rejected' });
    } catch (err) {
      console.error('respond request error', err);
      return res.status(500).json({ message: 'Server error' });
    }
  });

  // ------------------------------
  // PROVIDER
  // ------------------------------
  app.post('/api/provider/profile', authRequired, requireRole('provider'), async (req, res) => {
    try {
      const workType = String(req.body?.workType || '').trim();
      const budgetPerDay = toIntOrNull(req.body?.budgetPerDay);
      const workersNeeded = toIntOrNull(req.body?.workersNeeded) ?? 1;
      const workingHours = String(req.body?.workingHours || '');
      const customHours = String(req.body?.customHours || '');
      const location = String(req.body?.location || '').trim();
      const workStartTime = String(req.body?.workStartTime || '');

      if (!workType) return res.status(400).json({ message: 'workType is required' });
      if (budgetPerDay === null) return res.status(400).json({ message: 'budgetPerDay is required' });
      if (!location) return res.status(400).json({ message: 'location is required' });

      const existing = await db.get('SELECT id FROM provider_profiles WHERE user_id = ?', [req.auth.userId]);
      if (existing) {
        await db.run(
          `UPDATE provider_profiles
           SET work_type = ?, budget_per_day = ?, workers_needed = ?, working_hours = ?, custom_hours = ?, location = ?, work_start_time = ?, updated_at = datetime('now')
           WHERE user_id = ?`,
          [workType, budgetPerDay, workersNeeded, workingHours, customHours, location, workStartTime, req.auth.userId]
        );
      } else {
        await db.run(
          `INSERT INTO provider_profiles (user_id, work_type, budget_per_day, workers_needed, working_hours, custom_hours, location, work_start_time)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [req.auth.userId, workType, budgetPerDay, workersNeeded, workingHours, customHours, location, workStartTime]
        );
      }

      return res.json({ message: 'Profile saved' });
    } catch (err) {
      console.error('save provider profile error', err);
      return res.status(500).json({ message: 'Server error' });
    }
  });

  app.get('/api/provider/seekers', authRequired, requireRole('provider'), async (req, res) => {
    try {
      const workType = String(req.query?.workType || '').trim();
      const maxBudget = toIntOrNull(req.query?.maxBudget);
      const location = String(req.query?.location || '').trim().toLowerCase();

      const rows = await db.all(
        `SELECT sp.id AS profile_id, sp.work_types_json, sp.expected_wage, sp.hours_availability, sp.location, sp.experience, sp.rating,
                u.id AS user_id, u.name AS user_name, u.phone AS user_phone
         FROM seeker_profiles sp
         JOIN users u ON u.id = sp.user_id
         WHERE u.role = 'seeker'`,
        []
      );

      let seekers = rows.map(r => ({
        id: r.profile_id,
        userId: { id: r.user_id, name: r.user_name, phone: r.user_phone },
        workTypes: safeJsonParseArray(r.work_types_json),
        expectedWage: r.expected_wage,
        hoursAvailability: r.hours_availability,
        location: r.location,
        experience: r.experience,
        rating: r.rating
      }));

      if (workType) {
        seekers = seekers.filter(s => s.workTypes.includes(workType));
      }
      if (maxBudget !== null) {
        seekers = seekers.filter(s => Number(s.expectedWage ?? 0) <= maxBudget);
      }
      if (location) {
        seekers = seekers.filter(s => String(s.location || '').toLowerCase().includes(location));
      }

      return res.json({ seekers });
    } catch (err) {
      console.error('search seekers error', err);
      return res.status(500).json({ message: 'Server error' });
    }
  });

  app.post('/api/provider/send-request', authRequired, requireRole('provider'), async (req, res) => {
    try {
      const seekerId = toIntOrNull(req.body?.seekerId);
      const message = String(req.body?.message || '').trim();
      if (!seekerId) return res.status(400).json({ message: 'seekerId is required' });

      const seeker = await db.get('SELECT id, role FROM users WHERE id = ?', [seekerId]);
      if (!seeker || seeker.role !== 'seeker') return res.status(404).json({ message: 'Seeker not found' });

      const provider = await db.get('SELECT id, name, phone FROM users WHERE id = ?', [req.auth.userId]);
      if (!provider) return res.status(401).json({ message: 'Unauthorized' });

      const profile = await db.get(
        `SELECT work_type, budget_per_day, location, working_hours, work_start_time
         FROM provider_profiles WHERE user_id = ?`,
        [req.auth.userId]
      );

      // Allow sending even if provider profile missing; but offers UI looks better with data.
      const workType = profile?.work_type ?? null;
      const budgetPerDay = profile?.budget_per_day ?? null;
      const jobLocation = profile?.location ?? null;
      const workingHours = profile?.working_hours ?? null;
      const workStartTime = profile?.work_start_time ?? null;

      await db.run(
        `INSERT INTO job_requests (
          provider_id, seeker_id, status, message,
          provider_name, provider_phone,
          work_type, budget_per_day, location, working_hours, work_start_time
        ) VALUES (?, ?, 'pending', ?, ?, ?, ?, ?, ?, ?, ?)`,
        [req.auth.userId, seekerId, message, provider.name, provider.phone, workType, budgetPerDay, jobLocation, workingHours, workStartTime]
      );

      return res.json({ message: 'Job offer sent' });
    } catch (err) {
      console.error('send request error', err);
      return res.status(500).json({ message: 'Server error' });
    }
  });

  app.listen(PORT, () => {
    console.log(`Backend running on http://localhost:${PORT}`);
  });
}

main().catch((err) => {
  console.error('Fatal startup error', err);
  process.exit(1);
});
