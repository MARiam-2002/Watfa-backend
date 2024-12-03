import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import jwt from "jsonwebtoken";
import userModel from "../DB/models/user.model.js";
import dotenv from "dotenv";
import axios from "axios"; // نحتاج إلى axios لإرسال طلب إلى Google People API
dotenv.config();

import { google } from "googleapis";

async function getUserDetails(accessToken) {
  try {
    const peopleService = google.people({ version: 'v1', auth: accessToken });

    // قم بتحميل بيانات المستخدم من People API
    const res = await peopleService.people.get({
      resourceName: 'people/me',
      personFields: 'phoneNumbers,addresses',
    });

    // استخراج رقم الهاتف
    const phoneNumbers = res.data.phoneNumbers;
    const phoneNumber = phoneNumbers && phoneNumbers.length > 0 ? phoneNumbers[0].value : null;

    // استخراج العناوين
    const addresses = res.data.addresses;
    const country = addresses && addresses.length > 0 ? addresses[0].country : null;

    return { phoneNumber, country };
  } catch (error) {
    console.error("Error fetching user details: ", error);
    return { phoneNumber: null, country: null };
  }
}


passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.CLIENTID,
      clientSecret: process.env.CLIENTSECRET,
      callbackURL: "https://watfa-backend.vercel.app/auth/google/callback",
      passReqToCallback: true,
    },
    async (req, accessToken, refreshToken, profile, done) => {
      try {
        const role = req.session.role || "buyer";

        // جلب التفاصيل (رقم الهاتف والدولة)
        const { phoneNumber, country } = await getUserDetails(accessToken);

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
            phoneNumber: user.phoneNumber,
            country: user.country,
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
