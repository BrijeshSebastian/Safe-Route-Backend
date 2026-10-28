const incidentRepo = require('../repositories/incident.repository');
const assignmentRepo = require('../repositories/assignment.repository');
const userRepo = require('../repositories/user.repository');
const statusHistoryRepo = require('../repositories/statusHistory.repository');
const notificationRepo = require('../repositories/notification.repository');
const AppError = require('../utils/AppError');
const errorCodes = require('../constants/errorCodes');
const INCIDENT_STATUS = require('../constants/incidentStatus');
const ASSIGNMENT_STATUS = require('../constants/assignmentStatus');
const NOTIFICATION_TYPES = require('../constants/notificationTypes');
const ROLES = require('../constants/roles');
const { getPagination, getPagingData } = require('../utils/pagination');
const { sequelize } = require('../models');

class AdminService {
  async getDashboard() {
    const totalIncidents = await incidentRepo.countAll();
    const pendingIncidents = await incidentRepo.countByStatus(INCIDENT_STATUS.PENDING);
    const verifiedIncidents = await incidentRepo.countByStatus(INCIDENT_STATUS.VERIFIED);
    const assignedIncidents = await incidentRepo.countByStatus(INCIDENT_STATUS.ASSIGNED);
    const resolvedIncidents = await incidentRepo.countByStatus(INCIDENT_STATUS.RESOLVED);
    const totalReporters = await userRepo.countByRole(ROLES.REPORTER);
    const totalResponders = await userRepo.countByRole(ROLES.RESPONDER);

    return {
      totalIncidents,
      pendingIncidents,
      verifiedIncidents,
      assignedIncidents,
      resolvedIncidents,
      totalReporters,
      totalResponders,
    };
  }

  async getAllIncidents(query) {
    const { page, size, status, incident_type, severity, search } = query;
    const { limit, offset } = getPagination(page, size);
    const data = await incidentRepo.findAll({ limit, offset, status, incidentType: incident_type, severity, search });
    return getPagingData(data, page, limit);
  }

  async getIncidentDetails(incidentId) {
    const incident = await incidentRepo.findById(incidentId);
    if (!incident) {
      throw new AppError('Incident not found', 404, errorCodes.INCIDENT_001.code);
    }
    return incident;
  }

  async verifyIncident(incidentId, adminId) {
    const incident = await incidentRepo.findById(incidentId);
    if (!incident) {
      throw new AppError('Incident not found', 404, errorCodes.INCIDENT_001.code);
    }
    if (incident.status !== INCIDENT_STATUS.PENDING) {
      throw new AppError('Only pending incidents can be verified', 400, errorCodes.INCIDENT_002.code);
    }

    await incidentRepo.update(incidentId, { status: INCIDENT_STATUS.VERIFIED });
    await statusHistoryRepo.create({
      incident_id: incidentId,
      previous_status: INCIDENT_STATUS.PENDING,
      new_status: INCIDENT_STATUS.VERIFIED,
      changed_by: adminId,
      notes: 'Incident verified by admin',
    });

    await notificationRepo.create({
      user_id: incident.reporter_id,
      title: 'Incident Verified',
      message: 'Your incident has been verified by an administrator.',
      type: NOTIFICATION_TYPES.INCIDENT_VERIFIED,
      reference_id: incidentId,
    });

    return incidentRepo.findById(incidentId);
  }

  async rejectIncident(incidentId, adminId, reason) {
    const incident = await incidentRepo.findById(incidentId);
    if (!incident) {
      throw new AppError('Incident not found', 404, errorCodes.INCIDENT_001.code);
    }
    if (incident.status !== INCIDENT_STATUS.PENDING) {
      throw new AppError('Only pending incidents can be rejected', 400, errorCodes.INCIDENT_002.code);
    }

    await incidentRepo.update(incidentId, { status: INCIDENT_STATUS.REJECTED });
    await statusHistoryRepo.create({
      incident_id: incidentId,
      previous_status: INCIDENT_STATUS.PENDING,
      new_status: INCIDENT_STATUS.REJECTED,
      changed_by: adminId,
      notes: reason || 'Incident rejected by admin',
    });

    await notificationRepo.create({
      user_id: incident.reporter_id,
      title: 'Incident Rejected',
      message: reason || 'Your incident has been rejected.',
      type: NOTIFICATION_TYPES.INCIDENT_REJECTED,
      reference_id: incidentId,
    });

    return incidentRepo.findById(incidentId);
  }

