const { IncidentAssignment, User, Incident, IncidentImage } = require('../models');
const ASSIGNMENT_STATUS = require('../constants/assignmentStatus');

class AssignmentRepository {
  async create(data, options) {
    return IncidentAssignment.create(data, options);
  }

  async findById(id) {
    return IncidentAssignment.findByPk(id, {
      include: [
        {
          model: Incident,
          as: 'incident',
          include: [
            { model: User, as: 'reporter', attributes: ['id', 'full_name', 'email', 'phone'] },
            { model: IncidentImage, as: 'images' },
          ],
        },
        { model: User, as: 'responder', attributes: ['id', 'full_name', 'email', 'phone', 'responder_type'] },
      ],
    });
  }

  async findByIncidentId(incidentId) {
    return IncidentAssignment.findAll({
      where: { incident_id: incidentId },
      include: [
        { model: User, as: 'responder', attributes: ['id', 'full_name', 'email', 'phone', 'responder_type'] },
      ],
      order: [['created_at', 'DESC']],
    });
  }

  async findByResponderId({ responderId, limit, offset, status }) {
    const where = { responder_id: responderId };
    if (status) where.assignment_status = status;
    return IncidentAssignment.findAndCountAll({
      where,
      include: [
        {
          model: Incident,
          as: 'incident',
          include: [
            { model: User, as: 'reporter', attributes: ['id', 'full_name', 'email', 'phone'] },
            { model: IncidentImage, as: 'images' },
          ],
        },
      ],
      limit,
      offset,
      order: [['created_at', 'DESC']],
    });
  }

  async findActiveByResponderId(responderId) {
    return IncidentAssignment.findAll({
      where: {
        responder_id: responderId,
        assignment_status: ASSIGNMENT_STATUS.ACCEPTED,
      },
      include: [{ model: Incident, as: 'incident' }],
    });
  }

  async update(id, data, options = {}) {
    const assignment = await IncidentAssignment.findByPk(id, options);
    if (!assignment) return null;
    return assignment.update(data, options);
  }

  async findActiveByIncidentId(incidentId) {
    return IncidentAssignment.findOne({
      where: {
        incident_id: incidentId,
        assignment_status: { [require('sequelize').Op.in]: [ASSIGNMENT_STATUS.ASSIGNED, ASSIGNMENT_STATUS.ACCEPTED] },
      },
    });
  }

  async findAcceptedByIncidentId(incidentId) {
    return IncidentAssignment.findOne({
      where: {
        incident_id: incidentId,
        assignment_status: ASSIGNMENT_STATUS.ACCEPTED,
      },
      include: [
        {
          model: User,
          as: 'responder',
          attributes: ['id', 'full_name', 'responder_type', 'last_known_latitude', 'last_known_longitude', 'last_location_at'],
        },
      ],
      order: [['created_at', 'DESC']],
    });
  }
}

module.exports = new AssignmentRepository();
