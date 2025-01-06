// groupService.js
const { User } = require("../model/users");
const { Group } = require("../model/group");  // Import the Group model
const { GroupBalances } = require("../model/groupBalances");  // Import the GroupBalances model

const { client } = require('../data/redis-database');

const deleteGroupService = async (members, groupId) => {
  try {
    // Extract emails from members and filter out invalid emails
    const memberEmails = members.filter((member) => member.email).map((member) => member.email);
    console.log("Extracted member emails:", memberEmails);

    // Update each user to remove the groupId from the groupIds array
    await Promise.all(
      memberEmails.map(async (email) => {
        let findUser = await User.findOne({ email });
        if (findUser) {
          await User.updateOne(
            { email },  // Find the user by email
            { $pull: { groupIds: groupId } }  // Remove the specific groupId from the groupIds array
          );
        }
      })
    );
    const groupKey = `group:${groupId}`; // Redis key for the group
    // Delete the group key
    await client.del(groupKey);

    // Delete the group from the Group collection
    const result = await Group.deleteOne({ groupId });

    if (result.deletedCount > 0) {
      console.log(`Group with groupId ${groupId} deleted successfully.`);
    } else {
      console.log(`No group found with groupId ${groupId}.`);
    }

    return { success: true, message: 'Group and associated users updated successfully.' };

  } catch (error) {
    console.error("Error in deleteGroupService:", error);
    throw new Error('An error occurred while deleting the group.');
  }
};

const calculateGroupBalance = async (groupId) => {
  let group = await Group.findOne({ groupId });
  let members = group.members;
  let transactionArray = []

  for (var i = 0; i < members.length; i++) {
    for (var j = i + 1; j < members.length; j++) {
      var trasanctionObj = {
        'OwedTo': members[i],
        'OwedBy': members[j],
        'Amount': 0
      };
      transactionArray.push(trasanctionObj);
    };
  };

  for (let transaction of group.transactions) {
    if (transaction.netBalances) {
      var owedTo = transaction.netBalances[0].person;
      for (var i = 1; i < transaction.netBalances.length; i++) {
        var owedBy = transaction.netBalances[i].person;

        for (const trnObj of transactionArray) {
          if (trnObj.OwedTo.email == owedTo && trnObj.OwedBy.email == owedBy) {
            trnObj.Amount += -1 * (transaction.netBalances[i].balance);
          }
          else if (trnObj.OwedTo.email == owedBy && trnObj.OwedBy.email == owedTo) {
            trnObj.Amount += (transaction.netBalances[i].balance);
          }
        }
      }
    }
  }

  console.log(transactionArray);
  return transactionArray;
}

const insertGroupBalancesInDB = async (transactionArray, groupId) => {

  try {

    //Saving to database GroupBalance collection
    for (const element of transactionArray) {
      let email = element.OwedBy.email;
      // if(element.Amount >= 0){

      await GroupBalances.findOneAndUpdate(
        {
          email: element.OwedBy.email,
          to: element.OwedTo.email,
          groupId: groupId, // Ensure unique identification
        },
        {
          $set: {
            email: element.OwedBy.email,
            owesAmount: element.Amount,
            to: element.OwedTo.email,
            groupId: groupId,
          }
        },
        {
          new: true, // Return the updated document
          upsert: true // Create a new document if no match is found
        }
      )
      // }
      // else{
      //   await GroupBalances.findOneAndUpdate(
      //     {email},
      //     {$set: {
      //       email: element.OwedTo.email,
      //       owesAmount: -1*element.Amount,
      //       to: element.OwedBy.email,
      //       groupId: groupId,
      //     }},
      //     {
      //       new: true, // Return the updated document
      //       upsert: true // Create a new document if no match is found
      //     }
      //   )
      // }
    };
  } catch (error) {
    throw error;
  }
}

const getGroupBalance = async (groupId) => {
  try {
    let listTransactions = await GroupBalances.find({ groupId: groupId });
    if (listTransactions.length > 0) {
      listTransactions = listTransactions.filter(transaction => transaction.owesAmount != 0);
      return listTransactions;
    }
    else {
      console.log("Not records found")
    }
  } catch (error) {
    throw error;
  }
}

const calculateOwesOwedAmount = async (groupId, email) => {
  try {
    let balanceOwedToYou = 0;
    let balanceYouOwe = 0;
    let myTotalBalance = 0;

    let transactionArray = await getGroupBalance(groupId);

    if (transactionArray?.length > 0) {
      transactionArray.forEach(trn => {
        if (trn.owesAmount > 0) {
          if (trn.email == email) {
            balanceOwedToYou += trn.owesAmount;
          }
          else if (trn.to == email) {
            balanceYouOwe += trn.owesAmount;
          }
        }
        else {
          if (trn.to == email) {
            balanceOwedToYou += -1 * trn.owesAmount;
          }
          else if (trn.email == email) {
            balanceYouOwe += -1 * trn.owesAmount;
          }
        }
      });
    }

    let group = await Group.findOne({ groupId });
      group?.transactions?.forEach(element => {
        myTotalBalance += element.amount
      });
    let arrBalances = {
      balanceYouOwe,
      balanceOwedToYou,
      myTotalBalance
    }

    return arrBalances;
  } catch (error) {
    throw error;
  }
}
module.exports = { deleteGroupService, calculateGroupBalance, insertGroupBalancesInDB, getGroupBalance, calculateOwesOwedAmount };
