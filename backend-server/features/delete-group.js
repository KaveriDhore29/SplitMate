// groupService.js
const { User } = require("../model/users");
const { Group } = require("../model/group");  // Import the Group model
const { deleteFromRedis, getFromRedis, addInRedis } = require("./redis-crud");

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
    
    // delete the id from userdata also 
    // first get the members of the group form redis and fing using email in userdata in redis and mongo and slice or delete the groupid from the groupids array
    await getFromRedis(`group:${groupId}`).then(async (data) => {
      const groupData = JSON.parse(data);
      console.log("groupData:", groupData);
      await Promise.all(
        groupData.members.map(async (member) => {
          console.log('member:', member);
          const findUser = await User.findOne({ email: member.email });
          // groupIds:email has an array on ids of groups that user is part of, delete/slice the current groupId from th array and if the array becomes empty delete the key from redis
          // if (findUser) {
            // remove the groupId from redis
            let getIds = await getFromRedis(`groupIds:${member.email}`);
            getIds = JSON.parse(getIds);
            getIds = getIds.filter((id) => id !== groupId);
            console.log('getIds:', getIds);
            if (getIds.length === 0) {
              await deleteFromRedis(`groupIds:${member.email}`);
            } else {
              // await deleteFromRedis(`groupIds:${member.email}`);
              await addInRedis(`groupIds:${member.email}`, JSON.stringify(getIds));
            }

            // now slice the groupId from groupIds array in userdata mongo db
            if(findUser) {
              await User.updateOne(
                { email: member.email },
                { $pull: { groupIds: groupId } }
              );
            }
          // }
        })
      );
    });

    // delet from redis database too
    await deleteFromRedis(`group:${groupId}`);

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
