import { Response, NextFunction } from 'express';
import { reportService } from '../services/report.service';
import { AuthRequest } from '../types';

export class ReportController {
  async getReport(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { startDate, endDate } = req.query as any;
      const report = await reportService.getReport(startDate, endDate);
      res.json({ success: true, data: report });
    } catch (error) { next(error); }
  }

  async exportCsv(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { startDate, endDate, type } = req.query as any;
      const result = await reportService.exportCsv(startDate, endDate, type || 'trips');
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
      res.send(result.csv);
    } catch (error) { next(error); }
  }
}

export const reportController = new ReportController();
