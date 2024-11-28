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
  console.log('data ',data);
  const mergedData = {};

  // Iterate through the transactions array
  for (const obj of data) {
    for (const transaction of obj.transactions) {
      const { from, to, currency, amount } = transaction;
      const key = `${from}-${to}-${currency}`; // Create a unique key based on from, to, and currency

      if (!mergedData[key]) {
        // Initialize if key does not exist
        mergedData[key] = { from, to, currency, amount: parseFloat(amount) };
      } else {
        // Add amounts if key exists
        mergedData[key].amount += parseFloat(amount);
      }
    }
  }

  // Convert the mergedData object back into an array
  return Object.values(mergedData);
}

async function mergeNetBalances(existingNetBalances = [], newNetBalances = []) {
  console.log("existingNetBalances", existingNetBalances);
  console.log("newNetBalances", newNetBalances);

  // Initialize an empty object to store combined balances
  const combinedNetBalances = {};

  // Merge existingNetBalances into combinedNetBalances
  existingNetBalances.forEach(({ person, balance }) => {
    console.log('balance ',balance);
    combinedNetBalances[person] = balance;
  });
  console.log('existingNetBalances ',existingNetBalances);

  // Merge with newNetBalances
  newNetBalances.forEach(({ person, balance }) => {
    console.log('typeof balance ',typeof balance);
    balance = parseFloat(balance.toFixed(2));
    if (combinedNetBalances[person] !== undefined) {
      // Adjust the value if the person already exists
      console.log('combinedNetBalances[person] ',combinedNetBalances[person]);
      console.log('typeof combinedNetBalances[person] ',typeof combinedNetBalances[person]);
      console.log('balance ',balance);
      combinedNetBalances[person] += balance;
    } else {
      // Add new person with their balance
      combinedNetBalances[person] = balance;
    }
  });
  console.log('combinedNetBalances ',combinedNetBalances);

  // Convert back to the desired array format
  const netBalancesArray = Object.entries(combinedNetBalances).map(([person, balance]) => ({
    person,
    balance
  }));

  console.log("netBalancesArray", netBalancesArray);
  return netBalancesArray;
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
  let netBalances = { ...previousBalances }; // Carry forward previous balances
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

      // Add credit to the person who paid
      netBalances[personOwed] = (netBalances[personOwed] || 0) + normalizedAmount;
      console.log('netBalances before ',netBalances);

      // Deduct debts from each member (including the spender)
      allMembers.forEach((member, index) => {
          netBalances[member.person] = (netBalances[member.person] || 0) - individualShares[index].share;
      });

      // Convert netBalances into an array of objects like [{ person: "Person1", balance: 400 }]
      netBalances = Object.entries(netBalances).map(([person, balance]) => ({
        person,
        balance,
      }));
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

module.exports = { simplifyDebts, mergeTransactions, mergeNetBalances, settle }
