const app = require('./app');
const env = require('./config/env');
const { sequelize } = require('./models');
const logger = require('./utils/logger');

const PORT = env.port;

const startServer = async () => {
  try {
    // Test database connection
    await sequelize.authenticate();
    logger.info('✅ Database connection established successfully.');

    // Sync models (creates tables if they don't exist)
    await sequelize.sync({ alter: false });
    logger.info('✅ Database models synchronized.');

    // Start the server
    app.listen(PORT, () => {
      logger.info(`🚀 SafeRoute API server running on port ${PORT}`);
      logger.info(`📍 Environment: ${env.nodeEnv}`);
      logger.info(`🔗 Health check: http://localhost:${PORT}/api/v1/health`);
    });
  } catch (error) {
    logger.error('❌ Unable to start server:', error);
    process.exit(1);
  }
};

startServer();
