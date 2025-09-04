import nodemailer from "nodemailer";

//!smtp detail send to the details
//? SMTP : like Google STMP, Yahoo SMTP, etc.
const transporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 587,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});
export default transporter;
