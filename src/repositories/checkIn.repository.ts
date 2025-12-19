import { CheckIn, ICheckIn } from '../models/CheckIn';
import { v4 as uuidv4 } from 'uuid';

export class CheckInRepository {
    async create(data: {
        id?: string;
        organizationId: string;
        status?: string;
        externalId?: string;
    }): Promise<ICheckIn> {
        const checkIn = new CheckIn({
            id: data.id || uuidv4(),
            organizationId: data.organizationId,
            status: data.status || 'PENDING',
            externalId: data.externalId,
        });

        return await checkIn.save();
    }

    async findById(id: string): Promise<ICheckIn | null> {
        return await CheckIn.findOne({ id });
    }

    async findByExternalId(
        externalId: string
    ): Promise<ICheckIn | null> {
        return await CheckIn.findOne({ externalId });
    }

    async findByOrganizationId(
        organizationId: string,
        limit: number = 100,
        skip: number = 0
    ): Promise<ICheckIn[]> {
        return await CheckIn.find({ organizationId })
            .sort({ createdAt: -1 })
            .limit(limit)
            .skip(skip);
    }

    async findAll(limit: number = 100, skip: number = 0): Promise<ICheckIn[]> {
        return await CheckIn.find()
            .sort({ createdAt: -1 })
            .limit(limit)
            .skip(skip);
    }

    async updateStatus(id: string, status: string): Promise<ICheckIn | null> {
        return await CheckIn.findOneAndUpdate(
            { id },
            { $set: { status } },
            { new: true, runValidators: true }
        );
    }

    async delete(id: string): Promise<boolean> {
        const result = await CheckIn.deleteOne({ id });
        return result.deletedCount > 0;
    }

    async count(filter?: { organizationId?: string; status?: string }): Promise<number> {
        return await CheckIn.countDocuments(filter || {});
    }
}

export default new CheckInRepository();