  async assignResponder(incidentId, responderId, adminId) {
    const assignmentId = await sequelize.transaction(async (transaction) => {
      const incident = await incidentRepo.findById(incidentId, { transaction, lock: transaction.LOCK.UPDATE });
      if (!incident) throw new AppError('Incident not found', 404, errorCodes.INCIDENT_001.code);
      if (incident.status !== INCIDENT_STATUS.VERIFIED) {
        throw new AppError('Only verified incidents can be assigned', 400, errorCodes.INCIDENT_002.code);
      }
      const responder = await userRepo.findById(responderId);
      if (!responder || responder.role !== ROLES.RESPONDER || !responder.is_active) {
        throw new AppError('Invalid or inactive responder', 400);
      }
      const assignment = await assignmentRepo.create({ incident_id: incidentId, responder_id: responderId, assigned_by: adminId }, { transaction });
      await incidentRepo.update(incidentId, { status: INCIDENT_STATUS.ASSIGNED }, { transaction });
      await statusHistoryRepo.create({
        incident_id: incidentId, previous_status: INCIDENT_STATUS.VERIFIED, new_status: INCIDENT_STATUS.ASSIGNED,
        changed_by: adminId, notes: `Assigned to responder #${responderId}`,
      }, { transaction });
      await notificationRepo.create({
        user_id: responderId, title: 'New Assignment', message: `You have been assigned to incident #${incidentId}`,
        type: NOTIFICATION_TYPES.INCIDENT_ASSIGNED, reference_id: incidentId,
      }, { transaction });
      await notificationRepo.create({
        user_id: incident.reporter_id, title: 'Responder Assigned', message: 'A responder has been assigned to your incident.',
        type: NOTIFICATION_TYPES.INCIDENT_ASSIGNED, reference_id: incidentId,
      }, { transaction });
      return assignment.id;
    });
    return assignmentRepo.findById(assignmentId);
  }

  async reassignResponder(incidentId, newResponderId, adminId) {
    const incident = await incidentRepo.findById(incidentId);
    if (!incident) {
      throw new AppError('Incident not found', 404, errorCodes.INCIDENT_001.code);
    }
    if (![INCIDENT_STATUS.ASSIGNED, INCIDENT_STATUS.ACCEPTED].includes(incident.status)) {
      throw new AppError('Only assigned incidents can be reassigned', 400, errorCodes.INCIDENT_002.code);
    }

    // Cancel existing active assignment
    const activeAssignment = await assignmentRepo.findActiveByIncidentId(incidentId);
    if (activeAssignment) {
      await assignmentRepo.update(activeAssignment.id, {
        assignment_status: ASSIGNMENT_STATUS.REJECTED,
        notes: 'Reassigned by admin',
      });
    }
    await incidentRepo.update(incidentId, { status: INCIDENT_STATUS.VERIFIED });
    await statusHistoryRepo.create({
      incident_id: incidentId,
      previous_status: incident.status,
      new_status: INCIDENT_STATUS.VERIFIED,
      changed_by: adminId,
      notes: 'Assignment reassigned by admin',
    });
    return this.assignResponder(incidentId, newResponderId, adminId);
  }

