const nodemailer = require("nodemailer");

const sendEmailToNewUser = async (req, res, email, groupId, groupName = '') => {
    // Guard against multiple calls
    if (res.headersSent) {
        console.warn('Headers already sent, skipping email send response');
        return;
    }

    let hasResponded = false;

    try {
        // Validate email
        if (!email) {
            return res.status(400).json({
                success: false,
                error: "Email address is required"
            });
        }

        const groupIdHash = groupId;
        const link = `http://localhost:4200/dashboard/group-detail/${groupIdHash}`;
        const newLink = 'http://localhost:4200/login'
        // zptafkazpfqyvmpc

        const transporter = nodemailer.createTransport({
            service: "Gmail",
            auth: {
                user: "rahul5555br@gmail.com",
                pass: "vuzfimbeykqaeoaq",
            },
        });

        const mailOptions = {
            to: email,
            from: "rahul5555br@gmail.com",
            subject: "Join this Splitwise group",
            text: `You have been added to the Splitmate Group ${groupName}.
            Kindly register on below link to join the Group.
            ${newLink}
            `,
        };

        const info = await transporter.sendMail(mailOptions);

        if (!hasResponded && !res.headersSent) {
            hasResponded = true;
            return res.status(200).json({
                success: true,
                message: "Email sent successfully"
            });
        }
    } catch (error) {
        console.error("Error sending email:", error);

        if (!hasResponded && !res.headersSent) {
            hasResponded = true;
            return res.status(500).json({
                success: false,
                error: "Failed to send email",
                details: error.message
            });
        }
    }
};

module.exports = { sendEmailToNewUser };