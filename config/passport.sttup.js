passport.use(new GoogleStrategy(
  {
    clientID: process.env.CLIENTID, 
    clientSecret: process.env.CLIENTSECRET, 
    callbackURL: 'https://watfa-backend.vercel.app/auth/google/callback',  
    passReqToCallback: true, // يتيح تمرير req إلى الوظيفة
  },
  async (req, accessToken, refreshToken, profile, done) => { // إضافة req هنا
    try {
      const role = req.session.role || 'buyer'; // الآن يمكن استخدام req.session.role

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
export default passport;
