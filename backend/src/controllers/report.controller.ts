import { Request, Response, NextFunction } from 'express';
import { ReportService } from '../services/report.service';
import { sendSuccess } from '../utils/helpers';

const reportService = new ReportService();

export class ReportController {
  async getTripReport(req: Request, res: Response, next: NextFunction) {
    try {
      const { startDate, endDate } = req.query;
      const report = await reportService.getTripReport(startDate as string, endDate as string);
      sendSuccess(res, report);
    } catch (error) {
      next(error);
    }
  }

  async getFuelReport(req: Request, res: Response, next: NextFunction) {
    try {
      const { startDate, endDate } = req.query;
      const report = await reportService.getFuelReport(startDate as string, endDate as string);
      sendSuccess(res, report);
    } catch (error) {
      next(error);
    }
  }

  async getExpenseReport(req: Request, res: Response, next: NextFunction) {
    try {
      const { startDate, endDate } = req.query;
      const report = await reportService.getExpenseReport(startDate as string, endDate as string);
      sendSuccess(res, report);
    } catch (error) {
      next(error);
    }
  }

  async getFleetUtilization(req: Request, res: Response, next: NextFunction) {
    try {
      const { startDate, endDate } = req.query;
      const report = await reportService.getFleetUtilizationReport(startDate as string, endDate as string);
      sendSuccess(res, report);
    } catch (error) {
      next(error);
    }
  }

  async exportTripsCsv(req: Request, res: Response, next: NextFunction) {
    try {
      const { startDate, endDate } = req.query;
      const report = await reportService.getTripReport(startDate as string, endDate as string);
      const headers = ['ID', 'Origin', 'Destination', 'Status', 'Cargo (kg)', 'Vehicle', 'Driver', 'Started', 'Completed'];
      const data = report.trips.map((t) => ({
        ID: t.id,
        Origin: t.origin,
        Destination: t.destination,
        Status: t.status,
        'Cargo (kg)': t.cargoWeight,
        Vehicle: t.vehicle.plateNumber,
        Driver: `${t.driver.firstName} ${t.driver.lastName}`,
        Started: t.startTime?.toISOString() || '',
        Completed: t.endTime?.toISOString() || '',
      }));
      const csv = reportService.generateCsv(data, headers);

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=trips-report-${Date.now()}.csv`);
      res.send(csv);
    } catch (error) {
      next(error);
    }
  }
}
