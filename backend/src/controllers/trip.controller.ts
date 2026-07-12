import { Request, Response, NextFunction } from 'express';
import { TripService } from '../services/trip.service';
import { sendSuccess, sendPaginated } from '../utils/helpers';

const tripService = new TripService();

export class TripController {
  async findAll(req: Request, res: Response, next: NextFunction) {
    try {
      const { page, limit, status, vehicleId, driverId, startDate, endDate } = req.query;
      const result = await tripService.findAll({
        page: page ? Number(page) : undefined,
        limit: limit ? Number(limit) : undefined,
        status: status as string,
        vehicleId: vehicleId ? Number(vehicleId) : undefined,
        driverId: driverId ? Number(driverId) : undefined,
        startDate: startDate as string,
        endDate: endDate as string,
      });
      sendPaginated(res, result.data, result.total, result.page, result.limit);
    } catch (error) {
      next(error);
    }
  }

  async findById(req: Request, res: Response, next: NextFunction) {
    try {
      const trip = await tripService.findById(Number(req.params.id));
      sendSuccess(res, trip);
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const trip = await tripService.create(req.body);
      sendSuccess(res, trip, 'Trip created and vehicle/driver dispatched', 201);
    } catch (error) {
      next(error);
    }
  }

  async updateStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { status, notes } = req.body;
      const trip = await tripService.updateStatus(Number(req.params.id), status, notes);
      sendSuccess(res, trip, `Trip ${status.toLowerCase()} successfully`);
    } catch (error) {
      next(error);
    }
  }

  async getActive(req: Request, res: Response, next: NextFunction) {
    try {
      const trips = await tripService.getActiveTrips();
      sendSuccess(res, trips);
    } catch (error) {
      next(error);
    }
  }
}
