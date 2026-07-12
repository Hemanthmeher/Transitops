import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import { AppError } from '../utils/errors';
import { ZodError } from 'zod';

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  console.error('Error:', err);

  // Custom AppError
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
    return;
  }

  // Zod validation errors
  if (err instanceof ZodError) {
    const errors = err.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));
    res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors,
    });
    return;
  }

  // Prisma known request errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    switch (err.code) {
      case 'P2002':
        res.status(409).json({
          success: false,
          message: 'A record with this information already exists.',
        });
        return;
      case 'P2025':
        res.status(404).json({
          success: false,
          message: 'Record not found.',
        });
        return;
      default:
        res.status(400).json({
          success: false,
          message: 'Database error occurred.',
        });
        return;
    }
  }

  // Default error
  res.status(500).json({
    success: false,
    message: 'Internal server error.',
  });
};
