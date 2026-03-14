import mongoose from 'mongoose';

let isConnected = false;

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.warn(
      '⚠️  MONGODB_URI is not set. Backend will run without a database connection. ' +
        'Set MONGODB_URI in backend/.env to connect to MongoDB.',
    );
    return;
  }

  // Avoid reconnecting if already connected
  if (isConnected) return;

  try {
    const conn = await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    isConnected = true;
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(
      `⚠️  Failed to connect to MongoDB at ${uri}. The API server will still start, ` +
        'but any endpoints that require the database will fail until MongoDB is available.',
    );
    console.error(`MongoDB error: ${error.message}`);
    // Do NOT exit the process – allow the API to run in degraded mode
  }
};

export default connectDB;

