import mongoose from 'mongoose';

const connectDB = async () => {
  const primaryUri = process.env.MONGO_URI;
  const fallbackUri = 'mongodb://127.0.0.1:27017/mb_services';

  try {
    const conn = await mongoose.connect(primaryUri, {
      serverSelectionTimeoutMS: 4000,
    });
    console.log(`[Database] MongoDB Connected to Primary Host: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.warn(`[Database Warning] Could not connect to primary MongoDB Atlas (${error.message}). Trying fallback local MongoDB...`);
    try {
      const conn = await mongoose.connect(fallbackUri, {
        serverSelectionTimeoutMS: 5000,
      });
      console.log(`[Database] MongoDB Connected to Fallback Local DB: ${conn.connection.host}`);
      return conn;
    } catch (fallbackError) {
      console.error(`[Database Error] Could not connect to local MongoDB fallback: ${fallbackError.message}`);
    }
  }
};

export default connectDB;

