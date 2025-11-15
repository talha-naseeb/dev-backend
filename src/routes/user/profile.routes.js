const express = require("express");
const upload = require("../../middleware/upload.middleware");
const { getUserProfile, updateUserProfile, logoutUser, getAllUsers } = require("../../controllers/user.controller");
const { validateUserEmail, authenticate, authorize } = require("../../middleware/auth.middleware");

const uploadFields = upload.fields([
  { name: "profileImage", maxCount: 1 },
  { name: "companyLogo", maxCount: 1 },
]);

const router = express.Router();

// User profile routes (only verified users)
router.get("/profile", authenticate, validateUserEmail, getUserProfile);
router.patch("/update-profile", authenticate, validateUserEmail, uploadFields, updateUserProfile);
router.post("/logout", authenticate, logoutUser);

// only admin can get all users
router.get("/all", authenticate, validateUserEmail, authorize("admin"), getAllUsers);

module.exports = router;
