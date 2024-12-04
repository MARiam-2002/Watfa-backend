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
        const role = req.session?.role || "buyer";

        // جلب بيانات إضافية (رقم الهاتف والدولة)
        const { phoneNumber, country } = await getUserDetails(accessToken);

        // البحث عن المستخدم باستخدام await بدلاً من callback
        let user = await userModel.findOne({
          $or: [
            { googleId: profile.id },
            { email: profile.emails[0].value },
            { userName: profile.displayName },
          ],
        });

        if (!user) {
          // إذا لم يتم العثور على المستخدم، قم بإنشاء مستخدم جديد
          user = new userModel({
            googleId: profile.id,
            userName: profile.displayName,
            email: profile.emails[0].value,
            phoneNumber,
            country,
            role,
          });

          await user.save(); // تأكد من أن المستخدم تم حفظه
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

        // إرجاع المستخدم بعد المصادقة مع التوكن
        done(null, user);
      } catch (error) {
        console.error("Error in Google strategy: ", error.message);
        done(error, null); // ارسال الخطأ إلى Passport
      }
    }
  )
);


// استخدام JWT بدلاً من الجلسات في الخطوة التالية
passport.serializeUser((user, done) => {
  done(null, user.id); // فقط حفظ الـ ID
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await userModel.findById(id);
    if (user) {
      done(null, user);
    } else {
      done(new Error("User not found"), null);
    }
  } catch (error) {
    done(error, null);
  }
});

export default passport;
