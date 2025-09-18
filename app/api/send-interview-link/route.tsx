
"use server"
import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(req: NextRequest) {
    console.log("Request received to send email");
    // Parse request body if needed (e.g., for dynamic content)
    const { subject, body ,toEmail} = await req.json();

    //Create a transporter using Gmail SMTP
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'ganesan.mohan@xbpasia.com',
            pass: 'MyPassword', // Use an App Password if 2FA is enabled
        },
    });

//     const transporter = nodemailer.createTransport({
//   host: 'smtp.example.com',
//   port: 465,
//   secure: true, // true for port 465
//   auth: {
//     user: process.env.SMTP_USER,
//     pass: process.env.SMTP_PASSWORD,
//   },
// });

    const mailOptions = {
        from: 'ganesan.mohan@xbpasia.com',
        to: 'upresi.jeyaseelan@exelaonline.com',
        subject: 'Subject',
        text: 'Body of the email',
    };

    try {
        await transporter.sendMail(mailOptions);
        return NextResponse.json({ success: true, message: 'Email sent successfully' });
    } catch (error) {
        //alert('Failed to send interview link. Please check the email address and try again..' + error);
        return NextResponse.json({ success: false, message: 'Failed to send email', error: (error as Error).message }, { status: 500 });
    }
}