const express = require('express');
const dotenv = require('dotenv');
const connectDatabase = require('./data/database');
const cors = require('cors');
const { loginControl } = require('./controllers/users');
const { isAuthenticated } = require('./middlewares/auth');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const redis = require('redis');
const { getSuggestions } = require('./controllers/suggestions');
const { User } = require('./model/users');

const path = require('path');
const { Group } = require('./model/group'); // Import Group model for group creation
const { sendEmailToNewUser } = require('./features/send-email');

const app = express();

// Load environment variables
dotenv.config();

// Middleware
app.use(express.json()); // For parsing application/json
app.use(cookieParser()); // For parsing cookies
app.use(bodyParser.urlencoded({ extended: true })); // For parsing application/x-www-form-urlencoded


//CORS compatibility
// CORS configuration
// app.use(cors({
//   origin: 'http://localhost:4200', // Allow the frontend URL
//   methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
//   allowedHeaders: ['Content-Type', 'Authorization'], // Add Content-Type
//   credentials: true, // If using cookies or credentials
// }));
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
// const redis = require('redis');

// Create the Redis client
const client = redis.createClient({
  url: 'redis://localhost:6379', // Replace with your Redis server URL
});

// Handle connection events
client.on('connect', () => {
  console.log('Connected to Redis...');
});

client.on('error', (err) => {
  console.error('Redis error:', err);
});

// Connect the client
(async () => {
  try {
    await client.connect();
  } catch (err) {
    console.error('Error connecting to Redis:', err);
  }
})();

// module.exports = client;


// Connect to the database
connectDatabase();

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
app.get('/api/search-users-by-username', async (req, res) => {
  const { query } = req.query;

  try {
    const redisKey = `${query}`;
    // Use modern Redis methods
    const cachedResult = await client.get(redisKey); // Await Promise-based `get`
    // console.log('cachedResult',cachedResult);
    if (cachedResult) {
      console.log('Cache hit');
      return res.json(JSON.parse(cachedResult));
    }
    // Search users by username (case-insensitive search)
    const users = await User.find({
      name: { $regex: `^${query}`, $options: 'i' }  // Search usernames starting with the query
    }).limit(10); // Limit results to 10 users

    // Return usernames and emails
    const results = users.map(user => ({
      username: user.name,
      email: user.email,
      userid: user._id
    }));
    await client.setEx(redisKey, 3600, JSON.stringify(results)); // Use `setEx`
    res.json(results);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Server error while searching users' });
  }
});


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
      // sendEmailToNewUser(member.email);
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
  // console.log(`Server running on port ${PORT}`);
})
