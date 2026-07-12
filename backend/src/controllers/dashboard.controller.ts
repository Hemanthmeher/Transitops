import { Request, Response, NextFunction } from 'express';
import { DashboardService } from '../services/dashboard.service';
import { sendSuccess } from '../utils/helpers';

const dashboardService = new DashboardService();

export class DashboardController {
  async getStats(req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await dashboardService.getStats();
      sendSuccess(res, stats);
    } catch (error) {
      next(error);
    }
  }

  async getRecentTrips(req: Request, res: Response, next: NextFunction) {
    try {
      const trips = await dashboardService.getRecentTrips();
      sendSuccess(res, trips);
    } catch (error) {
      next(error);
    }
  }

  async getVehicleStatusDistribution(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await dashboardService.getVehicleStatusDistribution();
      sendSuccess(res, data);
    } catch (error) {
      next(error);
    }
  }

  async getTripStatusSummary(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await dashboardService.getTripStatusSummary();
      sendSuccess(res, data);
    } catch (error) {
      next(error);
    }
  }
}
