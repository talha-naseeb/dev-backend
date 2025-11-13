const express = require("express");
const { getUserProfile, updateUserProfile, logoutUser, getAllUsers } = require("../../controllers/user.controller");
const { validateUserEmail, authenticate, authorize } = require("../../middleware/auth.middleware");

const router = express.Router();

// User profile routes (only verified users)
router.get("/profile", authenticate, validateUserEmail, getUserProfile);
router.patch("/update-profile", authenticate, validateUserEmail, updateUserProfile);

// Logout (only authenticated users)
router.post("/logout", authenticate, logoutUser);

// Admin only
router.get("/all", authenticate, validateUserEmail, authorize("admin"), getAllUsers);

module.exports = router;
