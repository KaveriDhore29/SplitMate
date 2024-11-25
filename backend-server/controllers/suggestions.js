const { client } = require('../data/redis-database');
const { User } = require('../model/users');
// const User = require('../model/users');
// const client = require('../server'); // Correctly import the Redis client

// const getSuggestions = async (req, res) => {
//   const { query } = req.query;

//   try {
//     const redisKey = `search:${query}`;
//     console.log('redisKey ',redisKey);
//     // Use modern Redis methods
//     const cachedResult = await client.get(redisKey); // Await Promise-based `get`
//     // console.log('cachedResult',cachedResult);
//     if (cachedResult) {
//       console.log('Cache hit');
//       return res.json(JSON.parse(cachedResult));
//     }
//     console.log('Cache miss');
//     // Search users by username (case-insensitive search)
//     const users = await User.find({
//       name: { $regex: `^${query}`, $options: 'i' }  // Search usernames starting with the query
//     }).limit(10); // Limit results to 10 users

//     // Return usernames and emails
//     const results = users.map(user => ({
//       username: user.name,
//       email: user.email,
//       userid: user._id
//     }));
//     await client.set(redisKey, JSON.stringify(results)); // Use `setEx`
//     res.json(results);
//   } catch (error) {
//     console.error('Error fetching users:', error);
//     res.status(500).json({ error: 'Server error while searching users' });
//   }
// };
// Function to scan Redis for a key matching the pattern
const scanForKey = async (pattern) => {
  let cursor = 0;
  let matchingKeys = [];

  try {
    do {
      const result = await client.scan(cursor, { 
        MATCH: `*${pattern.toLowerCase()}*`, 
        COUNT: 100000000 
      });
      
      console.log('SCAN result:', result);

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
      console.log('imediate cache hit');
      return res.json([JSON.parse(getRedisKey)]);
    }
    const matchingKeys = await scanForKey(redisKey.trim());

    if (matchingKeys && matchingKeys.length > 0) {
      console.log('found key');
      console.log('Cache hit for key:', matchingKeys);

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
      console.log('results kjfrj',results);

      if (results.length > 0) {
        // Remove duplicates based on email
        // Log each item during the mapping process
        const uniqueResults = Array.from(
          new Map(
            results.map(item => {
              console.log('Processing item:', item); // Log each item
              return [item.email, item];
            })
          ).values()
        );
        console.log('uniqueResults ',uniqueResults);
        console.log('redisKey ',redisKey);
        if(uniqueResults.length > 0) await client.set(redisKey, JSON.stringify(uniqueResults));
        return res.json(uniqueResults.slice(0, 10)); // Limit to 10 results
      }
    }

    console.log('Cache miss');

    // Fallback to database search
    const users = await User.find({
      name: { $regex: `^${query}`, $options: 'i' }
    }).limit(10);

    const results = users.map(user => ({
      username: user.name,
      email: user.email,
      userid: user._id
    }));
console.log('results ',results);
console.log('users ',users);
    if(users.length > 0) {
      console.log('inside if users');
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

    console.log('eod ',results);
    return res.json(results);
  } catch (error) {
    console.error('Error in getSuggestions:', error);
    res.status(500).json({ error: 'Server error while searching users' });
  }
};



module.exports = { getSuggestions };
