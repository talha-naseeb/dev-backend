const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false, // TLS (port 587) - false for TLS, true for SSL (port 465)
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

transporter.verify((err, success) => {
  if (err) console.error("SMTP Error:", err);
  else console.log("Connected to email server");
});

// Send Reset Password Email
exports.sendResetPasswordEmail = async (email, token) => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: "Password Reset Request | Developers Portal",
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f6f8; padding: 40px 0;">
        <table align="center" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <tr>
            <td style="background-color: #0d6efd; padding: 20px 40px; color: #ffffff; text-align: center; font-size: 24px; font-weight: bold;">
              Dev Portal
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
                <a href="${resetUrl}" style="background-color: #0d6efd; color: #ffffff; text-decoration: none; padding: 12px 30px; border-radius: 6px; font-weight: 600; display: inline-block;">
                  Reset Password
                </a>
              </div>
              <p style="color: #555555; font-size: 14px; line-height: 1.6;">
                If you did not request this, please ignore this email. Your password will remain unchanged.
              </p>
              <p style="color: #999999; font-size: 12px; margin-top: 20px;">
                This link will expire in <strong>30 minutes</strong> for your security.
              </p>
            </td>
          </tr>
          <tr>
            <td style="background-color: #f4f6f8; text-align: center; padding: 20px; font-size: 12px; color: #888888;">
              © ${new Date().getFullYear()} Dev Portal. All rights reserved.
            </td>
          </tr>
        </table>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Email send error:", error);
    throw new Error("Error sending reset password email");
  }
};

// Send Verification Email
exports.sendVerificationEmail = async (email, token) => {
  const verifyUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: "Email Verification Request| Developers Portal",
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f6f8; padding: 40px 0;">
        <table align="center" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <tr>
            <td style="background-color: #0d6efd; padding: 20px 40px; color: #ffffff; text-align: center; font-size: 24px; font-weight: bold;">
              Dev Portal
            </td>
          </tr>
          <tr>
            <td style="padding: 40px;">
              <h2 style="color: #333333; margin-bottom: 10px;">Email Verification Request</h2>
              <p style="color: #555555; font-size: 15px; line-height: 1.6;">
                Hi ${email},<br><br>
               This email is to verify your email address. Please click the button below to verify your email.
              </p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${verifyUrl}" style="background-color: #0d6efd; color: #ffffff; text-decoration: none; padding: 12px 30px; border-radius: 6px; font-weight: 600; display: inline-block;">
                  Verify Email
                </a>
              </div>
              <p style="color: #555555; font-size: 14px; line-height: 1.6;">
                 If you did not verify your email , it will automatically be deleted from our system.
              </p>
              <p style="color: #999999; font-size: 12px; margin-top: 20px;">
                This link will expire in <strong>30 minutes</strong> for your security.
              </p>
            </td>
          </tr>
          <tr>
            <td style="background-color: #f4f6f8; text-align: center; padding: 20px; font-size: 12px; color: #888888;">
              © ${new Date().getFullYear()} Dev Portal. All rights reserved.
            </td>
          </tr>
        </table>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

// Send Employee Credentials Email
exports.sendEmployeeCredentialsEmail = async (toEmail, plainPassword, verificationToken) => {
  const verifyUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: toEmail,
    subject: "Your Account Credentials | Developers Portal",
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f6f8; padding: 40px 0;">
        <table align="center" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <tr>
            <td style="background-color: #0d6efd; padding: 20px 40px; color: #ffffff; text-align: center; font-size: 24px; font-weight: bold;">
              Dev Portal
            </td>
          </tr>
          <tr>
            <td style="padding: 40px;">
              <h2 style="color: #333333; margin-bottom: 10px;">Welcome to Developers Portal</h2>
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
                <a href="${verifyUrl}" style="background-color: #0d6efd; color: #ffffff; text-decoration: none; padding: 12px 30px; border-radius: 6px; font-weight: 600; display: inline-block;">
                  Login to Portal
                </a>
              </div>
              <p style="color: #555555; font-size: 14px; line-height: 1.6;">
                Please change your password after first login to keep your account secure.
              </p>
            </td>
          </tr>
          <tr>
            <td style="background-color: #f4f6f8; text-align: center; padding: 20px; font-size: 12px; color: #888888;">
              © ${new Date().getFullYear()} Dev Portal. All rights reserved.
            </td>
          </tr>
        </table>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};
