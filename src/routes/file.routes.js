import { Router } from 'express';
import { uploadMiddleware } from '../middleware/upload.middleware.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import {
  uploadFile, getFile, getFiles, getFileProgress, deleteFile
} from '../controllers/file.controller.js';

const router = Router();
router.use(authMiddleware);

router.post('/', uploadMiddleware.single('file'), uploadFile);
router.get('/:id/progress', getFileProgress);
router.get('/:id', getFile);
router.get('/', getFiles);
router.delete('/:id', deleteFile);

export default router;


