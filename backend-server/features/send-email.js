const nodemailer = require("nodemailer");

const sendEmailToNewUser = async (req, res, email) => {
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

        const groupIdHash = "dummy";
        const link = `http://localhost:4200/dashboard/my-group/${groupIdHash}`;

        const transporter = nodemailer.createTransport({
            service: "Gmail",
            auth: {
                user: "rahul5555br@gmail.com",
                pass: "zptafkazpfqyvmpc",
            },
        });

        const mailOptions = {
            to: email,
            from: "rahul5555br@gmail.com",
            subject: "Join this Splitwise group",
            text: `${link}`,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log("Email sent:", info.response);

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