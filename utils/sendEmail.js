"use strict";
const nodemailer = require("nodemailer");
const { EMAIL_ID, PASS } = require('../config/keys')

// async..await is not allowed in global scope, must use a wrapper
async function sendEmail(email, data) {
  let { location, title, company, apply, summary } = data

  let testAccount = await nodemailer.createTestAccount();

  let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: EMAIL_ID, // generated ethereal user
      pass: PASS // generated ethereal password
    }
  })

  // send mail with defined transport object
  let info = await transporter.sendMail({
    from: '001@123workforce.com', // sender address
    to: email, // list of receivers
    subject: "Job Alert", // Subject line
    html: `
    <div style="background-color: aliceblue; padding: 25px">
      <h2 style="margin-bottom: 10px; color: #0046FE">123workforce</h2>
      <h2>${title}</h2>
      <div style="display: flex">
        <div style="font-size: 0.8rem;">Location: ${location}   Company: ${company}</div>

      </div>
      <p>${summary}</p>
      <a href="${apply}" style="margin-top: 10px">Apply Now</a>

      <div style="margin-top: 20px; margin-bottom: 5px;">Thank you</div>
      <div>Team 123workforce</div>
    </div>
    ` 
  })

  console.log("Message sent: %s", info.messageId);
  console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
}

module.exports = sendEmail