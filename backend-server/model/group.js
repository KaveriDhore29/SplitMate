
const mongoose = require('mongoose');

// const groupSchema = new mongoose.Schema({
//   name: { type: String, required: true },
//   members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
//   createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
//   createdAt: { type: Date, default: Date.now },
// });



// const Group = mongoose.model('Group', groupSchema);

const groupSchema = new mongoose.Schema({
  name: String,
  members: Array,
  type: String,  // This should match groupType
  groupId: String,
  transactions: Array,
  netBalances: Object,
  latestTransactions: Array,
  createdBy: String,
}, { timestamps: true });
const Group = mongoose.model('Group', groupSchema);

module.exports = { Group };
