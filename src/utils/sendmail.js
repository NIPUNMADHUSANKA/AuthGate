const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT || 465,
    secure: true,
    auth: {user: process.env.SMTP_USER, pass: process.env.SMTP_PASS}
})

async function sendMail(to, id, token) {
    await transporter.sendMail({
        from: process.env.MAIL_FROM,
        to: to,
        subject: "Verify your email address - AuthGate",
        html: `<h2>Welcome to AuthGate!</h2><p>Thanks for signing up. Please verify your email by clicking the link below:</p><p><a href='https://yourapp.com/api/auth/verify?token=${token}&uid=${id}' style='background:#4CAF50;color:#fff;padding:10px 15px;text-decoration:none;border-radius:5px;'>Verify Email</a></p><p>If you didn’t create an account, you can ignore this email.</p>`,
        text: `Welcome to AuthGate!\n\nThanks for signing up. Please verify your email by clicking this link:\nhttps://yourapp.com/api/auth/verify?token=${token}&uid=${id}\n\nIf you didn’t create an account, you can ignore this email.`
    });
}

module.exports = { sendMail };