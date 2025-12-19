import { Organization, IOrganization } from '../models/Organization';
import { randomUUID } from 'crypto';

export class OrganizationRepository {
    async create(data: {
        name: string;
        emailIds?: string[];
    }): Promise<IOrganization> {
        const nameId = `${randomUUID()}_${data.name.toLowerCase().replace(/\s+/g, '_')}`;

        const organization = new Organization({
            name: data.name,
            nameId,
            emailIds: data.emailIds || [],
        });

        return await organization.save();
    }

    async findByNameId(nameId: string): Promise<IOrganization | null> {
        return await Organization.findOne({ nameId });
    }

    async findAll(limit: number = 100, skip: number = 0): Promise<IOrganization[]> {
        return await Organization.find()
            .sort({ createdAt: -1 })
            .limit(limit)
            .skip(skip);
    }

    async update(nameId: string, data: Partial<{
        name: string;
        emailIds: string[];
    }>): Promise<IOrganization | null> {
        const updateData: any = { ...data };

        // If name is being updated, regenerate nameId
        if (data.name) {
            const id = nameId.split('_')[0];
            updateData.nameId = `${id}_${data.name.toLowerCase().replace(/\s+/g, '_')}`;
        }

        return await Organization.findOneAndUpdate(
            { nameId },
            { $set: updateData },
            { new: true, runValidators: true }
        );
    }

    async delete(nameId: string): Promise<boolean> {
        const result = await Organization.deleteOne({ nameId });
        return result.deletedCount > 0;
    }

    async addEmailId(nameId: string, emailId: string): Promise<IOrganization | null> {
        return await Organization.findOneAndUpdate(
            { nameId },
            { $addToSet: { emailIds: emailId } },
            { new: true }
        );
    }

    async removeEmailId(nameId: string, emailId: string): Promise<IOrganization | null> {
        return await Organization.findOneAndUpdate(
            { nameId },
            { $pull: { emailIds: emailId } },
            { new: true }
        );
    }

    async findByEmailId(emailId: string): Promise<IOrganization[]> {
        return await Organization.find({ emailIds: emailId });
    }

    async count(): Promise<number> {
        return await Organization.countDocuments();
    }
}

export default new OrganizationRepository();
