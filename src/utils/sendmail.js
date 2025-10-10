const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT || 465,
    secure: true,
    auth: {user: process.env.SMTP_USER, pass: process.env.SMTP_PASS}
})

async function sendVerifyEmail(to, id, token) {
    await transporter.sendMail({
        from: process.env.MAIL_FROM,
        to: to,
        subject: "Verify your email address - AuthGate",
        html: `<h2>Welcome to AuthGate!</h2><p>Thanks for signing up. Please verify your email by clicking the link below:</p><p><a href='https://yourapp.com/api/auth/verify?token=${token}&uid=${id}' style='background:#4CAF50;color:#fff;padding:10px 15px;text-decoration:none;border-radius:5px;'>Verify Email</a></p><p>If you didn’t create an account, you can ignore this email.</p>`,
        text: `Welcome to AuthGate!\n\nThanks for signing up. Please verify your email by clicking this link:\nhttps://yourapp.com/api/auth/verify?token=${token}&uid=${id}\n\nIf you didn’t create an account, you can ignore this email.`
    });
}

async function sendForgotPasswordEmail(to, id, token) {
    await transporter.sendMail({
    from: process.env.MAIL_FROM,
    to: to,
    subject: "Reset your password - AuthGate",
    html: `
        <h2>Password Reset Request</h2>
        <p>We received a request to reset your password for your AuthGate account.</p>
        <p>If you made this request, please reset your password by clicking the button below:</p>
        <br>
        <p>
            <a href='https://yourapp.com/api/auth/reset-password?token=${token}&uid=${id}' 
               style='background:#4CAF50;color:#fff;padding:10px 15px;text-decoration:none;border-radius:5px;'>
               Reset Password
            </a>
        </p>
        <br>
        <p>If you didn’t request a password reset, you can safely ignore this email.</p>
    `,
    text: `Password Reset Request

        We received a request to reset your password for your AuthGate account.

        If you made this request, please reset your password using the link below:
        https://yourapp.com/api/auth/reset-password?token=${token}&uid=${id}

        If you didn’t request a password reset, you can safely ignore this email.`
    });
}

module.exports = { sendVerifyEmail, sendForgotPasswordEmail };