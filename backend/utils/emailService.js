const nodemailer = require('nodemailer');

// Check if email is configured
const isEmailConfigured = () => {
  return !!(process.env.EMAIL_USER && process.env.EMAIL_PASS);
};

// Create email transporter
let transporter = null;

if (isEmailConfigured()) {
  transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
  console.log('✅ Email service configured with:', process.env.EMAIL_USER);
} else {
  console.log('⚠️  Email service not configured. Emails will not be sent.');
  console.log('   To enable emails, add EMAIL_USER and EMAIL_PASS to .env file');
}

/**
 * Send an email
 * @param {string} to - Recipient email address
 * @param {string} subject - Email subject
 * @param {string} html - HTML content of email
 * @returns {Promise<{success: boolean, error?: string}>}
 */
exports.sendEmail = async (to, subject, html) => {
  // If email is not configured, just log and return
  if (!isEmailConfigured()) {
    console.log(`📧 Email simulation (not configured):`);
    console.log(`   To: ${to}`);
    console.log(`   Subject: ${subject}`);
    return { success: false, error: 'Email service not configured' };
  }

  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM || `"CivicMitra" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent to: ${to} | Subject: ${subject}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Email send error:', error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Send welcome email to new citizen
 */
exports.sendWelcomeEmail = async (user) => {
  const subject = 'Welcome to CivicMitra!';
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #2563eb; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background-color: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
        .button { display: inline-block; background-color: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Welcome to CivicMitra!</h1>
        </div>
        <div class="content">
          <h2>Hello ${user.name}!</h2>
          <p>Thank you for registering with CivicMitra. Your account has been created successfully.</p>

          <p><strong>Your Login Email:</strong> ${user.email}</p>

          <p>You can now:</p>
          <ul>
            <li>File complaints about civic issues</li>
            <li>Track complaint status in real-time</li>
            <li>Chat with assigned workers</li>
            <li>Receive updates via email and in-app notifications</li>
            <li>Provide feedback on resolved complaints</li>
          </ul>

          <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/login" class="button">Login to CivicMitra</a>

          <p>If you have any questions, feel free to reach out to us.</p>

          <p>Best regards,<br>The CivicMitra Team</p>
        </div>
        <div class="footer">
          <p>This is an automated message from CivicMitra. Please do not reply to this email.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return await this.sendEmail(user.email, subject, html);
};

/**
 * Send complaint status update email
 */
exports.sendComplaintUpdateEmail = async (user, complaint, message) => {
  const subject = `Complaint Update: ${complaint.title}`;
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #2563eb; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background-color: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
        .status-badge { display: inline-block; padding: 6px 12px; border-radius: 4px; font-weight: bold; }
        .status-submitted { background-color: #dbeafe; color: #1e40af; }
        .status-in-progress { background-color: #fef3c7; color: #92400e; }
        .status-resolved { background-color: #d1fae5; color: #065f46; }
        .button { display: inline-block; background-color: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Complaint Update</h1>
        </div>
        <div class="content">
          <h2>Hello ${user.name}!</h2>
          <p>${message}</p>

          <h3>Complaint Details:</h3>
          <p><strong>Title:</strong> ${complaint.title}</p>
          <p><strong>Status:</strong> <span class="status-badge status-${complaint.status.toLowerCase().replace(' ', '-')}">${complaint.status}</span></p>
          <p><strong>Category:</strong> ${complaint.category}</p>
          <p><strong>Location:</strong> ${complaint.location}</p>

          <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/${user.slug || ''}/complaints/${complaint._id}" class="button">View Complaint Details</a>

          <p>Thank you for using CivicMitra.</p>

          <p>Best regards,<br>The CivicMitra Team</p>
        </div>
        <div class="footer">
          <p>This is an automated message from CivicMitra. Please do not reply to this email.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return await this.sendEmail(user.email, subject, html);
};

/**
 * Send worker assignment email
 */
exports.sendWorkerAssignmentEmail = async (user, complaint, worker) => {
  const subject = `Worker Assigned to Your Complaint: ${complaint.title}`;
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #10b981; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background-color: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
        .worker-info { background-color: #e0f2fe; padding: 15px; border-radius: 6px; margin: 20px 0; }
        .button { display: inline-block; background-color: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>✅ Worker Assigned!</h1>
        </div>
        <div class="content">
          <h2>Good News, ${user.name}!</h2>
          <p>A worker has been assigned to handle your complaint.</p>

          <h3>Complaint:</h3>
          <p><strong>${complaint.title}</strong></p>
          <p>${complaint.description}</p>

          <div class="worker-info">
            <h3>👷 Assigned Worker:</h3>
            <p><strong>Name:</strong> ${worker.name}</p>
            <p><strong>Email:</strong> ${worker.email}</p>
            ${worker.phone ? `<p><strong>Phone:</strong> ${worker.phone}</p>` : ''}
          </div>

          <p>You can track the progress and chat with the worker through the CivicMitra platform.</p>

          <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/${user.slug || ''}/complaints/${complaint._id}" class="button">Track Your Complaint</a>

          <p>Thank you for your patience!</p>

          <p>Best regards,<br>The CivicMitra Team</p>
        </div>
        <div class="footer">
          <p>This is an automated message from CivicMitra. Please do not reply to this email.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return await this.sendEmail(user.email, subject, html);
};

module.exports = exports;
