import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import usersRouter from './routes/users.js';
import postsRouter from './routes/posts.js';
import tradesRouter from './routes/trades.js';
import careRouter from './routes/care.js';
import { warmUpResnet } from './ai/resnet.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/', (req, res) => {
  res.send('Wearithm Backend Server is running...');
});

app.use('/api/users', usersRouter);
app.use('/api/posts', postsRouter);
app.use('/api/trades', tradesRouter);
app.use('/api/care', careRouter);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  warmUpResnet();
});
