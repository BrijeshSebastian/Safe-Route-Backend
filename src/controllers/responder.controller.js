const responderService = require('../services/responder.service');
const notificationService = require('../services/notification.service');
const { sendSuccess } = require('../utils/response');

class ResponderController {
  async getAssignedIncidents(req, res, next) {
    try {
      const result = await responderService.getAssignedIncidents(req.user.id, req.query);
      return sendSuccess(res, 200, 'Assigned incidents retrieved', result.items, result.pagination);
    } catch (err) {
      next(err);
    }
  }

  async getAssignmentDetails(req, res, next) {
    try {
      const assignment = await responderService.getAssignmentDetails(
        parseInt(req.params.id),
        req.user.id
      );
      return sendSuccess(res, 200, 'Assignment details retrieved', { assignment });
    } catch (err) {
      next(err);
    }
  }

  async acceptAssignment(req, res, next) {
    try {
      const assignment = await responderService.acceptAssignment(
        parseInt(req.params.id),
        req.user.id
      );
      return sendSuccess(res, 200, 'Assignment accepted', { assignment });
    } catch (err) {
      next(err);
    }
  }

  async rejectAssignment(req, res, next) {
    try {
      const assignment = await responderService.rejectAssignment(
        parseInt(req.params.id),
        req.user.id,
        req.body.notes
      );
      return sendSuccess(res, 200, 'Assignment rejected', { assignment });
    } catch (err) {
      next(err);
    }
  }

  async startTravel(req, res, next) {
    try {
      const incident = await responderService.startTravel(
        parseInt(req.params.id),
        req.user.id
      );
      return sendSuccess(res, 200, 'Travel started', { incident });
    } catch (err) {
      next(err);
    }
  }

  async arrived(req, res, next) {
    try {
      const incident = await responderService.arrived(
        parseInt(req.params.id),
        req.user.id
      );
      return sendSuccess(res, 200, 'Arrived at location', { incident });
    } catch (err) {
      next(err);
    }
  }

  async resolveIncident(req, res, next) {
    try {
      const incident = await responderService.resolveIncident(
        parseInt(req.params.id),
        req.user.id,
        req.body.notes
      );
      return sendSuccess(res, 200, 'Incident resolved', { incident });
    } catch (err) {
      next(err);
    }
  }

  async getCompletedHistory(req, res, next) {
    try {
      const result = await responderService.getCompletedHistory(req.user.id, req.query);
      return sendSuccess(res, 200, 'Completed history retrieved', result.items, result.pagination);
    } catch (err) {
      next(err);
    }
  }

  async updateLocation(req, res, next) {
    try {
      const result = await responderService.updateLocation(req.user.id, req.body);
      return sendSuccess(res, 200, result.message);
    } catch (err) {
      next(err);
    }
  }

  async getDashboard(req, res, next) {
    try {
      const dashboard = await responderService.getDashboard(req.user.id);
      return sendSuccess(res, 200, 'Dashboard retrieved', { dashboard });
    } catch (err) {
      next(err);
    }
  }

  async getNotifications(req, res, next) {
    try {
      const result = await notificationService.getNotifications(req.user.id, req.query);
      return sendSuccess(res, 200, 'Notifications retrieved', result.items, result.pagination);
    } catch (err) {
      next(err);
    }
  }

  async markNotificationRead(req, res, next) {
    try {
      const notification = await notificationService.markRead(
        parseInt(req.params.notificationId),
        req.user.id
      );
      return sendSuccess(res, 200, 'Notification marked as read', { notification });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new ResponderController();
