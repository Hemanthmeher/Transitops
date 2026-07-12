import { Router } from 'express';
import { tripController } from '../controllers/trip.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/', tripController.findAll.bind(tripController));
router.get('/:id', tripController.findById.bind(tripController));
router.post('/', authorize('ADMIN', 'MANAGER', 'DISPATCHER'), tripController.create.bind(tripController));
router.patch('/:id/assign', authorize('ADMIN', 'MANAGER', 'DISPATCHER'), tripController.assign.bind(tripController));
router.patch('/:id/start', authorize('ADMIN', 'MANAGER', 'DISPATCHER'), tripController.startTrip.bind(tripController));
router.patch('/:id/complete', authorize('ADMIN', 'MANAGER', 'DISPATCHER'), tripController.complete.bind(tripController));
router.patch('/:id/cancel', authorize('ADMIN', 'MANAGER', 'DISPATCHER'), tripController.cancel.bind(tripController));
router.delete('/:id', authorize('ADMIN'), tripController.delete.bind(tripController));

export default router;
