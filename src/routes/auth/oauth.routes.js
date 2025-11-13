const express = require("express");
const passport = require("passport");

const router = express.Router();

/* OAuth routes commented out for future implementation
// Google OAuth routes
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

router.get("/google/callback", passport.authenticate("google", { failureRedirect: "/login" }), (req, res) => {
  const token = req.user.generateAuthToken();
  res.redirect(`/auth-success?token=${token}`);
});

// Microsoft OAuth routes
router.get("/microsoft", passport.authenticate("microsoft", { scope: ["user.read"] }));

router.get("/microsoft/callback", passport.authenticate("microsoft", { failureRedirect: "/login" }), (req, res) => {
  const token = req.user.generateAuthToken();
  res.redirect(`/auth-success?token=${token}`);
});
*/

module.exports = router;
