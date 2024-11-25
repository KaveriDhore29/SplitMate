const db = []; // Simulating database to store previous transactions

function simplifyDebts(input, previousBalances = {}) {
  console.log('input ',input);
    const transactions = [];

    // Step 1: Parse input and update balances
    const netBalances = { ...previousBalances }; // Carry forward previous balances

    input.forEach((entry) => {
        const personOwed = Object.keys(entry)[0]; // E.g., Person2
        const members = entry[personOwed].members; // E.g., [Person1, Person3, Person4]
        const totalAmount = entry.Amount; // E.g., 600

        // Include the spender in the division
        const allMembers = [personOwed, ...members];
        const individualShare = totalAmount / allMembers.length;

        // Add credit to the person who paid
        netBalances[personOwed] = (netBalances[personOwed] || 0) + totalAmount;

        // Deduct debts from each member (including the spender)
        allMembers.forEach((member) => {
            netBalances[member] = (netBalances[member] || 0) - individualShare;
        });
    });

    // Step 2: Convert net balances to an array
    const balances = Object.entries(netBalances)
        .filter(([_, balance]) => balance !== 0)
        .map(([person, balance]) => ({ person, balance }));

    // Step 3: Debt Simplification Logic
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
            amount: settlement,
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

    return { transactions, netBalances };
}

module.exports = { simplifyDebts }