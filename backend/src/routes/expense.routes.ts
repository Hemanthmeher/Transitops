import { Router } from 'express';
import { ExpenseController } from '../controllers/expense.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createExpenseSchema, updateExpenseSchema } from '../validators/expense.validator';

const router = Router();
const controller = new ExpenseController();

router.use(authenticate);

router.get('/', controller.findAll.bind(controller));
router.get('/:id', controller.findById.bind(controller));
router.post('/', validate(createExpenseSchema), controller.create.bind(controller));
router.put('/:id', validate(updateExpenseSchema), controller.update.bind(controller));
router.delete('/:id', controller.delete.bind(controller));

export default router;
