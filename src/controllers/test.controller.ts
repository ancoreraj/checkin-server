import { Request, Response } from 'express';
import testService from '../services/test.service';

export class TestController {
    /**
     * POST /api/test/email
     * Sends a test verification email to the registered emails of a hotel
     */
    async sendTestEmail(req: Request, res: Response): Promise<void> {
        try {
            const { email } = req.body;

            if (!email) {
                res.status(400).json({
                    success: false,
                    message: 'Missing required field: email',
                });
                return;
            }

            const success = await testService.sendTestEmail(email);

            if (success) {
                res.status(200).json({
                    success: true,
                    message: `Test email sent successfully to ${email}`,
                });
            } else {
                res.status(500).json({
                    success: false,
                    message: 'Failed to send test email',
                });
            }
        } catch (error) {
            console.error('Error in sendTestEmail controller:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error while sending test email',
                error: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    }
}

export default new TestController();
