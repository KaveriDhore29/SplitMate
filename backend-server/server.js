const express = require('express');
const dotenv = require('dotenv');
const connectDatabase = require('./data/database');
const cors = require('cors');
const { loginControl } = require('./controllers/users');
const { isAuthenticated } = require('./middlewares/auth');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const redis = require('redis');
// const { createClient } = require('redis');
const { getSuggestions } = require('./controllers/suggestions');
const { User } = require('./model/users');

const path = require('path');
const { Group } = require('./model/group'); // Import Group model for group creation
const { sendEmailToNewUser } = require('./features/send-email');
const { redisDb } = require('./data/redis-database');

const app = express();

// to use node version 20.16.0
// source ~/.nvm/nvm.sh
// nvm use 20.16.0

// Load environment variables
dotenv.config();

// Middleware
app.use(express.json()); // For parsing application/json
app.use(cookieParser()); // For parsing cookies
app.use(bodyParser.urlencoded({ extended: true })); // For parsing application/x-www-form-urlencoded


// CORS configuration
const corsOptions = {
  origin: 'http://localhost:4200',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
  credentials: true // Important for cookies
};

// Apply CORS middleware
app.use(cors(corsOptions));

// Handle preflight requests
app.options('*', cors());

// Connect to the database
connectDatabase();

// Connect Redis
redisDb();

// Routes
app.get('/', (req, res) => {
  res.send('Hello World!');
});

// Login route
app.post('/api/login', loginControl);

// Example protected route (authentication middleware)
app.get('/api/protected', isAuthenticated, (req, res) => {
  res.json({ message: 'You are authenticated!' });
});

// Search users by username (new endpoint)
app.get('/api/search-users-by-username', getSuggestions);


// **Create Group Route** - Handle group creation with selected members
app.post('/api/create-group', async (req, res) => {
  console.log('create grp');
  const { groupName, groupType } = req.body;
  let {members} = req.body
  console.log('members',members);

  // Validate the group name, members, and group type
  if (!groupName || !members || members.length === 0 || !groupType) {
    return res.status(400).json({ error: 'Group name, members, and group type are required' });
  }

  try {
    // Extract emails from members array
    const memberEmails = members.map(member => member.email);
  
    // Find users that exist in the database
    const existingUsers = await User.find({ email: { $in: memberEmails } });
    const existingUserEmails = existingUsers.map(user => user.email);
  
    console.log('Existing users:', existingUsers);

     // Filter out members that do not exist in the database
  members = members.filter(member => {
    const isExisting = existingUserEmails.includes(member.email);
    if (!isExisting) {
      console.log('User not found, sending email to:', member.email);
      sendEmailToNewUser(req, res, member.email);
    }
    return isExisting;
  });
  console.log('members  ',members);

    // if (users.length !== members.length) {
    //   return res.status(404).json({ error: 'Some members not found' });
    // }

    const newGroup = await Group.create({
      name: groupName,
      members: members,
      type: groupType
    });

    // await newGroup.save();
    res.status(201).json({ message: 'Group created successfully!', group: newGroup });
  } catch (error) {
    console.error('Error creating group:', error);  // Check for detailed error
    res.status(500).json({ error: 'Server error while creating group' });
  }
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
})
