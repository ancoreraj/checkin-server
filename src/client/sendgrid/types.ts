export interface SendGridConfig {
    apiKey: string;
    fromEmail: string;
    fromName: string;
}

export interface EmailAttachment {
    content: string;
    filename: string;
    type: string;
    disposition: 'attachment' | 'inline';
    contentId?: string;
}

export interface SendEmailRequest {
    to: string | string[];
    subject: string;
    text: string;
    html: string;
    attachments?: EmailAttachment[];
}

export interface KYCEmailData {
    recipientName: string;
    organizationName: string;
    verificationDate: string;
    aadhaarName: string;
    aadhaarDob: string;
    aadhaarGender: string;
    aadhaarAddress: string;
    aadhaarPincode: string;
    checkInId: string;
    userImage?: string; // base64 image string
}
