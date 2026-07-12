import express from 'express';
import cors from 'cors';
import { config } from './config';
import routes from './routes';
import { errorHandler } from './middleware/errorHandler';

const app = express();

// Middleware
app.use(cors({
  origin: config.cors.frontendUrl,
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ success: true, message: 'TransitOps API is running', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api', routes);

// Global error handler (must be last)
app.use(errorHandler);

export default app;
