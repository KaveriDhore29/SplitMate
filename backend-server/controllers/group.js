const { sendEmailToNewUser } = require('../features/send-email');
const { Group } = require('../model/group');
const { v4: uuidv4 } = require('uuid'); // For generating a unique group ID
const { User } = require('../model/users');

// Controller to create a new group
const createGroup = 
// async (req, res) => {
  // try {
  //   const { userId, groupName } = req.body;  // userId and groupName in the request body

  //   // Validate input
  //   if (!groupName || !userId) {
  //     return res.status(400).json({ error: 'Group name and user ID are required' });
  //   }

  //   // Create the new group
  //   const newGroup = new Group({
  //     name: groupName,
  //     createdBy: userId,
  //     members: [userId], // Add the user as the first member
  //   });

  //   // Save the new group to the database
  //   await newGroup.save();

  //   // Respond with the new group
  //   res.status(201).json(newGroup);
  // } catch (error) {
  //   console.error('Error creating group:', error);
  //   res.status(500).json({ error: 'Error while creating group' });
  // }


  async (req, res) => {
    console.log('create grp');
    const { groupName, groupType } = req.body;
    let { members } = req.body;
    const username = req.body.createdBy.username;
    const email = req.body.createdBy.email;
  
    console.log('members:', members);
  
    // Validate the group name, members, and group type
    if (!groupName || !Array.isArray(members) || members.length === 0 || !groupType) {
      return res.status(400).json({ error: 'Group name, members, and group type are required' });
    }
  
    try {
      let obj ={
        username,
        email
      }
            members.push(obj);
      // Extract emails from members array
      let memberEmails = members.map(member => member.email);
  
      // Generate a unique groupId
      const groupId = uuidv4();
  
      // Find users that exist in the database
      const existingUsers = await User.find({ email: { $in: memberEmails } });
      const existingUserEmails = existingUsers.map(user => user.email);
  
      console.log('Existing users:', existingUsers);
  
      // Filter out members that do not exist in the database
      members = members.filter(member => {
        const isExisting = existingUserEmails.includes(member.email);
        if (!isExisting && member.email !== '') {
          console.log('User not found, sending email to:', member.email);
          try {
            sendEmailToNewUser(req, res, member.email, groupId);
          } catch (error) {
            console.error('Error sending email to new user:', error);
          }
        }
        return isExisting;
      });
  
      console.log('Filtered members:', members);
  
      // Add the groupId to userdatas concurrently
      const updatePromises = members.map(member =>
        User.updateOne({ email: member.email }, { $push: { groupIds: groupId } })
      );
      await Promise.all(updatePromises); // Execute all updates concurrently
  
      // Create the new group
      const newGroup = await Group.create({
        name: groupName,
        members: members,
        type: groupType,
        groupId: groupId,
        createdBy: username
      });
  
      const groupIdHash = groupId;
      const link = `http://localhost:4200/dashboard/group-detail/${groupIdHash}`;
      res.status(201).json({
        success: true,
        message: 'Group created successfully!',
        group: newGroup,
        groupIdHash,
        link,
      });
  
    } catch (error) {
      console.error('Error creating group:', error.message || error);  // Check for detailed error
      res.status(500).json({ error: error.message || 'Server error while creating group' });
    }
  };
  
// };

// Controller to add members to an existing group
const addMembersToGroup = async (req, res) => {
  try {
    const { groupId, membersToAdd } = req.body;  // Expecting groupId and an array of user IDs to add

    if (!groupId || !membersToAdd || membersToAdd.length === 0) {
      return res.status(400).json({ error: 'Group ID and members to add are required' });
    }

    // Find the group by its ID
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    // Add members to the group
    group.members.push(...membersToAdd);

    // Save the updated group
    await group.save();

    // Respond with the updated group
    res.status(200).json(group);
  } catch (error) {
    console.error('Error adding members to group:', error);
    res.status(500).json({ error: 'Error while adding members' });
  }
};

// Controller to get details of a group
const getGroupDetails = async (req, res) => {
  try {
    // const groupId = req.params.groupId;
    // console.log(groupId);
    let arrGroupIds = [];
    const {email} = req.body;
    let user = await User.find({email})
    if(!user) return res.status(404).json({ error: 'User not found' });

    console.log(user.groupIds);
    let allIds = user.groupIds;

    let allGroups = [];
    // go group ids
    for(let gId of allIds) {
      let oneGroup = await Group.find({groupId: gId});
      allGroups.push(oneGroup);
    }

    // Fetch the group details along with its members (populate member details)
    // const group = await Group.findById(groupId).populate('members', 'name email');
    // console.log(group);
    // if (!group) {
    //   return res.status(404).json({ error: 'Group not found' });
    // }

    // Return the group details
    res.status(200).json(allGroups);
  } catch (error) {
    console.error('Error fetching group details:', error);
    res.status(500).json({ error: 'Error while fetching group details' });
  }
};



const getOneGroupDetail = async (req, res) => {
  const {email, groupId} = req.body;

  try {
    const group = await Group.find({groupId});
    if(!group) res.status(404).json({error: 'Group not found here'});
    res.status(200).json(group);
  } catch (error) {
    console.log(error);
  }
}

module.exports = { createGroup, addMembersToGroup, getGroupDetails, getOneGroupDetail };