import { Router } from 'express';
import * as organizationController from '../controllers/organization.controller';

const router = Router();

/**
 * @route   POST /api/organizations
 * @desc    Onboard a new organization
 * @access  Public (or semi-private depending on implementation)
 */
router.post('/', organizationController.registerOrganization);

/**
 * @route   GET /api/organizations
 * @desc    Get all registered organizations
 * @access  Public
 */
router.get('/', organizationController.getAllOrganizations);

/**
 * @route   GET /api/organizations/:nameId
 * @desc    Get specific organization details
 * @access  Public
 */
router.get('/:nameId', organizationController.getOrganization);

/**
 * @route   PATCH /api/organizations/:nameId
 * @desc    Update organization details
 * @access  Public
 */
router.patch('/:nameId', organizationController.updateOrganization);

/**
 * @route   DELETE /api/organizations/:nameId
 * @desc    Remove an organization
 * @access  Public
 */
router.delete('/:nameId', organizationController.deleteOrganization);

export default router;
