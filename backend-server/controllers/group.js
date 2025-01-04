const { sendEmailToNewUser } = require('../features/send-email');
const { Group } = require('../model/group');
const { v4: uuidv4 } = require('uuid'); // For generating a unique group ID
const { User } = require('../model/users');
const { client } = require('../data/redis-database');
const { addMembers } = require('../features/addMembers');
const { simplifyDebts, mergeTransactions, mergeNetBalances, settle, replaceEmailsWithUsernames } = require('../features/simplify-debts');
const { deleteGroupService } = require('../features/delete-group'); // Import the service layer

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
      // Add the groupId to userdatas concurrently
      let groupIdsOfUser = [];
      let id = [];
      for (const member of members) {
        // Update the user's groupIds in the database
        await User.updateOne({ email: member.email }, { $push: { groupIds: groupId } });
        // Initialize groupIdsOfUser as an empty array
        // Retrieve existing groupIds from the cache
        id = await client.get(`groupIds:${member.email}`);
        groupIdsOfUser = []; // Reset groupIdsOfUser for each member
        // Check if id exists and process it
        if (id) {
          try {
            id = JSON.parse(id); // Parse the JSON string into an object
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
        // Update the cache with the new groupIds array
        await client.set(`groupIds:${member.email}`, JSON.stringify(groupIdsOfUser));
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
    const { groupId, membersToAdd } = req.body;
    if (!groupId || !membersToAdd || membersToAdd.length === 0) {
      return res.status(400).json({ error: 'Group ID and members to add are required' });
    }
    // Find the group by its ID
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }
    // Add new members to the group, checking for duplicates
    membersToAdd.forEach(member => {
      const memberExists = group.members.some(existingMember => existingMember.email === member.email);
      if (!memberExists) {
        group.members.push(member); // Add member if not already in group
      }
    });
    await group.save();
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
      allIds = JSON.parse(userId);
    }
    else {
      let user = await User.find({email})
      if(!user) return res.status(404).json({ error: 'User not found' });
      allIds = user[0].groupIds;
    }

    let allGroups = [];
    for (let gId of allIds) {
      // Check Redis cache for group details
      const cachedGroup = await client.get(`group:${gId}`);
      if (cachedGroup) {
        allGroups.push(JSON.parse(cachedGroup));
      } else {
        // Fetch group details from the database
        const oneGroup = await Group.findOne({ groupId: gId });
        if (oneGroup) {
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
    if(!group) res.status(404).json({error: 'Group not found here'});
    res.status(200).json(group);
  } catch (error) {
    console.error('Error fetching group detail:', error);
  }
}


const getAddMembersToGroup = async (req, res) => {
  const {members, groupId} = req.body;
  console.log('members ',members);
  console.log('groupdId ',groupId);

  if(members.length == 0) {
    return res.status(400).json({error: 'No members to be added'});
  }
  try {
    await addMembers(req, res, members, groupId);

    // Add the groupId to userdatas concurrently
    const updatePromises = members.map(member =>
      User.updateOne({ email: member.email }, { $push: { groupIds: groupId } })
    );
    await Promise.all(updatePromises); // Execute all updates concurrently

    const updateGroup = members.map(async (member) => {
      await Group.updateOne({groupId}, {$push: {members: member}});
    })
    const getUpdatedGroup = await getOneGroupDetail(req, res, groupId);
    res.status(200).json(getUpdatedGroup);
  } catch (error) {
    console.error('Error fetching group details:', error);
  }

}
const editGroup = async (req, res) => {
  try {
    const { groupId, groupName, groupType, members, transactions, netBalances } = req.body;
    
    // Validate inputs
    if (!groupId || !groupName || !groupType) {
      return res.status(400).json({ error: 'Group ID, group name, and group type are required' });
    }

    // Fetch the existing group from the database using the provided groupId
    const group = await Group.findOne({ groupId });

    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    // Merge the incoming data with the existing group data
    group.name = groupName || group.name; // Update name if provided
    group.type = groupType || group.type; // Update group type if provided

    // Merge members - ensure that we don't add duplicate members
    if (Array.isArray(members)) {
      members.forEach((member) => {
        const existingMember = group.members.find((m) => m.email === member.email);
        if (!existingMember) {
          group.members.push(member); // Add new members if not already in the group
        }
      });
    }

    // Merge transactions (if provided)
    if (Array.isArray(transactions)) {
      group.transactions = [...group.transactions, ...transactions]; // Add new transactions
    }

    // Merge netBalances (if provided)
    if (Array.isArray(netBalances)) {
      group.netBalances = [...group.netBalances, ...netBalances]; // Add new balances
    }

    // Save the updated group
    await group.save();

    // Respond with the updated group details
    res.status(200).json({
      success: true,
      message: 'Group updated successfully!',
      group: group,
    });
  } catch (error) {
    console.error('Error updating group:', error.message || error);
    res.status(500).json({ error: 'Error while updating group' });
  }
};


const simplification = async (req, res, input) => {
  try {
    console.log('req.body', req.body);

    const { paidBy, members, amount, simplifyCurrency, splitBy, title, groupId,expenseDate, createdBy } = req.body;
    const amountValue = amount?.value || 0; 
    // Fetch the group and its netBalances in one query
    let getGroup = await Group.findOne({ groupId }).lean();
    if (!getGroup) {
      return res.status(404).json({ error: "Group not found" });
    }

    // Extract netBalances safely
    const netBalances = getGroup?.netBalances?.transactions?.netBalances || null;

    // Simplify debts and prepare transaction data
    const transactionId = uuidv4();
    const simplifiedData = await simplifyDebts(
      paidBy, members, amount, simplifyCurrency, splitBy, title, groupId, netBalances || []
    );

    Object.assign(simplifiedData, { title, transactionId, createdBy, paidBy, 
      expenseDate: new Date(expenseDate) || new Date(),
      amount: amountValue  //store the amount value
     });

    // Merge and update net balances and transactions in a single update query
    console.log('simplifiedData ',simplifiedData);
    console.log('getGroup.netBalances ',getGroup.netBalances);
    console.log('simplif.netBalances ',simplifiedData.netBalances);
    console.log(paidBy,expenseDate,amountValue);

    const newNetBalances = await mergeNetBalances(getGroup.netBalances, simplifiedData.netBalances);

    const updateResult = await Group.findOneAndUpdate(
      { groupId },
      {
        $push: {
          transactions: { $each: [simplifiedData], $position: 0 },
        },
        $set: { netBalances: newNetBalances },
      },
      { new: true } // Return the updated document
    ).lean();

    // Merge latest transactions
    console.log('updateResult ',updateResult);
    let latestTransactions = await mergeTransactions(updateResult.transactions);
    console.log('latestTransactions ',latestTransactions);

    // get usernames in place of emails
    latestTransactions = await replaceEmailsWithUsernames(latestTransactions);
    console.log(latestTransactions);

    // store the latestTransactions in db
    await Group.updateOne(
      { groupId }, // Filter by groupId
      { $set: { latestTransactions: latestTransactions } } // Update the transactions field
    );


    // Send the response
    res.status(200).json({ latestTransactions, getGroup: updateResult });
  } catch (error) {
    console.error('Error in simplification:', error);
    res.status(500).json({ error: 'error.message' });
  }
};



// get total owed amount
const totalOwed = async(req, res) => {
  const {email, groupIds} = req.body;
  console.log('groupIds ',groupIds);
  try {
    let allGroups = [];
    for(let groupId of groupIds) {
      let group = await Group.findOne({groupId});
      allGroups.push(group);
    }
    let allNetBalances = [];
    for(let group of allGroups) {
      if(group?.netBalances){
        let netBalance = group.netBalances;
        allNetBalances.push(netBalance);
      }
    }
    let myTotalBalance = 0;
    // calculate total owed
    // keep total owed and owes separate
    let owesBalance = 0;
    let owedBalance = 0;
    console.log('allNetBalances ',allNetBalances);
    for (const netBalance of allNetBalances) {
      for(const balance of netBalance) {
        if(balance.person == email) {
          myTotalBalance += balance.balance;
          if(balance.balance < 0) {
            owesBalance += balance.balance;
          }
          else {
            owedBalance += balance.balance;
          }
        }
      }
    }

    console.log('myTotalBalance ',myTotalBalance);
    console.log('owesBalance ',owesBalance);
    console.log('owedBalance ',owedBalance);
    res.status(200).json({myTotalBalance, owesBalance, owedBalance});
  } catch (error) {
    console.error('Error finding total owed amount', error);
    res.status(500).json({ error: 'Error in total owed amount' });
  }
}

// get total owed amount
const grpTotalOwed = async(req, res) => {
  const {email, groupId} = req.body;
  console.log('groupIds ',groupId);
  try {
    let group = await Group.findOne({groupId});
    let allNetBalances = [];
    if(group.netBalances){
      let netBalance = group.netBalances;
      allNetBalances.push(netBalance);
    }
    let myTotalBalance = 0;
    // calculate total owed
    // keep total owed and owes separate
    let owesBalance = 0;
    let owedBalance = 0;
    console.log('allNetBalances ',allNetBalances);
    for (const netBalance of allNetBalances) {
      for(const balance of netBalance) {
        if(balance.person == email) {
          myTotalBalance += balance.balance;
          if(balance.balance < 0) {
            owesBalance += balance.balance;
          }
          else {
            owedBalance += balance.balance;
          }
        }
      }
    }

    console.log('myTotalBalance ',myTotalBalance);
    console.log('owesBalance ',owesBalance);
    console.log('owedBalance ',owedBalance);
    res.status(200).json({myTotalBalance, owesBalance, owedBalance});
  } catch (error) {
    console.error('Error finding total owed amount', error);
    res.status(500).json({ error: 'Error in total owed amount' });
  }
}

// Delete group API endpoint
const deleteGroup = async (req, res) => {
  try {
    const groupId  = req.body.groupId; // Get groupId from the request params
    const members = req.body.members; // Get members from the request body

    if (!members || members.length === 0) {
      return res.status(400).json({ message: 'No members provided.' });
    }

    // Call the deleteGroupService with the members and groupId
    const result = await deleteGroupService(members, groupId);

    // Respond with success message
    res.status(200).json(result);
  } catch (error) {
    console.error("Error in deleteGroup controller:", error);
    res.status(500).json({ message: error.message });
  }
};

// get total owed amount
const grpBalance = async(req, res) => {
  const {groupId} = req.body;
  console.log('groupIds ',groupId);
  try {
    let group = await Group.findOne({groupId});
    let members = group.members;
    let transactionArray = []

    for(var i = 0; i < members.length; i++){
      for(var j = i+1; j < members.length; j++){
        var trasanctionObj = {
          'OwedTo': members[i],
          'OwedBy': members[j],
          'Amount': 0
        };
        transactionArray.push(trasanctionObj);
      };
    };
    
    for(let transaction of group.transactions) {
      if(transaction.netBalances){
        var owedTo = transaction.netBalances[0].person;
        for(var i=1; i< transaction.netBalances.length; i++){
          var owedBy = transaction.netBalances[i].person;

          for(const trnObj of transactionArray){
            if(trnObj.OwedTo.email == owedTo &&  trnObj.OwedBy.email == owedBy){
              trnObj.Amount += -1*(transaction.netBalances[i].balance);
            }
            else if(trnObj.OwedTo.email == owedBy &&  trnObj.OwedBy.email == owedTo){
              trnObj.Amount += (transaction.netBalances[i].balance);
            }
          }
        }
      }
    }
    console.log(transactionArray);
    
    res.status(200).json({transactionArray});
  } catch (error) {
    console.error('Error finding total owed amount', error);
    res.status(500).json({ error: 'Error in total owed amount' });
  }
}

const getGroupExpenses = async (req, res) => {
  try {
    const { groupId , currentUserEmail} = req.body;  // Extract groupId from the request body

    // Find the group by groupId
    const group = await Group.findOne({ groupId });

    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }
    let transactionList = [];
    
    // Iterate over each transaction in the group's transactions
    group.transactions.forEach(transaction => {
      // Extract "Paid By" from the "to" field in the transaction (who paid)
      const paidBy = transaction.to;

       let borrowed = 0;
       
      // Check if the transaction has a netBalances array
      if (transaction.netBalances && Array.isArray(transaction.netBalances)) {
        // Loop through each item in netBalances
        transaction.netBalances.forEach(Balance => {
          // If the amount is negative, add the absolute value to borrowed
          if (Balance.balance < 0 && Balance.person == currentUserEmail) {
            borrowed += Math.abs(Balance.balance);  // Add the absolute value of negative amounts
          }
        });
      }
    
      // Construct the expense object
      const expense = {
        transactionId: transaction.transactionId,  // Unique transaction ID
        date: transaction.expenseDate,                // Transaction date 
        title: transaction.title,                   // Expense title
        amount: parseFloat(transaction.amount),     // Total amount for the transaction
        paidBy: transaction.paidBy, 
        paidByName: group.members.find(member => member.email === transaction.paidBy)?.username, // Username of the person who paid
        borrowed: borrowed                          // Amount borrowed (if any)
      };
 
      // Add the processed expense to the transactionList
      transactionList.push(expense);
    });

    // Send the expenses back in the response
    res.status(200).json({ expenses: transactionList });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error fetching group expenses' });
  }
};

const getAllExpenses = async (req, res) => {
  try {
    const { groupIds } = req.body;  // Extract groupIds from the request body

    if (!Array.isArray(groupIds) || groupIds.length === 0) {
      return res.status(400).json({ error: 'Group IDs are required' });
    }

    let allExpenses = [];
    const defaultCurrency = 'USD';  // Define a default currency (e.g., USD)

    // Iterate over each group ID to fetch relevant expenses
    for (const groupId of groupIds) {
      const group = await Group.findOne({ groupId });

      if (!group) {
        continue; // Skip if group is not found
      }

      // Iterate over each transaction in the group's transactions
      group.transactions.forEach(transaction => {
        // Get currency from the transaction or use defaultCurrency
        const transactionCurrency = transaction.transactions?.[0]?.currency || defaultCurrency;
        
        let expense = {
          groupName: group.name,        // Group name
          expenseDate: transaction.expenseDate,  // Transaction date
          amount: {
            value: transaction.amount // Total amount for the transaction
          },
          currency: transactionCurrency,
          paidBy: transaction.paidBy,   // Person who paid
          paidByName: group.members.find(member => member.email === transaction.paidBy)?.username, // Username of the person who paid
          date: transaction.expenseDate,                // Transaction date 
        title: transaction.title,                   // Expense title
        
        };

        // Add the processed expense to the list of all expenses
        allExpenses.push(expense);
      });
    }

    // Send the expenses back in the response
    res.status(200).json({ expenses: allExpenses });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error fetching expenses for the groups' });
  }
};



const getChartData = async (req, res) => {
  try {
    const { groupIds } = req.body; // Get the groupIds from the request body
    if (!groupIds || !Array.isArray(groupIds) || groupIds.length === 0) {
      return res.status(400).json({ error: 'Group IDs are required' });
    }

    // Initialize arrays and objects for aggregating data
    let allNetBalances = [];
    let transactionsData = [];
    let memberData = [];
    let groupExpenses = [];
    let monthlyExpenses = {}; // To store the accumulated expenses by month/year
    let categoryExpenses = {}; // To store expenses categorized by group type

    // Fetch data for each groupId
    for (const groupId of groupIds) {
      // Get the group details from the DB, including transactions
      const group = await Group.findOne({ groupId });

      if (group) {
        const groupType = group.type?.trim() || 'Uncategorized'; // Ensure group type is valid

        // Process netBalances for the group
        const netBalances = group.netBalances || [];
        allNetBalances.push(...netBalances);

        // Process transactions for the group
        const transactions = group.transactions || [];
        transactionsData.push(...transactions);

        // Process transactions and calculate monthly spends
        transactions.forEach(transaction => {
          const expenseDate = new Date(transaction.expenseDate);

          // Skip transactions with invalid dates
          if (isNaN(expenseDate)) {
            console.error('Invalid date:', transaction.expenseDate);
            return;
          }

          const expenseAmount = parseFloat(transaction.amount);

          // Calculate the monthYear for the transaction (MM/YYYY format)
          const monthYear = `${expenseDate.getMonth() + 1}/${expenseDate.getFullYear()}`;

          // Accumulate the total spend for each monthYear
          if (!monthlyExpenses[monthYear]) {
            monthlyExpenses[monthYear] = 0;
          }
          monthlyExpenses[monthYear] += expenseAmount;

          // Accumulate the total spend for each category (group type)
          if (!categoryExpenses[groupType]) {
            categoryExpenses[groupType] = 0;
          }
          categoryExpenses[groupType] += expenseAmount;

          // Prepare group expense data
          groupExpenses.push({
            transactionId: transaction.transactionId,
            date: transaction.expenseDate,
            title: transaction.title,
            amount: expenseAmount,
            paidBy: transaction.paidBy,
            groupType: groupType, // Include the type for each transaction
          });
        });

        // Prepare member data (initialize member balances)
        group.members.forEach(member => {
          memberData.push({
            email: member.email,
            username: member.username,
            totalBalance: 0, // Will be updated later
            owes: 0,
            owed: 0,
            isMember: true,
          });
        });
      }
    }

    // Process the netBalances to calculate owed/owes balances for each member
    const owedBalances = allNetBalances.reduce((acc, balance) => {
      const person = balance.person;

      // Initialize the balance data for each person
      if (!acc[person]) {
        acc[person] = { owes: 0, owed: 0 };
      }

      // If the balance is negative, the person owes money, otherwise they are owed money
      if (balance.balance < 0) {
        acc[person].owes += balance.balance; // Negative balance means they owe
      } else {
        acc[person].owed += balance.balance; // Positive balance means they are owed
      }

      return acc;
    }, {});

    // Update memberData with the calculated balances
    memberData = memberData.map(member => {
      const owedData = owedBalances[member.email] || { owes: 0, owed: 0 };
      return {
        ...member,
        owes: owedData.owes,
        owed: owedData.owed,
        totalBalance: owedData.owes + owedData.owed, // Total balance is the sum of owes and owed
      };
    });

    // Prepare the final chart data response
    const chartData = {
      groupExpenses, // Group-wise expense data
      memberData, // Data for each member (owe/owed balances)
      transactionsData, // All transaction data
      totalOwed: memberData.reduce((sum, member) => sum + member.totalBalance, 0), // Total owed across all members
      totalOwedByOthers: memberData.filter(member => member.owes < 0).reduce((sum, member) => sum + Math.abs(member.owes), 0), // Total owed by others
      totalOwedToOthers: memberData.filter(member => member.owed > 0).reduce((sum, member) => sum + member.owed, 0), // Total owed to others
      monthlyExpenses: Object.keys(monthlyExpenses).map(monthYear => ({
        monthYear, // e.g., "1/2025"
        totalSpend: monthlyExpenses[monthYear], // Total spend for that month
      })),
      categoryExpenses: Object.keys(categoryExpenses).map(category => ({
        category, // Group type (e.g., "Food", "Travel")
        totalSpend: categoryExpenses[category], // Total spend for that category
      })),
    };

    // Return the chart data as the response
    res.status(200).json(chartData);

  } catch (error) {
    console.error('Error fetching chart data:', error);
    res.status(500).json({ error: 'Error fetching chart data' });
  }
};




module.exports = { createGroup, addMembersToGroup, getGroupDetails, getOneGroupDetail, getAddMembersToGroup, 
  simplification, totalOwed, grpTotalOwed, deleteGroup, grpBalance,getGroupExpenses,getAllExpenses,editGroup ,getChartData};