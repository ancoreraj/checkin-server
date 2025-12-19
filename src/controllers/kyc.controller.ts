import { Request, Response } from 'express';
import kycService from '../services/kyc.service';

export class KYCController {
    async initiateKYC(req: Request, res: Response): Promise<void> {
        try {
            const { organizationNameId } = req.body;

            if (!organizationNameId) {
                res.status(400).json({
                    success: false,
                    message: 'Missing required fields: organizationNameId',
                });
                return;
            }

            const response = await kycService.initiateKYC(
                organizationNameId,
            );

            res.status(200).json({
                success: true,
                message: 'KYC workflow initiated successfully',
                data: response,
            });
        } catch (error) {
            console.error('Error initiating KYC:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to initiate KYC workflow',
                error: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    }

    async handleCallback(req: Request, res: Response): Promise<void> {
        try {
            const callbackData = req.body;

            console.log(callbackData, 'callbackData');

            await kycService.handleKYCCallback(callbackData);

            res.status(200).json({
                success: true,
                message: 'Callback processed successfully',
            });
        } catch (error) {
            console.error('Error processing KYC callback:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to process callback',
                error: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    }

    async getCheckInStatus(req: Request, res: Response): Promise<void> {
        try {
            const { checkInId } = req.params;

            if (!checkInId) {
                res.status(400).json({
                    success: false,
                    message: 'Missing required parameter: checkInId',
                });
                return;
            }

            const statusData = await kycService.getCheckInStatus(checkInId);

            res.status(200).json({
                success: true,
                data: statusData,
            });
        } catch (error) {
            console.error('Error getting CheckIn status:', error);

            if (error instanceof Error && error.message === 'CheckIn not found') {
                res.status(404).json({
                    success: false,
                    message: 'CheckIn not found',
                });
                return;
            }

            res.status(500).json({
                success: false,
                message: 'Failed to get CheckIn status',
                error: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    }
}

export default new KYCController();
