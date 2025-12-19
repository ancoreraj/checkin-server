import { Request, Response } from 'express';
import healthService from '../services/health.service';

export class HealthController {
    async getWelcome(req: Request, res: Response): Promise<void> {
        try {
            const data = healthService.getWelcomeMessage();
            res.json(data);
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error fetching welcome message',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    async getHealth(req: Request, res: Response): Promise<void> {
        try {
            const data = healthService.getHealthStatus();
            res.json(data);
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error fetching health status',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
}

export default new HealthController();
