const { User } = require("../model/users");
const { Group } = require("../model/group");  // Import the Group model
const { OAuth2Client } = require('google-auth-library');
const { client } = require("../data/redis-database");

// Use environment variable for Google Client ID
const clientId = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const loginControl = async (req, res) => {
  const { credential, userDetails } = req.body;
  
  try {
    // Verify the Google ID token
    const ticket = await clientId.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const { sub, name, email } = payload;
    // Check if user exists
    let user = await User.findOne({ email });
    if (!user) {
      // Create new user
      user = await User.create({
        id_token: credential,
        username: userDetails.name,
        email: userDetails.email,
        googleId: userDetails.sub,
      });
      console.log('user in users ', user);
    }

    let obj ={
      username: userDetails.name,
      email: userDetails.email,
    }

    await client.set(`user:${userDetails.email}`, JSON.stringify(obj));
    await client.set(`user:${userDetails.name}`, JSON.stringify(obj));

    // add each charatcter to redis db
    let item = '';
    for(let i=0; i<userDetails.email.length; i++) {
      item += userDetails.email[i];
      await client.set(`user:${item}`, JSON.stringify(obj)) 
    }
    item = '';
    for(let i=0; i<userDetails.name.length; i++) {
      item += userDetails.name[i];
      await client.set(`user:${item}`, JSON.stringify(obj)) 
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
