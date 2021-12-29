const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'myclassroom.clc@gmail.com',
        pass: 'ahihi123'
    }
});

const mailOptions = {
    from: 'myclassroom.clc@gmail.com',
    to: 'lethanhson1504@gmail.com',
    subject: 'Reset My Classroom password',
    text: 'That was easy!'
};

function sendCode(emailAdress, code) {
    mailOptions.to = emailAdress
    mailOptions.text = "Your reset pass code: " + code + ". This code will expire in 3 minutes!"
    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });
};

module.exports = sendCode;