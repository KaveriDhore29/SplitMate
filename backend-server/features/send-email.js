const nodemailer = require("nodemailer");

const sendEmailToNewUser = async (req, res, email, groupId, groupName = '') => {
    console.log('email', email);
    if (!email) {
        throw new Error("Email address is required");
    }

    const groupIdHash = groupId;
    const link = `http://localhost:4200/dashboard/group-detail/${groupIdHash}`;
    const newLink = 'http://localhost:4200/login';

    const transporter = nodemailer.createTransport({
        service: "Gmail",
        auth: {
            user: "rahul5555br@gmail.com",
            pass: "vuzfimbeykqaeoaq", // It's better to use environment variables for sensitive data
        },
    });

    const mailOptions = {
        to: email,
        from: "rahul5555br@gmail.com",
        subject: "Join this Splitwise group",
        text: `You have been added to the Splitmate Group ${groupName}.
            Kindly register on the link below to join the Group:
            ${newLink}`,
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log("Email sent:", info.response);
        return {
            success: true,
            message: "Email sent successfully",
        };
    } catch (error) {
        console.error("Error sending email:", error);
        throw new Error("Failed to send email");
    }
};


module.exports = { sendEmailToNewUser };