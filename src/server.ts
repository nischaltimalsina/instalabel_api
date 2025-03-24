import { configureExpress } from './config/express';
import { connectToDatabase } from './config/database';
import { setupRoutes } from './api/routes';
import environment from './config/environment';

async function startServer() {
  try {
    // Connect to MongoDB
    await connectToDatabase();

    // Create Express application
    const app = configureExpress();

    // Configure routes
    setupRoutes(app);

    // Start the server
    const server = app.listen(environment.server.port, () => {
      console.log(`Server running on port ${environment.server.port} in ${environment.server.nodeEnv} mode`);
    });

    // Handle shutdown gracefully
    const shutdown = async () => {
      console.log('Shutting down server...');
      server.close();
      process.exit(0);
    };

    // Handle termination signals
    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
