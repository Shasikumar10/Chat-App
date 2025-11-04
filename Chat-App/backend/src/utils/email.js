// Simple email helper stub for password reset notifications.
// Replace with nodemailer / SES / SendGrid in production.

async function sendPasswordResetEmail(toEmail, { resetUrl, token }) {
  console.log('=== sendPasswordResetEmail ===');
  console.log('To:', toEmail);
  console.log('Reset URL:', resetUrl);
  console.log('Token (raw):', token);
  console.log('===============================');
  return Promise.resolve(true);
}

module.exports = { sendPasswordResetEmail };
