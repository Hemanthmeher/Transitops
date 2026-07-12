import { Router } from 'express';
import { DashboardController } from '../controllers/dashboard.controller';
import { authenticate } from '../middleware/auth';

const router = Router();
const controller = new DashboardController();

router.use(authenticate);

router.get('/stats', controller.getStats.bind(controller));
router.get('/recent-trips', controller.getRecentTrips.bind(controller));
router.get('/vehicle-status', controller.getVehicleStatusDistribution.bind(controller));
router.get('/trip-status', controller.getTripStatusSummary.bind(controller));

export default router;
