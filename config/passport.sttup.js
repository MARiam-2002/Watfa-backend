import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import jwt from "jsonwebtoken";
import userModel from "../DB/models/user.model.js";
import dotenv from "dotenv";
import axios from "axios"; // نحتاج إلى axios لإرسال طلب إلى Google People API
dotenv.config();

// دالة للحصول على رقم الهاتف والدولة
const getPhoneNumberAndCountry = async (accessToken) => {
  try {
    const response = await axios.get("https://people.googleapis.com/v1/people/me", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      params: {
        personFields: "phoneNumbers,addresses", // جلب رقم الهاتف والعنوان (الدولة)
      },
    });

    const phoneNumber = response.data.phoneNumbers ? response.data.phoneNumbers[0].value : null;
    const country = response.data.addresses ? response.data.addresses[0].country : null;

    return { phoneNumber, country };
  } catch (error) {
    console.error("Error fetching phone number and country:", error);
    return { phoneNumber: null, country: null };
  }
};

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.CLIENTID,
      clientSecret: process.env.CLIENTSECRET,
      callbackURL: "https://watfa-backend.vercel.app/auth/google/callback",
      passReqToCallback: true, // يتيح تمرير req إلى الوظيفة
    },
    async (req, accessToken, refreshToken, profile, done) => {
      try {
        const role = req.session.role || "buyer";

        // جلب رقم الهاتف والدولة
        const { phoneNumber, country } = await getPhoneNumberAndCountry(accessToken);

        let user = await userModel.findOne({
          $or: [
            { googleId: profile.id },
            { email: profile.emails[0].value },
            { userName: profile.displayName },
          ],
        });

        if (!user) {
          user = new userModel({
            googleId: profile.id,
            userName: profile.displayName,
            email: profile.emails[0].value,
            phoneNumber, // تخزين رقم الهاتف
            country, // تخزين الدولة
            role,
          });

          await user.save();
        }

        const token = jwt.sign(
          {
            id: user._id,
            email: user.email,
            userName: user.userName,
            phoneNumber: user.phoneNumber, // تضمين رقم الهاتف في الـ token
            country: user.country, // تضمين الدولة في الـ token
            role: user.role,
          },
          process.env.TOKEN_KEY,
          { expiresIn: "1h" }
        );

        done(null, user);
      } catch (error) {
        done(error);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  const user = await userModel.findById(id);
  done(null, user);
});

export default passport;
