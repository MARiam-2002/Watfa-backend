import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import jwt from 'jsonwebtoken';
import userModel from '../DB/models/user.model.js';
import dotenv from 'dotenv';
dotenv.config();

// تعريف استراتيجية Google OAuth مع Passport
passport.use(new GoogleStrategy(
  {
    clientID: process.env.CLIENTID, // Client ID من Google
    clientSecret: process.env.CLIENTSECRET, // Client Secret من Google
    callbackURL: 'https://watfa-backend.vercel.app/auth/google/callback', // الرابط الذي سيتم إعادة توجيه المستخدمين إليه بعد تسجيل الدخول
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      // استرداد الدور (role) من الجلسة
      const role = req.session.role || 'buyer';

      // البحث عن المستخدم باستخدام الـ googleId
      let user = await userModel.findOne({ googleId: profile.id });

      if (!user) {
        // إذا كان المستخدم غير موجود، يتم إنشاؤه
        user = new userModel({
          googleId: profile.id,
          userName: profile.displayName,
          email: profile.emails[0].value,
          role, // استخدام الدور الذي تم تمريره
        });

        await user.save();
      }

      // بعد العثور على أو إنشاء المستخدم، يتم توليد التوكن JWT
      const token = jwt.sign(
        {
          id: user._id,
          email: user.email,
          userName: user.userName,
          role: user.role,
        },
        process.env.TOKEN_KEY, // تأكد من تعيين هذا المفتاح في متغيرات البيئة
        { expiresIn: '1h' } // تحديد مدة صلاحية التوكن
      );

      // إرجاع المستخدم فقط
      done(null, user);
    } catch (error) {
      done(error); // في حالة حدوث خطأ
    }
  }
));

passport.serializeUser((user, done) => {
  done(null, user.id); // تأكد من أن بيانات المستخدم التي تستخدمها في السيريالايز هي `user.id` أو المعرف المناسب
});

passport.deserializeUser(async (id, done) => {
  const user = await userModel.findById(id);
  done(null, user); // التأكد من إرجاع البيانات بشكل صحيح
});

