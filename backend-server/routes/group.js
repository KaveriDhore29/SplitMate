const express = require('express');
const router = express.Router();
const { createGroup, addMembersToGroup, getGroupDetails } = require('../controllers/group');  // Use 'group' controller instead of 'groups'

// Route to create a new group
router.post('/create', createGroup);

// Route to add members to an existing group
router.post('/add-members', addMembersToGroup);

// Route to get details of a group
router.get('/:groupId', getGroupDetails);

module.exports = router;
