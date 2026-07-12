import { Request, Response, NextFunction } from 'express';
import { MaintenanceService } from '../services/maintenance.service';
import { sendSuccess, sendPaginated } from '../utils/helpers';

const maintenanceService = new MaintenanceService();

export class MaintenanceController {
  async findAll(req: Request, res: Response, next: NextFunction) {
    try {
      const { page, limit, status, vehicleId } = req.query;
      const result = await maintenanceService.findAll({
        page: page ? Number(page) : undefined,
        limit: limit ? Number(limit) : undefined,
        status: status as string,
        vehicleId: vehicleId ? Number(vehicleId) : undefined,
      });
      sendPaginated(res, result.data, result.total, result.page, result.limit);
    } catch (error) {
      next(error);
    }
  }

  async findById(req: Request, res: Response, next: NextFunction) {
    try {
      const log = await maintenanceService.findById(Number(req.params.id));
      sendSuccess(res, log);
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const log = await maintenanceService.create(req.body);
      sendSuccess(res, log, 'Maintenance log created', 201);
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const log = await maintenanceService.update(Number(req.params.id), req.body);
      sendSuccess(res, log, 'Maintenance log updated');
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await maintenanceService.delete(Number(req.params.id));
      sendSuccess(res, null, 'Maintenance log cancelled');
    } catch (error) {
      next(error);
    }
  }
}
