import nodemailer from "nodemailer";

export const sendEmail = async ({ to, subject, html, attachments }) => {
  const transporter = nodemailer.createTransport({
    host: "localhost",
    port: 465,
    secure: true,
    service: "gmail",
    auth: {
      user: process.env.EMAIL,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  const emailInfo = await transporter.sendMail({
    from: `"Ecommerce " < ${process.env.EMAIL} >`,
    to,
    subject,
    html,
    attachments,
  });
  return emailInfo.accepted.length < 1 ? false : true;
};
