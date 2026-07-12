import { Request, Response, NextFunction } from 'express';
import { FuelService } from '../services/fuel.service';
import { sendSuccess, sendPaginated } from '../utils/helpers';

const fuelService = new FuelService();

export class FuelController {
  async findAll(req: Request, res: Response, next: NextFunction) {
    try {
      const { page, limit, vehicleId, tripId } = req.query;
      const result = await fuelService.findAll({
        page: page ? Number(page) : undefined,
        limit: limit ? Number(limit) : undefined,
        vehicleId: vehicleId ? Number(vehicleId) : undefined,
        tripId: tripId ? Number(tripId) : undefined,
      });
      sendPaginated(res, result.data, result.total, result.page, result.limit);
    } catch (error) {
      next(error);
    }
  }

  async findById(req: Request, res: Response, next: NextFunction) {
    try {
      const log = await fuelService.findById(Number(req.params.id));
      sendSuccess(res, log);
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const log = await fuelService.create(req.body);
      sendSuccess(res, log, 'Fuel log created', 201);
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const log = await fuelService.update(Number(req.params.id), req.body);
      sendSuccess(res, log, 'Fuel log updated');
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await fuelService.delete(Number(req.params.id));
      sendSuccess(res, null, 'Fuel log deleted');
    } catch (error) {
      next(error);
    }
  }
}
