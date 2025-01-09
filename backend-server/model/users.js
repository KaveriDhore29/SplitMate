const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  id_token: {
    type: String,
    required: false,
  },
  username: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address'],
  },
  groupIds: {
    type: Array,
    required: false,
  },
  profilePicture: { 
    type: String,
    required: false,
  },
}, { timestamps: true });

const User = mongoose.model('userData', schema);

module.exports = { User };
