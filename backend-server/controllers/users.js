const { User } = require("../model/users");

const loginControl = async (req, res) => {
  const { id_token, name, email } = req.body;
  const user = await User.findOne({ name });
  let newUser;
  if(!user) {
    // if user not present then make his entry in the DB
    newUser = await User.create({ id_token, name, email });
  }
  console.log("newUser ",newUser);
  // set cookie
  res.cookie('cookieToken', name, {
    httpOnly: true,
    maxAge: 60 * 60 * 1000,
    secure: false
  }).json({
    success: true,
    message: 'Cookie set successfully'
  });
}

module.exports = { loginControl }