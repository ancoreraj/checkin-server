import { Request, Response } from 'express';
import * as organizationService from '../services/organization.service';

/**
 * Controller for registering a new organization
 */
export async function registerOrganization(req: Request, res: Response): Promise<void> {
    try {
        const { name, emailIds } = req.body;

        if (!name) {
            res.status(400).json({
                success: false,
                message: 'Missing required field: name',
            });
            return;
        }

        const organization = await organizationService.registerOrganization({ name, emailIds });

        res.status(201).json({
            success: true,
            message: 'Organization registered successfully',
            data: organization,
        });
    } catch (error) {
        console.error('Error in OrganizationController.registerOrganization:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to register organization',
            error: error instanceof Error ? error.message : 'Unknown error',
        });
    }
}

/**
 * Controller for getting organization details
 */
export async function getOrganization(req: Request, res: Response): Promise<void> {
    try {
        const { nameId } = req.params;

        if (!nameId) {
            res.status(400).json({
                success: false,
                message: 'Missing required parameter: nameId',
            });
            return;
        }

        const organization = await organizationService.getOrganization(nameId);

        res.status(200).json({
            success: true,
            data: organization,
        });
    } catch (error) {
        console.error('Error in OrganizationController.getOrganization:', error);
        const status = error instanceof Error && error.message === 'Organization not found' ? 404 : 500;
        res.status(status).json({
            success: false,
            message: error instanceof Error ? error.message : 'Failed to get organization',
        });
    }
}

/**
 * Controller for getting all organizations
 */
export async function getAllOrganizations(req: Request, res: Response): Promise<void> {
    try {
        const organizations = await organizationService.getAllOrganizations();

        res.status(200).json({
            success: true,
            data: organizations,
        });
    } catch (error) {
        console.error('Error in OrganizationController.getAllOrganizations:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get organizations',
        });
    }
}

/**
 * Controller for updating organization details
 */
export async function updateOrganization(req: Request, res: Response): Promise<void> {
    try {
        const { nameId } = req.params;
        const { name, emailIds } = req.body;

        if (!nameId) {
            res.status(400).json({
                success: false,
                message: 'Missing required parameter: nameId',
            });
            return;
        }

        const organization = await organizationService.updateOrganization(nameId, { name, emailIds });

        res.status(200).json({
            success: true,
            message: 'Organization updated successfully',
            data: organization,
        });
    } catch (error) {
        console.error('Error in OrganizationController.updateOrganization:', error);
        const status = error instanceof Error && error.message === 'Organization not found' ? 404 : 500;
        res.status(status).json({
            success: false,
            message: error instanceof Error ? error.message : 'Failed to update organization',
        });
    }
}

/**
 * Controller for deleting an organization
 */
export async function deleteOrganization(req: Request, res: Response): Promise<void> {
    try {
        const { nameId } = req.params;

        if (!nameId) {
            res.status(400).json({
                success: false,
                message: 'Missing required parameter: nameId',
            });
            return;
        }

        const success = await organizationService.deleteOrganization(nameId);

        if (success) {
            res.status(200).json({
                success: true,
                message: 'Organization deleted successfully',
            });
        } else {
            res.status(404).json({
                success: false,
                message: 'Organization not found or could not be deleted',
            });
        }
    } catch (error) {
        console.error('Error in OrganizationController.deleteOrganization:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete organization',
        });
    }
}
