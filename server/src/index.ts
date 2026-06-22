import express from 'express';
import type { Request, Response } from 'express';
import cors from 'cors';
import { connectToDatabase } from './connectDB/db.js';
import todoRoutes from './routes/todoRoutes.js';

const app = express();
app.disable('x-powered-by');
const PORT = 5000;

app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(express.json());

app.get('/', (_req: Request, res: Response) => {
  res.send('Hello, Backend is running successfully!');
});

app.use('/api/todos', todoRoutes);

const startServer = async () => {
  try {
  
    await connectToDatabase();

    app.listen(PORT, () => {
      console.log(`Server is running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server: Database connection error", error);
    process.exit(1); 
  }
};

startServer();