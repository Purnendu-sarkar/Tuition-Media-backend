import nodemailer from "nodemailer";
let transporter;
async function getTransporter() {
    if (transporter)
        return transporter;
    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
        transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: Number(process.env.SMTP_PORT) || 587,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });
    }
    else {
        // Generate test SMTP service account from ethereal.email
        const testAccount = await nodemailer.createTestAccount();
        console.log("Created Ethereal test account:", testAccount.user);
        transporter = nodemailer.createTransport({
            host: "smtp.ethereal.email",
            port: 587,
            secure: false, // true for 465, false for other ports
            auth: {
                user: testAccount.user, // generated ethereal user
                pass: testAccount.pass, // generated ethereal password
            },
        });
    }
    return transporter;
}
export async function sendEmail({ to, subject, text, html }) {
    try {
        const mailTransporter = await getTransporter();
        const info = await mailTransporter.sendMail({
            from: '"AI Tuition Media" <noreply@tuitionmedia.com>',
            to,
            subject,
            text,
            html,
        });
        console.log("Message sent: %s", info.messageId);
        // For ethereal email testing
        if (!process.env.SMTP_HOST) {
            console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
        }
        return info;
    }
    catch (error) {
        console.error("Error sending email:", error);
        throw error;
    }
}
