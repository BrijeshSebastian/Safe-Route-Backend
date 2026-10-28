const { sequelize, User } = require('../models');
const { hashPassword } = require('../utils/bcrypt');
const ROLES = require('../constants/roles');
const logger = require('../utils/logger');

const seedAdmin = async () => {
  try {
    const email = process.env.SEED_ADMIN_EMAIL;
    const password = process.env.SEED_ADMIN_PASSWORD;
    if (!email || !password || password.length < 12) {
      throw new Error('SEED_ADMIN_EMAIL and a 12+ character SEED_ADMIN_PASSWORD are required');
    }
    await sequelize.authenticate();
    logger.info('Database connected for seeding.');

    await sequelize.sync({ alter: false });

    // Check if admin already exists
    const existingAdmin = await User.findOne({ where: { role: ROLES.ADMIN } });
    if (existingAdmin) {
      logger.info('Admin user already exists. Skipping seed.');
      process.exit(0);
    }

    const hashedPassword = await hashPassword(password);
    await User.create({
      full_name: 'System Admin',
      email,
      phone: process.env.SEED_ADMIN_PHONE || '9999999999',
      password: hashedPassword,
      role: ROLES.ADMIN,
      is_active: true,
    });

    logger.info('✅ Admin user seeded successfully.');
    logger.info(`   Email: ${email}`);
    process.exit(0);
  } catch (error) {
    logger.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

seedAdmin();
