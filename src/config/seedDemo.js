const { sequelize, User } = require('../models');
const { hashPassword } = require('../utils/bcrypt');
const ROLES = require('../constants/roles');
const RESPONDER_TYPES = require('../constants/responderTypes');
const logger = require('../utils/logger');

const seedDemo = async () => {
  if (process.env.NODE_ENV === 'production') {
    logger.error('❌ Demo seeding is strictly disabled in production (NODE_ENV=production).');
    process.exit(1);
  }

  try {
    await sequelize.authenticate();
    logger.info('Database connected for demo seeding.');

    await sequelize.sync({ alter: false });

    const reporterPassword = await hashPassword('ReporterPass123!');
    const responderPassword = await hashPassword('ResponderPass123!');

    const demoUsers = [
      {
        full_name: 'Demo Reporter',
        email: 'reporter@example.com',
        phone: '9000000001',
        password: reporterPassword,
        role: ROLES.REPORTER,
        is_active: true,
      },
      {
        full_name: 'Demo Ambulance',
        email: 'ambulance@example.com',
        phone: '9000000002',
        password: responderPassword,
        role: ROLES.RESPONDER,
        responder_type: RESPONDER_TYPES.AMBULANCE,
        is_active: true,
      },
      {
        full_name: 'Demo Police',
        email: 'police@example.com',
        phone: '9000000003',
        password: responderPassword,
        role: ROLES.RESPONDER,
        responder_type: RESPONDER_TYPES.POLICE,
        is_active: true,
      },
      {
        full_name: 'Demo Fire',
        email: 'fire@example.com',
        phone: '9000000004',
        password: responderPassword,
        role: ROLES.RESPONDER,
        responder_type: RESPONDER_TYPES.FIRE,
        is_active: true,
      },
    ];

    for (const userData of demoUsers) {
      const [user, created] = await User.findOrCreate({
        where: { email: userData.email },
        defaults: userData,
      });

      if (created) {
        logger.info(`✅ Created demo user: ${userData.full_name} (${userData.email})`);
      } else {
        logger.info(`ℹ️ Demo user already exists: ${userData.full_name} (${userData.email})`);
      }
    }

    logger.info('✅ Demo seeding finished successfully.');
    process.exit(0);
  } catch (error) {
    logger.error('❌ Demo seeding failed:', error);
    process.exit(1);
  }
};

seedDemo();
