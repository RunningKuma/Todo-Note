import express, { json, urlencoded } from 'express';
// import bodyParser from 'body-parser';
import authRoutes from './routes/auth';
import todoRoutes from './routes/todo';
import noteRoutes from './routes/note';
import { db } from './config/database';
// import userRoutes from './routes/user';

const app = express();

// Middleware
app.use(json());
app.use(urlencoded({ extended: true }));

// Connect to the database and initialize
db.connect().then(() => {
  console.log('🚀 数据库初始化完成，服务器准备就绪');
}).catch((error) => {
  console.error('❌ 数据库初始化失败:', error);
  process.exit(1);
});
// Routes
app.use('/auth', authRoutes);
app.use('/todos', todoRoutes);
app.use('/notes', noteRoutes);
// app.use('/users', userRoutes);

export default app;