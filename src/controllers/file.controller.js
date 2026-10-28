const fs = require('fs');
const path = require('path');
const { User, IncidentImage } = require('../models');
const incidentRepo = require('../repositories/incident.repository');
const incidentService = require('../services/incident.service');
const AppError = require('../utils/AppError');
const { uploadDir } = require('../utils/upload');
const ROLES = require('../constants/roles');

class FileController {
  async getImage(req, res, next) {
    try {
      const { filename } = req.params;
      if (!/^[a-f0-9-]{36}\.(jpg|png|webp)$/i.test(filename)) throw new AppError('File not found', 404);
      const imageUrl = `/api/v1/files/${filename}`;
      const profileOwner = await User.findOne({ where: { profile_image: imageUrl } });
      if (profileOwner) {
        if (req.user.role !== ROLES.ADMIN && profileOwner.id !== req.user.id) throw new AppError('Unauthorized', 403);
      } else {
        const image = await IncidentImage.findOne({ where: { image_url: imageUrl } });
        if (!image) throw new AppError('File not found', 404);
        const incident = await incidentRepo.findById(image.incident_id);
        if (!incident || !incidentService.canAccessIncident(incident, req.user)) throw new AppError('Unauthorized', 403);
      }
      const filePath = path.join(uploadDir, filename);
      if (!fs.existsSync(filePath)) throw new AppError('File not found', 404);
      res.set('X-Content-Type-Options', 'nosniff');
      return res.sendFile(filePath);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new FileController();
