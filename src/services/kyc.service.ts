import { initiateKYCWorkflow, DecentroKYCRequest, DecentroKYCResponse } from '../client/decentro';
import organizationRepository from '../repositories/organization.repository';
import checkInRepository from '../repositories/checkIn.repository';
import { v4 as uuidv4 } from 'uuid';
import { CheckInStatus, ICheckIn } from '../models';
import { InitiateKYCResponse } from '../controllers/response/kycServiceResponse';
import { CheckInStatusResponse } from '../controllers/response/checkInStatusResponse';
import {
    DecentroCallback,
    DocumentsFetchedCallback,
    PartialDocumentsFetchedCallback,
    PartialDocumentsWithPollerCallback,
    PollerSuccessCallback,
    AadhaarData,
    PANData,
    isSessionInitiated,
    isDocumentsFetched,
    isPartialDocumentsFetched,
    isPartialDocumentsWithPoller,
    isPollerSuccess,
    isPollerRetriesExhausted,
    isSessionTermination,
    isSessionTimeout,
} from '../types/decentroCallback';
import { sendKYCVerificationEmail, KYCEmailData } from '../client/sendgrid';

export class KYCService {
    /**
     * Initiate KYC process for a user
     * @param nameId - User identifier (organization nameId)
     */
    async initiateKYC(
        nameId: string,
    ): Promise<InitiateKYCResponse> {
        try {
            const organization = await organizationRepository.findByNameId(nameId);
            if (!organization) {
                throw new Error('Organization not found');
            }

            const checkInId = uuidv4();
            const redirectUrl = `${process.env.FRONTEND_URL}/redirect/${organization.nameId}/${checkInId}`;
            // const callbackUrl = `${process.env.BACKEND_URL}/api/kyc/callback/${organization.nameId}`;
            const callbackUrl = 'https://webhook.site/03e6c0c3-1418-4af5-a3d6-c9160820f30b';

            const kycRequest: DecentroKYCRequest = {
                consent: true,
                purpose: 'To perform KYC of the individual',
                redirect_url: redirectUrl,
                uistream: 'DIGILOCKER_AADHAAR',
                skip_survey: true,
                disable_multiple_tabs: false,
                language: 'en',
                force_aadhaar: false,
                force_mobile: false,
                clear_cookies: false,
                callback_url: callbackUrl,
                reference_id: checkInId,
            };

            const decentroKycResponse = await initiateKYCWorkflow(kycRequest);
            const checkIn = await checkInRepository.create({
                id: checkInId,
                organizationId: organization.nameId,
                status: CheckInStatus.INITIATED,
                externalId: decentroKycResponse.decentroTxnId,
            });

            return {
                decentroKycResponse,
                checkIn,
            };
        } catch (error) {
            throw error;
        }
    }

    /**
     * Handle KYC webhook callback from Decentro
     * Supports all 8 callback types with proper type checking
     */
    async handleKYCCallback(callbackData: DecentroCallback): Promise<void> {
        const { initialDecentroTxnId, responseKey, message } = callbackData;

        try {
            // Find the check-in record
            const checkIn = await checkInRepository.findByExternalId(initialDecentroTxnId);

            if (!checkIn) {
                console.error(`❌ CheckIn not found for TxnId: ${initialDecentroTxnId}`);
                throw new Error('CheckIn record not found');
            }

            console.log(`📥 Processing callback: ${responseKey} for CheckIn: ${checkIn.id}`);

            if (isSessionInitiated(callbackData)) {
                await this.handleSessionInitiated(checkIn);
            } else if (isDocumentsFetched(callbackData)) {
                await this.handleDocumentsFetched(checkIn, callbackData);
            } else if (isPartialDocumentsFetched(callbackData)) {
                await this.handlePartialDocumentsFetched(checkIn, callbackData);
            } else if (isPartialDocumentsWithPoller(callbackData)) {
                await this.handlePartialDocumentsWithPoller(checkIn, callbackData);
            } else if (isPollerSuccess(callbackData)) {
                await this.handlePollerSuccess(checkIn, callbackData);
            } else if (isPollerRetriesExhausted(callbackData)) {
                await this.handlePollerRetriesExhausted(checkIn);
            } else if (isSessionTermination(callbackData)) {
                await this.handleSessionTermination(checkIn);
            } else if (isSessionTimeout(callbackData)) {
                await this.handleSessionTimeout(checkIn);
            } else {
                console.warn(`⚠️ Unknown callback type: ${responseKey}`);
            }

            console.log(`✅ Callback processed successfully: ${responseKey}`);
        } catch (error) {
            console.error(`❌ Error processing callback (${responseKey}):`, error);
            throw error;
        }
    }

    private async handleSessionInitiated(checkIn: ICheckIn): Promise<void> {
        console.log(`🚀 Session initiated for CheckIn: ${checkIn.id}`);
        await checkInRepository.updateStatus(checkIn.id, CheckInStatus.SESSION_STARTED);
    }

