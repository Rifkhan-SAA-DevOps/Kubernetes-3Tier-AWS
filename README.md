# Library Management System

A medium-sized full-stack app with two interchangeable backends — one on **MySQL**, one on **MongoDB** —
so you can run the exact same frontend against either a relational or a NoSQL database.

## Stack

- **Frontend**: React (Vite)
- **Backend (choose one)**:
  - `backend-mysql/` — Node.js + Express + MySQL (`mysql2`)
  - `backend-mongodb/` — Node.js + Express + MongoDB (`mongoose`)
- **Auth**: JWT, roles `admin` / `member`

Both backends implement the **identical REST API** (same routes, same JSON field names), so the frontend
works unmodified no matter which one you run.

## Features

- User registration/login (JWT auth)
- Book catalog: search, filter, CRUD (admin only)
- Borrow / return workflow with due dates and overdue fines
- Book reviews & ratings
- Member management (admin)
- Activity log / audit trail
- `/health` and `/ready` endpoints on the backend

## Project layout

```
library-management-system/
├── frontend/                # React (Vite) app — works with either backend
│   └── src/
├── backend-mysql/           # Express API backed by MySQL
│   ├── init-db/init.sql     # schema + seed data (run this against your MySQL DB)
│   └── src/
└── backend-mongodb/         # Express API backed by MongoDB
    └── src/
        └── seed.js           # creates admin user + sample books
```

## 1. Choose & set up a database

### Option A — MySQL

1. Create a database and user (or just let `init.sql` create the database):
   ```bash
   mysql -u root -p < backend-mysql/init-db/init.sql
   ```
   This creates `library_db` with all tables (`users`, `books`, `borrows`, `reviews`, `activity_logs`),
   a default admin user, and a few sample books.

2. Configure the backend:
   ```bash
   cd backend-mysql
   cp .env.example .env
   # edit .env with your MySQL host/user/password
   ```

### Option B — MongoDB

1. Make sure MongoDB is running locally (or use a connection string for a hosted instance, e.g. Atlas).

2. Configure the backend:
   ```bash
   cd backend-mongodb
   cp .env.example .env
   # edit .env with your MONGO_URI if needed
   ```

3. Seed the default admin user and sample books:
   ```bash
   npm install
   npm run seed
   ```

## 2. Run the backend

```bash
cd backend-mysql      # or backend-mongodb
npm install
npm run dev           # or: npm start
```

The API runs on **http://localhost:5000** by default.

- `GET /health` — liveness check
- `GET /ready` — readiness check (verifies DB connection)

Default admin login: `admin` / `Admin@123`

## 3. Run the frontend

```bash
cd frontend
cp .env.example .env   # VITE_API_URL=http://localhost:5000/api
npm install
npm run dev
```

Open http://localhost:5173

## Switching backends

Because both backends return the same JSON shape, you can run either one and point the frontend
at it with `VITE_API_URL` — no frontend code changes needed. Just don't run both at the same time
on the same port (or change `PORT` in one of the `.env` files).

## API reference

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | – | Register a new member |
| POST | `/api/auth/login` | – | Login, returns JWT |
| GET | `/api/auth/me` | ✓ | Current user |
| GET | `/api/books?search=&category=` | – | List/search books |
| GET | `/api/books/:id` | – | Book detail |
| POST/PUT/DELETE | `/api/books/:id` | admin | Manage books |
| POST | `/api/borrow/:bookId` | ✓ | Borrow a book |
| POST | `/api/borrow/:id/return` | ✓ | Return a book |
| GET | `/api/borrow/my` | ✓ | My borrow history |
| GET | `/api/borrow` | admin | All borrow records |
| GET/POST | `/api/reviews/book/:bookId` | GET: – / POST: ✓ | Reviews |
| DELETE | `/api/reviews/:id` | ✓ (own) / admin | Delete review |
| GET | `/api/logs?limit=` | admin | Activity log |
| GET | `/api/members` | admin | List members |
| PUT/DELETE | `/api/members/:id` | admin | Manage members |
| GET | `/health` / `/ready` | – | Health checks |

### Response field reference

- **Book**: `id, title, author, isbn, category, description, publishedYear, totalCopies, availableCopies, createdAt`
- **User/Member**: `id, username, email, role, createdAt`
- **Borrow**: `id, bookId, userId, bookTitle, author, username, borrowDate, dueDate, returnDate, status, fineAmount`
- **Review**: `id, bookId, userId, username, rating, comment, createdAt`
- **Activity log**: `id, userId, username, action, details, createdAt`
