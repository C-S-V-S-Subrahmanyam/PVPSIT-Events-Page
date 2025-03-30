import { transporter } from "./Email.config.js";
import { Verification_Email_Template, Welcome_Email_Template } from "./EmailTemplate.js";

export const sendVerificationEmail = async (email, verificationCode) => {
    if (!verificationCode) {
        console.log('Verification code is undefined');
        return;
    }
    
    try {
        const response = await transporter.sendMail({
            from: '"PVPSIT Events" <saigovvala2346@gmail.com>',
            to: email,
            subject: "Verify your Email",
            text: "Verify your Email",
            html: Verification_Email_Template.replace("{verificationCode}", verificationCode)
        });
        console.log('Email sent successfully', response);
    } catch (error) {
        console.log('Email error', error);
    }
};

export const sendWelcomeEmail = async (email, name) => {
    try {
        const response = await transporter.sendMail({
            from: '"PVPSIT Events" <saigovvala2346@gmail.com>',
            to: email,
            subject: "Welcome Email",
            text: "Welcome Email",
            html: Welcome_Email_Template.replace("{name}", name)
        });
        console.log('Email sent successfully', response);
    } catch (error) {
        console.log('Email error', error);
    }
};

export default sendWelcomeEmail;