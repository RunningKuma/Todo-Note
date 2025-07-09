"use strict";
// filepath: sqlite-auth-server/src/models/user.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const database_1 = require("@server/config/database");
exports.User = {
    createTable: () => {
        //@todo implement real table
        database_1.db.run(`CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY NOT NULL,
            email TEXT UNIQUE NOT NULL,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            note_structure TEXT
        )`);
    },
    create: (id, email, username, password) => {
        return database_1.db.run(`INSERT INTO users (id, email, username, password) VALUES (?, ?, ?, ?)`, [id, email, username, password]).then(() => {
            console.log('User ' + username + ' created successfully');
        }).catch((error) => {
            console.error('Error creating user:', error);
            throw error;
        });
    },
    findUser: {
        findById: (id) => {
            return database_1.db.queryOne(`SELECT * FROM users WHERE id = ?`, [id]).then((row) => {
                if (row) {
                    return { id: row.id, email: row.email, username: row.username, password: row.password };
                }
                else {
                    return null;
                }
            }).catch((error) => {
                console.error('Error finding user by ID:', error);
                throw error;
            });
        },
        findByUsername: (username) => database_1.db.queryOne(`SELECT * FROM users WHERE username = ?`, [username]).then((row) => {
            if (row) {
                return { id: row.id, email: row.email, username: row.username, password: row.password };
            }
            else {
                return null;
            }
        }).catch((error) => {
            console.error('Error finding user by username:', error);
            throw error;
        }),
        findByEmail: (email) => database_1.db.queryOne(`SELECT * FROM users WHERE email = ?`, [email]).then((row) => {
            if (row) {
                return { id: row.id, email: row.email, username: row.username, password: row.password };
            }
            else {
                return null;
            }
        }).catch((error) => {
            console.error('Error finding user by email:', error);
            throw error;
        }),
    },
};
