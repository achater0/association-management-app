# Omni-Association

A lightweight, fast web application for managing non-profit association memberships, finances, projects, and bureau reporting.

## Tech Stack

This project is built with a simple, reliable stack: Node.js + Express for the backend API, React + Vite for the frontend interface, SQLite for local persistence, JWT for secure authentication, and Multer for document uploads.

## Repository Blueprint

```
.
├── README.md
├── roadMap
├── back
│   ├── .env
│   ├── .gitignore
│   ├── package.json
│   ├── server.js
│   ├── seed.js
│   ├── ams_database.db
│   ├── uploads/
│   ├── config/
│   │   ├── db.js
│   │   └── schema.js
│   ├── controllers/
│   ├── middleware/
│   │   └── authMiddleware.js
│   ├── models/
│   │   ├── projectModel.js
│   │   ├── transactionModel.js
│   │   └── userModel.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── projectRoutes.js
│   │   ├── transactionRoutes.js
│   │   └── userRoutes.js
│   └── utils/
├── front
│   ├── package.json
│   ├── vite.config.js
│   ├── index.html
│   ├── eslint.config.js
│   ├── public/
│   └── src/
│       ├── App.jsx
│       ├── index.css
│       ├── main.jsx
│       ├── assets/
│       ├── components/
│       │   ├── common/
│       │   ├── layout/
│       │   ├── receipts/
│       │   └── routes/
│       ├── context/
│       │   └── AuthContext.jsx
│       ├── pages/
│       │   ├── admin/
│       │   ├── auth/
│       │   └── subscriber/
│       ├── services/
│       │   ├── api.js
│       │   ├── authService.js
│       │   ├── projectService.js
│       │   ├── transactionService.js
│       │   └── userService.js
│       └── utils/
└── .gitignore
```

## Local Setup & Infrastructure

1. Prepare the backend environment

Create a `.env` file inside the `back/` folder:

```env
PORT=8080
JWT_SECRET=your_super_secure_jwt_secret
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=you@example.com
SMTP_PASS=your_smtp_password
SMTP_FROM="Association <you@example.com>"
```

2. Prepare the frontend environment

Create a `.env` file inside the `front/` folder if you want to override the default API URL:

```env
VITE_API_BASE_URL=http://localhost:8080/api
```

3. Run the project locally

Open two terminals.

Backend:

```bash
cd back
npm install
npm run dev
```

Frontend:

```bash
cd front
npm install
npm run dev
```

4. Access the application

- Frontend: http://localhost:5173
- Backend API: http://localhost:8080/api

## Database Architecture

The application uses SQLite as a lightweight relational database. The schema initializes automatically on startup and manages the main association domains:

- Users and roles: president, treasurer, secretary, counselor, subscriber, etc.
- Projects and committee membership
- Transactions and financial records
- Payment proofs and document uploads
- Annual report publication and project reports

The core tables include:

- `users`
- `projects`
- `project_members`
- `transactions`
- `annual_reports`

## Project Tasks & Roadmap

The project currently covers the most important association-management flows:

- Members include bureau officers and standard subscribers.
- Bureau members can manage roles and restrict sensitive actions.
- The president can manage the bureau, while some role changes remain protected.
- Each member can pay annual dues and see their membership balance.
- Association projects can be created and tracked.
- Project committees can be assigned to members.
- Transactions can be logged as income or expense.
- Proof documents and payment evidence can be uploaded.
- End-of-project reports can be generated from project transactions.
- Annual bureau reports can be published for subscribers.
- Subscribers can view their contribution history and reports.

## Quick Progress Summary

- Status: In Active Development
- Core features completed: Authentication, role-based access, dashboard flows, treasury, projects, committee management, uploads, and report publishing.
- Focus area: final refinements, UX polish, and production readiness checks.

## Notes

- The backend serves uploaded files from `/uploads`.
- Database tables are initialized automatically through `back/config/schema.js`.
- The app is designed as a simple local-association management platform and is intentionally lightweight rather than heavy-framework based.

