const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  email: {
    type: String,
    required: false, // Change to true if you need this field to be required
  },
  owesAmount: {
    type: Number,
    required: false,
    default:0
  },
  to:{
    type: String,
    required: false, // Change to true if you need this field to be required
  },
  groupId: {
    type: String,
    required: false,
  }
}, { timestamps: true }); // Automatically add createdAt and updatedAt fields

const GroupBalances = mongoose.model('groupBalances', schema);

module.exports = { GroupBalances };
