// filepath: sqlite-auth-server/src/models/user.ts

import { db } from '@server/config/database';
import { UserRawData } from '@server/types/db';

export const User = {

  createTable: (): void => {
  //@todo implement real table
    db.run(`CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY NOT NULL,
            email TEXT UNIQUE NOT NULL,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL
        )`);
  },

  create: (id: string, email: string, username: string, password: string): Promise<void> => {
    return db.run(`INSERT INTO users (id, email, username, password) VALUES (?, ?, ?, ?)`, [id, email, username, password]).then(() => {
      console.log('User created successfully');
    }).catch((error) => {
      console.error('Error creating user:', error);
      throw error;
    });
  },

  findUser: {
    findById: (id: string): Promise<UserRawData | null> => {
      return db.queryOne<UserRawData>(`SELECT * FROM users WHERE id = ?`, [id]).then((row) => {
        if (row) {
          return { id: row.id, email: row.email, username: row.username, password: row.password } as UserRawData;
        } else {
          return null;
        }
      }).catch((error) => {
        console.error('Error finding user by ID:', error);
        throw error;
      });
    },

    findByUsername: (username: string): Promise<UserRawData | null> =>
      db.queryOne<UserRawData>(`SELECT * FROM users WHERE username = ?`, [username]).then((row) => {
        if (row) {
          return { id: row.id, email: row.email, username: row.username, password: row.password } as UserRawData;
        } else {
          return null;
        }
      }).catch((error) => {
        console.error('Error finding user by username:', error);
        throw error;
      }),

    findByEmail: (email: string): Promise<UserRawData | null> =>
      db.queryOne<UserRawData>(`SELECT * FROM users WHERE email = ?`, [email]).then((row) => {
        if (row) {
          return { id: row.id, email: row.email, username: row.username, password: row.password } as UserRawData;
        } else {
          return null;
        }
      }).catch((error) => {
        console.error('Error finding user by email:', error);
        throw error;
      }),
  },


};