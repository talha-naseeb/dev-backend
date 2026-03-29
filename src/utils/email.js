const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

transporter.verify((err, success) => {
  if (err) console.error("[SMTP] Connection Error:", err);
});

// Send Reset Password Email
exports.sendResetPasswordEmail = async (email, token) => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: "Password Reset Request | Workspace Elite",
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f6f8; padding: 40px 0;">
        <table align="center" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <tr>
            <td style="background-color: #6366f1; padding: 20px 40px; color: #ffffff; text-align: center; font-size: 24px; font-weight: bold;">
              Workspace Elite
            </td>
          </tr>
          <tr>
            <td style="padding: 40px;">
              <h2 style="color: #333333; margin-bottom: 10px;">Password Reset Request</h2>
              <p style="color: #555555; font-size: 15px; line-height: 1.6;">
                Hi there,<br><br>
                We received a request to reset your password. To continue, please click the button below to securely reset your password.
              </p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${resetUrl}" style="background-color: #6366f1; color: #ffffff; text-decoration: none; padding: 12px 30px; border-radius: 6px; font-weight: 600; display: inline-block;">
                  Reset Password
                </a>
              </div>
              <p style="color: #555555; font-size: 14px; line-height: 1.6;">
                If you did not request this, please ignore this email. Your password will remain unchanged.
              </p>
              <p style="color: #999999; font-size: 12px; margin-top: 20px;">
                This link will expire in <strong>24 hours</strong> for your security.
              </p>
            </td>
          </tr>
          <tr>
            <td style="background-color: #f4f6f8; text-align: center; padding: 20px; font-size: 12px; color: #888888;">
              © ${new Date().getFullYear()} Workspace Elite. All rights reserved.
            </td>
          </tr>
        </table>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    throw new Error("Error sending reset password email");
  }
};

// Send Verification Email
exports.sendVerificationEmail = async (email, token) => {
  const verifyUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: "Email Verification | Workspace Elite",
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f6f8; padding: 40px 0;">
        <table align="center" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <tr>
            <td style="background-color: #6366f1; padding: 20px 40px; color: #ffffff; text-align: center; font-size: 24px; font-weight: bold;">
              Workspace Elite
            </td>
          </tr>
          <tr>
            <td style="padding: 40px;">
              <h2 style="color: #333333; margin-bottom: 10px;">Verify Your Email</h2>
              <p style="color: #555555; font-size: 15px; line-height: 1.6;">
                Hi ${email},<br><br>
                Please click the button below to verify your email address and activate your Workspace Elite account.
              </p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${verifyUrl}" style="background-color: #6366f1; color: #ffffff; text-decoration: none; padding: 12px 30px; border-radius: 6px; font-weight: 600; display: inline-block;">
                  Verify Email
                </a>
              </div>
              <p style="color: #555555; font-size: 14px; line-height: 1.6;">
                If you did not create an account, you can safely ignore this email.
              </p>
              <p style="color: #999999; font-size: 12px; margin-top: 20px;">
                This link will expire in <strong>1 hour</strong> for your security.
              </p>
            </td>
          </tr>
          <tr>
            <td style="background-color: #f4f6f8; text-align: center; padding: 20px; font-size: 12px; color: #888888;">
              © ${new Date().getFullYear()} Workspace Elite. All rights reserved.
            </td>
          </tr>
        </table>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    throw error;
  }
};

// Send Employee Credentials Email
exports.sendEmployeeCredentialsEmail = async (toEmail, plainPassword, verificationToken) => {
  const verifyUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: toEmail,
    subject: "Your Account Credentials | Workspace Elite",
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f6f8; padding: 40px 0;">
        <table align="center" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <tr>
            <td style="background-color: #6366f1; padding: 20px 40px; color: #ffffff; text-align: center; font-size: 24px; font-weight: bold;">
              Workspace Elite
            </td>
          </tr>
          <tr>
            <td style="padding: 40px;">
              <h2 style="color: #333333; margin-bottom: 10px;">Welcome to Workspace Elite</h2>
              <p style="color: #555555; font-size: 15px; line-height: 1.6;">
                Hi ${toEmail},<br><br>
                Your account has been created successfully. Please use the credentials below to login and update your password:
              </p>
              <table cellpadding="0" cellspacing="0" width="100%" style="margin: 20px 0;">
                <tr>
                  <td style="padding: 10px; background: #f4f6f8; border-radius: 6px;">
                    <p style="margin: 5px 0;"><strong>Email:</strong> ${toEmail}</p>
                    <p style="margin: 5px 0;"><strong>Password:</strong> ${plainPassword}</p>
                  </td>
                </tr>
              </table>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${verifyUrl}" style="background-color: #6366f1; color: #ffffff; text-decoration: none; padding: 12px 30px; border-radius: 6px; font-weight: 600; display: inline-block;">
                  Login to Workspace Elite
                </a>
              </div>
              <p style="color: #555555; font-size: 14px; line-height: 1.6;">
                Please change your password after your first login to keep your account secure.
              </p>
            </td>
          </tr>
          <tr>
            <td style="background-color: #f4f6f8; text-align: center; padding: 20px; font-size: 12px; color: #888888;">
              © ${new Date().getFullYear()} Workspace Elite. All rights reserved.
            </td>
          </tr>
        </table>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    throw error;
  }
};

// Send Password Changed Confirmation Email
exports.sendPasswordChangedEmail = async (email) => {
  const loginUrl = `${process.env.FRONTEND_URL}/auth/login`;

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: "Security Alert: Password Changed | Workspace Elite",
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f6f8; padding: 40px 0;">
        <table align="center" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <tr>
            <td style="background-color: #6366f1; padding: 20px 40px; color: #ffffff; text-align: center; font-size: 24px; font-weight: bold;">
              Workspace Elite
            </td>
          </tr>
          <tr>
            <td style="padding: 40px;">
              <h2 style="color: #333333; margin-bottom: 10px;">Security Confirmation</h2>
              <p style="color: #555555; font-size: 15px; line-height: 1.6;">
                Hi ${email},<br><br>
                This is a confirmation that the password for your Workspace Elite account has been successfully changed.
              </p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${loginUrl}" style="background-color: #6366f1; color: #ffffff; text-decoration: none; padding: 12px 30px; border-radius: 6px; font-weight: 600; display: inline-block;">
                  Login to Your Account
                </a>
              </div>
              <p style="color: #555555; font-size: 14px; line-height: 1.6;">
                If you did not perform this action, please contact our support team immediately.
              </p>
              <p style="color: #999999; font-size: 12px; margin-top: 20px;">
                Securely yours,<br>The Workspace Elite Security Team
              </p>
            </td>
          </tr>
          <tr>
            <td style="background-color: #f4f6f8; text-align: center; padding: 20px; font-size: 12px; color: #888888;">
              © ${new Date().getFullYear()} Workspace Elite. All rights reserved.
            </td>
          </tr>
        </table>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    // Non-blocking error
  }
};
