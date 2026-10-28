const { IncidentStatusHistory, User } = require('../models');

class StatusHistoryRepository {
  async create(data, options) {
    return IncidentStatusHistory.create(data, options);
  }

  async findByIncidentId(incidentId) {
    return IncidentStatusHistory.findAll({
      where: { incident_id: incidentId },
      include: [
        { model: User, as: 'changedByUser', attributes: ['id', 'full_name', 'role'] },
      ],
      order: [['created_at', 'ASC']],
    });
  }

  async deleteByIncidentId(incidentId, options = {}) {
    return IncidentStatusHistory.destroy({ where: { incident_id: incidentId }, ...options });
  }
}

module.exports = new StatusHistoryRepository();
