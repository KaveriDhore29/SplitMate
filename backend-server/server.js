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
const { User } = require('./model/users'); // Import User model
const { Group } = require('./model/group'); // Import Group model for group creation

const app = express();

// Load environment variables
dotenv.config();

// Middleware
app.use(express.json()); // For parsing application/json
app.use(cookieParser()); // For parsing cookies
app.use(bodyParser.urlencoded({ extended: true })); // For parsing application/x-www-form-urlencoded


//CORS compatibility
// CORS configuration
app.use(cors({
  origin:'http://localhost:4200',
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type"],
  credentials: true,
}));

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
    await client.set('key', 'ytryuryutiui');
const value = await client.get('key');
console.log(value);
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

app.get('/api/suggestions', async (req, res) => {
  const { query } = req.query;

  if (!query) {
    return res.status(400).json({ message: 'Query parameter is required' });
  }

  try {
    const redisKey = `${query}`;
    console.log('Redis Key:', redisKey);

    // Use modern Redis methods
    const cachedResult = await client.get('redisKey'); // Await Promise-based `get`
    console.log('cachedResult',cachedResult);
    if (cachedResult) {
      console.log('Cache hit');
      return res.json(JSON.parse(cachedResult));
    }

    console.log('Cache miss');
    const regex = new RegExp(`^${query}`, 'i');
    const users = await User.find({ name: regex }).limit(10);
    const names = users.map(user => user.name);
    console.log(regex, users, names);

    await client.setEx(redisKey, 3600, JSON.stringify(names)); // Use `setEx`
    console.log(names);
    return res.json(names);
  } catch (error) {
    console.error('Error fetching suggestions:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});
// Example protected route (authentication middleware)
app.get('/api/protected', isAuthenticated, (req, res) => {
  res.json({ message: 'You are authenticated!' });
});

// Search users by username (new endpoint)
app.get('/api/search-users-by-username', async (req, res) => {
  const { query } = req.query;

  try {
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
    res.json(results);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Server error while searching users' });
  }
});


// **Create Group Route** - Handle group creation with selected members
app.post('/api/create-group', isAuthenticated, async (req, res) => {
  const { groupName, members, groupType } = req.body;

  // Validate the group name, members, and group type
  if (!groupName || !members || members.length === 0 || !groupType) {
    return res.status(400).json({ error: 'Group name, members, and group type are required' });
  }

  try {
    const users = await User.find({ '_id': { $in: members } });
    if (users.length !== members.length) {
      return res.status(404).json({ error: 'Some members not found' });
    }
  
    const newGroup = new Group({
      name: groupName,
      members: members,
      createdBy: req.user.id,
      type: groupType
    });
  
    await newGroup.save();
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
