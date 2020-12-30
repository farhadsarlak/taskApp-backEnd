"use strict";
const nodemailer = require("nodemailer");

async function sendWelcomeEmail(email, name) {

    console.log("user: ", process.env.EMAIL)

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL,
            pass: process.env.PASSWORD
        }
    });


    let info = await transporter.sendMail({
        from: '"Task App ⏲" <farhad.sarlak64@gmail.com>',
        to: email,
        subject: "Thanks for joining in  ✔", // Subject line

        html: `<b>Hello ${name},</b> <p>Welcome to the app</p>`, // html body
    });

    console.log("Message sent: %s", info.messageId);



    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));

}

async function sendCancelationEmail(email, name) {

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL,
            pass: process.env.PASSWORD
        }
    });


    let info = await transporter.sendMail({
        from: '"Task App ⏲" <farhad.sarlak64@gmail.com>',
        to: email,
        subject: "Sorry to see you go! ✔", // Subject line

        html: `<b>Goodbye ${name},</b> 
        <p style={color:"red"}>thanks ${name} for using this app</p>
        <p style={background-color:"red"}>I hope to see you back sometime soon.</p>
        `, // html body
    });

    console.log("Message sent: %s", info.messageId);



    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));

}

// sendWelcomeEmail().catch(console.error);
// sendCancelationEmail().catch(console.error);

module.exports = {
    sendWelcomeEmail,
    sendCancelationEmail
}