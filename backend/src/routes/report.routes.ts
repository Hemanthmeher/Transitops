import { Router } from 'express';
import { reportController } from '../controllers/report.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/', reportController.getReport.bind(reportController));
router.get('/export/csv', reportController.exportCsv.bind(reportController));

export default router;
