/* eslint-disable no-console */

const { spawn } = require('child_process');

const API_BASE = process.env.API_BASE || 'http://localhost:5000/api';

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchJsonWithTimeout(url, timeoutMs) {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  } finally {
    clearTimeout(t);
  }
}

async function waitForHealth(maxWaitMs = 8000) {
  const start = Date.now();
  while (Date.now() - start < maxWaitMs) {
    const data = await fetchJsonWithTimeout(`${API_BASE}/health`, 800);
    if (data && data.ok === true) return true;
    await sleep(250);
  }
  return false;
}

function killProcessTree(proc) {
  if (!proc || proc.killed) return;

  if (process.platform === 'win32') {
    // Ensure child + its subtree are terminated.
    const killer = spawn('taskkill', ['/PID', String(proc.pid), '/T', '/F'], {
      stdio: 'ignore',
      windowsHide: true,
    });
    killer.on('error', () => {
      try { proc.kill('SIGKILL'); } catch {}
    });
    return;
  }

  try {
    proc.kill('SIGTERM');
  } catch {}
}

async function run() {
  const alreadyUp = await waitForHealth(800);
  let serverProc = null;
  let startedHere = false;

  if (!alreadyUp) {
    console.log(`[dev:smoke] Backend not detected at ${API_BASE}, starting server...`);

    serverProc = spawn('node', ['src/server.js'], {
      stdio: 'inherit',
      env: { ...process.env, PORT: process.env.PORT || '5000' },
      windowsHide: true,
    });

    startedHere = true;

    const exitedEarly = new Promise((resolve) => {
      serverProc.on('exit', (code) => resolve(code ?? 1));
      serverProc.on('error', () => resolve(1));
    });

    const up = await Promise.race([
      waitForHealth(9000),
      exitedEarly,
    ]);

    if (up !== true) {
      killProcessTree(serverProc);
      throw new Error('[dev:smoke] Server failed to start (check port 5000 and logs above).');
    }
  } else {
    console.log(`[dev:smoke] Backend already running at ${API_BASE}`);
  }

  console.log('[dev:smoke] Running smoke test...');

  const smokeExit = await new Promise((resolve) => {
    const p = spawn('node', ['scripts/smoke-test.js'], {
      stdio: 'inherit',
      env: { ...process.env, API_BASE },
      windowsHide: true,
    });

    p.on('exit', (code) => resolve(code ?? 1));
    p.on('error', () => resolve(1));
  });

  if (startedHere) {
    console.log('[dev:smoke] Stopping server...');
    killProcessTree(serverProc);
  }

  process.exit(smokeExit);
}

run().catch((err) => {
  console.error(String(err?.message || err));
  process.exit(1);
});
