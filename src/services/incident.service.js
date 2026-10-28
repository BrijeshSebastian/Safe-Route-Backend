const incidentRepo = require('../repositories/incident.repository');
const incidentImageRepo = require('../repositories/incidentImage.repository');
const assignmentRepo = require('../repositories/assignment.repository');
const statusHistoryRepo = require('../repositories/statusHistory.repository');
const notificationRepo = require('../repositories/notification.repository');
const AppError = require('../utils/AppError');
const errorCodes = require('../constants/errorCodes');
const INCIDENT_STATUS = require('../constants/incidentStatus');
const ASSIGNMENT_STATUS = require('../constants/assignmentStatus');
const NOTIFICATION_TYPES = require('../constants/notificationTypes');
const { getPagination, getPagingData } = require('../utils/pagination');
const { validateImageFile, deleteFile } = require('../utils/upload');
const ROLES = require('../constants/roles');
const logger = require('../utils/logger');
const { sequelize, User } = require('../models');

class IncidentService {
  async createIncident(data, userId) {
    const incidentId = await sequelize.transaction(async (transaction) => {
      const incident = await incidentRepo.create({
        ...data,
        reporter_id: userId,
        status: INCIDENT_STATUS.PENDING,
      }, { transaction });
      await statusHistoryRepo.create({
        incident_id: incident.id,
        previous_status: null,
        new_status: INCIDENT_STATUS.PENDING,
        changed_by: userId,
        notes: 'Incident reported',
      }, { transaction });
      return incident.id;
    });

    const createdIncident = await incidentRepo.findById(incidentId);

    // Notify active admins about the newly reported incident
    try {
      const admins = await User.findAll({ where: { role: ROLES.ADMIN, is_active: true } });
      for (const admin of admins) {
        await notificationRepo.create({
          user_id: admin.id,
          title: 'New incident reported',
          message: `${createdIncident.title} (${createdIncident.incident_type}, ${createdIncident.severity})`,
          type: NOTIFICATION_TYPES.NEW_INCIDENT_REPORTED,
          reference_id: createdIncident.id,
        });
      }
    } catch (err) {
      logger.error('Failed to notify admins of new incident:', err);
    }

    return createdIncident;
  }

  async uploadImages(incidentId, files, userId) {
    const incident = await incidentRepo.findById(incidentId);
    if (!incident) {
      throw new AppError('Incident not found', 404, errorCodes.INCIDENT_001.code);
    }
    if (incident.reporter_id !== userId) {
      throw new AppError('Unauthorized', 403, errorCodes.INCIDENT_003.code);
    }

    if (!files || files.length === 0) {
      throw new AppError('At least one image is required', 400);
    }
    if (files.some((file) => !validateImageFile(file))) {
      files.forEach((file) => deleteFile(file.filename));
      throw new AppError('Uploaded file is not a valid image', 400);
    }
    const imageRecords = files.map((file) => ({
      incident_id: incidentId,
      image_url: `/api/v1/files/${file.filename}`,
    }));

    try {
      await incidentImageRepo.bulkCreate(imageRecords);
    } catch (err) {
      files.forEach((file) => deleteFile(file.filename));
      throw err;
    }
    return incidentRepo.findById(incidentId);
  }

  async getMyIncidents(userId, query) {
    const { page, size, status } = query;
    const { limit, offset } = getPagination(page, size);
    const data = await incidentRepo.findByReporterId({ reporterId: userId, limit, offset, status });
    return getPagingData(data, page, limit);
  }

  canAccessIncident(incident, user) {
    if (user.role === ROLES.ADMIN) return true;
    if (user.role === ROLES.REPORTER) return incident.reporter_id === user.id;
    return user.role === ROLES.RESPONDER && incident.assignments.some((assignment) => assignment.responder_id === user.id);
  }

  serializeIncident(incident, user) {
    if (user.role === ROLES.ADMIN) return incident;
    const data = incident.toJSON ? incident.toJSON() : incident;
    if (data.reporter) {
      delete data.reporter.email;
      // Rule: Responders may see the reporter's phone ONLY if they have an accepted assignment for this incident (not merely 'assigned').
      const hasAcceptedAssignment =
        user.role === ROLES.RESPONDER &&
        Array.isArray(data.assignments) &&
        data.assignments.some(
          (assignment) =>
            assignment.responder_id === user.id &&
            assignment.assignment_status === ASSIGNMENT_STATUS.ACCEPTED
        );

      if (!hasAcceptedAssignment) {
        delete data.reporter.phone;
      }
    }
    if (Array.isArray(data.assignments)) {
      data.assignments = data.assignments
        .filter((assignment) => user.role !== ROLES.RESPONDER || assignment.responder_id === user.id)
        .map((assignment) => {
          if (assignment.responder) {
            delete assignment.responder.email;
            delete assignment.responder.phone;
          }
          return assignment;
        });
    }
    return data;
  }

  async getIncidentDetails(incidentId, user) {
    const incident = await incidentRepo.findById(incidentId);
    if (!incident) {
      throw new AppError('Incident not found', 404, errorCodes.INCIDENT_001.code);
    }
    if (!this.canAccessIncident(incident, user)) {
      throw new AppError('Unauthorized', 403, errorCodes.INCIDENT_003.code);
    }
    return this.serializeIncident(incident, user);
  }

