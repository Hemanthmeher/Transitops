import { Request, Response, NextFunction } from 'express';
import { VehicleService } from '../services/vehicle.service';
import { sendSuccess, sendPaginated } from '../utils/helpers';

const vehicleService = new VehicleService();

export class VehicleController {
  async findAll(req: Request, res: Response, next: NextFunction) {
    try {
      const { page, limit, status, search } = req.query;
      const result = await vehicleService.findAll({
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
      const vehicle = await vehicleService.findById(Number(req.params.id));
      sendSuccess(res, vehicle);
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const vehicle = await vehicleService.create(req.body);
      sendSuccess(res, vehicle, 'Vehicle created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const vehicle = await vehicleService.update(Number(req.params.id), req.body);
      sendSuccess(res, vehicle, 'Vehicle updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await vehicleService.delete(Number(req.params.id));
      sendSuccess(res, null, 'Vehicle retired successfully');
    } catch (error) {
      next(error);
    }
  }

  async getAvailable(req: Request, res: Response, next: NextFunction) {
    try {
      const vehicles = await vehicleService.getAvailableVehicles();
      sendSuccess(res, vehicles);
    } catch (error) {
      next(error);
    }
  }
}
