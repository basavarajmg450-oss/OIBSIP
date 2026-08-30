const nodemailer = require('nodemailer');

// Transporter is created once and reused. It is null until initTransporter() resolves.
let transporter = null;
// Track whether initialization has been attempted so we don't retry on every send.
let initAttempted = false;

/**
 * Build and verify the Gmail SMTP transporter using env variables.
 * Throws if required variables are missing or if SMTP handshake fails.
 */
const initTransporter = async () => {
  initAttempted = true;

  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT) || 587;
  const user = process.env.SMTP_USER;
  // Accept either SMTP_PASSWORD (documented) or legacy SMTP_PASS
  const pass = process.env.SMTP_PASSWORD || process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    throw new Error(
      'SMTP is not configured. Set SMTP_HOST, SMTP_USER, and SMTP_PASSWORD in your .env file.'
    );
  }

  // port 465 → implicit TLS (secure:true); port 587 → STARTTLS (secure:false + requireTLS:true)
  const useImplicitTLS = port === 465;

  transporter = nodemailer.createTransport({
    host,
    port,
    secure: useImplicitTLS,
    requireTLS: !useImplicitTLS,   // enforces STARTTLS on port 587; rejects plaintext fallback
    auth: { user, pass },
    // Reject self-signed certificates — important for gmail.com
    tls: { rejectUnauthorized: true },
  });

  // Verify the connection + credentials before accepting any send requests.
  // This surfaces wrong passwords / blocked accounts immediately at startup.
  await transporter.verify();
  console.log(`✅ SMTP connection verified (${host}:${port})`);
};

// Attempt to initialise at startup. Failure here is logged but does NOT crash the
// server — the missing-config error will surface properly when a send is attempted.
initTransporter().catch((err) => {
  transporter = null;
  console.warn(`⚠️  SMTP init failed at startup: ${err.message}`);
  console.warn('   Emails will not be sent until SMTP is correctly configured in .env');
});

/**
 * Send an email. Throws if SMTP is misconfigured or delivery fails — the caller
 * must handle the error and surface it to the user rather than silently swallowing it.
 *
 * @param {string} to      - Recipient email address (the address the user registered with)
 * @param {string} subject - Email subject line
 * @param {string} html    - HTML body
 */
const sendEmail = async (to, subject, html) => {
  // Lazy-init if startup init hadn't been attempted yet (e.g. env loaded late)
  if (!transporter && !initAttempted) {
    await initTransporter();
  }

  if (!transporter) {
    throw new Error(
      'SMTP transporter is not available. Check SMTP_HOST, SMTP_USER, and SMTP_PASSWORD in your .env file.'
    );
  }

  const from = process.env.SMTP_FROM
    ? `"CrustCraft" <${process.env.SMTP_FROM}>`
    : `"CrustCraft" <${process.env.SMTP_USER}>`;

  // NOTE: We deliberately do NOT log the token, the full link, or any credential.
  // The recipient address is safe to log for operational tracing.
  console.log(`📨 Sending email to: ${to} | Subject: ${subject}`);

  const info = await transporter.sendMail({ from, to, subject, html });

  // Log only the message ID (opaque reference, not sensitive).
  console.log(`✅ Email delivered | messageId: ${info.messageId}`);
};

module.exports = { sendEmail };

