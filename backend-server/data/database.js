const mongoose = require('mongoose');

// Optionally set strictQuery to false (to handle deprecation warnings in Mongoose 6+)
mongoose.set('strictQuery', false);

// Connect to the database
const connectDatabase = async () => {
  try {
    const connection = await mongoose.connect(process.env.MONGODB_URI, {
      dbName: 'splitmate',
    });
    console.log(`Database connected successfully with host: ${connection.connection.host}`);
  } catch (error) {
    console.log('Database connection error:', error);
  }
};

module.exports = connectDatabase;
