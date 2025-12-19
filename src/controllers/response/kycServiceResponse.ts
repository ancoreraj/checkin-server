import { DecentroKYCResponse } from '../../client/decentro';
import { ICheckIn } from '../../models/CheckIn';

export interface InitiateKYCResponse {
    decentroKycResponse: DecentroKYCResponse;
    checkIn: ICheckIn;
}
