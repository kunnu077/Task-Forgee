# TaskForge — Team Task Manager

A production-ready full-stack team task management app with role-based access control, Kanban boards, and real-time task tracking.

## Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React 18 + Vite + Tailwind CSS |
| Backend | Node.js + Express.js |
| Database | MongoDB + Mongoose |
| Auth | JWT (role-based: admin / member) |
| HTTP | Axios |
| Notifications | react-hot-toast |
| Deploy (BE) | Railway |
| Deploy (FE) | Vercel |

---

## Folder Structure

```
team-task-manager/
├── backend/
│   ├── config/
│   │   └── db.js               # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js   # signup, login, getMe
│   │   ├── projectController.js
│   │   ├── taskController.js
│   │   └── userController.js
│   ├── middleware/
│   │   └── auth.js             # protect + adminOnly
│   ├── models/
│   │   ├── User.js
│   │   ├── Project.js
│   │   └── Task.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── projects.js
│   │   ├── tasks.js
│   │   └── users.js
│   ├── .env.example
│   ├── package.json
│   └── server.js
│
└── frontend/
    ├── src/
    │   ├── api/
    │   │   └── axios.js          # Axios instance with interceptors
    │   ├── components/
    │   │   ├── Layout.jsx        # Sidebar + responsive header
    │   │   ├── Modal.jsx         # Reusable modal
    │   │   └── TaskCard.jsx      # Kanban task card
    │   ├── context/
    │   │   └── AuthContext.jsx   # Auth state + JWT storage
    │   ├── pages/
    │   │   ├── AuthPage.jsx      # Login + Signup
    │   │   ├── Dashboard.jsx     # Stats overview
    │   │   ├── ProjectsPage.jsx  # Project listing
    │   │   └── ProjectDetail.jsx # Kanban board
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    ├── index.html
    ├── .env.example
    ├── package.json
    ├── tailwind.config.js
    ├── postcss.config.js
    └── vite.config.js
```

---

## API Reference

### Auth
| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| POST | `/api/auth/signup` | Public | Register user |
| POST | `/api/auth/login` | Public | Login |
| GET | `/api/auth/me` | Auth | Get current user |

### Projects
| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| POST | `/api/projects` | Admin | Create project |
| GET | `/api/projects` | Auth | List projects |
| GET | `/api/projects/:id` | Member | Get project |
| PUT | `/api/projects/:id/members` | Admin | Add member by email |
| DELETE | `/api/projects/:id` | Admin | Delete project + tasks |

### Tasks
| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| POST | `/api/tasks` | Admin | Create task |
| GET | `/api/tasks/:projectId` | Member | Get tasks for project |
| PUT | `/api/tasks/:id` | Member | Update (status only for members) |
| DELETE | `/api/tasks/:id` | Admin | Delete task |
| GET | `/api/tasks/dashboard/stats` | Auth | Dashboard stats |

### Users
| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| GET | `/api/users` | Auth | Search users |

---

## Setup — Run Locally

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (free) or local MongoDB

### 1. Clone the repo
```bash
git clone https://github.com/your-username/team-task-manager.git
cd team-task-manager
```

### 2. Backend Setup

```bash
cd backend
npm install

# Copy env file
cp .env.example .env
```

Edit `.env`:
```env
PORT=5000
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/team-task-manager
JWT_SECRET=your_secret_key_min_32_chars
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

```bash
# Start backend (dev mode with nodemon)
npm run dev

# Or production
npm start
```

Backend runs at: `http://localhost:5000`

### 3. Frontend Setup

```bash
cd ../frontend
npm install

# Copy env file
cp .env.example .env
```

Edit `.env`:
```env
VITE_API_URL=http://localhost:5000/api
```

```bash
npm run dev
```

Frontend runs at: `http://localhost:5173`

---

## Deployment

### Backend → Railway

1. Push your code to GitHub
2. Go to [railway.app](https://railway.app) → New Project → Deploy from GitHub
3. Select the `backend` folder (or set root directory to `backend`)
4. Add environment variables in Railway dashboard:
   ```
   PORT=5000
   MONGO_URI=your_atlas_uri
   JWT_SECRET=your_secret
   NODE_ENV=production
   FRONTEND_URL=https://your-app.vercel.app
   ```
5. Railway auto-detects Node.js and runs `npm start`
6. Copy the Railway deployment URL (e.g., `https://taskforge-api.up.railway.app`)

### Frontend → Vercel

1. Go to [vercel.com](https://vercel.com) → New Project → Import GitHub repo
2. Set **Root Directory** to `frontend`
3. Framework preset: **Vite**
4. Add environment variable:
   ```
   VITE_API_URL=https://taskforge-api.up.railway.app/api
   ```
5. Deploy!

---

## Role Permissions

| Action | Admin | Member |
|--------|-------|--------|
| Create project | ✅ | ❌ |
| Delete project | ✅ | ❌ |
| Add team members | ✅ | ❌ |
| Create tasks | ✅ | ❌ |
| Delete tasks | ✅ | ❌ |
| Update task status | ✅ | ✅ |
| View assigned projects | ✅ | ✅ |

---

## Features

- 🔐 JWT authentication with 7-day token expiry
- 👥 Role-based access (Admin / Member)
- 📋 Kanban board (Todo / In Progress / Done)
- 📊 Dashboard with live stats
- 🔴 Overdue task highlighting in red
- 📱 Fully responsive design
- 🔔 Toast notifications
- ⚡ Loading states throughout
- 🗑️ Project deletion cascades to tasks
- 🔒 Members can only update status, not task details

---

## Development Tips

- Use `npm run dev` in both `backend` and `frontend` simultaneously
- Create an admin account first via `/signup`, selecting "Admin" role
- Then create member accounts and add them to projects by email
- The Vite proxy (`/api` → `localhost:5000`) handles CORS in development automatically

---

## License

MIT
