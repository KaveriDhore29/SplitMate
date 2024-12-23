const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  id_token: {
    type: String,
    required: false, // Change to true if you need this field to be required
  },
  username: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true, // Ensures that email addresses are unique
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address'], // Basic email validation
  },
  groupIds: {
    type: Array,
    required: false,
  }
}, { timestamps: true }); // Automatically add createdAt and updatedAt fields

const User = mongoose.model('userData', schema);

module.exports = { User };
