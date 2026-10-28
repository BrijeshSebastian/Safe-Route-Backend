const { z } = require('zod');
const INCIDENT_TYPES = require('../constants/incidentTypes');

const createIncidentSchema = z.object({
  title: z.string().min(5).max(200),
  description: z.string().min(10),
  incident_type: z.enum(Object.values(INCIDENT_TYPES)),
  severity: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  address: z.string().max(500).optional(),
});

const updateIncidentSchema = z.object({
  title: z.string().min(5).max(200).optional(),
  description: z.string().min(10).optional(),
  incident_type: z.enum(Object.values(INCIDENT_TYPES)).optional(),
  severity: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  address: z.string().max(500).optional(),
});

const idParamsSchema = z.object({ id: z.coerce.number().int().positive() }).strict();
const incidentQuerySchema = z.object({
  page: z.coerce.number().int().positive().max(100000).optional(),
  size: z.coerce.number().int().positive().max(100).optional(),
  status: z.enum(Object.values(require('../constants/incidentStatus'))).optional(),
  incident_type: z.enum(Object.values(INCIDENT_TYPES)).optional(),
  severity: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  search: z.string().trim().max(200).optional(),
}).strict();
const nearbyQuerySchema = z.object({
  latitude: z.coerce.number().finite().min(-90).max(90),
  longitude: z.coerce.number().finite().min(-180).max(180),
  radius: z.coerce.number().finite().positive().max(100).optional(),
}).strict();

module.exports = {
  createIncidentSchema,
  updateIncidentSchema,
  idParamsSchema,
  incidentQuerySchema,
  nearbyQuerySchema,
};
