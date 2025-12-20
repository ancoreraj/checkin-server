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
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
                @media only screen and (max-width: 600px) {
                    .container { padding: 25px 15px !important; border-radius: 0 !important; }
                    .card { padding: 25px 20px !important; border-radius: 16px !important; }
                    .header-title { font-size: 22px !important; }
                    .guest-photo { width: 120px !important; height: 120px !important; }
                    .details-table td { font-size: 13px !important; padding: 8px 0 !important; }
                    .id-code { font-size: 16px !important; }
                }
            </style>
        </head>
        <body style="margin: 0; padding: 0; background-color: #05070a;">
            <div class="container" style="background-color: #05070a; padding: 40px 20px; font-family: 'Outfit', 'Segoe UI', Tahoma, sans-serif;">
                <div class="card" style="max-width: 600px; margin: auto; background: #0a0f18; border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 24px; padding: 40px; box-shadow: 0 20px 40px rgba(0,0,0,0.4); color: #f8fafc;">
                    
                    <div style="text-align: center; margin-bottom: 35px;">
                        <div style="font-size: 28px; font-weight: 800; color:  #6366f1; letter-spacing: 0.05em; margin-bottom: 20px; font-family: 'Outfit', sans-serif;">
                            EasyHotelCheckIn
                        </div>

                        <div style="display: inline-block; padding: 6px 16px; background: rgba(99, 102, 241, 0.1); border: 1px solid rgba(99, 102, 241, 0.2); border-radius: 100px; color: #ffffffff; font-size: 11px; font-weight: 700; letter-spacing: 0.1em; margin-bottom: 20px; text-transform: uppercase;">
                            Check-In Complete
                        </div>
                        <h2 class="header-title" style="font-size: 28px; margin: 0; font-weight: 700; color: #6366f1;">
                            ${data.organizationName}
                        </h2>
                        <p style="color: #94a3b8; font-size: 16px; margin: 10px 0 0 0;">Digital Verification Successful for ${data.aadhaarName}</p>
                    </div>

                    ${data.userImage ? `
                    <div style="text-align: center; margin-bottom: 30px;">
                        <img 
                            src="cid:userImage" 
                            alt="Guest Photo"
                            width="130"
                            height="130"
                            class="guest-photo"
                            style="width: 130px; height: 130px; border-radius: 65px; border: 3px solid #6366f1; object-fit: cover; display: block; margin: 0 auto; box-shadow: 0 0 20px rgba(99, 102, 241, 0.3);"
                        />
                    </div>` : ''}

                    <div style="background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.05); border-radius: 16px; padding: 25px; margin-bottom: 30px;">
                        <h3 style="margin-top: 0; color: #f8fafc; font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 1px solid rgba(255, 255, 255, 0.1); padding-bottom: 12px; margin-bottom: 20px;">Guest Identity Details</h3>
                        <table class="details-table" style="width: 100%; border-collapse: collapse;">
                            <tr>
                                <td style="padding: 10px 0; color: #64748b; width: 100px; font-size: 13px;"><strong>NAME</strong></td>
                                <td style="padding: 10px 0; color: #f8fafc; font-weight: 600; font-size: 14px;">${data.aadhaarName}</td>
                            </tr>
                            <tr>
                                <td style="padding: 10px 0; color: #64748b; font-size: 13px;"><strong>DOB</strong></td>
                                <td style="padding: 10px 0; color: #f8fafc; font-size: 14px;">${data.aadhaarDob}</td>
                            </tr>
                            <tr>
                                <td style="padding: 10px 0; color: #64748b; font-size: 13px;"><strong>GENDER</strong></td>
                                <td style="padding: 10px 0; color: #f8fafc; font-size: 14px;">${data.aadhaarGender}</td>
                            </tr>
                            <tr>
                                <td style="padding: 10px 0; color: #64748b; font-size: 13px;"><strong>PINCODE</strong></td>
                                <td style="padding: 10px 0; color: #f8fafc; font-size: 14px;">${data.aadhaarPincode}</td>
                            </tr>
                            <tr>
                                <td style="padding: 10px 0; color: #64748b; vertical-align: top; font-size: 13px;"><strong>ADDRESS</strong></td>
                                <td style="padding: 10px 0; color: #f8fafc; line-height: 1.5; font-size: 14px;">${data.aadhaarAddress}</td>
                            </tr>
                        </table>
                    </div>

                    <div style="background: linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(168, 85, 247, 0.1) 100%); border: 1px dashed rgba(99, 102, 241, 0.3); border-radius: 12px; padding: 20px; margin-bottom: 30px; text-align: center;">
                        <div style="font-size: 11px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 8px;">Check-In Identification</div>
                        <code class="id-code" style="display: block; font-size: 18px; color: #22d3ee; font-weight: 700; font-family: monospace;">${data.checkInId}</code>
                        <div style="margin-top: 15px; font-size: 12px; color: #64748b;">
                            Verified on: <strong>${data.verificationDate}</strong>
                        </div>
                    </div>
                    
                    <div style="text-align: center; color: #475569; font-size: 11px; letter-spacing: 0.02em;">
                        <p style="margin: 0;">This is an automated report from your digital reception desk.</p>
                        <p style="margin: 10px 0 0 0;">© ${new Date().getFullYear()} EasyHotelCheckIn | <a href="https://easyhotelcheckin.com" style="color: #22d3ee; text-decoration: none;">easyhotelcheckin.com</a></p>
                    </div>
                </div>
            </div>
        </body>
        </html>
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
