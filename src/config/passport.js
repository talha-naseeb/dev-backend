const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/user.model");

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // 1. Try find by googleId
        let user = await User.findOne({ googleId: profile.id });

        if (!user) {
          const email = profile.emails?.[0]?.value;
          if (!email) return done(new Error("No email returned from Google"), null);

          // 2. Try link to existing account by email
          user = await User.findOne({ email });
          if (user) {
            user.googleId = profile.id;
            if (!user.profileImage && profile.photos?.[0]?.value) {
              user.profileImage = profile.photos[0].value;
            }
            await user.save();
          } else {
            // 3. Create new admin account
            user = await User.create({
              name: profile.displayName,
              email,
              googleId: profile.id,
              password: require("crypto").randomBytes(32).toString("hex"), // unusable random password
              role: "admin",
              isVerified: true,
              maxUsersLimit: 3,
              subscriptionTier: "free",
              profileImage: profile.photos?.[0]?.value || undefined,
            });
          }
        }

        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

module.exports = passport;
