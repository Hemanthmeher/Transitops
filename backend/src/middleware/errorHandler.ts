import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  }

  // Prisma errors
  if (err.name === 'PrismaClientKnownRequestError') {
    const prismaErr = err as any;
    if (prismaErr.code === 'P2002') {
      return res.status(409).json({
        success: false,
        message: 'A record with that value already exists',
      });
    }
    if (prismaErr.code === 'P2025') {
      return res.status(404).json({
        success: false,
        message: 'Record not found',
      });
    }
  }

  // Zod validation errors
  if (err.name === 'ZodError') {
    const zodErr = err as any;
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: zodErr.errors?.map((e: any) => ({
        field: e.path?.join('.'),
        message: e.message,
      })),
    });
  }

  console.error('Unhandled error:', err);
  return res.status(500).json({
    success: false,
    message: 'Internal server error',
  });
}
