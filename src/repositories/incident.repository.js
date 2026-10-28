const { Incident, User, IncidentImage, IncidentAssignment } = require('../models');
const { Op } = require('sequelize');

class IncidentRepository {
  async create(data, options) {
    return Incident.create(data, options);
  }

  async findById(id, options = {}) {
    return Incident.findByPk(id, {
      include: [
        { model: User, as: 'reporter', attributes: ['id', 'full_name', 'email', 'phone'] },
        { model: IncidentImage, as: 'images' },
        {
          model: IncidentAssignment,
          as: 'assignments',
          include: [{ model: User, as: 'responder', attributes: ['id', 'full_name', 'email', 'phone', 'responder_type'] }],
        },
      ],
      ...options,
    });
  }

  async findByReporterId({ reporterId, limit, offset, status }) {
    const where = { reporter_id: reporterId };
    if (status) where.status = status;
    return Incident.findAndCountAll({
      where,
      include: [{ model: IncidentImage, as: 'images' }],
      limit,
      offset,
      order: [['created_at', 'DESC']],
    });
  }

  async findAll({ limit, offset, status, incidentType, severity, search }) {
    const where = {};
    if (status) where.status = status;
    if (incidentType) where.incident_type = incidentType;
    if (severity) where.severity = severity;
    if (search) {
      where[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } },
        { address: { [Op.like]: `%${search}%` } },
      ];
    }
    return Incident.findAndCountAll({
      where,
      include: [
        { model: User, as: 'reporter', attributes: ['id', 'full_name', 'email'] },
        { model: IncidentImage, as: 'images' },
      ],
      limit,
      offset,
      order: [['created_at', 'DESC']],
    });
  }

  async update(id, data, options = {}) {
    const incident = await Incident.findByPk(id, options);
    if (!incident) return null;
    return incident.update(data, options);
  }

  async delete(id, options = {}) {
    return Incident.destroy({ where: { id }, ...options });
  }

  async countByStatus(status) {
    const where = {};
    if (status) where.status = status;
    return Incident.count({ where });
  }

  async countAll() {
    return Incident.count();
  }

  async findNearby({ latitude, longitude, radiusKm = 5, limit = 20 }) {
    // Haversine formula in raw SQL for MySQL
    const { sequelize } = require('../models');
    const results = await sequelize.query(
      `SELECT *, (
        6371 * ACOS(
          COS(RADIANS(:lat)) * COS(RADIANS(latitude)) *
          COS(RADIANS(longitude) - RADIANS(:lng)) +
          SIN(RADIANS(:lat)) * SIN(RADIANS(latitude))
        )
      ) AS distance
      FROM incidents
      WHERE status NOT IN ('resolved', 'cancelled')
      HAVING distance <= :radius
      ORDER BY distance ASC
      LIMIT :limit`,
      {
        replacements: { lat: latitude, lng: longitude, radius: radiusKm, limit },
        type: sequelize.constructor.QueryTypes.SELECT,
      }
    );
    return results;
  }
}

module.exports = new IncidentRepository();
