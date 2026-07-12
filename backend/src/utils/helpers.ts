import { Response } from 'express';
import { AppError } from './errors';

export function sendSuccess(res: Response, data: any, message?: string, statusCode: number = 200) {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
}

export function sendPaginated(res: Response, data: any[], total: number, page: number, limit: number) {
  return res.status(200).json({
    success: true,
    data,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  });
}

export function sendError(res: Response, error: AppError) {
  return res.status(error.statusCode).json({
    success: false,
    message: error.message,
  });
}
