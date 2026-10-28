const { z } = require('zod');
const RESPONDER_TYPES = require('../constants/responderTypes');

const verifyIncidentSchema = z.object({});

const rejectIncidentSchema = z.object({
  reason: z.string().min(5).optional(),
});

const assignResponderSchema = z.object({
  responder_id: z.number().int().positive(),
});

const createResponderSchema = z.object({
  full_name: z.string().min(2).max(100),
  email: z.string().email(),
  phone: z.string().min(10).max(20),
  password: z.string().min(6).max(128),
  responder_type: z.enum(Object.values(RESPONDER_TYPES)),
});

const updateUserSchema = z.object({
  full_name: z.string().min(2).max(100).optional(),
  email: z.string().email().optional(),
  phone: z.string().min(10).max(20).optional(),
  is_active: z.boolean().optional(),
  responder_type: z.enum(Object.values(RESPONDER_TYPES)).optional(),
});

module.exports = {
  verifyIncidentSchema,
  rejectIncidentSchema,
  assignResponderSchema,
  createResponderSchema,
  updateUserSchema,
};
