import { Router } from 'express';
import kycController from '../controllers/kyc.controller';

const router = Router();

// POST /api/kyc/initiate - Initiate KYC workflow
router.post('/initiate', kycController.initiateKYC.bind(kycController));

// POST /api/kyc/callback - Handle KYC webhook callback
router.post('/callback', kycController.handleCallback.bind(kycController));

// GET /api/kyc/status/:checkInId - Get CheckIn status (polling endpoint)
router.get('/status/:checkInId', kycController.getCheckInStatus.bind(kycController));

export default router;
