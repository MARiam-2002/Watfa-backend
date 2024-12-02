import passport from "passport";
import { Strategy as FacebookStrategy } from "passport-facebook";
import dotenv from "dotenv";
import userModel from "../DB/models/user.model.js";

dotenv.config();

passport.use(
  new FacebookStrategy(
    {
      clientID: process.env.FACEBOOK_APP_ID,
      clientSecret: process.env.FACEBOOK_APP_SECRET,
      callbackURL: "https://watfa-backend.vercel.app/auth/facebook/callback",
      profileFields: ["id", "displayName", "email", "photos"],
      passReqToCallback: true, // يتيح تمرير req إلى الوظيفة
    },
    async (req, accessToken, refreshToken, profile, done) => {
      try {
        const role = req.session.role || "buyer";

        let user = await userModel.findOne({
          $or: [
            { facebookId: profile.id },
            { email: profile.emails?.[0]?.value },
            {
              userName: profile.displayName,
            },
          ],
        });
        if (!user) {
          user = new userModel({
            facebookId: profile.id,
            userName: profile.displayName,
            email: profile.emails?.[0]?.value || "", // استخدام قيمة فارغة إذا لم تكن متوفرة
            profileImage: { url: profile.photos?.[0]?.value || "" }, // استخدام قيمة فارغة إذا لم تكن متوفرة
            role: role,
          });
          await user.save();
        }
        done(null, user);
      } catch (error) {
        done(error);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.facebookId);
});

passport.deserializeUser((id, done) => {
  userModel.findOne({ facebookId: id }, (err, user) => {
    done(err, user);
  });
});

export default passport;
