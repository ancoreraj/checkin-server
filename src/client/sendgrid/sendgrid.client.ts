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
        attachments: request.attachments?.map(att => ({
            content: att.content,
            filename: att.filename,
            type: att.type,
            disposition: att.disposition,
            content_id: att.contentId,
        })),
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

    const subject = `CheckIn Complete - ${data.aadhaarName}`;
    const text = `CheckIn for ${data.organizationName} is complete. ID: ${data.checkInId}`;

    // Clean base64 string if it contains the metadata prefix
    const cleanBase64 = data.userImage ? data.userImage.replace(/^data:image\/\w+;base64,/, '') : '';

    const imageHtml = data.userImage
        ? `<div style="text-align: center; margin-bottom: 25px;">
             <img 
                src="cid:userImage" 
                alt="Guest Photo"
                width="120"
                height="120"
                style="
                    width: 120px; 
                    height: 120px; 
                    border-radius: 60px; 
                    border: 4px solid #4A90E2; 
                    object-fit: cover;
                    display: block;
                    margin: 0 auto;
                "
             />
           </div>`
        : '';

    const html = `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 40px; border-radius: 12px; color: #333;">
            <div style="text-align: center; margin-bottom: 30px;">
                <h2 style="color: #479dffff; margin-bottom: 10px;">CheckInVerified - ${data.organizationName}</h2>
                <p style="color: #666; margin: 0;">Successful verification for <b>${data.aadhaarName}</b></p>
            </div>

            ${imageHtml}

            <div style="background: #f8faff; padding: 25px; border-radius: 8px; border: 1px solid #eef2ff; margin: 25px 0;">
                <h3 style="margin-top: 0; color: #479dffff; border-bottom: 1px solid #e2e8f0; padding-bottom: 10px; margin-bottom: 15px;">Guest Details</h3>
                <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                        <td style="padding: 8px 0; color: #64748b; width: 120px;"><strong>Name:</strong></td>
                        <td style="padding: 8px 0; color: #1e293b;">${data.aadhaarName}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0; color: #64748b;"><strong>DOB:</strong></td>
                        <td style="padding: 8px 0; color: #1e293b;">${data.aadhaarDob}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0; color: #64748b;"><strong>Gender:</strong></td>
                        <td style="padding: 8px 0; color: #1e293b;">${data.aadhaarGender}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0; color: #64748b;"><strong>Pincode:</strong></td>
                        <td style="padding: 8px 0; color: #1e293b;">${data.aadhaarPincode}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0; color: #64748b; vertical-align: top;"><strong>Address:</strong></td>
                        <td style="padding: 8px 0; color: #1e293b; line-height: 1.4;">${data.aadhaarAddress}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0; color: #64748b; vertical-align: top;"><strong>Verified on:</strong></td>
                        <td style="padding: 8px 0; color: #1e293b; line-height: 1.4;">${data.verificationDate}</td>
                    </tr>
                </table>
            </div>

            <div style="background: #fdfdfd; padding: 15px; border-radius: 6px; border: 1px dashed #cbd5e1; margin-bottom: 25px;">
                <p style="margin: 0; font-size: 0.9em; color: #475569;">
                    <strong>Verification ID:</strong> <code style="color: #4A90E2; font-weight: bold;">${data.checkInId}</code>
                </p>
            </div>
            
            <div style="text-align: center; padding-top: 20px; border-top: 1px solid #eee; color: #94a3b8; font-size: 0.8em;">
                <p style="margin: 5px 0;">© ${new Date().getFullYear()} Easy Hotel Check-In | Digital Reception</p>
            </div>
        </div>
    `;

    return sendEmail({
        to: recipientEmail,
        subject,
        text,
        html,
        attachments: data.userImage ? [
            {
                content: cleanBase64,
                filename: `${data.aadhaarName}.jpg`,
                type: 'image/jpeg',
                disposition: 'inline',
                contentId: 'userImage',
            }
        ] : [],
    });
}
