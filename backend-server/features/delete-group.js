// groupService.js
const { User } = require("../model/users");
const { Group } = require("../model/group");  // Import the Group model

const deleteGroupService = async (members, groupId) => {
  try {
    const memberEmails = members.filter((member) => member.email).map((member) => member.email);
    console.log("Extracted member emails:", memberEmails);


    await Promise.all(
      memberEmails.map(async (email) => {
        const findUser = await User.findOne({ email });
        if (findUser) {
          await User.updateOne(
            { email }, 
            { $pull: { groupIds: groupId } }  
          );
        }
      })
    );

    // Delete the group from the Group collection
    const result = await Group.deleteOne({ groupId });

    if (result.deletedCount > 0) {
      console.log(`Group with groupId ${groupId} deleted successfully.`);
    } else {
      console.log(` ${groupId}.`);
    }

    return { success: true, message: 'Group and associated users updated successfully.' };

  } catch (error) {
    console.error("Error in deleteGroupService:", error);
    throw new Error('An error occurred while deleting the group.');
  }
};

module.exports = { deleteGroupService };