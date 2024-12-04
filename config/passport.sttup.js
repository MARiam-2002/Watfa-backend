import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { google } from "googleapis";
import userModel from "../DB/models/user.model.js";

dotenv.config();

/**
 * وظيفة لجلب بيانات المستخدم (رقم الهاتف والدولة) باستخدام Google People API
 */
async function getUserDetails(accessToken) {
  try {
    const peopleService = google.people({ version: "v1", auth: accessToken });

    // جلب البيانات الضرورية فقط
    const res = await peopleService.people.get({
      resourceName: "people/me",
      personFields: "phoneNumbers,addresses",
    });

    const phoneNumber = res.data.phoneNumbers?.[0]?.value || null;
    const country = res.data.addresses?.[0]?.country || null;

    return { phoneNumber, country };
  } catch (error) {
    console.error("Error fetching user details: ", error.message);
    return { phoneNumber: null, country: null }; // الإرجاع بالقيم الافتراضية
  }
}

/**
 * إعداد استراتيجية Google OAuth في Passport
 */
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
        // تحديد الدور الافتراضي (buyer) إذا لم يتم تحديده
        const role = "buyer"; // تعيين دور افتراضي مباشرة في حالة عدم وجود session

        // جلب بيانات إضافية (رقم الهاتف والدولة)
        const { phoneNumber, country } = await getUserDetails(accessToken);

        // البحث عن المستخدم في قاعدة البيانات
        let user = await userModel.findOne({
          $or: [
            { googleId: profile.id },
            { email: profile.emails[0].value },
            { userName: profile.displayName },
          ],
        });

        // إذا لم يتم العثور على المستخدم، قم بإنشاء مستخدم جديد
        if (!user) {
          user = new userModel({
            googleId: profile.id,
            userName: profile.displayName,
            email: profile.emails[0].value,
            phoneNumber, // حفظ رقم الهاتف
            country, // حفظ الدولة
            role, // حفظ الدور
          });

          await user.save();
        }

        // توليد التوكن JWT
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

        // إرسال التوكن مباشرة بعد المصادقة
        done(null, user);

      } catch (error) {
        console.error("Error in Google strategy: ", error.message);
        done(error, null);
      }
    }
  )
);

export default passport;
