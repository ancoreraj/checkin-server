import { Application } from 'express';
import healthRoutes from './health.routes';
import kycRoutes from './kyc.routes';
import organizationRoutes from './organization.routes';

export const registerRoutes = (app: Application): void => {
    app.use('/', healthRoutes);
    app.use('/api/kyc', kycRoutes);
    app.use('/api/organizations', organizationRoutes);
};
