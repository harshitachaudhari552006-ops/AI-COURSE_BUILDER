# How to Run the AI Course Builder Application

## Prerequisites (one-time)

1. **Node.js** (LTS) – [Download](https://nodejs.org/)
2. **MongoDB** – installed and running ([see INSTALL_MONGODB.md](INSTALL_MONGODB.md))
3. **Backend `.env`** – in `backend` folder with at least:
   - `MONGODB_URI=mongodb://localhost:27017/ai_course_builder`
   - `JWT_SECRET=any-secret-string`
   - `USE_FIXED_OTP=true` and `FIXED_OTP=123456` (for login without email)

---

## Run the whole application (every time)

Use **two terminals**: one for backend, one for frontend.

### Terminal 1 – Backend

```bash
cd backend
npm install
npm run dev
```

**Success looks like:**
- `MongoDB Connected: localhost`
- `AI Course Builder API listening on http://localhost:5000`

If you see **"address already in use"**, another process is using port 5000. Stop it or change `PORT` in `backend/.env`.

---

### Terminal 2 – Frontend

```bash
cd frontend
npm install
npm run dev
```

**Success looks like:**
- `VITE v5.x.x  ready`
- `Local: http://localhost:5173/`

---

## Open the app

In your browser go to: **http://localhost:5173**

---

## First-time: seed data (semesters, subjects, modules)

If the home page shows "No semesters found", run once:

```bash
cd backend
npm run seed
```

Then refresh the browser. You should see semester cards.

---

## Login (with fixed OTP)

1. **Student ID:** e.g. `STU001`
2. **Email:** any valid email (e.g. `test@example.com`)
3. Click **Request OTP**
4. **OTP:** enter `123456`
5. Click **Verify & Login**

---

## Quick checklist

| Step              | Command / Action                    |
|-------------------|-------------------------------------|
| 1. MongoDB running| `net start MongoDB` (Windows)       |
| 2. Backend        | `cd backend` → `npm run dev`        |
| 3. Frontend       | `cd frontend` → `npm run dev`       |
| 4. Seed (once)    | `cd backend` → `npm run seed`       |
| 5. Open app       | http://localhost:5173               |
| 6. Login          | STU001, any email, OTP: 123456       |
