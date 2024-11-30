const { User } = require("../model/users");

async function getExchangeRate(baseCurrency, targetCurrency) {
  const apiKey = "your_api_key"; // Replace with your API key
  const url = `https://open.er-api.com/v6/latest/${baseCurrency}`;

  const response = await fetch(url);
  if (!response.ok) {
      throw new Error("Failed to fetch exchange rates");
  }
  const data = await response.json();
  return data.rates[targetCurrency];
}

async function mergeTransactions(data) {
  // Array to store the merged transactions
  const mergedTransactions = [];

  // Helper function to find a transaction in the mergedTransactions array
  function findTransaction(from, to, currency) {
    for (let i = 0; i < mergedTransactions.length; i++) {
      const item = mergedTransactions[i];
      if (item.from === from && item.to === to && item.currency === currency) {
        return i;
      }
    }
    return -1;
  }

  // Iterate over the input array and merge transactions
  for (let i = 0; i < data.length; i++) {
    const currentData = data[i];

    // Ensure `transactions` exists and is an array
    if (Array.isArray(currentData.transactions)) {
      for (let j = 0; j < currentData.transactions.length; j++) {
        const transaction = currentData.transactions[j];
        const index = findTransaction(transaction.from, transaction.to, transaction.currency);

        if (index !== -1) {
          // If a matching transaction exists, combine the amounts
          mergedTransactions[index].amount = parseFloat(
            (parseFloat(mergedTransactions[index].amount) + parseFloat(transaction.amount)).toFixed(2)
          );
        } else {
          // Add a new transaction to the merged array
          mergedTransactions.push({
            from: transaction.from,
            to: transaction.to,
            amount: parseFloat(transaction.amount).toFixed(2),
            currency: transaction.currency,
          });
        }
      }
    }
  }

  return mergedTransactions;
}

async function mergeNetBalances(existingNetBalances = [], newNetBalances = []) {
  // Create an empty array to hold merged balances
  const mergedBalances = [];

  // Helper function to find a person in the mergedBalances array
  function findPerson(person) {
    for (let i = 0; i < mergedBalances.length; i++) {
      if (mergedBalances[i].person === person) {
        return i;
      }
    }
    return -1;
  }

  // Process existingNetBalances
  for (let i = 0; i < existingNetBalances.length; i++) {
    const item = existingNetBalances[i];
    mergedBalances.push({
      person: item.person,
      balance: parseFloat(item.balance.toFixed(2)),
      currency: item.currency
    });
  }

  // Process newNetBalances
  for (let i = 0; i < newNetBalances.length; i++) {
    const item = newNetBalances[i];
    const index = findPerson(item.person);
    if (index !== -1) {
      // Update the balance for the existing person
      mergedBalances[index].balance = parseFloat(
        (mergedBalances[index].balance + item.balance).toFixed(2)
      );
    } else {
      // Add a new person
      mergedBalances.push({
        person: item.person,
        balance: parseFloat(item.balance.toFixed(2)),
        currency: item.currency
      });
    }
  }
  console.log('mergedBalances ',mergedBalances);

  return mergedBalances;
}





async function simpleDebtSimplification(personOwed, balances, individualShares, members, simplifyCurrency) {
  let transactions = [];
  const creditor = personOwed;
  console.log('creditor ',creditor);
  console.log('balances ',balances);

  // find all the debtors
  // const debtors = balances.filter((b) => b.balance < 0 && members.includes(b.person)); //also make sure that the person is present in arr
  const debtors = balances.filter(
    (b) =>
      b.balance < 0 &&
      members.some((member) => member.person === b.person)
  );

  console.log('debtors ',debtors);
  // // sort debtors by balance ascending
  // debtors.sort((a, b) => a.balance - b.balance);

  // Record the transaction
  for(const debtor of debtors) {
      let settlement = 0;
      for(let i=0; i<individualShares.length; i++) {
        if(individualShares[i].person == debtor.person) {
          settlement = individualShares[i].share;
        }
      }
      console.log('settlement ',settlement);
      transactions.push({
          from: debtor.person,
          to: creditor,
          amount: settlement, // Round to 2 decimals
          currency: simplifyCurrency,
      });
      // Update balances
      creditor.balance += debtor.balance;
      debtor.balance = 0;
  }
  console.log('transactions inside simpledebt ',transactions);
  return transactions;
}

