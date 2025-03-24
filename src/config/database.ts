import mongoose from 'mongoose';
import environment from './environment';

export const connectToDatabase = async (): Promise<void> => {
  try {
    await mongoose.connect(environment.database.uri, {
      // These options help with connection stability
      // Note: Some options have changed in newer Mongoose versions
      autoIndex: true, // Build indexes
      maxPoolSize: 10, // Maintain up to 10 socket connections
    });

    console.log('MongoDB connected successfully');

    // Handle errors after initial connection
    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
    });

  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1); // Exit with failure
  }
};

export const disconnectFromDatabase = async (): Promise<void> => {
  try {
    await mongoose.disconnect();
    console.log('MongoDB disconnected successfully');
  } catch (error) {
    console.error('MongoDB disconnection error:', error);
    process.exit(1);
  }
};
