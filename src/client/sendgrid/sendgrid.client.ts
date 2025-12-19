import sgMail from '@sendgrid/mail';
import { SendEmailRequest, KYCEmailData } from './types';

require('dotenv').config();

const apiKey = process.env.SENDGRID_API_KEY;
if (!apiKey) {
    console.warn('⚠️ SENDGRID_API_KEY is not defined in environment variables');
} else {
    sgMail.setApiKey(apiKey);
}

export async function sendEmail(request: SendEmailRequest): Promise<boolean> {
    const msg = {
        to: request.to,
        from: {
            email: process.env.SENDGRID_FROM_EMAIL || 'test@example.com',
            name: process.env.SENDGRID_FROM_NAME || 'Easy Check-In'
        },
        subject: request.subject,
        text: request.text,
        html: request.html,
        attachments: request.attachments,
    };

    try {
        await sgMail.send(msg);
        console.log(`✅ Email sent successfully to ${request.to}`);
        return true;
    } catch (error: any) {
        console.error('❌ Error sending email via SendGrid:', error);
        if (error.response) {
            console.error(error.response.body);
        }
        return false;
    }
}

export async function sendKYCVerificationEmail(recipientEmail: string, data: KYCEmailData): Promise<boolean> {

    const subject = `CheckIn Complete - ${data.organizationName}`;
    const text = `Dear ${data.recipientName}, your CheckIn for ${data.organizationName} is complete. ID: ${data.checkInId}`;
    const html = `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px; border-radius: 10px;">
            <h2 style="color: #4A90E2;">CheckIn Complete</h2>
            <p>Dear <strong>${data.recipientName}</strong>,</p>
            <p>Your identity verification for <strong>${data.organizationName}</strong> has been completed successfully.</p>
            
            <div style="background: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <h3 style="margin-top: 0;">Verified Details:</h3>
                <ul style="list-style: none; padding: 0; margin: 0;">
                    <li><strong>Name:</strong> ${data.aadhaarName}</li>
                    <li><strong>DOB:</strong> ${data.aadhaarDob}</li>
                    <li><strong>Gender:</strong> ${data.aadhaarGender}</li>
                    <li><strong>Address:</strong> ${data.aadhaarAddress}</li>
                    <li><strong>Pincode:</strong> ${data.aadhaarPincode}</li>
                </ul>
            </div>
            
            <p style="color: #666;">Verification ID: <code>${data.checkInId}</code></p>
            <p style="margin-top: 30px; font-size: 0.8em; color: #999;">Verified on: ${data.verificationDate}</p>
        </div>
    `;

    return sendEmail({
        to: recipientEmail,
        subject,
        text,
        html,
        attachments: data.userImage ? [
            {
                content: data.userImage,
                filename: `${data.aadhaarName}.jpg`,
                type: 'image/jpeg',
                disposition: 'attachment',
            }
        ] : [],
    });
}
