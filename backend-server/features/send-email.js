const nodemailer = require('nodemailer');
const http = require('http');

const sendEmailToNewUser = async (req, res, email) => {
    try {
        const groupIdHash = 'dummy';
        const link = `http://localhost:4200/dashboard/my-group/${groupIdHash}`;

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'rahul5555br@gmail.com',
                pass: 'zptafkazpfqyvmpc',
            },
        });

        const mailOptions = {
            to: email,
            from: 'rahul5555br@gmail.com',
            subject: 'Join this Splitwise group',
            text: `${link}`,
        };

        await transporter.sendMail(mailOptions);

        res.json({
            success: true,
            message: "Email sent successfully",
        });
    } catch (error) {
        console.error(error);
        if (res) {
            res.status(500).json({
                success: false,
                error: "Failed to send email",
            });
        }
    }
};

module.exports = { sendEmailToNewUser };
