# CCTV Health Monitoring System

Course: SWE 0610-3250 — Group Project

Stack: React + Vite + Tailwind CSS (frontend) · Node.js + Express + MySQL (backend)

## Folder Structure

```
cctv-health-monitoring/
├── backend/
│   ├── src/
│   │   ├── config/         # db connection
│   │   ├── controllers/    # req/res handling only
│   │   ├── services/       # business logic + SQL queries
│   │   ├── routes/         # express routers
│   │   ├── middlewares/    # auth, role-check
│   │   ├── sockets/        # realtime notification push
│   │   ├── jobs/           # cron jobs (health-check)
│   │   ├── utils/          # helper functions (formatDate, generateToken, etc.)
│   │   └── app.js
│   ├── uploads/
│   │   ├── snapshots/      # camera snapshot images (gitignored, .gitkeep only)
│   │   └── default/        # no-snapshot placeholder image
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   ├── components/
│   │   ├── context/        # AuthContext
│   │   ├── api/            # centralized axios instance + endpoint modules
│   │   └── App.jsx
│   └── package.json
├── database/
│   └── cctv_database_schema.sql
└── docs/
    └── cctv_workflows_reference.pdf
```

## First-time Setup (প্রত্যেকে নিজের মেশিনে করবে)

### 1. Clone
```bash
git clone <repo-url>
cd cctv-health-monitoring
```

### 2. Database
- MySQL Workbench বা phpMyAdmin দিয়ে `database/cctv_database_schema.sql` রান করো
- এটা `cctv_health_monitoring` ডাটাবেজ ও সব টেবিল বানিয়ে দিবে

### 3. Backend
```bash
cd backend
npm install
cp .env.example .env
# .env ফাইলে নিজের DB password, JWT secret বসাও
npm run dev
```
Backend চলবে: `http://localhost:5000`

### 4. Frontend
```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```
Frontend চলবে: `http://localhost:5173`

## Git Workflow

- `main` — protected, শুধু PR দিয়ে merge হবে
- `dev` — সবাই এখানে merge করবে
- কাজ শুরুর আগে: `git checkout -b feature/your-task-name` (branch করো `dev` থেকে)
- কাজ শেষে: push করে `dev`-এ PR খোলো, একজন review করে merge করবে

## Team Split (suggested, workflow doc অনুযায়ী)

| Person | দায়িত্ব |
|---|---|
| A | Camera CRUD, Health-check cron, Snapshot capture/serve |
| B | Incident create/assign/accept/reject/complete |
| C | Auth (JWT), Notification system + socket, Technician account mgmt, frontend shell |

## Reference

সব API flow, workflow ও logic বিস্তারিত আছে `docs/cctv_workflows_reference.pdf`-এ। কোনো feature বানানোর আগে সেই section পড়ে নেওয়া ভালো।
