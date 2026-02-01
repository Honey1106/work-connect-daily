# Work Connect Daily — Backend (Node.js + SQL)

This backend implements the API consumed by `index.html`.

## Requirements
- Node.js 18+

## Setup
```bash
cd backend
copy .env.example .env
npm install
npm run dev
```

## Smoke test
With the backend running:
```bash
npm run test:smoke
```

## One-command run + test (Windows-friendly)
This will start the server if needed, wait for `/api/health`, run the smoke test, then stop the server it started:
```bash
npm run dev:smoke
```

If your API is not on localhost:5000, set:
```bash
set API_BASE=http://localhost:5000/api
npm run test:smoke
```

Backend will run at `http://localhost:5000` and the API is under `/api`.

## API
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/send-otp`
- `POST /api/auth/verify-otp`
- `GET /api/seeker/profile`
- `POST /api/seeker/profile`
- `POST /api/provider/profile`
- `GET /api/provider/seekers?workType=&maxBudget=&location=`
- `POST /api/provider/send-request`
- `GET /api/seeker/job-requests`
- `POST /api/seeker/respond-request`

## OTP login (dev)
1) `POST /api/auth/send-otp` with `{ "phone": "9876543210" }`
2) `POST /api/auth/verify-otp` with `{ "phone": "9876543210", "code": "123456" }`

In development, set `OTP_DEV_RETURN_CODE=true` to get the OTP back in the response (no SMS integration).

## Notes
- Uses SQLite stored at `backend/data/app.sqlite` (created automatically).
- Auth uses JWT in `Authorization: Bearer <token>`.
