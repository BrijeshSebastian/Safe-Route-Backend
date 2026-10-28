const incidentService = require('../services/incident.service');
const { sendSuccess } = require('../utils/response');

class IncidentController {
  async createIncident(req, res, next) {
    try {
      const incident = await incidentService.createIncident(req.body, req.user.id);
      return sendSuccess(res, 201, 'Incident created successfully', { incident });
    } catch (err) {
      next(err);
    }
  }

  async uploadImages(req, res, next) {
    try {
      const incident = await incidentService.uploadImages(
        parseInt(req.params.id),
        req.files,
        req.user.id
      );
      return sendSuccess(res, 200, 'Images uploaded successfully', { incident });
    } catch (err) {
      next(err);
    }
  }

  async getMyIncidents(req, res, next) {
    try {
      const result = await incidentService.getMyIncidents(req.user.id, req.query);
      return sendSuccess(res, 200, 'Incidents retrieved', result.items, result.pagination);
    } catch (err) {
      next(err);
    }
  }

  async getIncidentDetails(req, res, next) {
    try {
      const incident = await incidentService.getIncidentDetails(parseInt(req.params.id), req.user);
      return sendSuccess(res, 200, 'Incident details retrieved', { incident });
    } catch (err) {
      next(err);
    }
  }

  async getResponderLocation(req, res, next) {
    try {
      const data = await incidentService.getResponderLocation(
        parseInt(req.params.id),
        req.user
      );
      return sendSuccess(res, 200, 'Responder location retrieved', data);
    } catch (err) {
      next(err);
    }
  }

  async updateIncident(req, res, next) {
    try {
      const incident = await incidentService.updateIncident(
        parseInt(req.params.id),
        req.body,
        req.user.id
      );
      return sendSuccess(res, 200, 'Incident updated', { incident });
    } catch (err) {
      next(err);
    }
  }

  async deleteIncident(req, res, next) {
    try {
      await incidentService.deleteIncident(parseInt(req.params.id), req.user.id);
      return sendSuccess(res, 200, 'Incident deleted');
    } catch (err) {
      next(err);
    }
  }

  async getStatusHistory(req, res, next) {
    try {
      const history = await incidentService.getStatusHistory(parseInt(req.params.id), req.user);
      return sendSuccess(res, 200, 'Status history retrieved', { history });
    } catch (err) {
      next(err);
    }
  }

  async searchIncidents(req, res, next) {
    try {
      const result = await incidentService.searchIncidents(req.query);
      return sendSuccess(res, 200, 'Incidents retrieved', result.items, result.pagination);
    } catch (err) {
      next(err);
    }
  }

  async getNearbyIncidents(req, res, next) {
    try {
      const incidents = await incidentService.getNearbyIncidents(req.query);
      return sendSuccess(res, 200, 'Nearby incidents retrieved', { incidents });
    } catch (err) {
      next(err);
    }
  }

  async cancelIncident(req, res, next) {
    try {
      const incident = await incidentService.cancelIncident(parseInt(req.params.id), req.user.id);
      return sendSuccess(res, 200, 'Incident cancelled', { incident });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new IncidentController();
