import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes';
import maxtronRoutes from './modules/maxtron/routes';
import keilRoutes from './modules/keil/routes';
import { protect } from './middleware/authMiddleware';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Main App API Routes
app.use('/api/auth', authRoutes); // Auth is Global

// Completely Separate Module Sections
app.use('/api/maxtron', protect, maxtronRoutes);
app.use('/api/keil', protect, keilRoutes);

// Health Check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'ERP Backend is healthy' });
});



// Catch-all for undefined API routes (ensures JSON response instead of HTML)
app.use('/api', (req, res) => {
    res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found on this server` });
});

app.listen(port, () => {
    console.log(`Backend running on port ${port} - RESTART VERIFIED`);
});
