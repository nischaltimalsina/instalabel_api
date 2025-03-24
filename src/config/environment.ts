import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const environment = {
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
  isTest: process.env.NODE_ENV === 'test',

  server: {
    port: parseInt(process.env.PORT || '3006', 10),
    nodeEnv: process.env.NODE_ENV || 'development'
  },

  database: {
    uri: process.env.NODE_ENV === 'test'
      ? process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/kitchen-labeling-test'
      : process.env.MONGODB_URI || 'mongodb://localhost:27017/kitchen-labeling'
  },

  jwt: {
    secret: process.env.JWT_SECRET || 'default_jwt_secret',
    expiresIn: process.env.JWT_EXPIRES_IN || '1d'
  }
};

export default environment;
