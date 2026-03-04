import { Router } from 'express';

const router = Router();

// Modular routing for KEIL Operations
router.get('/dashboard', (req, res) => {
    res.json({ success: true, message: 'KEIL Module API is active.' });
});

export default router;
