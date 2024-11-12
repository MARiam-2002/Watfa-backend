import { asyncHandler } from "../../utils/asyncHandler.js";
import { sendEmail } from "../../utils/sendEmails.js";

const about = asyncHandler(async (req, res, next) => {
  const isSent = await sendEmail({
    to: req.body.email,
    subject: "message",
    html: `<h1>thank you to send feedback</h1>`,
  });
  return isSent
    ? res.status(200).json({ success: true, message: "check your email" })
    : next(new Error("something went wrong!", { cause: 400 }));
});

export default about;
