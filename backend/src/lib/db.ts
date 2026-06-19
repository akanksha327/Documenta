import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/signforge';

export async function dbConnect() {
  try {
    if (mongoose.connection.readyState >= 1) {
      return;
    }
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB successfully');
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    // Do not call process.exit(1) so the Express server can still bind to the port on Render.
  }
}
