const { z } = require('zod');

const idParamsSchema = z.object({ id: z.coerce.number().int().positive() }).strict();
const optionalNotesSchema = z.object({ notes: z.string().trim().min(1).max(5000).optional() }).strict();
const locationSchema = z.object({
  latitude: z.number().finite().min(-90).max(90),
  longitude: z.number().finite().min(-180).max(180),
}).strict();

module.exports = { idParamsSchema, optionalNotesSchema, locationSchema };
