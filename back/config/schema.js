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
        phone TEXT
    )`);

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
    db.run(`CREATE TABLE IF NOT EXISTS transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        type TEXT NOT NULL,
        amount REAL NOT NULL,
        category TEXT NOT NULL,
        description TEXT,
        date TEXT DEFAULT CURRENT_TIMESTAMP,
        document_path TEXT,
        user_id INTEGER,
        project_id INTEGER,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL
    )`);

    console.log("Database schema initialized successfully.");
};

module.exports = createTables;