const mongoose = require('mongoose');

const MAX_RETRIES = 5;
const INITIAL_DELAY = 1000;

const connectDB = async () => {
  let retries = 0;
  
  while (retries < MAX_RETRIES) {
    try {
      const conn = await mongoose.connect(process.env.MONGODB_URI);
      console.log(`MongoDB Connected: ${conn.connection.host}`);
      
      // Runtime reconnection handlers
      mongoose.connection.on('disconnected', () => {
        console.warn('MongoDB disconnected. Attempting reconnection...');
      });
      mongoose.connection.on('error', (err) => {
        console.error(`MongoDB connection error: ${err.message}`);
      });
      mongoose.connection.on('reconnected', () => {
        console.log('MongoDB reconnected successfully');
      });
      
      return;
    } catch (error) {
      retries++;
      const delay = INITIAL_DELAY * Math.pow(2, retries - 1);
      console.error(`MongoDB Connection Error (attempt ${retries}/${MAX_RETRIES}): ${error.message}`);
      
      if (retries >= MAX_RETRIES) {
        console.error('All MongoDB connection attempts failed. Exiting...');
        process.exit(1);
      }
      
      console.log(`Retrying in ${delay / 1000}s...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
};

module.exports = connectDB;