  async getResponderLocation(incidentId, user) {
    if (user.role !== ROLES.REPORTER && user.role !== ROLES.ADMIN) {
      throw new AppError('Unauthorized', 403, errorCodes.INCIDENT_003.code);
    }

    const incident = await incidentRepo.findById(incidentId);
    if (!incident) {
      throw new AppError('Incident not found', 404, errorCodes.INCIDENT_001.code);
    }

    if (!this.canAccessIncident(incident, user)) {
      throw new AppError('Unauthorized', 403, errorCodes.INCIDENT_003.code);
    }

    const activeStatuses = [
      INCIDENT_STATUS.ACCEPTED,
      INCIDENT_STATUS.ON_THE_WAY,
      INCIDENT_STATUS.REACHED,
    ];

    if (!activeStatuses.includes(incident.status)) {
      return { location: null };
    }

    const assignment = await assignmentRepo.findAcceptedByIncidentId(incidentId);
    if (!assignment || !assignment.responder) {
      return { location: null };
    }

    const responder = assignment.responder;
    if (responder.last_known_latitude == null || responder.last_known_longitude == null) {
      return { location: null };
    }

    return {
      location: {
        responder: {
          id: responder.id,
          full_name: responder.full_name,
          responder_type: responder.responder_type,
        },
        latitude: Number(responder.last_known_latitude),
        longitude: Number(responder.last_known_longitude),
        updated_at: responder.last_location_at
          ? new Date(responder.last_location_at).toISOString()
          : null,
      },
    };
  }

  async updateIncident(incidentId, data, userId) {
    const incident = await incidentRepo.findById(incidentId);
    if (!incident) {
      throw new AppError('Incident not found', 404, errorCodes.INCIDENT_001.code);
    }
    if (incident.reporter_id !== userId) {
      throw new AppError('Unauthorized', 403, errorCodes.INCIDENT_003.code);
    }
    if (incident.status !== INCIDENT_STATUS.PENDING) {
      throw new AppError('Cannot update incident after it has been processed', 400, errorCodes.INCIDENT_002.code);
    }

    await incidentRepo.update(incidentId, data);
    return incidentRepo.findById(incidentId);
  }

  async deleteIncident(incidentId, userId) {
    const incident = await incidentRepo.findById(incidentId);
    if (!incident) {
      throw new AppError('Incident not found', 404, errorCodes.INCIDENT_001.code);
    }
    if (incident.reporter_id !== userId) {
      throw new AppError('Unauthorized', 403, errorCodes.INCIDENT_003.code);
    }
    if (incident.status !== INCIDENT_STATUS.PENDING) {
      throw new AppError('Cannot delete incident after it has been processed', 400, errorCodes.INCIDENT_002.code);
    }

    const images = await sequelize.transaction(async (transaction) => {
      const records = await incidentImageRepo.findByIncidentId(incidentId, { transaction });
      await incidentImageRepo.deleteByIncidentId(incidentId, { transaction });
      await statusHistoryRepo.deleteByIncidentId(incidentId, { transaction });
      await incidentRepo.delete(incidentId, { transaction });
      return records;
    });
    images.forEach((image) => deleteFile(image.image_url));
  }

  async getStatusHistory(incidentId, user) {
    await this.getIncidentDetails(incidentId, user);
    return statusHistoryRepo.findByIncidentId(incidentId);
  }

  async searchIncidents(query) {
    const { page, size, status, incident_type, severity, search } = query;
    const { limit, offset } = getPagination(page, size);
    const data = await incidentRepo.findAll({
      limit,
      offset,
      status,
      incidentType: incident_type,
      severity,
      search,
    });
    return getPagingData(data, page, limit);
  }

  async getNearbyIncidents({ latitude, longitude, radius }) {
    return incidentRepo.findNearby({
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      radiusKm: parseFloat(radius) || 5,
    });
  }

  async cancelIncident(incidentId, userId) {
    const incident = await incidentRepo.findById(incidentId);
    if (!incident) {
      throw new AppError('Incident not found', 404, errorCodes.INCIDENT_001.code);
    }
    if (incident.reporter_id !== userId) {
      throw new AppError('Unauthorized', 403, errorCodes.INCIDENT_003.code);
    }
    const cancellableStatuses = [INCIDENT_STATUS.PENDING, INCIDENT_STATUS.VERIFIED];
    if (!cancellableStatuses.includes(incident.status)) {
      throw new AppError('Cannot cancel incident in current status', 400, errorCodes.INCIDENT_002.code);
    }

    const prevStatus = incident.status;
    await incidentRepo.update(incidentId, { status: INCIDENT_STATUS.CANCELLED });
    await statusHistoryRepo.create({
      incident_id: incidentId,
      previous_status: prevStatus,
      new_status: INCIDENT_STATUS.CANCELLED,
      changed_by: userId,
      notes: 'Incident cancelled by reporter',
    });

    return incidentRepo.findById(incidentId);
  }
}

module.exports = new IncidentService();
