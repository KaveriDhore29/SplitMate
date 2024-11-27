const { client } = require("../data/redis-database");
const { User } = require("../model/users");

const addMembers = async (req, res, members, groupId) => {
  // Extract emails from members array
  let memberEmails = members.map(member => member.email);

  let existingUsers = [];
  for (const member of memberEmails) {
    let user = await client.get(`user:${member}`);
    if (user) {
      existingUsers.push(JSON.parse(user)); // Assuming user data in Redis is JSON string
    } else {
      let findUser = await User.find({ email: member });
      existingUsers.push(findUser);
    }
  }

  const existingUserEmails = existingUsers.map(user => user.email);

  // Mark members who join by link
  members = members.map((member) => ({
    ...member,
    joinedByLink: !existingUserEmails.includes(member.email) && member.email !== "",
  }));

  // let isJoinByLink = false;
  // Filter out members that do not exist in the database
  members.filter(member => {
    const isExisting = existingUserEmails.includes(member.email);
    if (!isExisting && member.email !== '') {
      try {
        console.log('sendEmailToNewUser');
        // sendEmailToNewUser(req, res, member.email, groupId, groupName);
      } catch (error) {
        console.error('Error sending email to new user:', error);
      }
    }
    // return isExisting;
  });

  return members;
}

module.exports = { addMembers }