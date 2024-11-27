const { sendEmailToNewUser } = require('../features/send-email');
const { Group } = require('../model/group');
const { v4: uuidv4 } = require('uuid'); // For generating a unique group ID
const { User } = require('../model/users');
const { client } = require('../data/redis-database');
const { addMembers } = require('../features/addMembers');
const { simplifyDebts } = require('../features/simplify-debts');

// Controller to create a new group
const createGroup = async (req, res) => {
    const { groupName, groupType } = req.body;
    let { members, joinedByLink } = req.body;
    const username = req.body.createdBy.username;
    const email = req.body.createdBy.email;

    // Validate the group name, members, and group type
    if (!groupName || !Array.isArray(members) || members.length === 0 || !groupType) {
      return res.status(400).json({ error: 'Group name, members, and group type are required' });
    }

    try {
      // adding self only if not present in members
      let obj ={
        username,
        email,
        joinedByLink: false
      }
      let addSelf = true;
      for(let i=0; i<members.length; i++) {
        if(members[i].email == email) {
          addSelf = false;
        }
      }
      if(addSelf) members.push(obj);

      // Generate a unique groupId
      const groupId = uuidv4();

      members = await addMembers(req, res, members, groupId);
      // // Extract emails from members array
      // let memberEmails = members.map(member => member.email);

      // // Find users that exist in the database
      // const existingUsers = await User.find({ email: { $in: memberEmails } });
      // const existingUserEmails = existingUsers.map(user => user.email);

      // console.log('Existing users:', existingUsers);

      //  // Mark members who join by link
      // members = members.map((member) => ({
      //   ...member,
      //   joinedByLink: !existingUserEmails.includes(member.email) && member.email !== "",
      // }));

      // // let isJoinByLink = false;
      // // Filter out members that do not exist in the database
      // members.filter(member => {
      //   const isExisting = existingUserEmails.includes(member.email);
      //   if (!isExisting && member.email !== '') {
      //     console.log('User not found, sending email to:', member.email);
      //     try {
      //       console.log('sendEmailToNewUser');
      //       // sendEmailToNewUser(req, res, member.email, groupId, groupName);
      //     } catch (error) {
      //       console.error('Error sending email to new user:', error);
      //     }
      //   }
      //   return isExisting;
      // });

      // console.log('Filtered members:', members);

      // Add the groupId to userdatas concurrently
      console.log('before updatePromises');
      console.log('before members', members);
      let groupIdsOfUser = [];
      let id = [];
      for (const member of members) {
        console.log('inside update loop');
        console.log('member ',member);
        console.log('groupId ', groupId);
        // Update the user's groupIds in the database
        await User.updateOne({ email: member.email }, { $push: { groupIds: groupId } });
        // Initialize groupIdsOfUser as an empty array
        // Retrieve existing groupIds from the cache
        id = await client.get(`groupIds:${member.email}`);
        console.log('id x', id);
        groupIdsOfUser = []; // Reset groupIdsOfUser for each member
        // Check if id exists and process it
        if (id) {
          try {
            id = JSON.parse(id); // Parse the JSON string into an object
            console.log('Parsed id:', id);
      
            // Ensure id is an array before pushing into groupIdsOfUser
            if (Array.isArray(id)) {
              groupIdsOfUser.push(...id); // Spread the array into groupIdsOfUser
            } else {
              console.warn(`Expected array, got ${typeof id}:`, id);
            }
          } catch (err) {
            console.error('Error parsing cached groupIds:', err);
          }
        }
        // Add the new groupId to the array
        groupIdsOfUser.push(groupId);
        console.log('groupIdsOfUser:', groupIdsOfUser);
        // Update the cache with the new groupIds array
        await client.set(`groupIds:${member.email}`, JSON.stringify(groupIdsOfUser));
        console.log('Updated cache:', await client.get(`groupIds:${member.email}`));
      }

      // await Promise.all(updatePromises); // Execute all updates concurrently

      // Create the new group
      const newGroup = await Group.create({
        name: groupName,
        members: members,
        type: groupType,
        groupId: groupId,
        createdBy: email
      });

      // set the group in redis cache
      for(let member of members) {
        await client.set(`group:${groupId}`, JSON.stringify(newGroup));
      }

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
    let arrGroupIds = [];
    const {email} = req.body;

    // check if cache has users groupIds
    let allIds = [];
    let userId = await client.get(`groupIds:${email}`);
    if(userId) {
      console.log('cache hit for getGroupDetails');
      allIds = JSON.parse(userId);
    }
    else {
      let user = await User.find({email})
      if(!user) return res.status(404).json({ error: 'User not found' });
      allIds = user[0].groupIds;
    }
    console.log('allIds ',allIds);


    let allGroups = [];
    // // go group ids
    // for(let gId of allIds) {
    //   let oneGroup = await Group.find({groupId: gId});
    //   allGroups.push(oneGroup);
    // }

    for (let gId of allIds) {
      // Check Redis cache for group details
      const cachedGroup = await client.get(`group:${gId}`);
      // console.log('cachedGroup ',cachedGroup);
      if (cachedGroup) {
        console.log('cache hit for gId');
        allGroups.push(JSON.parse(cachedGroup));
      } else {
        // Fetch group details from the database
        const oneGroup = await Group.findOne({ groupId: gId });
        if (oneGroup) {
          // update the joinedbyLink if it is false;
          // for(member of oneGroup.members) {
          //   console.log('inside joinedbylink', member);
          //   let myUserDetails = await Group.updateOne({'members.email': member.email}, {$set: { 'member.joinedByLink': true}});
          //   console.log('myUserDetails ',myUserDetails);
          // }
          for (const member of oneGroup.members) {
            let myUserDetails = await Group.updateOne(
              {
                _id: oneGroup._id,
                'members.email': member.email, // Match the group and member
                'members.joinedByLink': true   // Ensure `joinedByLink` is `true`
              },
              {
                $set: { 'members.$.joinedByLink': false } // Update `joinedByLink` to `false`
              }
            );
          }



          allGroups.push(oneGroup);
          // Store group details in Redis cache with an expiration time
          // await client.setEx(gId, 30, JSON.stringify(oneGroup)); // Cache for 1 hour
        }
      }
    }

    // Fetch the group details along with its members (populate member details)
    // const group = await Group.findById(groupId).populate('members', 'name email');
    // console.log(group);
    // if (!group) {
    //   return res.status(404).json({ error: 'Group not found' });
    // }

    // Return the group details
    console.log('allGroups ', allGroups);
    res.status(200).json(allGroups);
  } catch (error) {
    console.error('Error fetching group details:', error);
    res.status(500).json({ error: 'Error while fetching group details' });
  }
};



