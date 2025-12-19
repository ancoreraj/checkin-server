import organizationRepository from '../repositories/organization.repository';
import { IOrganization } from '../models/Organization';

/**
 * Register a new organization
 */
export async function registerOrganization(data: {
    name: string;
    emailIds?: string[];
}): Promise<IOrganization> {
    try {
        return await organizationRepository.create(data);
    } catch (error) {
        console.error('Error in registerOrganization:', error);
        throw error;
    }
}

/**
 * Get organization by nameId
 */
export async function getOrganization(nameId: string): Promise<IOrganization | null> {
    try {
        const organization = await organizationRepository.findByNameId(nameId);
        if (!organization) {
            throw new Error('Organization not found');
        }
        return organization;
    } catch (error) {
        console.error('Error in getOrganization:', error);
        throw error;
    }
}

/**
 * Get all organizations
 */
export async function getAllOrganizations(): Promise<IOrganization[]> {
    try {
        return await organizationRepository.findAll();
    } catch (error) {
        console.error('Error in getAllOrganizations:', error);
        throw error;
    }
}

/**
 * Update organization details
 */
export async function updateOrganization(nameId: string, data: Partial<{
    name: string;
    emailIds: string[];
}>): Promise<IOrganization | null> {
    try {
        const organization = await organizationRepository.update(nameId, data);
        if (!organization) {
            throw new Error('Organization not found');
        }
        return organization;
    } catch (error) {
        console.error('Error in updateOrganization:', error);
        throw error;
    }
}

/**
 * Delete organization
 */
export async function deleteOrganization(nameId: string): Promise<boolean> {
    try {
        return await organizationRepository.delete(nameId);
    } catch (error) {
        console.error('Error in deleteOrganization:', error);
        throw error;
    }
}
