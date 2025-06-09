import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import {
  createUser,
  getById,
  getUserbyGoogleId,
} from "../models/user.model.js";

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
      prompt: "select_account",
      scope: ["profile", "email"],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Try to find user by Google OAuth ID
        let user = await getUserbyGoogleId(profile.id);
        if (user) {
          return done(null, user);
        }

        // Prepare new user data
        const newUser = {
          name: profile.displayName,
          email: profile.emails && profile.emails[0] ? profile.emails[0].value : null,
          avatar: profile.photos && profile.photos[0] ? profile.photos[0].value : null,
          oauth_provider: "google",
          oauth_id: profile.id,
          role: "student",
          password: null,
        };

        // Create new user
        const userCreated = await createUser(newUser);
        return done(null, userCreated);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await getById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

export default passport;