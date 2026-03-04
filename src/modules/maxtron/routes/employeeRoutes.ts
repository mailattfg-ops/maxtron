import { Router } from 'express';
import {
    getEmployees,
    getEmployee,
    createEmployee,
    updateEmployee,
    deleteEmployee
} from '../controllers/employeeController';
import { protect } from '../../../middleware/authMiddleware';

const router = Router();

// Apply auth middleware to all employee routes
router.use(protect);

router.route('/')
    .get(getEmployees)
    .post(createEmployee);

router.route('/:id')
    .get(getEmployee)
    .put(updateEmployee)
    .delete(deleteEmployee);

export default router;
