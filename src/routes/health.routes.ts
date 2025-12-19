import { Router } from 'express';
import healthController from '../controllers/health.controller';

const router = Router();

router.get('/', healthController.getWelcome.bind(healthController));
router.get('/health', healthController.getHealth.bind(healthController));

export default router;
