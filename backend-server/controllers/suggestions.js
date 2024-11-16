const User = require('../model/users');
const client = require('../server'); // Correctly import the Redis client

const getSuggestions = async (req, res) => {
  const { query } = req.query;

  if (!query) {
    return res.status(400).json({ message: 'Query parameter is required' });
  }

  try {
    const redisKey = `${query}`;
    // console.log('Redis Key:', redisKey);

    // Use modern Redis methods
    const cachedResult = await client.get(redisKey); // Await Promise-based `get`
    // console.log(cachedResult);
    if (cachedResult) {
      // console.log('Cache hit');
      return res.json(JSON.parse(cachedResult));
    }

    // console.log('Cache miss');
    const regex = new RegExp(`^${query}`, 'i');
    const users = await User.find({ name: regex }).limit(10);
    const names = users.map(user => user.name);

    await client.setEx(redisKey, 3600, JSON.stringify(names)); // Use `setEx`

    return res.json(names);
  } catch (error) {
    console.error('Error fetching suggestions:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = { getSuggestions };
