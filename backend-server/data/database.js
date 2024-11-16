const mongoose = require('mongoose');

const connectDatabase = () => {
  try {
    mongoose.connect(process.env.MONGODB_URI, {
      dbName: 'splitmate'
    }).then((c) => {
      console.log(`Database connected with ${c.connection.host}`);
    }).catch((err) => {
      console.log('Database connection ran into error: ',err);
    })
  } catch (error) {
    console.log(error);
  }
}

module.exports = connectDatabase;