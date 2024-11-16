const { User } = require("../model/users");
const { Group } = require("../model/group");  // Import the Group model
const { OAuth2Client } = require('google-auth-library');

// Use environment variable for Google Client ID
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Controller to handle Google login
// const loginControl = async (req, res) => {
//   console.log('login control');
//   const { credential, userDetails } = req.body;
//   console.log('credential ',credential);

//   try {
//     // Verify the Google ID token
//     const ticket = await client.verifyIdToken({
//       idToken: credential,
//       audience: '541417568546-kh9sct1mp04ou367mmiuvc69vdebk8ms.apps.googleusercontent.com',
//     });

//     const payload = ticket.getPayload();
//     console.log('payload ',payload);
//     const { sub, name, email } = payload;

//     // console.log('Verified user:', name, email);

//     // Check if the user exists in the database
//     let user = await User.findOne({ email });
//     if (!user) {
//       // Create a new user if not found
//       user = await User.create({
//         id_token: credential,
//         name: userDetails.name,
//         email: userDetails.email,
//         googleId: userDetails.sub, // Use sub as Google User ID
//       });

//       // console.log('New user created:', user.name);

//       // Create a default group for the new user
//       const newGroup = new Group({
//         name: `${user.name}'s Group`,
//         createdBy: user._id,
//         members: [user._id],
//       });

//       await newGroup.save();
//       // console.log('New group created:', newGroup.name);
//     }

//     // Set a cookie and respond
//     res.cookie('cookieToken', credential, {
//       httpOnly: true,
//       maxAge: 60 * 60 * 1000, // 1 hour
//       secure: process.env.NODE_ENV === 'production',
//     });

//     return res.redirect(`http://localhost:4200/dashboard`);
//     // return res.redirect(`http://localhost:4200/dashboard/main-dashboard?token=${credential}`);

//   } catch (error) {
//     console.error('Error during login:', error);
//     res.status(400).json({ success: false, error: 'Authentication failed' });
//   }
// };
const loginControl = async (req, res) => {
  const { credential, userDetails } = req.body;
  
  try {
    // Verify the Google ID token
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    console.log('payload',payload);
    const { sub, name, email } = payload;

    // Check if user exists
    let user = await User.findOne({ email });
    if (!user) {
      // Create new user
      user = await User.create({
        id_token: credential,
        name: userDetails.name,
        email: userDetails.email,
        googleId: userDetails.sub,
      });

      // Create default group
      const newGroup = new Group({
        name: `${user.name}'s Group`,
        createdBy: user._id,
        members: [user._id],
      });
      await newGroup.save();
    }

    // Set cookie
    res.cookie('cookieToken', credential, {
      httpOnly: true,
      maxAge: 60 * 60 * 1000,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'  // Important for cross-site cookie handling
    });

    // Send JSON response instead of redirect
    return res.status(200).json({
      success: true,
      message: 'Authentication successful',
      user: {
        name: user.name,
        email: user.email
      }
    });

  } catch (error) {
    console.error('Error during login:', error);
    res.status(400).json({ 
      success: false, 
      error: 'Authentication failed'
    });
  }
};


module.exports = { loginControl };
