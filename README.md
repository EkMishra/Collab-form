
# 📋 Collaborative Real-Time Form Builder

This project allows admins to create forms with custom fields and share them with users, who can fill out a single shared response collaboratively in real time.

---

## 🚀 Getting Started

Follow these steps to run the project locally:

### 1. 🐳 Start Postgres and Redis with Docker

Make sure Docker is installed and running.

```
docker-compose up -d
```

This will start:
- PostgreSQL at `localhost:5432`
- Redis at `localhost:6379`

---

### 2. 📦 Install Backend Dependencies

```
cd backend
npm install
```

---

### 3. 🔧 Set up Backend Environment

Create a `.env` file in the `backend/` directory with:

```
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/collabforms
REDIS_URL=redis://localhost:6379
PORT=3000
```

---

### 4. 🌐 Set Up the Database

Run the following to initialize the database schema:

```
npx prisma generate
npx prisma migrate dev --name init
```

---

### 5. 🚀 Start the Backend Server

```
npm run dev
```

Server runs on: `http://localhost:3000`

---

### 6. 🌐 Start the Frontend (Vite)

In a separate terminal:

```
cd frontend
npm install
npm run dev
```

Frontend runs on: `http://localhost:5173`

---

## ✅ Final Project URLs

- Admin Dashboard: `http://localhost:5173/admin`
- Create Form: `http://localhost:5173/create`
- Fill Form (as user): `http://localhost:5173/form/:inviteCode`


---

## 🐞 Troubleshooting

- Make sure ports `5432` and `6379` are not in use before running Docker.
- If you encounter database issues, try resetting Docker volumes:

```
docker-compose down -v
docker-compose up -d
```

---

## 📂 Folder Structure

- `backend/` - Node.js, Express, Prisma, Redis
- `frontend/` - React + Vite
- `docker-compose.yml` - Docker setup for PostgreSQL and Redis
