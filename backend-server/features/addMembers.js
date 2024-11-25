const { client } = require("../data/redis-database");
const { User } = require("../model/users");

const addMembers = async (req, res, members, groupId) => {
  // Extract emails from members array
  let memberEmails = members.map(member => member.email);
  console.log('memberEmails ',memberEmails);

  // Find users that exist in the database
  // const getExistingUser = await client.get(memberEmails.email);
  // let arr = [];
  // memberEmails.forEach(async(member) => {
  //   let user = await client.get(member);
  //   arr.push(user);
  // });
  // let getExistingUser = arr;

  // console.log(arr);
  // console.log('getExistingUser ',getExistingUser);
  // let existingUsers;
  // // if(getExistingUser.length > 0) {
  //   console.log('inside getExiuser');
  //   existingUsers = await User.find({ email: { $in: memberEmails } });
  // // }

  let existingUsers = [];
  for (const member of memberEmails) {
    let user = await client.get(`user:${member}`);
    console.log('user ', user);
    if (user) {
      existingUsers.push(JSON.parse(user)); // Assuming user data in Redis is JSON string
    } else {
      let findUser = await User.find({ email: member });
      console.log('findUser ', findUser);
      existingUsers.push(findUser);
    }
  }


  console.log('existingUsers ', existingUsers);
  const existingUserEmails = existingUsers.map(user => user.email);

  console.log('Existing users:', existingUsers);

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
      console.log('User not found, sending email to:', member.email);
      try {
        console.log('sendEmailToNewUser');
        // sendEmailToNewUser(req, res, member.email, groupId, groupName);
      } catch (error) {
        console.error('Error sending email to new user:', error);
      }
    }
    return isExisting;
  });

  console.log('Filtered members:', members);
  return
}

module.exports = { addMembers }