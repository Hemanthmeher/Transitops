import { Request, Response, NextFunction } from 'express';
import { DriverService } from '../services/driver.service';
import { sendSuccess, sendPaginated } from '../utils/helpers';

const driverService = new DriverService();

export class DriverController {
  async findAll(req: Request, res: Response, next: NextFunction) {
    try {
      const { page, limit, status, search } = req.query;
      const result = await driverService.findAll({
        page: page ? Number(page) : undefined,
        limit: limit ? Number(limit) : undefined,
        status: status as string,
        search: search as string,
      });
      sendPaginated(res, result.data, result.total, result.page, result.limit);
    } catch (error) {
      next(error);
    }
  }

  async findById(req: Request, res: Response, next: NextFunction) {
    try {
      const driver = await driverService.findById(Number(req.params.id));
      sendSuccess(res, driver);
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const driver = await driverService.create(req.body);
      sendSuccess(res, driver, 'Driver created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const driver = await driverService.update(Number(req.params.id), req.body);
      sendSuccess(res, driver, 'Driver updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await driverService.delete(Number(req.params.id));
      sendSuccess(res, null, 'Driver suspended successfully');
    } catch (error) {
      next(error);
    }
  }

  async getAvailable(req: Request, res: Response, next: NextFunction) {
    try {
      const drivers = await driverService.getAvailableDrivers();
      sendSuccess(res, drivers);
    } catch (error) {
      next(error);
    }
  }
}
