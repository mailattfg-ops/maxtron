import { Router } from 'express';
import {
    getCustomers,
    getCustomer,
    createCustomer,
    updateCustomer,
    deleteCustomer
} from '../controllers/customerController';
import { protect } from '../../../middleware/authMiddleware';

const router = Router();

router.get('/', protect, getCustomers);
router.get('/:id', protect, getCustomer);
router.post('/', protect, createCustomer);
router.put('/:id', protect, updateCustomer);
router.delete('/:id', protect, deleteCustomer);

export default router;
