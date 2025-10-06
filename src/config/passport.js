const passport = require("passport");
const { getUserByEmail, getUserById } = require("../services/user.services");
const { comparePassword } = require("../utils/hash");
const LocalStrategy = require("passport-local").Strategy;

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
            if(!user.is_active || !user.email_verified) return done(new Error("User is not active or email not verified"), false);
            const isValidPassword = await comparePassword(password, user.password_hash);
            if(!isValidPassword) return done(new Error("Incorrect email or password"), false);
            return done(null, { id: user.id });
        } catch (error) {
            return done(error, null);   
        }
    }
))