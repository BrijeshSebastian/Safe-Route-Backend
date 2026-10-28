const { DataTypes } = require('sequelize');
const INCIDENT_TYPES = require('../constants/incidentTypes');
const INCIDENT_STATUS = require('../constants/incidentStatus');

module.exports = (sequelize) => {
  const Incident = sequelize.define('Incident', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    title: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    incident_type: {
      type: DataTypes.ENUM(...Object.values(INCIDENT_TYPES)),
      allowNull: false,
    },
    severity: {
      type: DataTypes.ENUM('low', 'medium', 'high', 'critical'),
      allowNull: false,
      defaultValue: 'medium',
    },
    status: {
      type: DataTypes.ENUM(...Object.values(INCIDENT_STATUS)),
      allowNull: false,
      defaultValue: INCIDENT_STATUS.PENDING,
    },
    latitude: {
      type: DataTypes.DECIMAL(10, 8),
      allowNull: false,
    },
    longitude: {
      type: DataTypes.DECIMAL(11, 8),
      allowNull: false,
    },
    address: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    reporter_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  }, {
    tableName: 'incidents',
  });

  return Incident;
};
