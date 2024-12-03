const { client } = require("../data/redis-database");
const { User } = require("../model/users");
const { sendEmailToNewUser } = require("./send-email");

const addMembers = async (req, res, members, groupId) => {
  try {
    // Extract emails from members
    const memberEmails = members.map((member) => member.email);
    console.log("Extracted member emails:", memberEmails);
    // Fetch existing users from Redis or MongoDB
    const existingUsers = await Promise.all(
      memberEmails.map(async (email) => {
        if (!email) return null; // Skip empty emails
        let user = await client.get(`user:${email}`);
        if (user) {
          return JSON.parse(user);
        } else {
          const findUser = await User.findOne({ email });
          return findUser || null;
        }
      })
    );
    // Filter undefined or null users
    const validExistingUsers = existingUsers.filter((user) => user);
    console.log("Valid existing users:", validExistingUsers);
    // Extract emails of existing users
    const existingUserEmails = validExistingUsers.map((user) => user.email);
    console.log("Emails of existing users:", existingUserEmails);
    const updatedMembers = members.map((member) => ({
      ...member,
      joinedByLink: !existingUserEmails.includes(member.email) && member.email !== "",
    }));
    // Send emails to new members who joined by link
    for (const member of updatedMembers) {
      if (member.joinedByLink) {
        try {
          console.log(`Sending email to new user: ${member.email}`);
          await sendEmailToNewUser(req, res, member.email, groupId);
        } catch (error) {
          console.error(`Error sending email to ${member.email}:, error`);
        }
      }
    }
    console.log("Final member list:", updatedMembers);
    return updatedMembers; // Return updated member list
  } catch (error) {
    console.error("Error in addMembers:", error);
    throw error; // Re-throw to handle at a higher level
  }
};

module.exports = { addMembers };
