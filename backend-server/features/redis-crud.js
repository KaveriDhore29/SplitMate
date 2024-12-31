const {client} = require('../data/redis-database');

const addInRedis = async (key, value) => {
  try {
    await client.set(key, value);
    console.log(`Added ${key} to Redis`);
  } catch (error) {
    console.error("Error in addInRedis:", error);
    throw new Error('An error occurred while adding to Redis.');
  }
}

const getFromRedis = async (key) => {
  console.log('key', key);
  try {
    const value = await client.get(key);
    console.log(`Retrieved ${value} from Redis`);
    return value;
  } catch (error) {
    console.error("Error in getFromRedis:", error);
    throw new Error('An error occurred while getting from Redis.');
  }
}

const deleteFromRedis = async (key) => {
  try {
    const result = await client.del(key);
    console.log(`Deleted ${result} key from Redis`);
    return result;
  } catch (error) {
    console.error("Error in deleteFromRedis:", error);
    throw new Error('An error occurred while deleting from Redis.');
  }
}

module.exports = { addInRedis, getFromRedis, deleteFromRedis };