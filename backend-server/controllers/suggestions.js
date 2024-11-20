const { client } = require('../data/redis-database');
const { User } = require('../model/users');
// const User = require('../model/users');
// const client = require('../server'); // Correctly import the Redis client

const getSuggestions = async (req, res) => {
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
};

module.exports = { getSuggestions };
