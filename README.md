# Student Grievance Management System
### MERN Stack | JWT Auth | Full CRUD

---

## Project Structure

```
grievance-system/
├── backend/
│   ├── models/
│   │   ├── Student.js        # Mongoose schema for students
│   │   └── Grievance.js      # Mongoose schema for grievances
│   ├── routes/
│   │   ├── auth.js           # POST /api/register, POST /api/login
│   │   └── grievances.js     # Full CRUD + search (protected)
│   ├── middleware/
│   │   └── protect.js        # JWT verification middleware
│   ├── server.js             # Express app entry point
│   ├── .env.example          # Environment variable template
│   └── package.json
└── frontend/
    ├── public/index.html
    └── src/
        ├── components/
        │   ├── Register.jsx  # Registration form
        │   ├── Login.jsx     # Login form
        │   ├── Navbar.jsx    # Top navigation bar
        │   └── GrievanceCard.jsx  # Card with inline edit/delete
        ├── pages/
        │   └── Dashboard.jsx # Protected main page
        ├── styles/App.css    # All CSS (light, clean design)
        ├── api.js            # Axios instance with JWT interceptor
        ├── App.js            # Root component + auth routing
        └── index.js
```

---

## Setup & Run

### 1. Backend

```bash
cd backend
npm install

# Create .env file
cp .env.example .env
# Edit .env — set your MONGO_URI and JWT_SECRET

npm run dev        # development (nodemon)
# or
npm start          # production
```

### 2. Frontend

```bash
cd frontend
npm install
npm start          # runs on http://localhost:3000
```

> The frontend proxies `/api` requests to `http://localhost:5000` (set in package.json).

---

## API Reference

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/register` | No | Register new student |
| POST | `/api/login` | No | Login, returns JWT |
| POST | `/api/grievances` | Yes | Submit grievance |
| GET | `/api/grievances` | Yes | Get all grievances |
| GET | `/api/grievances/:id` | Yes | Get single grievance |
| PUT | `/api/grievances/:id` | Yes | Update grievance |
| DELETE | `/api/grievances/:id` | Yes | Delete grievance |
| GET | `/api/grievances/search?title=xyz` | Yes | Search by title |

---

## Features

### Authentication
- Student registration with bcrypt password hashing (salt rounds: 10)
- JWT login (7-day expiry)
- Protected routes — unauthorized access returns 401
- Duplicate email detection (409 conflict)
- Invalid credentials return generic message (security best practice)

### Grievance Management
- Submit with title, description, category, auto date & Pending status
- View all own grievances (sorted newest first)
- Search by title (case-insensitive regex)
- Inline edit — update title, description, category, status
- Delete with confirmation dialog
- Ownership check — students can only manage their own grievances

### Frontend
- Session persistence via localStorage (token + student info)
- Auto-logout on 401 (expired/invalid token)
- Stats dashboard: total / pending / resolved counts
- Light, clean UI with responsive design (mobile-friendly)

---

## MongoDB Schemas

**Student**
```js
{ name, email (unique), password (hashed), timestamps }
```

**Grievance**
```js
{
  title, description,
  category: ['Academic', 'Hostel', 'Transport', 'Other'],
  date: Date (default now),
  status: ['Pending', 'Resolved'] (default Pending),
  student: ObjectId (ref Student),
  timestamps
}
```
