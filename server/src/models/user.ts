// filepath: sqlite-auth-server/src/models/user.ts

import { Database } from 'sqlite3';

export class User {
    id: number;
    username: string;
    password: string;

    constructor(id: number, username: string, password: string) {
        this.id = id;
        this.username = username;
        this.password = password;
    }

    static createTable(db: Database): void {
        db.run(`CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL
        )`);
    }

    static findById(db: Database, id: number, callback: (err: Error | null, user?: User) => void): void {
        db.get(`SELECT * FROM users WHERE id = ?`, [id], (err, row) => {
            if (err) {
                callback(err);
                return;
            }
            if (row) {
                callback(null, new User(row.id, row.username, row.password));
            } else {
                callback(null);
            }
        });
    }

    static findByUsername(db: Database, username: string, callback: (err: Error | null, user?: User) => void): void {
        db.get(`SELECT * FROM users WHERE username = ?`, [username], (err, row) => {
            if (err) {
                callback(err);
                return;
            }
            if (row) {
                callback(null, new User(row.id, row.username, row.password));
            } else {
                callback(null);
            }
        });
    }

    static create(db: Database, username: string, password: string, callback: (err: Error | null) => void): void {
        db.run(`INSERT INTO users (username, password) VALUES (?, ?)`, [username, password], function (err) {
            callback(err);
        });
    }
}