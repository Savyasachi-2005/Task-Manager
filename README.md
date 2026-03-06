# Task Manager

A full-stack task management application with JWT authentication and role-based access control.

**Backend:** FastAPI · SQLAlchemy · PostgreSQL (Supabase) · JWT · bcrypt  
**Frontend:** React · Vite · Tailwind CSS · Axios

---

## Project Structure

```
Intern/
├── bd/                          # Backend (FastAPI)
│   ├── app/
│   │   ├── main.py              # App entry-point, CORS, middleware, routers
│   │   ├── config.py            # Settings loaded from .env via pydantic-settings
│   │   ├── database.py          # SQLAlchemy engine, session factory, Base
│   │   ├── models/
│   │   │   ├── user.py          # User ORM model
│   │   │   └── task.py          # Task ORM model
│   │   ├── schemas/
│   │   │   ├── user_schema.py   # Pydantic request/response schemas for auth
│   │   │   └── task_schema.py   # Pydantic request/response schemas for tasks
│   │   ├── routes/
│   │   │   ├── auth_routes.py   # POST /api/v1/auth/register, /login
│   │   │   ├── task_routes.py   # CRUD /api/v1/tasks
│   │   │   └── admin_routes.py  # Admin-only endpoints
│   │   ├── services/
│   │   │   ├── auth_service.py  # Register & login business logic
│   │   │   └── task_service.py  # Task CRUD + ownership checks
│   │   ├── dependencies/
│   │   │   └── auth_dependency.py  # get_current_user, require_admin
│   │   └── utils/
│   │       ├── jwt_handler.py   # JWT create / decode
│   │       └── password_hash.py # bcrypt hash / verify
│   ├── requirements.txt
│   ├── generate_hash.py         # Utility to generate bcrypt hashes
│   └── .env.example
│
└── fd/                          # Frontend (React + Vite)
    ├── src/
    │   ├── api/
    │   │   └── index.js         # Axios instance + authAPI & tasksAPI helpers
    │   ├── components/
    │   │   ├── TaskCard.jsx     # Single task card with edit/delete actions
    │   │   ├── TaskModal.jsx    # Create / edit task modal dialog
    │   │   └── Pagination.jsx   # Page navigation component
    │   ├── utils/
    │   │   └── jwt.js           # Client-side JWT decoder
    │   ├── pages/
    │   │   ├── Login.jsx
    │   │   ├── Register.jsx
    │   │   └── Dashboard.jsx
    │   ├── App.jsx              # Router + PrivateRoute guard
    │   ├── main.jsx
    │   └── index.css            # Tailwind directives
    ├── public/
    │   └── debug.html           # JWT debugging tool
    ├── index.html
    ├── vite.config.js
    ├── tailwind.config.js
    └── package.json
```

---

## Database Schema

### users

| Column        | Type                     | Notes               |
|---------------|--------------------------|---------------------|
| id            | UUID (PK)                | auto-generated      |
| name          | VARCHAR(100)             |                     |
| email         | VARCHAR(255) UNIQUE      | indexed             |
| password_hash | VARCHAR(255)             | bcrypt              |
| role          | ENUM('user','admin')     | default: `user`     |
| created_at    | TIMESTAMPTZ              | server default now()|

### tasks

| Column      | Type         | Notes                          |
|-------------|--------------|--------------------------------|
| id          | UUID (PK)    | auto-generated                 |
| title       | VARCHAR(200) |                                |
| description | TEXT         | nullable                       |
| user_id     | UUID (FK)    | references users.id ON DELETE CASCADE |
| created_at  | TIMESTAMPTZ  | server default now()           |

---

## Environment Variables

Copy `bd/.env.example` to `bd/.env` and fill in the values.

| Variable                     | Description                                      |
|------------------------------|--------------------------------------------------|
| `DATABASE_URL`               | PostgreSQL connection string (Supabase or local) |
| `SECRET_KEY`                 | Random 32-byte hex string used to sign JWTs     |
| `JWT_ALGORITHM`              | `HS256` (default)                                |
| `ACCESS_TOKEN_EXPIRE_MINUTES`| Token lifetime in minutes (default: 30)          |

Generate a secure secret key:

```bash
python -c "import secrets; print(secrets.token_hex(32))"
```

---

## Setup & Running

### Backend

```bash
cd bd

# 1. Create and activate a virtual environment
python -m venv venv
# Windows
venv\Scripts\activate
# macOS / Linux
source venv/bin/activate

# 2. Install dependencies
pip install -r requirements.txt

# 3. Configure environment
copy .env.example .env      # Windows
# then edit .env with your DATABASE_URL and SECRET_KEY

# 4. Start the development server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

API docs will be available at:
- Swagger UI → http://localhost:8000/docs
- ReDoc       → http://localhost:8000/redoc

---

### Frontend

```bash
cd fd

# 1. Install dependencies
npm install

