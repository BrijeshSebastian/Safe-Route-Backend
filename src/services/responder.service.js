const assignmentRepo = require('../repositories/assignment.repository');
const incidentRepo = require('../repositories/incident.repository');
const statusHistoryRepo = require('../repositories/statusHistory.repository');
const notificationRepo = require('../repositories/notification.repository');
const userRepo = require('../repositories/user.repository');
const incidentService = require('./incident.service');
const AppError = require('../utils/AppError');
const errorCodes = require('../constants/errorCodes');
const INCIDENT_STATUS = require('../constants/incidentStatus');
const ASSIGNMENT_STATUS = require('../constants/assignmentStatus');
const NOTIFICATION_TYPES = require('../constants/notificationTypes');
const ROLES = require('../constants/roles');
const { getPagination, getPagingData } = require('../utils/pagination');

class ResponderService {
  serializeAssignment(assignment, responderId) {
    if (!assignment) return null;
    const data = assignment.toJSON ? assignment.toJSON() : JSON.parse(JSON.stringify(assignment));
    if (data.incident && data.incident.reporter) {
      delete data.incident.reporter.email;
      // Rule: Responders may see the reporter's phone ONLY if they have an accepted assignment for this incident (not merely 'assigned').
      const isAccepted =
        data.responder_id === responderId &&
        data.assignment_status === ASSIGNMENT_STATUS.ACCEPTED;

      if (!isAccepted) {
        delete data.incident.reporter.phone;
      }
    }
    return data;
  }

  async getAssignedIncidents(responderId, query) {
    const { page, size, status } = query;
    const { limit, offset } = getPagination(page, size);
    const data = await assignmentRepo.findByResponderId({ responderId, limit, offset, status });
    data.rows = data.rows.map((row) => this.serializeAssignment(row, responderId));
    return getPagingData(data, page, limit);
  }

  async getAssignmentDetails(assignmentId, responderId) {
    const assignment = await assignmentRepo.findById(assignmentId);
    if (!assignment) {
      throw new AppError('Assignment not found', 404, errorCodes.ASSIGNMENT_001.code);
    }
    if (assignment.responder_id !== responderId) {
      throw new AppError('Unauthorized', 403);
    }
    return this.serializeAssignment(assignment, responderId);
  }

  async acceptAssignment(assignmentId, responderId) {
    const assignment = await assignmentRepo.findById(assignmentId);
    if (!assignment) {
      throw new AppError('Assignment not found', 404, errorCodes.ASSIGNMENT_001.code);
    }
    if (assignment.responder_id !== responderId) {
      throw new AppError('Unauthorized', 403);
    }
    if (assignment.assignment_status !== ASSIGNMENT_STATUS.ASSIGNED) {
      throw new AppError('Assignment already responded to', 400, errorCodes.INCIDENT_002.code);
    }

    await assignmentRepo.update(assignmentId, {
      assignment_status: ASSIGNMENT_STATUS.ACCEPTED,
      responded_at: new Date(),
    });

    const incident = assignment.incident;
    if (incident.status !== INCIDENT_STATUS.ASSIGNED) {
      throw new AppError('Invalid incident status transition', 400, errorCodes.INCIDENT_002.code);
    }
    await incidentRepo.update(incident.id, { status: INCIDENT_STATUS.ACCEPTED });
    await statusHistoryRepo.create({
      incident_id: incident.id,
      previous_status: incident.status,
      new_status: INCIDENT_STATUS.ACCEPTED,
      changed_by: responderId,
      notes: 'Assignment accepted by responder',
    });

    // Notify reporter
    await notificationRepo.create({
      user_id: incident.reporter_id,
      title: 'Responder Accepted',
      message: 'A responder has accepted your incident.',
      type: NOTIFICATION_TYPES.INCIDENT_ACCEPTED,
      reference_id: incident.id,
    });

    const updatedAssignment = await assignmentRepo.findById(assignmentId);
    return this.serializeAssignment(updatedAssignment, responderId);
  }

