import express from 'express';
// import bodyParser from 'body-parser';
import { json, urlencoded } from 'body-parser';
import authRoutes from './routes/auth';
import userRoutes from './routes/user';
import { connectToDatabase } from './config/database';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(json());
app.use(urlencoded({ extended: true }));

// Connect to the database
connectToDatabase();

// Routes
app.use('/auth', authRoutes);
app.use('/users', userRoutes);

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

export default app;