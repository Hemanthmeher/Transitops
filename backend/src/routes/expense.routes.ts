import { Router } from 'express';
import { expenseController } from '../controllers/expense.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/monthly-summary', expenseController.getMonthlySummary.bind(expenseController));
router.get('/', expenseController.findAll.bind(expenseController));
router.get('/:id', expenseController.findById.bind(expenseController));
router.post('/', authorize('ADMIN', 'MANAGER'), expenseController.create.bind(expenseController));
router.put('/:id', authorize('ADMIN', 'MANAGER'), expenseController.update.bind(expenseController));
router.delete('/:id', authorize('ADMIN'), expenseController.delete.bind(expenseController));

export default router;
