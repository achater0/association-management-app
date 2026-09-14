const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');

// POST /api/notify/send-email
router.post('/send-email', async (req, res) => {
  try {
    const { to, subject, text, html } = req.body;

    if (!to || !subject) return res.status(400).json({ error: 'Recipient and subject required' });

    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = process.env.SMTP_PORT;
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;

    if (!smtpHost || !smtpPort || !smtpUser || !smtpPass) {
      return res.status(500).json({ error: 'SMTP configuration missing in environment variables' });
    }

    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: Number(smtpPort),
      secure: Number(smtpPort) === 465, // true for 465, false for other ports
      auth: {
        user: smtpUser,
        pass: smtpPass
      }
    });

    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || smtpUser,
      to,
      subject,
      text,
      html
    });

    res.status(200).json({ message: 'Email sent', info });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
