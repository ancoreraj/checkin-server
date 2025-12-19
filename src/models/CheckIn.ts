import mongoose, { Schema, Document } from 'mongoose';

export interface ICheckIn extends Document {
    id: string;
    organizationId: string;
    status: string;
    externalId: string;
    createdAt: Date;
    updatedAt: Date;
}

export enum CheckInStatus {
    INITIATED = 'INITIATED',
    SESSION_STARTED = 'SESSION_STARTED',
    SESSION_COMPLETED = 'SESSION_COMPLETED',
    SESSION_FAILED = 'SESSION_FAILED',
    EMAIL_SENT = 'EMAIL_SENT',
    COMPLETED = 'COMPLETED',
    FAILED = 'FAILED',
}

const CheckInSchema: Schema = new Schema(
    {
        id: {
            type: String,
            required: true,
            unique: true,
            index: true,
        },
        organizationId: {
            type: String,
            required: true,
            ref: 'Organization',
            index: true,
        },
        status: {
            type: String,
            required: true,
        },
        externalId: {
            type: String,
            required: true,
            index: true,
            unique: true,
        },
    },
    {
        timestamps: true,
        collection: 'checkins',
    }
);

CheckInSchema.index({ organizationId: 1, status: 1 });
CheckInSchema.index({ createdAt: -1 });

export const CheckIn = mongoose.model<ICheckIn>('CheckIn', CheckInSchema);
