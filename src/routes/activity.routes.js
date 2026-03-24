const express = require("express");
const { getActivities } = require("../controllers/activity.controller");
const passport = require("passport");

const router = express.Router();

router.get("/", passport.authenticate("jwt", { session: false }), getActivities);

module.exports = router;
