import { Router } from 'express';
import { getCases, createCase, updateStage } from '../controllers/caseController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = Router();

router.use(authMiddleware);

router.get('/', getCases);
router.post('/', createCase);
router.patch('/:caseNumber/stage', updateStage);

export default router;
