import express from 'express';
import CORS from 'cors';
import { authRoutes } from './routes/authRoutes';
import { connectDB } from './config/mongo';
import { checkRouter } from './routes/checks';

const app = express();

app.use(CORS({
  origin: process.env.NODE_ENV === "production" ? process.env.FRONTEND : 'http://localhost:5173',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type']
}))

app.use(express.json());

app.use('/auth', authRoutes)
app.use('/check', checkRouter)

const port = process.env.PORT || 8080;

(async () => await connectDB())()

const server = app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
})

export { app, server };