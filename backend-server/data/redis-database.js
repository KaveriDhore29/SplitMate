const redis = require('redis');

const redisDb = async() => {

  const client = redis.createClient({
    password: 'XsrgTF2CFvts9c1fdmHNOpwNsIIw26RS',
    socket: {
      host: 'redis-15937.c81.us-east-1-2.ec2.redns.redis-cloud.com',
      port: 15937,
      connectTimeout: 10000 // 10 seconds
    }
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
}


module.exports = { client, redisDb }