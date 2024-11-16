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


const app = express();

// to use node version 20.16.0
// source ~/.nvm/nvm.sh
// nvm use 20.16.0

app.use(express.json()); //to use express
dotenv.config(); //to use .env file
connectDatabase(); //connect to DB
app.use(cookieParser());
// Middleware to parse urlencoded data
app.use(bodyParser.urlencoded({ extended: true }));


//CORS compatibility
app.use(cors({
  origin: process.env.FRONTEND_URL,
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


app.get('/', (req, res) => {
  res.send('Hello World!');
})

// app.post('/api/login', (req, res) => {
//   const data = req.body;
//   console.log(data);
//   // Handle request and respond
//   // res.redirect('http://localhost:4200/dashboard/');
// });

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


app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});
