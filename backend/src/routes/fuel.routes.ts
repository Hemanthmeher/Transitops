import { Router } from 'express';
import { fuelController } from '../controllers/fuel.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/monthly-summary', fuelController.getMonthlySummary.bind(fuelController));
router.get('/', fuelController.findAll.bind(fuelController));
router.get('/:id', fuelController.findById.bind(fuelController));
router.post('/', authorize('ADMIN', 'MANAGER'), fuelController.create.bind(fuelController));
router.put('/:id', authorize('ADMIN', 'MANAGER'), fuelController.update.bind(fuelController));
router.delete('/:id', authorize('ADMIN'), fuelController.delete.bind(fuelController));

export default router;
