const mongoose = require('mongoose');

// Optionally set strictQuery to false (to handle deprecation warnings in Mongoose 6+)
mongoose.set('strictQuery', false);

// Connect to the database
const connectDatabase = async () => {
  try {
    const connection = await mongoose.connect(process.env.MONGODB_URI, {
      dbName: 'splitmate', // Specify the database name
      useNewUrlParser: true, // Use the new URL parser (for older versions of Mongoose)
      useUnifiedTopology: true, // Use the new topology engine (for older versions of Mongoose)
    });
    console.log(`Database connected successfully with host: ${connection.connection.host}`);
  } catch (error) {
    console.log('Database connection error:', error);
  }
};

module.exports = connectDatabase;
