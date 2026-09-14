const db = require('./db');

const createTables = () => {
    // Enable Foreign Keys in SQLite
    db.run("PRAGMA foreign_keys = ON;");

    // Create the 'users' table
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role TEXT DEFAULT 'Subscriber',
        cin_number TEXT UNIQUE,
        phone TEXT,
        cin_file TEXT,
        payment_proof TEXT,
        payment_proof_status TEXT DEFAULT 'pending'
    )`);

    // Ensure a column exists to store scanned CIN or uploaded ID documents.
    // If the table already exists, ALTER TABLE will throw an error when the column exists — ignore it.
    db.run("ALTER TABLE users ADD COLUMN cin_file TEXT", (err) => {});
    db.run("ALTER TABLE users ADD COLUMN payment_proof TEXT", (err) => {});
    db.run("ALTER TABLE users ADD COLUMN payment_proof_status TEXT DEFAULT 'pending'", (err) => {});

    // Create the 'projects' table
    db.run(`CREATE TABLE IF NOT EXISTS projects (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT,
        budget REAL DEFAULT 0,
        status TEXT DEFAULT 'Planning',
        start_date TEXT,
        end_date TEXT
    )`);
    
    // Create the 'project_members' junction table
    db.run(`CREATE TABLE IF NOT EXISTS project_members (
        project_id INTEGER,
        user_id INTEGER,
        committee_role TEXT,
        PRIMARY KEY (project_id, user_id),
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )`);

    // Create the updated 'transactions' table
    // Create transactions table (includes document_path and optional bank proof)
    db.run(`CREATE TABLE IF NOT EXISTS transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        type TEXT NOT NULL,
        amount REAL NOT NULL,
        category TEXT,
        description TEXT,
        date TEXT,
        document_path TEXT,
        bank_proof TEXT,
        invoice_number TEXT,
        voucher_number TEXT,
        supplier_name TEXT,
        payment_method TEXT DEFAULT 'Cash',
        project_id INTEGER,
        user_id INTEGER,
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
    )`);

    // Ensure optional columns exist if the table was created previously
    db.run("ALTER TABLE transactions ADD COLUMN bank_proof TEXT", () => {});
    db.run("ALTER TABLE transactions ADD COLUMN invoice_number TEXT", () => {});
    db.run("ALTER TABLE transactions ADD COLUMN voucher_number TEXT", () => {});
    db.run("ALTER TABLE transactions ADD COLUMN supplier_name TEXT", () => {});
    db.run("ALTER TABLE transactions ADD COLUMN payment_method TEXT DEFAULT 'Cash'", () => {});

    db.run(`CREATE TABLE IF NOT EXISTS annual_reports (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        year INTEGER NOT NULL,
        file_path TEXT NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )`);

    console.log("Database schema initialized successfully.");
};

module.exports = createTables;