# 2. Start the dev server (proxies /api/* to http://localhost:8000)
npm run dev
```

Open http://localhost:3000 in your browser.

---

## Creating an Admin User

By default, registered users have the `user` role. To create an admin user:

### Option 1: Using the Hash Generator Script

```bash
cd bd
python generate_hash.py
```

This generates a bcrypt hash. Copy the SQL output and run it in your Supabase SQL Editor.

### Option 2: Promote an Existing User

```sql
-- Update an existing user to admin
UPDATE users 
SET role = 'admin' 
WHERE email = 'your-email@example.com';
```

### Option 3: Direct SQL Insert

```sql
-- Create a new admin user (generate hash first with generate_hash.py)
INSERT INTO users (id, name, email, password_hash, role, created_at)
VALUES (
    gen_random_uuid(),
    'Admin User',
    'admin@example.com',
    '<bcrypt-hash-from-generate_hash.py>',
    'admin',
    NOW()
);
```

**Important:** Always logout and login again after changing roles to get a new JWT token.

---

## API Endpoints

### Authentication

| Method | Endpoint                   | Body                          | Description          |
|--------|----------------------------|-------------------------------|----------------------|
| POST   | `/api/v1/auth/register`    | `{name, email, password}`     | Create a new account |
| POST   | `/api/v1/auth/login`       | `{email, password}`           | Get a JWT token      |

### Tasks  *(Authorization: Bearer \<token\> required)*

| Method | Endpoint               | Body / Params               | Description                        |
|--------|------------------------|-----------------------------|------------------------------------|
| POST   | `/api/v1/tasks`        | `{title, description?}`     | Create a task                      |
| GET    | `/api/v1/tasks`        | `?page=1&page_size=10`      | List tasks (paginated)             |
| GET    | `/api/v1/tasks/{id}`   | —                           | Get single task                    |
| PUT    | `/api/v1/tasks/{id}`   | `{title?, description?}`    | Partial update                     |
| DELETE | `/api/v1/tasks/{id}`   | —                           | Delete task (returns 204)          |

### Admin Endpoints  *(Authorization: Bearer \<token\> required, Admin role only)*

| Method | Endpoint               | Body / Params               | Description                        |
|--------|------------------------|-----------------------------|------------------------------------|
| GET    | `/api/v1/admin/tasks`  | `?page=1&page_size=10`      | View all tasks across all users    |

---

## Role-Based Access Control (RBAC)

### User Role (`role = 'user'`)
- ✅ Create tasks (owned by self)
- ✅ View their own tasks only
- ✅ Edit their own tasks only
- ✅ Delete their own tasks only
- ❌ Cannot access other users' tasks (403 Forbidden)
- ❌ Cannot access `/api/v1/admin/*` endpoints (403 Forbidden)

### Admin Role (`role = 'admin'`)
- ✅ Create tasks
- ✅ **View ALL tasks** (across all users)
- ✅ **Edit ANY task** (bypasses ownership checks)
- ✅ **Delete ANY task** (bypasses ownership checks)
- ✅ Access admin-only endpoints (`/api/v1/admin/*`)
- ✅ See "Admin Mode" badge in frontend UI

### Frontend Admin Features

When logged in as an admin, the dashboard displays:
- 🟡 **"Admin Mode"** amber badge in the navbar
- 📊 Page title: **"All Tasks"** (instead of "My Tasks")
- 📝 Subtitle: **(across all users)**
- 🎨 Task cards with amber tint
- 👤 Owner user ID displayed on each task card
- ✅ Ability to edit/delete any user's tasks

---

## Security

- Passwords are hashed with **bcrypt** (cost factor 12) and never stored in plain text.
- JWTs are signed with **HS256**; the secret key must be kept private.
- Each task endpoint enforces **ownership checks** so users cannot access other users' data.
- CORS is restricted to the known frontend origins.
- The login error message is intentionally generic to prevent email enumeration.

---

## Debug Tools

### JWT Debugger

Access the JWT debugging tool at: **http://localhost:3000/debug.html**

Features:
- Decode JWT tokens to view payload
- Check current localStorage contents
- Verify user role from token
- Clear localStorage for fresh login
- Step-by-step troubleshooting guide

### Password Hash Generator

```bash
cd bd
python generate_hash.py
```

Generates bcrypt hashes compatible with the backend authentication system.

---

## Health Check

```
GET /health
→ {"status": "ok", "message": "Task Manager API is running"}
```

---

## Troubleshooting

### Admin Mode Not Showing After Login?

1. **Verify role in database:**
   ```sql
   SELECT email, role FROM users WHERE email = 'your-email@example.com';
   ```
   Should show `role = 'admin'`

2. **Clear browser localStorage:**
   - Open browser console (F12)
   - Run: `localStorage.clear()`
   - Refresh page and login again

3. **Use the debug tool:**
   - Go to http://localhost:3000/debug.html
   - Click "Get from localStorage"
   - Click "Decode Token"
   - Check if `role` field shows `"admin"`

4. **If role is still "user":**
   - The JWT was created before you updated the role in the database
   - Logout, clear localStorage, and login again to get a fresh token

### Invalid Password Error?

- The bcrypt hash in your database doesn't match the password you're entering
- Use `generate_hash.py` to create a new hash with your desired password
- Update the database with the new hash

---

## API Documentation

- **Swagger UI:** http://localhost:8000/docs (interactive API testing)
- **ReDoc:** http://localhost:8000/redoc (clean API reference)
