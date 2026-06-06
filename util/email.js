const nodemailer = require("nodemailer");

const sendEmail = async (option) => {
  var transport = nodemailer.createTransport({
    host: "sandbox.smtp.mailtrap.io",
    port: 2525,
    auth: {
      user: "REDACTED",
      pass: "REDACTED",
    },
  });

  const mailOption = {
    from: "REDACTED",
    to: option.userEmail,
    subject: option.subject,
    // text: option.text,
    html: option.html
  };

  await transport.sendMail(mailOption);
};

module.exports = sendEmail;
