const { DataTypes } = require('sequelize');
const INCIDENT_STATUS = require('../constants/incidentStatus');

module.exports = (sequelize) => {
  const IncidentStatusHistory = sequelize.define('IncidentStatusHistory', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    incident_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    previous_status: {
      type: DataTypes.ENUM(...Object.values(INCIDENT_STATUS)),
      allowNull: true,
    },
    new_status: {
      type: DataTypes.ENUM(...Object.values(INCIDENT_STATUS)),
      allowNull: false,
    },
    changed_by: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  }, {
    tableName: 'incident_status_history',
  });

  return IncidentStatusHistory;
};
