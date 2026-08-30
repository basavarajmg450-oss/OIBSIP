const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');

let mongoServer;

const connectDB = async () => {
  // Try connecting to the configured MongoDB URI first
  if (process.env.MONGODB_URI) {
    try {
      await mongoose.connect(process.env.MONGODB_URI);
      console.log('✅ Connected to MongoDB via URI:', process.env.MONGODB_URI);
      return;
    } catch (error) {
      console.warn('⚠️  Could not connect to MongoDB URI, falling back to persistent local server...');
    }
  }

  // Fallback to MongoMemoryServer with a persistent dbPath on disk.
  // Data written here survives server restarts — emailVerified stays true.
  try {
    const { MongoMemoryServer } = require('mongodb-memory-server');

    // Resolve storage directory relative to this file so it always
    // points to  <project-root>/server/data/db  regardless of cwd.
    const dbPath = path.resolve(__dirname, '../../data/db');
    if (!fs.existsSync(dbPath)) {
      fs.mkdirSync(dbPath, { recursive: true });
      console.log(`📁 Created persistent DB directory: ${dbPath}`);
    }

    mongoServer = await MongoMemoryServer.create({
      instance: {
        dbPath,          // <-- write data here so it survives restarts
        storageEngine: 'wiredTiger',
      },
    });

    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB via MongoMemoryServer (persistent file storage)');
    console.log(`📁 DB data directory: ${dbPath}`);
    console.log('✅ Data WILL persist between server restarts');
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
