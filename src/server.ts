import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/database';
import authRoutes from './routes/authRoutes';
import entryRoutes from './routes/entryRoutes';
import categoryRoutes from './routes/categoryRoutes';
import tagRoutes from './routes/tagRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

connectDB();

app.get('/', (req, res) => {
  res.json({
    message: 'Mundi Wiki API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      entries: '/api/entries',
      categories: '/api/categories',
      tags: '/api/tags',
    },
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/entries', entryRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/tags', tagRoutes);

app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;
