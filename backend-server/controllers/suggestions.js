const { client } = require('../data/redis-database');
const { User } = require('../model/users');

const scanForKey = async (pattern) => {
  let cursor = 0;
  let matchingKeys = [];

  try {
    do {
      const result = await client.scan(cursor, { 
        MATCH: `*${pattern.toLowerCase()}*`, 
        COUNT: 100000000 
      });

      if (result && Array.isArray(result.keys)) {
        matchingKeys = [...matchingKeys, ...result.keys];
        cursor = parseInt(result.cursor); // Convert cursor to number
      } else {
        throw new Error('Unexpected result format from Redis SCAN');
      }

      // Break if cursor is 0 (numeric comparison)
      if (cursor === 0) {
        break;
      }
    } while (true);

    console.log('Found matching keys:', matchingKeys);
    return matchingKeys;
  } catch (error) {
    console.error('Error while scanning Redis:', error);
    throw error;
  }
};

const getSuggestions = async (req, res) => {
  const { query } = req.query;

  if (!query) {
    return res.status(400).json({ error: 'Search query is required' });
  }

  try {
    const redisKey = (`user:${query}`);
    let getRedisKey = await client.get(redisKey)
    if(getRedisKey) {
      return res.json([JSON.parse(getRedisKey)]);
    }
    const matchingKeys = await scanForKey(redisKey.trim());

    if (matchingKeys && matchingKeys.length > 0) {
      // Get values for each key individually
      const results = [];
      for (const key of matchingKeys) {
        try {
          const value = await client.get(key);
          if (value) {
            try {
              const parsedValue = JSON.parse(value);
              if (parsedValue) {
                results.push(parsedValue);
              }
            } catch (parseError) {
              console.error('Error parsing cached value for key:', key, parseError);
              // Continue with next key if parsing fails
              continue;
            }
          }
        } catch (getError) {
          console.error('Error getting value for key:', key, getError);
          // Continue with next key if get fails
          continue;
        }
      }

      if (results.length > 0) {
        // Remove duplicates based on email
        // Log each item during the mapping process
        const uniqueResults = Array.from(
          new Map(
            results.map(item => {
              return [item.email, item];
            })
          ).values()
        );
        if(uniqueResults.length > 0) await client.set(redisKey, JSON.stringify(uniqueResults));
        return res.json(uniqueResults.slice(0, 10)); // Limit to 10 results
      }
    }

    // Fallback to database search
    const users = await User.find({
      name: { $regex: `^${query}`, $options: 'i' }
    }).limit(10);

    const results = users.map(user => ({
      username: user.name,
      email: user.email,
      userid: user._id
    }));
    if(users.length > 0) {
      await client.set(redisKey, JSON.stringify(results));

    // Cache individual results
    for (const result of results) {
      try {
        // Store by email
        await client.set(
          `user:${result.email.toLowerCase()}`,
          JSON.stringify(result),
          { EX: 3600 }
        );
        // Store by username
        await client.set(
          `user:${result.username.toLowerCase()}`,
          JSON.stringify(result),
          { EX: 3600 }
        );
      } catch (cacheError) {
        console.error('Error caching result:', cacheError);
        // Continue with next result if caching fails
      }
    }
  }

    return res.json(results);
  } catch (error) {
    console.error('Error in getSuggestions:', error);
    res.status(500).json({ error: 'Server error while searching users' });
  }
};



module.exports = { getSuggestions };
