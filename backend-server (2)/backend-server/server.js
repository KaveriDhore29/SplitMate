const express = require('express');
const dotenv = require('dotenv');
const connectDatabase = require('./data/database');
const cors = require('cors');
const { loginControl } = require('./controllers/users');
const { isAuthenticated } = require('./middlewares/auth');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
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

// CORS configuration
app.use(cors({
  origin:'http://localhost:4200',
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type"],
  credentials: true,
}));

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
  }});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