  async cancelAssignment(assignmentId, adminId) {
    const assignment = await assignmentRepo.findById(assignmentId);
    if (!assignment) {
      throw new AppError('Assignment not found', 404, errorCodes.ASSIGNMENT_001.code);
    }
    if (![ASSIGNMENT_STATUS.ASSIGNED, ASSIGNMENT_STATUS.ACCEPTED].includes(assignment.assignment_status)) {
      throw new AppError('Only active assignments can be cancelled', 400, errorCodes.ASSIGNMENT_001.code);
    }

    await assignmentRepo.update(assignmentId, {
      assignment_status: ASSIGNMENT_STATUS.REJECTED,
      notes: 'Cancelled by admin',
    });

    const incident = assignment.incident;
    await incidentRepo.update(incident.id, { status: INCIDENT_STATUS.VERIFIED });
    await statusHistoryRepo.create({
      incident_id: incident.id,
      previous_status: incident.status,
      new_status: INCIDENT_STATUS.VERIFIED,
      changed_by: adminId,
      notes: 'Assignment cancelled by admin',
    });

    return assignment;
  }

  async getAvailableResponders(responderType) {
    return userRepo.findAvailableResponders(responderType);
  }

  async getAllUsers(query) {
    const { page, size, role, search, is_active } = query;
    const { limit, offset } = getPagination(page, size);
    const data = await userRepo.findAll({
      limit,
      offset,
      role,
      search,
      isActive: is_active !== undefined ? is_active === 'true' : undefined,
    });
    return getPagingData(data, page, limit);
  }

  async getUserDetails(userId) {
    const user = await userRepo.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404, errorCodes.USER_001.code);
    }
    return user;
  }

  async createResponder(data) {
    const { hashPassword } = require('../utils/bcrypt');
    const existing = await userRepo.findByEmail(data.email);
    if (existing) {
      throw new AppError('Email already registered', 409, errorCodes.USER_002.code);
    }
    const existingPhone = await userRepo.findByPhone(data.phone);
    if (existingPhone) {
      throw new AppError('Phone number already registered', 409, errorCodes.USER_002.code);
    }

    const hashedPassword = await hashPassword(data.password);
    const user = await userRepo.create({
      ...data,
      password: hashedPassword,
      role: ROLES.RESPONDER,
    });

    const userData = user.toJSON();
    delete userData.password;
    return userData;
  }

  async updateUser(userId, data) {
    const user = await userRepo.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404, errorCodes.USER_001.code);
    }
    await userRepo.update(userId, data);
    return userRepo.findById(userId);
  }

  async disableUser(userId) {
    const user = await userRepo.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404, errorCodes.USER_001.code);
    }
    await userRepo.update(userId, { is_active: false });
    return userRepo.findById(userId);
  }

  async getAnalytics() {
    const { sequelize } = require('../models');
    const [incidentsByType] = await sequelize.query(
      `SELECT incident_type, COUNT(*) as count FROM incidents GROUP BY incident_type`
    );
    const [incidentsBySeverity] = await sequelize.query(
      `SELECT severity, COUNT(*) as count FROM incidents GROUP BY severity`
    );
    const [incidentsByStatus] = await sequelize.query(
      `SELECT status, COUNT(*) as count FROM incidents GROUP BY status`
    );
    const [monthlyTrend] = await sequelize.query(
      `SELECT DATE_FORMAT(created_at, '%Y-%m') as month, COUNT(*) as count 
       FROM incidents 
       GROUP BY month 
       ORDER BY month DESC 
       LIMIT 12`
    );

    return { incidentsByType, incidentsBySeverity, incidentsByStatus, monthlyTrend };
  }

  async getMonthlyReport(year, month) {
    const { sequelize } = require('../models');
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const endDate = new Date(year, month, 0).toISOString().split('T')[0];

    const [report] = await sequelize.query(
      `SELECT 
        COUNT(*) as total_incidents,
        SUM(CASE WHEN status = 'resolved' THEN 1 ELSE 0 END) as resolved,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN severity = 'critical' THEN 1 ELSE 0 END) as critical_count
       FROM incidents 
       WHERE created_at BETWEEN :startDate AND :endDate`,
      { replacements: { startDate, endDate: endDate + ' 23:59:59' } }
    );

    return report[0] || {};
  }
}

module.exports = new AdminService();
