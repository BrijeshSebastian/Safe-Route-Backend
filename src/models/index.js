const sequelize = require('../config/database');

// Import model definitions
const defineUser = require('./user.model');
const defineIncident = require('./incident.model');
const defineIncidentImage = require('./incidentImage.model');
const defineIncidentAssignment = require('./incidentAssignment.model');
const defineIncidentStatusHistory = require('./incidentStatusHistory.model');
const defineNotification = require('./notification.model');
const defineRefreshToken = require('./refreshToken.model');
const definePasswordResetToken = require('./passwordResetToken.model');

// Initialize models
const User = defineUser(sequelize);
const Incident = defineIncident(sequelize);
const IncidentImage = defineIncidentImage(sequelize);
const IncidentAssignment = defineIncidentAssignment(sequelize);
const IncidentStatusHistory = defineIncidentStatusHistory(sequelize);
const Notification = defineNotification(sequelize);
const RefreshToken = defineRefreshToken(sequelize);
const PasswordResetToken = definePasswordResetToken(sequelize);

// ──── Associations ────

// User <-> Incident
User.hasMany(Incident, { foreignKey: 'reporter_id', as: 'incidents' });
Incident.belongsTo(User, { foreignKey: 'reporter_id', as: 'reporter' });

// Incident <-> IncidentImage
Incident.hasMany(IncidentImage, { foreignKey: 'incident_id', as: 'images' });
IncidentImage.belongsTo(Incident, { foreignKey: 'incident_id' });

// Incident <-> IncidentAssignment
Incident.hasMany(IncidentAssignment, { foreignKey: 'incident_id', as: 'assignments' });
IncidentAssignment.belongsTo(Incident, { foreignKey: 'incident_id', as: 'incident' });

// Assignment <-> User (responder)
User.hasMany(IncidentAssignment, { foreignKey: 'responder_id', as: 'assignments' });
IncidentAssignment.belongsTo(User, { foreignKey: 'responder_id', as: 'responder' });

// Assignment <-> User (assigned_by)
IncidentAssignment.belongsTo(User, { foreignKey: 'assigned_by', as: 'assignedByUser' });

// Incident <-> IncidentStatusHistory
Incident.hasMany(IncidentStatusHistory, { foreignKey: 'incident_id', as: 'statusHistory' });
IncidentStatusHistory.belongsTo(Incident, { foreignKey: 'incident_id' });

// StatusHistory <-> User (changed_by)
IncidentStatusHistory.belongsTo(User, { foreignKey: 'changed_by', as: 'changedByUser' });

// User <-> Notification
User.hasMany(Notification, { foreignKey: 'user_id', as: 'notifications' });
Notification.belongsTo(User, { foreignKey: 'user_id' });

// User <-> RefreshToken
User.hasMany(RefreshToken, { foreignKey: 'user_id', as: 'refreshTokens' });
RefreshToken.belongsTo(User, { foreignKey: 'user_id' });

User.hasMany(PasswordResetToken, { foreignKey: 'user_id', as: 'passwordResetTokens' });
PasswordResetToken.belongsTo(User, { foreignKey: 'user_id' });

module.exports = {
  sequelize,
  User,
  Incident,
  IncidentImage,
  IncidentAssignment,
  IncidentStatusHistory,
  Notification,
  RefreshToken,
  PasswordResetToken,
};
