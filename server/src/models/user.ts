// filepath: sqlite-auth-server/src/models/user.ts

import { Database } from 'sqlite3';

export const User = {

  createTable: (db: Database): void => {
    db.run(`CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY NOT NULL,
            email TEXT UNIQUE NOT NULL,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL
        )`);
  },

  findById: (db: Database, id: string, callback: (err: Error | null, user?: User) => void): void => {
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
    try {
      db.run(`INSERT INTO users (, username, password) VALUES (?, ?)`, [username, password], function (err) {
        callback(err);
      });
    } catch (error) {
      //@todo implement no table error handling and others
      console.error('Error creating user:', error);
      throw error;
      if (error.code === 'SQLITE_CONSTRAINT') {
        callback(new Error('Username already exists'));
      }
    }
  }
}