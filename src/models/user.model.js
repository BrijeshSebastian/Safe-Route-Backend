const { DataTypes } = require('sequelize');
const ROLES = require('../constants/roles');
const RESPONDER_TYPES = require('../constants/responderTypes');

module.exports = (sequelize) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    full_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM(...Object.values(ROLES)),
      allowNull: false,
      defaultValue: ROLES.REPORTER,
    },
    responder_type: {
      type: DataTypes.ENUM(...Object.values(RESPONDER_TYPES)),
      allowNull: true,
    },
    profile_image: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    last_known_latitude: {
      type: DataTypes.DECIMAL(10, 8),
      allowNull: true,
    },
    last_known_longitude: {
      type: DataTypes.DECIMAL(11, 8),
      allowNull: true,
    },
    last_location_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  }, {
    tableName: 'users',
  });

  return User;
};
