const { User } = require("../model/users");
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client('YOUR_GOOGLE_CLIENT_ID'); // Replace with your actual client ID

const loginControl = async (req, res) => {
  const { credential, g_csrf_token } = req.body;

  // Verify the Google ID token
  try {
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: '1040146212904-7b45nt102lbvv34dsd4f2cg980plc1ob.apps.googleusercontent.com', // Replace with your actual client ID
    });
    const payload = ticket.getPayload();

    // The payload contains the user's info, including name, email, etc.
    const { sub, name, email } = payload;

    console.log('Verified user:', name, email);

    // Check if the user exists in the database
    let user = await User.findOne({ name });
    if (!user) {
      // Create the user if not found
      user = await User.create({ id_token: credential, name, email });
    }

    // Set cookie and redirect
    res.cookie('cookieToken', name, {
      httpOnly: true,
      maxAge: 60 * 60 * 1000, // 1 hour
      secure: false, // Set to `true` if using HTTPS
    });

    res.redirect(`http://localhost:4200/dashboard?token=${credential}`);

  } catch (error) {
    console.error('Error verifying ID token:', error);
    return res.status(400).json({ error: 'Invalid ID token' });
  }
};


// const loginControl = async (req, res) => {
//   const { id_token, name, email } = req.body;
//   const user = await User.findOne({ name });
//   let newUser;
//   // if(!user) {
//   //   // if user not present then make his entry in the DB
//   //   newUser = await User.create({ id_token, name, email });
//   // }
//   // console.log("newUser ",newUser);
//   // // set cookie
//   // res.cookie('cookieToken', name, {
//   //   httpOnly: true,
//   //   maxAge: 60 * 60 * 1000,
//   //   secure: false
//   // }).json({
//   //   success: true,
//   //   message: 'Cookie set successfully'
//   // });
//   console.log('rahul ',req.body);
//   console.log(id_token);

//   // Redirect to the Angular app with token as a query parameter
//   res.redirect(`http://localhost:4200/dashboard?token=${id_token}`);
// }

module.exports = { loginControl }