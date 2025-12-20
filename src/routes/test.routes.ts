import { Router } from 'express';
import testController from '../controllers/test.controller';

const router = Router();

// POST /api/test/email - Send a test verification email
router.post('/email', testController.sendTestEmail.bind(testController));

export default router;
