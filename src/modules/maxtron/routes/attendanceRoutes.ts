import { Router } from 'express';
import {
    getAllAttendance,
    getAttendanceByDate,
    createAttendance,
    updateAttendance,
    deleteAttendance
} from '../controllers/attendanceController';
import { protect } from '../../../middleware/authMiddleware';

const router = Router();

router.get('/', protect, getAllAttendance);
router.get('/date/:date', protect, getAttendanceByDate);
router.post('/', protect, createAttendance);
router.put('/:id', protect, updateAttendance);
router.delete('/:id', protect, deleteAttendance);

export default router;