function settle(balances, simplifyCurrency = "INR") {
  // Create a local transactions array to avoid global state issues
  console.log('balances ',balances);
  const transactions = [];

  function settleRecursive(currentBalances) {
    // console.log('currentBalances ',currentBalances);
    // Base case: if no balances remain, return transactions
    if (currentBalances.length == 0) {
      return transactions;
    }

    // Find max creditor and max debtor
    const maxCreditor = currentBalances.reduce((max, b) =>
      b.balance > max.balance ? b : max
    );
    const maxDebtor = currentBalances.reduce((min, b) =>
      b.balance < min.balance ? b : min
    );

    // Determine settlement amount
    const settlement = Math.min(
      maxCreditor.balance,
      -maxDebtor.balance
    );

    // Record the transaction
    transactions.push({
      from: maxDebtor.person,
      to: maxCreditor.person,
      amount: settlement,
      currency: simplifyCurrency,
    });

    // Update balances
    maxCreditor.balance -= parseFloat(settlement.toFixed(2));
    maxDebtor.balance += parseFloat(settlement.toFixed(2));

    // Remove settled balances
    const updatedBalances = currentBalances.filter((b) => b.balance !== 0 || (b.balance > 1 && b.balance < -1));
    // console.log('updatedBalances ',updatedBalances);

    // Recursive call
    return settleRecursive(updatedBalances);
  }

  // Initial call to recursive function
  return settleRecursive(balances);
}


