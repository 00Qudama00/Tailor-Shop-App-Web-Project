const nodemailer = require('nodemailer');

async function sendOtpEmail(to, otp, purpose) {
  const title = purpose === 'reset' ? 'Reset your password' : 'Verify your email';
  const shop = process.env.SENDER_NAME || 'Tailor Shop';

  if (process.env.NODE_ENV !== 'production') {
    console.log(`[OTP] ${to} -> ${otp} (${purpose})`);
  }

  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) return;

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });

    await transporter.sendMail({
      from: `"${shop}" <${process.env.SMTP_USER}>`,
      to,
      subject: `${shop} - ${title}`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:420px;margin:auto;padding:24px;border:1px solid #e5ddd0;border-radius:12px">
          <h2 style="color:#2b2622;margin:0 0 8px">${shop}</h2>
          <p style="color:#6b6157">${title}. Your code is:</p>
          <p style="font-size:32px;letter-spacing:8px;font-weight:bold;color:#b4532a">${otp}</p>
          <p style="color:#9a8f83;font-size:12px">This code expires in 10 minutes.</p>
        </div>`,
    });
  } catch (err) {
    // a wrong Gmail password should not break register or login
    console.error('Email could not be sent:', err.message);
  }
}

module.exports = sendOtpEmail;
