const { User } = require("../model/users");
const { Group } = require("../model/group");
const { GroupBalances } = require("../model/groupBalances");

const { client } = require('../data/redis-database');

const mergeTransactionList = (transactions) => {
  return transactions.slice(0, 10); 
};

const calculateTransactionGroupBalance = async (groupId) => {
  const group = await Group.findOne({ groupId }).lean();
  if (!group) throw new Error('Group not found');

  const transactions = group.transactions || [];
  const balances = {};

  transactions.forEach((tx) => {
    tx.netBalances.forEach((balance) => {
      balances[balance.email] = (balances[balance.email] || 0) + balance.amount;
    });
  });

  return Object.entries(balances).map(([email, owesAmount]) => ({ email, owesAmount }));
};

const insertTransactionGroupBalancesInDB = async (balances, groupId) => {
  await Group.updateOne(
    { groupId },
    { $set: { netBalances: balances } }
  );
};

const mergeTransactionNetBalances = (existingBalances, reverseBalances) => {
  const balanceMap = new Map();

  existingBalances.forEach((balance) => {
    balanceMap.set(balance.email, balance.amount);
  });

  // Reverse balances
  reverseBalances.forEach((balance) => {
    const existingAmount = balanceMap.get(balance.email) || 0;
    balanceMap.set(balance.email, existingAmount + balance.amount);
  });

  // Convert the Map back to an array
  return Array.from(balanceMap, ([email, amount]) => ({ email, amount }));
};

module.exports = {
  insertTransactionGroupBalancesInDB,
  calculateTransactionGroupBalance,
  mergeTransactionNetBalances,
  mergeTransactionList
};
