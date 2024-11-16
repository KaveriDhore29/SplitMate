const { Group } = require('../models/group'); 
const { User } = require('../models/user');  

// Controller to create a new group
const createGroup = async (req, res) => {
  try {
    const { userId, groupName } = req.body;  // userId and groupName in the request body

    // Validate input
    if (!groupName || !userId) {
      return res.status(400).json({ error: 'Group name and user ID are required' });
    }

    // Create the new group
    const newGroup = new Group({
      name: groupName,
      createdBy: userId,
      members: [userId], // Add the user as the first member
    });

    // Save the new group to the database
    await newGroup.save();

    // Respond with the new group
    res.status(201).json(newGroup);
  } catch (error) {
    console.error('Error creating group:', error);
    res.status(500).json({ error: 'Error while creating group' });
  }
};

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
    const groupId = req.params.groupId;

    // Fetch the group details along with its members (populate member details)
    const group = await Group.findById(groupId).populate('members', 'name email');
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    // Return the group details
    res.status(200).json(group);
  } catch (error) {
    console.error('Error fetching group details:', error);
    res.status(500).json({ error: 'Error while fetching group details' });
  }
};

module.exports = { createGroup, addMembersToGroup, getGroupDetails };
