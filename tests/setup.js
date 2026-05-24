/**
 * Test setup: Creates an isolated Express app with mongodb-memory-server
 * for testing without requiring a real MongoDB instance.
 */
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');

let mongoServer;

/**
 * Connect to in-memory MongoDB before tests
 */
async function setupTestDB() {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  
  // Disconnect any existing connection
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  
  await mongoose.connect(uri);
}

/**
 * Disconnect and stop in-memory MongoDB after tests
 */
async function teardownTestDB() {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  if (mongoServer) {
    await mongoServer.stop();
  }
}

/**
 * Clear all collections between tests
 */
async function clearTestDB() {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
}

module.exports = { setupTestDB, teardownTestDB, clearTestDB };
