import express, { json, urlencoded } from 'express';
// import bodyParser from 'body-parser';
import authRoutes from './routes/auth';
import todoRoutes from './routes/todo';
import { db } from './config/database';
// import userRoutes from './routes/user';

const app = express();

// Middleware
app.use(json());
app.use(urlencoded({ extended: true }));

// Connect to the database
db.connect();
// Routes
app.use('/auth', authRoutes);
app.use('/todos', todoRoutes);
// app.use('/users', userRoutes);

export default app;