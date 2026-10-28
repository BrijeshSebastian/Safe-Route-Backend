const { DataTypes } = require('sequelize');
const ASSIGNMENT_STATUS = require('../constants/assignmentStatus');

module.exports = (sequelize) => {
  const IncidentAssignment = sequelize.define('IncidentAssignment', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    incident_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    responder_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    assigned_by: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    assignment_status: {
      type: DataTypes.ENUM(...Object.values(ASSIGNMENT_STATUS)),
      allowNull: false,
      defaultValue: ASSIGNMENT_STATUS.ASSIGNED,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    responded_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    completed_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  }, {
    tableName: 'incident_assignments',
  });

  return IncidentAssignment;
};
