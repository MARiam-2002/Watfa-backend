import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import jwt from 'jsonwebtoken';
import userModel from '../DB/models/user.model.js';
import dotenv from 'dotenv';
dotenv.config();

passport.use(new GoogleStrategy(
  {
    clientID: process.env.CLIENTID, 
    clientSecret: process.env.CLIENTSECRET, 
    callbackURL: 'https://watfa-backend.vercel.app/auth/google/callback',  
    passReqToCallback: true, // يتيح تمرير req إلى الوظيفة

  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      const role = req.session.role || 'buyer';

      let user = await userModel.findOne({ googleId: profile.id });

      if (!user) {
        user = new userModel({
          googleId: profile.id,
          userName: profile.displayName,
          email: profile.emails[0].value,
          role, 
        });

        await user.save();
      }

      const token = jwt.sign(
        {
          id: user._id,
          email: user.email,
          userName: user.userName,
          role: user.role,
        },
        process.env.TOKEN_KEY, 
        { expiresIn: '1h' } 
      );

      done(null, user);
    } catch (error) {
      done(error); 
    }
  }
));

passport.serializeUser((user, done) => {
  done(null, user.id);  
});

passport.deserializeUser(async (id, done) => {
  const user = await userModel.findById(id);
  done(null, user); 
});

export default passport;
