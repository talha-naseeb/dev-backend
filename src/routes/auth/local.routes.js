const express = require("express");
const { signup, login, forgotPassword, verifyResetToken, resetPassword, verifyUserEmail, resendVerificationEmail, updateProfile, changePassword } = require("../../controllers/auth.controller");
const { validateSignUpAuth, validateLoginAuth, validateForgotPassword, validateResetPassword, authenticate, validateUpdateProfile, validateChangePassword } = require("../../middleware/auth.middleware");

const router = express.Router();

/**
 * @swagger
 * /api/auth/signup:
 *   post:
 *     summary: Register a new workspace admin
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password]
 *             properties:
 *               name: { type: string }
 *               email: { type: string }
 *               password: { type: string, minLength: 6 }
 *     responses:
 *       201: { description: User created successfully }
 *       400: { description: Invalid input or User already exists }
 */
router.post("/signup", validateSignUpAuth, signup);

/**
 * @swagger
 * /api/auth/verify-email:
 *   post:
 *     summary: Verify email with token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [token]
 *             properties:
 *               token: { type: string }
 *     responses:
 *       200: { description: Email verified }
 *       400: { description: Invalid/Expired token }
 */
router.post("/verify-email", verifyUserEmail);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Authenticate user and get token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string }
 *               password: { type: string }
 *     responses:
 *       200: { description: Login successful }
 *       401: { description: Invalid credentials }
 */
router.post("/login", validateLoginAuth, login);

/**
 * @swagger
 * /api/auth/resend-verification:
 *   post:
 *     summary: Resend verification email
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email: { type: string }
 *     responses:
 *       200: { description: Verification email resent }
 *       404: { description: User not found }
 */
router.post("/resend-verification", resendVerificationEmail);

/**
 * @swagger
 * /api/auth/forgot-password:
 *   post:
 *     summary: Send password reset email
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email: { type: string }
 *     responses:
 *       200: { description: Reset link sent }
 */
router.post("/forgot-password", validateForgotPassword, forgotPassword);

/**
 * @swagger
 * /api/auth/verify-reset-token:
 *   get:
 *     summary: Validate reset password token
 *     tags: [Auth]
 *     parameters:
 *       - in: query
 *         name: token
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Token is valid }
 *       400: { description: Token is invalid }
 */
router.get("/verify-reset-token", verifyResetToken);

/**
 * @swagger
 * /api/auth/reset-password:
 *   post:
 *     summary: Update password using reset token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [token, newPassword]
 *             properties:
 *               token: { type: string }
 *               newPassword: { type: string }
 *     responses:
 *       200: { description: Password reset successful }
 */
/**
 * @swagger
 * /api/auth/profile:
 *   put:
 *     summary: Update current user profile
 *     tags: [Auth]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               mobileNumber: { type: string }
 *               personalEmail: { type: string }
 *               department: { type: string }
 *               jobDescription: { type: string }
 *     responses:
 *       200: { description: Profile updated successfully }
 *       401: { description: Unauthorized }
 */
router.patch("/profile", authenticate, validateUpdateProfile, updateProfile);

/**
 * @swagger
 * /api/auth/change-password:
 *   put:
 *     summary: Change password for current user
 *     tags: [Auth]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [currentPassword, newPassword]
 *             properties:
 *               currentPassword: { type: string }
 *               newPassword: { type: string }
 *     responses:
 *       200: { description: Password updated successfully }
 *       400: { description: Validation error }
 *       401: { description: Invalid current password }
 */
router.patch("/change-password", authenticate, validateChangePassword, changePassword);

module.exports = router;
