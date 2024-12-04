import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { google } from "googleapis";
import userModel from "../DB/models/user.model.js";

dotenv.config();

async function getUserDetails(accessToken) {
  try {
    const peopleService = google.people({ version: "v1", auth: accessToken });

    const res = await peopleService.people.get({
      resourceName: "people/me",
      personFields: "phoneNumbers,addresses",
    });

    const phoneNumbers = res.data.phoneNumbers;
    const phoneNumber =
      phoneNumbers && phoneNumbers.length > 0 ? phoneNumbers[0].value : null;

    const addresses = res.data.addresses;
    const country =
      addresses && addresses.length > 0 ? addresses[0].country : null;

    return { phoneNumber, country };
  } catch (error) {
    console.error("Error fetching user details: ", error.message);
    return { phoneNumber: null, country: null };
  }
}


/**
 * Configure Passport with Google OAuth strategy
 */
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.CLIENTID,
      clientSecret: process.env.CLIENTSECRET,
      callbackURL: "https://watfa-backend.vercel.app/auth/google/callback",
      passReqToCallback: true,
      scope: [
        "https://www.googleapis.com/auth/userinfo.profile",
        "https://www.googleapis.com/auth/userinfo.email",
        "https://www.googleapis.com/auth/user.phonenumbers.read", // صلاحية رقم الهاتف
        "https://www.googleapis.com/auth/user.addresses.read",  // صلاحية العنوان
      ],
    },
    async (req, accessToken, refreshToken, profile, done) => {
      try {
        // Determine role from session or default to "buyer"
        const role = req.session?.role || "buyer";

        // Fetch additional user details (phoneNumber, country)
        const { phoneNumber, country } = await getUserDetails(accessToken);

        // Check if user already exists
        let user = await userModel.findOne({
          $or: [
            { googleId: profile.id },
            { email: profile.emails[0].value },
            { userName: profile.displayName },
          ],
        });

        // If user doesn't exist, create a new one
        if (!user) {
          user = new userModel({
            googleId: profile.id,
            userName: profile.displayName,
            email: profile.emails[0].value,
            phoneNumber, // Save phone number
            country, // Save country
            role, // Save role
          });

          await user.save();
        }

        // Generate JWT token for the user
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

        // Return the user object
        done(null, user);
      } catch (error) {
        console.error("Error in Google strategy: ", error.message);
        done(error, null);
      }
    }
  )
);

/**
 * Serialize user instance to the session
 */
passport.serializeUser((user, done) => {
  done(null, user.id);
});

/**
 * Deserialize user instance from the session
 */
passport.deserializeUser(async (id, done) => {
  try {
    const user = await userModel.findById(id); // Use await to fetch the user
    done(null, user);
  } catch (error) {
    console.error("Error in deserializing user: ", error.message);
    done(error, null); // Handle errors
  }
});

export default passport;
