import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  appUrl: process.env.APP_URL || 'http://localhost:5173',
  jwt: {
    secret: process.env.JWT_SECRET || 'transitops-jwt-secret-key-2024',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
    rememberMeExpiresIn: '7d',
  },
  bcrypt: {
    saltRounds: 12,
  },
  database: {
    url: process.env.DATABASE_URL || 'file:./dev.db',
  },
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  },
  email: {
    host: process.env.SMTP_HOST || '',
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
    from: process.env.SMTP_FROM || 'noreply@transitops.com',
  },
} as const;
