const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  auth_token: {
    type: String,
    required: false,
  },
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
});

// export const User = mongoose.model("userData", schema);
const User = mongoose.model('userData', schema);
module.exports = { User };