    private async handleDocumentsFetched(
        checkIn: ICheckIn,
        callbackData: DocumentsFetchedCallback
    ): Promise<void> {
        console.log(`📄 All documents fetched for CheckIn: ${checkIn.id}`);

        const { data } = callbackData;
        const aadhaarData = this.extractAadhaarData(data);
        const panData = data.PAN;

        if (aadhaarData) {
            this.logAadhaarData(aadhaarData);
        }

        if (panData && panData.idNumber) {
            this.logPANData(panData);
        }

        // Update status to SESSION_COMPLETED
        await checkInRepository.updateStatus(checkIn.id, CheckInStatus.SESSION_COMPLETED);
        console.log(`✅ CheckIn ${checkIn.id} marked as SESSION_COMPLETED`);

        // Send email notification
        this.sendVerificationEmailsAndUpdateStatus(checkIn, aadhaarData);
    }

    private async handlePartialDocumentsFetched(
        checkIn: ICheckIn,
        callbackData: PartialDocumentsFetchedCallback
    ): Promise<void> {
        console.log(`⚠️ Partial documents fetched (no poller) for CheckIn: ${checkIn.id}`);

        const { data } = callbackData;
        const aadhaarData = this.extractAadhaarData(data);

        if (aadhaarData) {
            this.logAadhaarData(aadhaarData);
        }

        // Check PAN error
        if (data.PAN && data.PAN.message) {
            console.error(`❌ PAN fetch failed: ${data.PAN.message}`);
        }

        // Update status - partial success
        await checkInRepository.updateStatus(checkIn.id, CheckInStatus.SESSION_COMPLETED);
        console.log(`⚠️ CheckIn ${checkIn.id} marked as SESSION_COMPLETED (partial data)`);

        this.sendVerificationEmailsAndUpdateStatus(checkIn, aadhaarData);
    }

    private async handlePartialDocumentsWithPoller(
        checkIn: ICheckIn,
        callbackData: PartialDocumentsWithPollerCallback
    ): Promise<void> {
        console.log(`🔄 Partial documents fetched, poller initiated for CheckIn: ${checkIn.id}`);

        const { data } = callbackData;
        const aadhaarData = this.extractAadhaarData(data);

        if (aadhaarData) {
            this.logAadhaarData(aadhaarData);
        }

        if (data.PAN) {
            console.log(`🔄 PAN poller initiated: ${data.PAN.message || 'Waiting for complete data'}`);
            if (data.PAN.idNumber) {
                this.logPANData(data.PAN);
            }
        }

        console.log(`⏳ Waiting for poller to complete for CheckIn: ${checkIn.id}`);
        this.sendVerificationEmailsAndUpdateStatus(checkIn, aadhaarData);
    }

    private async handlePollerSuccess(
        checkIn: ICheckIn,
        callbackData: PollerSuccessCallback
    ): Promise<void> {
        console.log(`🎯 Poller successfully fetched missing data for CheckIn: ${checkIn.id}`);

        const { data } = callbackData;

        if (data.PAN) {
            this.logPANData(data.PAN);
        }

        // Update status to SESSION_COMPLETED
        await checkInRepository.updateStatus(checkIn.id, CheckInStatus.SESSION_COMPLETED);
        console.log(`✅ CheckIn ${checkIn.id} marked as SESSION_COMPLETED (poller success)`);

        // Send email notification with complete data
        try {
            if (checkIn) {
                const organization = await organizationRepository.findByNameId(checkIn.organizationId);
                // We need Aadhaar data for the email, let's try to get it from historical records
                // For now, since we haven't implemented full storage, we'll assume the email template 
                // might need to be adjusted or we need to store the data somewhere.
                // Assuming we have Aadhaar data to send (this is a placeholder until storage is implemented)

                // Note: In a real scenario, we would fetch the stored Aadhaar data from the database here.
                // Since storing is still a TODO, this is prepared to work once that's in place.
            }
        } catch (error) {
            console.error(`❌ Error sending KYC verification emails for CheckIn ${checkIn.id} after poller success:`, error);
        }
    }

    private async handlePollerRetriesExhausted(checkIn: ICheckIn): Promise<void> {
        console.error(`❌ Poller retries exhausted for CheckIn: ${checkIn.id}`);

        // Update status to SESSION_FAILED
        await checkInRepository.updateStatus(checkIn.id, CheckInStatus.SESSION_FAILED);
        console.log(`❌ CheckIn ${checkIn.id} marked as SESSION_FAILED (poller exhausted)`);

        // TODO: Send email notification about incomplete verification
    }

    private async handleSessionTermination(checkIn: ICheckIn): Promise<void> {
        console.warn(`🛑 Session terminated by user for CheckIn: ${checkIn.id}`);

        // Update status to SESSION_FAILED
        await checkInRepository.updateStatus(checkIn.id, CheckInStatus.SESSION_FAILED);
        console.log(`❌ CheckIn ${checkIn.id} marked as SESSION_FAILED (user terminated)`);
    }

