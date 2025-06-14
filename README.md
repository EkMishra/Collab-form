# 📋 Collaborative Real-Time Form Builder

A full-stack web application where **admins can create forms**, share them via invite code, and **users can collaboratively fill out** a single shared response in **real-time**, with live synchronization using WebSockets and Redis.

---

## 🔗 GitHub Repository

> [Insert your GitHub repository link here]

---

## 🚀 Getting Started

Follow these steps to run the project locally:

### 1. 🐳 Start PostgreSQL and Redis with Docker

Make sure Docker is installed and running.

```bash
docker-compose up -d
```

This will start:
- **PostgreSQL** at `localhost:5432`
- **Redis** at `localhost:6379` with keyspace notifications enabled

---

### 2. 📦 Install Backend Dependencies

```bash
cd backend
npm install
```

---

### 3. 🔧 Set up Backend Environment

Create a `.env` file inside the `backend/` directory:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/collabforms
REDIS_URL=redis://localhost:6379
PORT=3000
```

---

### 4. 🌐 Set Up the Database

Initialize Prisma and set up the database:

```bash
npx prisma generate
npx prisma migrate dev --name init
```

---

### 5. 🚀 Start the Backend Server

```bash
npm run dev
```

Server will run at: `http://localhost:3000`

---

### 6. 🌐 Start the Frontend (Vite)

In a separate terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend will run at: `http://localhost:5173`

---

## ✅ Final Project URLs

| Page             | URL                                       |
|------------------|-------------------------------------------|
| Admin Dashboard  | http://localhost:5173/admin               |
| Create Form      | http://localhost:5173/create              |
| Fill Form (User) | http://localhost:5173/form/:inviteCode   |

---

## 🏗️ Architecture & Design Decisions

### Backend
- **Node.js + Express.js + Prisma + Redis**
- Redis stores real-time field values and manages field locks
- Prisma connects to PostgreSQL for persistent form/response storage

### Frontend
- **React with Vite**
- Dynamic form rendering and real-time updates using Socket.IO

### Real-time Syncing
- **Socket.IO + Redis**
- Field-level locking to prevent conflicts
- Redis data is synced to PostgreSQL every 10 seconds

### Role-based Logic
- **Admins** create & manage forms
- **Users** join and fill forms using invite codes

---

## 🧪 Edge Cases Handled

- Users trying to edit locked fields
- Redis crash — fallback to last synced DB state
- Concurrent editing with locking mechanism
- Invalid or expired invite codes
- Finalized forms become read-only

---

## 🛠️ Technologies Used and Why

| Tech          | Reason                                               |
|---------------|------------------------------------------------------|
| Node.js       | Scalable backend runtime                             |
| Express       | Lightweight and efficient routing                    |
| Prisma        | Type-safe ORM with great PostgreSQL support          |
| PostgreSQL    | Robust relational DB for structured data             |
| Redis         | Fast in-memory store for real-time sync              |
| Socket.IO     | WebSocket abstraction for live updates               |
| React + Vite  | Fast frontend with HMR and modular structure         |
| Docker        | Simplifies Redis and Postgres container setup        |

---

## 🧪 Postman Collection

A Postman collection is included in the repo:  
**`CollabFormAPI.postman_collection.json`**

Use it to test:
- Form creation
- User joining
- Real-time response saving
- Admin viewing responses

---

## 🐞 Troubleshooting

Ensure ports **5432** (PostgreSQL) and **6379** (Redis) are not occupied.

To reset Docker state:

```bash
docker-compose down -v
docker-compose up -d
```

---

## 📂 Folder Structure

```bash
.
├── backend/             # Express, Prisma, Redis, Socket.IO logic
├── frontend/            # React + Vite-based dynamic UI
├── docker-compose.yml
└── README.md
```
