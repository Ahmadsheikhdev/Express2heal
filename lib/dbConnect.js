import mongoose from 'mongoose';
import 'dotenv/config';

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  throw new Error('Please define the MONGO_URI environment variable in your .env file');
}

// Global cached connection object to prevent multiple connections during hot reloads
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export default async function dbConnect() {
  if (cached.conn) {
    console.log(`Using existing MongoDB connection: ${cached.conn.connections[0].name}`);
    return cached.conn;
  }

  if (!cached.promise) {
    console.log('Attempting to connect to MongoDB...');
    cached.promise = mongoose
      .connect(MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 5000, // Timeout after 5 seconds
      })
      .then((mongoose) => {
        const dbName = mongoose.connection.name;
        const dbHost = mongoose.connection.host;
        console.log(`Successfully connected to MongoDB database: "${dbName}" on host: "${dbHost}"`);
        return mongoose;
      })
      .catch((err) => {
        console.error('MongoDB connection error:', err.message);
        throw new Error(`Failed to connect to MongoDB: ${err.message}`);
      });
  }

  try {
    cached.conn = await cached.promise;

    // Additional logging for the connected database
    if (cached.conn) {
      const { name, host, port } = cached.conn.connections[0];
      console.log(`Connected to MongoDB database: "${name}" at host: "${host}" on port: "${port}"`);
    }

    return cached.conn;
  } catch (err) {
    console.error('Error in MongoDB connection:', err.message);

    // Graceful error throw for debugging
    throw new Error(`MongoDB connection failed: ${err.message}`);
  }
}