const getOneGroupDetail = async (req, res) => {
  const {email, groupId} = req.body;

  try {
    // const cachedGroup = await client.get(`group:${gId}`);
    // if(cachedGroup) {
    //   console.log('cache hit for getOneGroupDetail');
    //   res.status(200).json([JSON.parse(cachedGroup)]);
    // }
    const group = await Group.find({groupId});
    console.log('group ',group);
    if(!group) res.status(404).json({error: 'Group not found here'});
    res.status(200).json(group);
  } catch (error) {
    console.error('Error fetching group detail:', error);
  }
}


const getAddMembersToGroup = async (req, res) => {
  const {members, groupdId} = req.body;

  if(members.length == 0) {
    return res.status(400).json({error: 'No members to be added'});
  }
  try {
    await addMembers(req, res, members, groupdId);

    // Add the groupId to userdatas concurrently
    const updatePromises = members.map(member =>
      User.updateOne({ email: member.email }, { $push: { groupIds: groupId } })
    );
    await Promise.all(updatePromises); // Execute all updates concurrently

    const updateGroup = members.map(async (member) => {
      await Group.updateOne({email: member.email}, {$push: {members: member}});
    })
    const getUpdatedGroup = await getOneGroupDetail(req, res, email, groupdId);
    res.status(200).json(getUpdatedGroup);
  } catch (error) {
    console.error('Error fetching group details:', error);
  }

}

const simplification = async (req, res, input) => {
  try {
    console.log('req.body ',req.body);
    const {input, groupId} = req.body;
    let netBalances = await Group.findOne({groupId: req.body[0].groupId})
    console.log('netBalances before ',netBalances);
    if(netBalances && netBalances.transactions && netBalances.transactions.netBalances) {
      netBalances = netBalances.transactions.netBalances;
    }
    else {
      netBalances = null;
    }
    let title = "SPlitwisely";
    const simplifiedData = await simplifyDebts(req.body, netBalances ? netBalances : {});
    simplifiedData.title = title;
    await Group.updateOne(
      { groupId: req.body[0].groupId },
      {
        $push: {
          transactions: {
            $each: [simplifiedData], // Insert the new transactions
            $position: 0, // Push at the beginning of the array
          },
        },
      }
    );
    await Group.updateOne(
      { groupId: req.body[0].groupId },
      {
        $set: { netBalances: [simplifiedData.netBalances] }, // Push netBalances array
      }
    );
    console.log("simplifiedData ",simplifiedData);
    console.log("simplifiedData.netBalances ",simplifiedData.netBalances);
    res.status(200).json(simplifiedData);
  } catch (error) {
    console.error('Error fetching group details:', error);
  }
}


module.exports = { createGroup, addMembersToGroup, getGroupDetails, getOneGroupDetail, getAddMembersToGroup, simplification };