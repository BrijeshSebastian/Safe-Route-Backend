const adminService = require('../services/admin.service');
const notificationService = require('../services/notification.service');
const { sendSuccess } = require('../utils/response');

class AdminController {
  async getDashboard(req, res, next) {
    try {
      const dashboard = await adminService.getDashboard();
      return sendSuccess(res, 200, 'Dashboard retrieved', { dashboard });
    } catch (err) {
      next(err);
    }
  }

  async getAllIncidents(req, res, next) {
    try {
      const result = await adminService.getAllIncidents(req.query);
      return sendSuccess(res, 200, 'Incidents retrieved', result.items, result.pagination);
    } catch (err) {
      next(err);
    }
  }

  async getIncidentDetails(req, res, next) {
    try {
      const incident = await adminService.getIncidentDetails(parseInt(req.params.id));
      return sendSuccess(res, 200, 'Incident details retrieved', { incident });
    } catch (err) {
      next(err);
    }
  }

  async verifyIncident(req, res, next) {
    try {
      const incident = await adminService.verifyIncident(parseInt(req.params.id), req.user.id);
      return sendSuccess(res, 200, 'Incident verified', { incident });
    } catch (err) {
      next(err);
    }
  }

  async rejectIncident(req, res, next) {
    try {
      const incident = await adminService.rejectIncident(
        parseInt(req.params.id),
        req.user.id,
        req.body.reason
      );
      return sendSuccess(res, 200, 'Incident rejected', { incident });
    } catch (err) {
      next(err);
    }
  }

  async assignResponder(req, res, next) {
    try {
      const assignment = await adminService.assignResponder(
        parseInt(req.params.id),
        req.body.responder_id,
        req.user.id
      );
      return sendSuccess(res, 200, 'Responder assigned', { assignment });
    } catch (err) {
      next(err);
    }
  }

  async reassignResponder(req, res, next) {
    try {
      const assignment = await adminService.reassignResponder(
        parseInt(req.params.id),
        req.body.responder_id,
        req.user.id
      );
      return sendSuccess(res, 200, 'Responder reassigned', { assignment });
    } catch (err) {
      next(err);
    }
  }

  async cancelAssignment(req, res, next) {
    try {
      const result = await adminService.cancelAssignment(parseInt(req.params.id), req.user.id);
      return sendSuccess(res, 200, 'Assignment cancelled', { assignment: result });
    } catch (err) {
      next(err);
    }
  }

  async getAvailableResponders(req, res, next) {
    try {
      const responders = await adminService.getAvailableResponders(req.query.responder_type);
      return sendSuccess(res, 200, 'Available responders retrieved', { responders });
    } catch (err) {
      next(err);
    }
  }

  async getAllUsers(req, res, next) {
    try {
      const result = await adminService.getAllUsers(req.query);
      return sendSuccess(res, 200, 'Users retrieved', result.items, result.pagination);
    } catch (err) {
      next(err);
    }
  }

  async getUserDetails(req, res, next) {
    try {
      const user = await adminService.getUserDetails(parseInt(req.params.id));
      return sendSuccess(res, 200, 'User details retrieved', { user });
    } catch (err) {
      next(err);
    }
  }

  async createResponder(req, res, next) {
    try {
      const responder = await adminService.createResponder(req.body);
      return sendSuccess(res, 201, 'Responder created', { responder });
    } catch (err) {
      next(err);
    }
  }

  async updateUser(req, res, next) {
    try {
      const user = await adminService.updateUser(parseInt(req.params.id), req.body);
      return sendSuccess(res, 200, 'User updated', { user });
    } catch (err) {
      next(err);
    }
  }

  async disableUser(req, res, next) {
    try {
      const user = await adminService.disableUser(parseInt(req.params.id));
      return sendSuccess(res, 200, 'User disabled', { user });
    } catch (err) {
      next(err);
    }
  }

  async getAnalytics(req, res, next) {
    try {
      const analytics = await adminService.getAnalytics();
      return sendSuccess(res, 200, 'Analytics retrieved', { analytics });
    } catch (err) {
      next(err);
    }
  }

  async getMonthlyReport(req, res, next) {
    try {
      const { year, month } = req.query;
      const report = await adminService.getMonthlyReport(
        parseInt(year) || new Date().getFullYear(),
        parseInt(month) || new Date().getMonth() + 1
      );
      return sendSuccess(res, 200, 'Monthly report retrieved', { report });
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

module.exports = new AdminController();
