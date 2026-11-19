const nodemailer = require("nodemailer");

const sendEmail = async (option) => {
  const { SMTP_USER, SMTP_PASSWORD, SMTP_FROM } = process.env;
  if (!SMTP_USER || !SMTP_PASSWORD || !SMTP_FROM) {
    throw new Error("SMTP credentials and sender are required to send mail.");
  }

  const transport = nodemailer.createTransport({
    host: "sandbox.smtp.mailtrap.io",
    port: 2525,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASSWORD,
    },
  });

  const mailOption = {
    from: SMTP_FROM,
    to: option.userEmail,
    subject: option.subject,
    // text: option.text,
    html: option.html
  };

  await transport.sendMail(mailOption);
};

module.exports = sendEmail;
