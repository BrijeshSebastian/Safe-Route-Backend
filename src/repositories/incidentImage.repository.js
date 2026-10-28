const { IncidentImage } = require('../models');

class IncidentImageRepository {
  async create(data) {
    return IncidentImage.create(data);
  }

  async bulkCreate(dataArray, options) {
    return IncidentImage.bulkCreate(dataArray, options);
  }

  async findByIncidentId(incidentId, options = {}) {
    return IncidentImage.findAll({ where: { incident_id: incidentId }, ...options });
  }

  async deleteByIncidentId(incidentId, options = {}) {
    return IncidentImage.destroy({ where: { incident_id: incidentId }, ...options });
  }
}

module.exports = new IncidentImageRepository();
