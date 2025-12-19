import { CheckInStatus } from '../../models/CheckIn';

export interface CheckInStatusResponse {
    checkInId: string;
    organizationId: string;
    status: CheckInStatus;
    message: string;
    createdAt: Date;
    updatedAt: Date;
}
