import mongoose, { Schema, Document } from 'mongoose';

export interface IOrganization extends Document {
    name: string;
    nameId: string;
    emailIds: string[];
    createdAt: Date;
    updatedAt: Date;
}

const OrganizationSchema: Schema = new Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        nameId: {
            type: String,
            required: true,
            unique: true,
            index: true,
        },
        emailIds: {
            type: [String],
            default: [],
            validate: {
                validator: function (emails: string[]) {
                    return emails.every(email => /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email));
                },
                message: 'Invalid email format in emailIds array'
            }
        },
    },
    {
        timestamps: true,
        collection: 'organizations',
    }
);


export const Organization = mongoose.model<IOrganization>('Organization', OrganizationSchema);