  async rejectAssignment(assignmentId, responderId, notes) {
    const assignment = await assignmentRepo.findById(assignmentId);
    if (!assignment) {
      throw new AppError('Assignment not found', 404, errorCodes.ASSIGNMENT_001.code);
    }
    if (assignment.responder_id !== responderId) {
      throw new AppError('Unauthorized', 403);
    }
    if (assignment.assignment_status !== ASSIGNMENT_STATUS.ASSIGNED) {
      throw new AppError('Assignment already responded to', 400, errorCodes.INCIDENT_002.code);
    }

    await assignmentRepo.update(assignmentId, {
      assignment_status: ASSIGNMENT_STATUS.REJECTED,
      responded_at: new Date(),
      notes: notes || 'Rejected by responder',
    });

    // Revert incident status to verified so admin can reassign
    const incident = assignment.incident;
    if (incident.status !== INCIDENT_STATUS.ASSIGNED) {
      throw new AppError('Invalid incident status transition', 400, errorCodes.INCIDENT_002.code);
    }
    await incidentRepo.update(incident.id, { status: INCIDENT_STATUS.VERIFIED });
    await statusHistoryRepo.create({
      incident_id: incident.id,
      previous_status: incident.status,
      new_status: INCIDENT_STATUS.VERIFIED,
      changed_by: responderId,
      notes: 'Assignment rejected by responder',
    });

    // Notify admin(s)
    const { User } = require('../models');
    const admins = await User.findAll({ where: { role: 'admin', is_active: true } });
    for (const admin of admins) {
      await notificationRepo.create({
        user_id: admin.id,
        title: 'Assignment Rejected',
        message: `Responder rejected assignment for incident #${incident.id}`,
        type: NOTIFICATION_TYPES.ASSIGNMENT_REJECTED,
        reference_id: incident.id,
      });
    }

    const updatedAssignment = await assignmentRepo.findById(assignmentId);
    return this.serializeAssignment(updatedAssignment, responderId);
  }

  async startTravel(assignmentId, responderId) {
    const assignment = await assignmentRepo.findById(assignmentId);
    if (!assignment) throw new AppError('Assignment not found', 404, errorCodes.ASSIGNMENT_001.code);
    if (assignment.responder_id !== responderId) throw new AppError('Unauthorized', 403);
    if (assignment.assignment_status !== ASSIGNMENT_STATUS.ACCEPTED) {
      throw new AppError('Must accept assignment first', 400, errorCodes.INCIDENT_002.code);
    }

    const incident = assignment.incident;
    if (incident.status !== INCIDENT_STATUS.ACCEPTED) {
      throw new AppError('Invalid incident status transition', 400, errorCodes.INCIDENT_002.code);
    }
    await incidentRepo.update(incident.id, { status: INCIDENT_STATUS.ON_THE_WAY });
    await statusHistoryRepo.create({
      incident_id: incident.id,
      previous_status: INCIDENT_STATUS.ACCEPTED,
      new_status: INCIDENT_STATUS.ON_THE_WAY,
      changed_by: responderId,
      notes: 'Responder is on the way',
    });

    await notificationRepo.create({
      user_id: incident.reporter_id,
      title: 'Responder On The Way',
      message: 'A responder is heading to your location.',
      type: NOTIFICATION_TYPES.INCIDENT_ON_THE_WAY,
      reference_id: incident.id,
    });

    const incidentRecord = await incidentRepo.findById(incident.id);
    return incidentService.serializeIncident(incidentRecord, { id: responderId, role: ROLES.RESPONDER });
  }

