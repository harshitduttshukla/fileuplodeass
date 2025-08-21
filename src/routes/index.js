import { Router } from 'express';
import authRoutes from './auth.routes.js';
import fileRoutes from './file.routes.js';

const router = Router();
router.use('/auth', authRoutes);
router.use('/files', fileRoutes);

export default router;

