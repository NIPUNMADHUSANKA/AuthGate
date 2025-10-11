const passport = require("passport");
const { getUserByEmail, getUserById, saveUser, userAccountActivate } = require("../services/user.services");
const { comparePassword, hashPassword } = require("../utils/hash");
const LocalStrategy = require("passport-local").Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;

passport.serializeUser((user, done) => {
    return done(null, user.id);
});

passport.deserializeUser(async(id, done) =>{
    try {
        const user = await getUserById(id);
        if(!user) return done(new Error("User not found"), null);
        return done(null, { id: user.id, email: user.email, role: user.role });
    } catch (error) {
        return done(error, null);
    }
})

passport.use(new LocalStrategy({usernameField: "email"},
    async(email, password, done) => {
        try {
            const user = await getUserByEmail(email);
            if(!user) return done(new Error("Incorrect email or password"), false);
            if(!user.email_verified) return done(new Error("Email is not verified"), false);
            const isValidPassword = await comparePassword(password, user.password_hash);
            if(!isValidPassword) return done(new Error("Incorrect email or password"), false);
            return done(null, { id: user.id });
        } catch (error) {
            return done(error, null);   
        }
    }
))

passport.use(new GoogleStrategy(
  {
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL,
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      const email = profile.emails && profile.emails[0] && profile.emails[0].value;
      if (!email) return done(new Error('Email not provided by Google'), false);

      const existing = await getUserByEmail(email);
      if (existing && existing.id) {
        // Ensure verified for OAuth logins
        if (!existing.email_verified) {
          await userAccountActivate(existing.id, true);
        }
        return done(null, { id: existing.id });
      }

      // Create a new user with a random password to satisfy NOT NULL
      const randomPwd = require('crypto').randomBytes(16).toString('hex');
      const hashed = await hashPassword(randomPwd);
      const created = await saveUser({ email, password: hashed });
      await userAccountActivate(created.id, tue);
      return done(null, { id: created.id });r
    } catch (error) {
      return done(error, null);
    }
  }
));
