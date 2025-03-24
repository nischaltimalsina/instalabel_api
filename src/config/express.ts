import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import environment from './environment';

export const configureExpress = (): Application => {
  const app: Application = express();

  // Security middleware
  app.use(helmet());

  // CORS configuration
  const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3006'];
  app.use(cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, Postman)
      if (!origin) return callback(null, true);

      if (allowedOrigins.indexOf(origin) === -1) {
        const msg = `The CORS policy for this site does not allow access from the specified Origin: ${origin}`;
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }));

  // Request parsing middleware
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true }));

  // Compression and logging
  app.use(compression());
  app.use(morgan(environment.isDevelopment ? 'dev' : 'combined'));

  // Basic route for health check
  app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', environment: environment.server.nodeEnv });
  });

  return app;
};
