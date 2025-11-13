const express = require("express");
const { signup, login, forgotPassword, verifyResetToken, resetPassword, verifyUserEmail } = require("../../controllers/auth.controller");
const { validateSignUpAuth, validateLoginAuth, validateForgotPassword, validateResetPassword } = require("../../middleware/auth.middleware");

const router = express.Router();

router.post("/signup", validateSignUpAuth, signup);
router.post("/verify-email", verifyUserEmail);
router.post("/login", validateLoginAuth, login);
router.post("/forgot-password", validateForgotPassword, forgotPassword);
router.get("/verify-reset-token", verifyResetToken);
router.post("/reset-password", validateResetPassword, resetPassword);

module.exports = router;
