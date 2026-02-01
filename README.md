# Work Connect Daily

Frontend is a single-file React app at `index.html`.
Backend is a Node.js + SQL (SQLite) API in `backend/`.

## Run backend
```bash
cd backend
copy .env.example .env
npm install
npm run dev
```

Open `index.html` in your browser.

If you want the frontend to talk to a different backend URL, update `API_BASE_URL` in `index.html`.

## Deploy (recommended: Render)
This repo includes a `render.yaml` that deploys a single Node service and mounts a persistent disk for SQLite.

1) Push this repo to GitHub
2) In Render: **New → Blueprint** and pick your repo
3) Render will create the service and disk automatically
4) After deploy, open your service URL (it serves the UI at `/`)

### Important production env vars
- Set a real `JWT_SECRET` (Render auto-generates one via `render.yaml`).
- Keep `OTP_DEV_RETURN_CODE=false` in production.
- SQLite persistence requires a mounted disk (Render configured as `/var/data`).

### Notes
- If you deploy somewhere without persistent storage, SQLite data may be lost on restart.
