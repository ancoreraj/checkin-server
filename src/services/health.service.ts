import mongoose from 'mongoose';

export class HealthService {
    getWelcomeMessage() {
        return {
            message: 'Welcome to Easy Check-In API',
            status: 'Server is running',
            timestamp: new Date().toISOString()
        };
    }

    getHealthStatus() {
        return {
            status: 'healthy',
            database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
            uptime: process.uptime(),
            timestamp: new Date().toISOString()
        };
    }
}

export default new HealthService();
