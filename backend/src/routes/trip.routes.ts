import { Router } from 'express';
import { TripController } from '../controllers/trip.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createTripSchema, updateTripSchema } from '../validators/trip.validator';

const router = Router();
const controller = new TripController();

router.use(authenticate);

router.get('/active', controller.getActive.bind(controller));
router.get('/', controller.findAll.bind(controller));
router.get('/:id', controller.findById.bind(controller));
router.post('/', validate(createTripSchema), controller.create.bind(controller));
router.patch('/:id/status', validate(updateTripSchema), controller.updateStatus.bind(controller));

export default router;
