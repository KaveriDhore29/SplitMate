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

async function simplifyDebts(input, previousBalances = {}, defaultCurrency = "INR") {
  console.log('simplify inputs ',input);
  const transactions = [];
  const netBalances = { ...previousBalances }; // Carry forward previous balances

  // Extract the currency for simplification
  const simplifyCurrency = input[0]?.simplifyCurrency || defaultCurrency;

  for (const entry of input) {
      const personOwed = Object.keys(entry)[0]; // E.g., Person2
      const members = entry[personOwed].members; // E.g., [Person1, Person3, Person4]
      const totalAmount = entry.Amount.value; // E.g., 600
      const currency = entry.Amount.currency; // E.g., 'EUR'

      // Fetch the exchange rate for the current amount to simplifyCurrency
      const exchangeRate = await getExchangeRate(currency, simplifyCurrency);
      const normalizedAmount = totalAmount * exchangeRate; // Convert to simplifyCurrency

      // Include the spender in the division
      const allMembers = [personOwed, ...members];
      const individualShare = normalizedAmount / allMembers.length;

      // Add credit to the person who paid
      netBalances[personOwed] = (netBalances[personOwed] || 0) + normalizedAmount;

      // Deduct debts from each member (including the spender)
      allMembers.forEach((member) => {
          netBalances[member] = (netBalances[member] || 0) - individualShare;
      });
  }

  // Convert net balances to an array
  const balances = Object.entries(netBalances)
      .filter(([_, balance]) => balance !== 0)
      .map(([person, balance]) => ({ person, balance }));

  // Debt Simplification Logic
  function settle(balances) {
      if (balances.length === 0) return;

      // Find max creditor and max debtor
      const maxCreditor = balances.reduce((max, b) =>
          b.balance > max.balance ? b : max
      );
      const maxDebtor = balances.reduce((min, b) =>
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
          amount: settlement.toFixed(2), // Round to 2 decimals
          currency: simplifyCurrency,
      });

      // Update balances
      maxCreditor.balance -= settlement;
      maxDebtor.balance += settlement;

      // Remove settled balances
      const updatedBalances = balances.filter((b) => b.balance !== 0);

      // Recursive call
      settle(updatedBalances);
  }

  settle(balances);
  console.log('transactions ',transactions);

  return { transactions, netBalances };
}

module.exports = { simplifyDebts }
