# Association Management App

Small association management system (Node/Express backend + React frontend) for managing members, projects and treasury operations.

## Features added
- Member management with roles (Bureau, Subscriber)
- Projects and project committee membership
- Transactions ledger (Income / Expense) with category, description, user and project links
- Upload and store proof documents (images / PDFs) for transactions
- User financial history and per-user balance calculation
- Email sending endpoint (SMTP via nodemailer)

## Important files
- Backend server: `back/server.js`
- Frontend app: `front/` (Vite + React)
- SQLite DB file: `back/ams_database.db`
- Uploaded files directory: `back/uploads`

## Environment variables
Create a `.env` file in `back/` with at least the following variables:

```
# Backend
PORT=8080
JWT_SECRET=your_jwt_secret_here

# SMTP (used by POST /api/notify/send-email)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=you@example.com
SMTP_PASS=your_smtp_password
# optional
SMTP_FROM="Association <you@example.com>"
```

Frontend can set the API base URL via `front/.env` (optional):

```
VITE_API_BASE_URL=http://localhost:8080/api
```

## Uploads & API notes
- The backend serves uploaded documents at: `http://<HOST>:<PORT>/uploads/<filename>`
- When creating a transaction (POST `/api/transactions`), the upload field name is `document` (multipart/form-data). The backend also accepts JSON with `proof_url` if you prefer an external link.
- Transaction POST requires: `type` ("Income" or "Expense"), `amount`, `category`. Optional: `description`, `user_id`, `project_id`, `date`, `document` (file) or `proof_url` (string).

## Running locally
From project root, open two terminals.

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

## Testing email
Use the notify endpoint to test SMTP config:

POST `http://localhost:8080/api/notify/send-email`
Body (JSON):
```json
{
  "to": "recipient@example.com",
  "subject": "Test email",
  "text": "Hello from Association app"
}
```

## Notes
- The server initializes DB tables automatically using `back/config/schema.js` on startup.
- `back/.gitignore` includes `uploads/` and the DB file to avoid committing binaries.

If you'd like, I can:
- Add automated confirmation emails on transaction creation
- Commit these changes and open a minimal README in `back/` as well
- Add short Postman examples or curl snippets for core endpoints

