import { Router } from 'express';
import { ReportController } from '../controllers/report.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();
const controller = new ReportController();

router.use(authenticate);
router.use(authorize('ADMIN', 'MANAGER'));

router.get('/trips', controller.getTripReport.bind(controller));
router.get('/fuel', controller.getFuelReport.bind(controller));
router.get('/expenses', controller.getExpenseReport.bind(controller));
router.get('/fleet-utilization', controller.getFleetUtilization.bind(controller));
router.get('/trips/export/csv', controller.exportTripsCsv.bind(controller));

export default router;