    private async handleSessionTimeout(checkIn: ICheckIn): Promise<void> {
        console.warn(`⏱️ Session timeout for CheckIn: ${checkIn.id}`);

        // Update status to SESSION_FAILED
        await checkInRepository.updateStatus(checkIn.id, CheckInStatus.SESSION_FAILED);
        console.log(`❌ CheckIn ${checkIn.id} marked as SESSION_FAILED (timeout)`);
    }

    private extractAadhaarData(data: any): AadhaarData | null {
        const aadhaarResponse = data.AADHAAR || data.EAADHAAR;

        if (aadhaarResponse && aadhaarResponse.status === 'SUCCESS' && aadhaarResponse.data) {
            return aadhaarResponse.data;
        }

        return null;
    }

    private logAadhaarData(aadhaarData: AadhaarData): void {
        console.log('📋 Aadhaar Data:');
        console.log(`  - Name: ${aadhaarData.proofOfIdentity.name}`);
        console.log(`  - DOB: ${aadhaarData.proofOfIdentity.dob}`);
        console.log(`  - Gender: ${aadhaarData.proofOfIdentity.gender}`);
        console.log(`  - Address: ${aadhaarData.proofOfAddress.locality}, ${aadhaarData.proofOfAddress.district}, ${aadhaarData.proofOfAddress.state}`);
        console.log(`  - Pincode: ${aadhaarData.proofOfAddress.pincode}`);
        console.log(`  - UID: ${aadhaarData.aadhaarUid}`);
    }

    private logPANData(panData: PANData): void {
        console.log('💳 PAN Data:');
        console.log(`  - PAN Number: ${panData.idNumber || 'N/A'}`);
        console.log(`  - Name: ${panData.userName || 'N/A'}`);
        console.log(`  - DOB: ${panData.userDateOfBirth || 'N/A'}`);
        console.log(`  - Gender: ${panData.userGender || 'N/A'}`);
        console.log(`  - Status: ${panData.documentStatus || 'N/A'}`);
    }

    private async sendVerificationEmailsAndUpdateStatus(
        checkIn: ICheckIn,
        aadhaarData: AadhaarData | null
    ): Promise<void> {
        if (!aadhaarData) return;

        try {
            const organization = await organizationRepository.findByNameId(checkIn.organizationId);
            if (!organization || !organization.emailIds || organization.emailIds.length === 0) {
                return;
            }

            const emailData: KYCEmailData = {
                recipientName: aadhaarData.proofOfIdentity.name,
                organizationName: organization.name,
                verificationDate: new Date().toLocaleDateString('en-IN'),
                aadhaarName: aadhaarData.proofOfIdentity.name,
                aadhaarDob: aadhaarData.proofOfIdentity.dob,
                aadhaarGender: aadhaarData.proofOfIdentity.gender,
                aadhaarAddress: `${aadhaarData.proofOfAddress.locality}, ${aadhaarData.proofOfAddress.district}, ${aadhaarData.proofOfAddress.state}`,
                aadhaarPincode: aadhaarData.proofOfAddress.pincode,
                checkInId: checkIn.id,
                userImage: aadhaarData.image,
            };

            const emailPromises = organization.emailIds.map(email =>
                sendKYCVerificationEmail(email, emailData)
            );

            await Promise.all(emailPromises);

            await checkInRepository.updateStatus(checkIn.id, CheckInStatus.EMAIL_SENT);
            console.log(`✅ KYC Verification emails sent for CheckIn: ${checkIn.id}`);
        } catch (error) {
            console.error(`❌ Error sending KYC verification emails for CheckIn ${checkIn.id}:`, error);
        }
    }

    async getCheckInStatus(checkInId: string): Promise<CheckInStatusResponse> {
        const checkIn = await checkInRepository.findById(checkInId);

        if (!checkIn) {
            throw new Error('CheckIn not found');
        }

        const statusMessages: Record<string, string> = {
            [CheckInStatus.INITIATED]: 'Welcome! We are preparing your digital check-in.',
            [CheckInStatus.SESSION_STARTED]: 'Identity verification in progress. Please complete the DigiLocker steps.',
            [CheckInStatus.SESSION_COMPLETED]: 'Verification successful! We are now notifying the hotel staff.',
            [CheckInStatus.SESSION_FAILED]: 'Verification failed. Please try again or visit the reception desk.',
            [CheckInStatus.EMAIL_SENT]: 'Check-in complete! A confirmation has been sent to the hotel reception.',
            [CheckInStatus.COMPLETED]: 'All set! You can now collect your keys at the reception.',
            [CheckInStatus.FAILED]: 'Check-in process encountered an issue. Please see the front desk staff.',
        };

        return {
            checkInId: checkIn.id,
            organizationId: checkIn.organizationId,
            status: checkIn.status as CheckInStatus,
            message: statusMessages[checkIn.status as CheckInStatus] || 'Status unknown',
            createdAt: checkIn.createdAt,
            updatedAt: checkIn.updatedAt,
        };
    }
}

export default new KYCService();