  async arrived(assignmentId, responderId) {
    const assignment = await assignmentRepo.findById(assignmentId);
    if (!assignment) throw new AppError('Assignment not found', 404, errorCodes.ASSIGNMENT_001.code);
    if (assignment.responder_id !== responderId) throw new AppError('Unauthorized', 403);

    const incident = assignment.incident;
    if (incident.status !== INCIDENT_STATUS.ON_THE_WAY) {
      throw new AppError('Invalid status transition', 400, errorCodes.INCIDENT_002.code);
    }

    await incidentRepo.update(incident.id, { status: INCIDENT_STATUS.REACHED });
    await statusHistoryRepo.create({
      incident_id: incident.id,
      previous_status: INCIDENT_STATUS.ON_THE_WAY,
      new_status: INCIDENT_STATUS.REACHED,
      changed_by: responderId,
      notes: 'Responder has arrived',
    });

    await notificationRepo.create({
      user_id: incident.reporter_id,
      title: 'Responder Arrived',
      message: 'The responder has arrived at the incident location.',
      type: NOTIFICATION_TYPES.INCIDENT_REACHED,
      reference_id: incident.id,
    });

    const incidentRecord = await incidentRepo.findById(incident.id);
    return incidentService.serializeIncident(incidentRecord, { id: responderId, role: ROLES.RESPONDER });
  }

  async resolveIncident(assignmentId, responderId, notes) {
    const assignment = await assignmentRepo.findById(assignmentId);
    if (!assignment) throw new AppError('Assignment not found', 404, errorCodes.ASSIGNMENT_001.code);
    if (assignment.responder_id !== responderId) throw new AppError('Unauthorized', 403);

    const incident = assignment.incident;
    if (incident.status !== INCIDENT_STATUS.REACHED) {
      throw new AppError('Must arrive at location first', 400, errorCodes.INCIDENT_002.code);
    }

    await incidentRepo.update(incident.id, { status: INCIDENT_STATUS.RESOLVED });
    await assignmentRepo.update(assignmentId, {
      assignment_status: ASSIGNMENT_STATUS.COMPLETED,
      completed_at: new Date(),
      notes: notes || 'Incident resolved',
    });
    await statusHistoryRepo.create({
      incident_id: incident.id,
      previous_status: INCIDENT_STATUS.REACHED,
      new_status: INCIDENT_STATUS.RESOLVED,
      changed_by: responderId,
      notes: notes || 'Incident resolved by responder',
    });

    await notificationRepo.create({
      user_id: incident.reporter_id,
      title: 'Incident Resolved',
      message: 'Your reported incident has been resolved.',
      type: NOTIFICATION_TYPES.INCIDENT_RESOLVED,
      reference_id: incident.id,
    });

    const incidentRecord = await incidentRepo.findById(incident.id);
    return incidentService.serializeIncident(incidentRecord, { id: responderId, role: ROLES.RESPONDER });
  }

  async getCompletedHistory(responderId, query) {
    const { page, size } = query;
    const { limit, offset } = getPagination(page, size);
    const data = await assignmentRepo.findByResponderId({
      responderId,
      limit,
      offset,
      status: ASSIGNMENT_STATUS.COMPLETED,
    });
    data.rows = data.rows.map((row) => this.serializeAssignment(row, responderId));
    return getPagingData(data, page, limit);
  }

  async updateLocation(responderId, { latitude, longitude }) {
    await userRepo.updateLastKnownLocation(responderId, latitude, longitude);
    return { message: 'Location updated' };
  }

  async getDashboard(responderId) {
    const activeAssignments = await assignmentRepo.findActiveByResponderId(responderId);
    const completedData = await assignmentRepo.findByResponderId({
      responderId,
      limit: 1000,
      offset: 0,
      status: ASSIGNMENT_STATUS.COMPLETED,
    });
    const unreadNotifications = await notificationRepo.countUnread(responderId);

    return {
      activeIncidents: activeAssignments.length,
      completedIncidents: completedData.count,
      unreadNotifications,
      currentAssignments: activeAssignments,
    };
  }
}

module.exports = new ResponderService();
