import { Router } from 'express';
import inventoryRoutes from './inventoryRoutes';
import employeeRoutes from './employeeRoutes';
import companyRoutes from './companyRoutes';
import { getUserTypes } from '../controllers/userTypeController';
import { getDepartments } from '../controllers/departmentController';
import { getCategories } from '../controllers/categoryController';
import { protect } from '../../../middleware/authMiddleware';

const router = Router();

// Modular routing for Maxtron Operations
router.use('/inventory', inventoryRoutes);
router.use('/employees', employeeRoutes);
router.use('/companies', companyRoutes);
router.get('/user-types', protect, getUserTypes);
router.get('/departments', protect, getDepartments);
router.get('/categories', protect, getCategories);

export default router;