async function simplifyDebts(paidBy, members, amount, simplifyCurrency, splitBy = 'equally', title, groupId, previousBalances = {}, defaultCurrency = "INR") {
  let transactions = [];
  let netBalances = previousBalances || []; // Carry forward previous balances
  console.log('netBalances ;',netBalances);
  let individualShare = 0;

  // Extract the currency for simplification
  simplifyCurrency = simplifyCurrency || defaultCurrency;

  // for (const entry of input) {
      const personOwed = paidBy; // E.g., Person2
      // const members = members; // E.g., [Person1, Person3, Person4]
      const totalAmount = amount.value; // E.g., 600
      const currency = amount.currency; // E.g., 'EUR'

      // Fetch the exchange rate for the current amount to simplifyCurrency
      const exchangeRate = await getExchangeRate(currency, simplifyCurrency);
      const normalizedAmount = totalAmount * exchangeRate; // Convert to simplifyCurrency

      // Include the spender in the division
      const allMembers = [...members];

      let totalDivisions = 0;
      allMembers.forEach((item) => {
        totalDivisions += item.division;
      })
      console.log('totalDivisions ',totalDivisions);

      let individualShares = [];

      if(splitBy == 'equally') {
        // for equally
        allMembers.forEach((item) => {
          let obj = {
            person: item.person,
            share: (normalizedAmount / totalDivisions).toFixed(2)
          }
          individualShares.push(obj);
        })
      }
      else if(splitBy == 'shares') {
        // for shares
        allMembers.forEach((item) => {
          let ekShare = (normalizedAmount/totalDivisions);
          let obj = {
            person: item.person,
            share: (ekShare*item.division).toFixed(2)
          }
          individualShares.push(obj)
        })
      }
      else if(splitBy == 'percentage') {
        // for percentage
        allMembers.forEach((item) => {
          let obj = {
            person: item.person,
            share: ((item.division*0.01)*normalizedAmount).toFixed(2)
          }
          individualShares.push(obj);
        })
      }
      console.log('individualShares ',individualShares);

      // individualShare = normalizedAmount / allMembers.length;

      // Check if `personOwed` already exists in `netBalances`
      const existingEntry = netBalances.find(entry => entry.person === personOwed);

      if (existingEntry) {
        // If person already exists, update their balance
        existingEntry.balance += normalizedAmount;
      } else {
        // If person does not exist, create a new entry
        netBalances.push({
          person: personOwed,
          balance: normalizedAmount,
          currency: currency
        });
      }
      console.log('netBalances :',netBalances);

      // Add credit to the person who paid
      // netBalances[personOwed] = (netBalances[personOwed] || 0) + normalizedAmount;
      // console.log('netBalances before ',netBalances);

      // Deduct debts from each member (including the spender)

      // allMembers.forEach((member, index) => {
      //     netBalances[member.person] = (netBalances[member.person] || 0) - individualShares[index].share;
      // });
      allMembers.forEach((member, index) => {
        const person = member.person;
        const share = individualShares[index].share;
      
        // Check if the person already exists in netBalances
        const existingEntry = netBalances.find(entry => entry.person === person);
      
        if (existingEntry) {
          // If person exists, update their balance
          existingEntry.balance -= share;
        } else {
          // If person does not exist, create a new entry
          netBalances.push({
            person: person,
            balance: -share,
            currency: 'INR' // Replace with the actual currency if dynamic
          });
        }
      });
      console.log('netBalances ',netBalances);

      // Convert netBalances into an array of objects like [{ person: "Person1", balance: 400 }]
      // netBalances = Object.entries(netBalances).map(([person, balance]) => ({
      //   person,
      //   balance,
      // }));
  // }
  console.log('allMembers ',allMembers);
  console.log('netBalances ',netBalances);

  // // Convert net balances to an array
  // const balances = Object.entries(netBalances)
  //     .filter(([_, balance]) => balance !== 0)
  //     .map(([person, balance]) => ({ person, balance }));
  //     console.log('balances ',balances);

    // Convert netBalances to the desired structure, filtering out balances of 0
    const balances = netBalances
    .filter(({ balance }) => balance !== 0)  // Filter out zero balances
    .map(({ person, balance }) => ({ person, balance }));  // Map to the desired structure

    console.log('balances ', balances);

  // simple Debt Simplification logic
  transactions = await simpleDebtSimplification(personOwed, balances, individualShares, members, simplifyCurrency);

  // Debt Simplification Logic
  // await settle(balances);

  // settle(balances);
  // await simpleDebtSimplification(personOwed, balances, individualShare);

  return { transactions, netBalances };
}

const justification = async (req, res) => {
  console.log('req.body justification ',req.body);
  const { groupId } = req.body;
  try {
    //get the group
    const getGroup = await Group.findOne({groupId});
    let netBalances = getGroup.netBalances;
    let justify = await settle(netBalances);
    console.log('justify ',justify);
    res.status(200).json(justify);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: ' Error while justifying' });
  }
}

const replaceEmailsWithUsernames = async (transactions) => {
  try {
    // Step 1: Extract unique emails from the transactions array
    const emails = new Set();
    transactions.forEach(({ from, to }) => {
      emails.add(from);
      emails.add(to);
    });

    // Step 2: Query the database for user names corresponding to these emails
    const users = await User.find({ email: { $in: Array.from(emails) } }, 'name email');
    const emailToNameMap = users.reduce((map, user) => {
      map[user.email] = user.get('name'); // Map email to the user's name
      return map;
    }, {});

    // Step 3: Replace emails with user names in the transactions array
    const updatedTransactions = transactions.map(({ from, to, ...rest }) => ({
      from: emailToNameMap[from] ? emailToNameMap[from] + ' ' + '(' + (from) + ')' : from, // Fallback to email if name is not found
      to: emailToNameMap[to] ? emailToNameMap[to] + ' ' + '(' + (to) + ')' : to,
      ...rest,
    }));

    return updatedTransactions;
  } catch (error) {
    console.error('Error replacing emails with user names:', error);
    throw error; // Rethrow to handle it in the calling function
  }
};

module.exports = { simplifyDebts, mergeTransactions, mergeNetBalances, settle, justification, replaceEmailsWithUsernames }
