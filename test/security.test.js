const test = require('node:test');
const assert = require('node:assert/strict');
const { registerSchema } = require('../src/validators/auth.validator');
const { nearbyQuerySchema } = require('../src/validators/incident.validator');
const { locationSchema } = require('../src/validators/responder.validator');

test('public registration rejects role injection and weak passwords', () => {
  assert.throws(() => registerSchema.parse({
    full_name: 'Test User', email: 'test@example.com', phone: '1234567890', password: 'short', role: 'admin',
  }));
});

test('nearby incident and responder-location coordinates are bounded', () => {
  assert.throws(() => nearbyQuerySchema.parse({ latitude: 91, longitude: 0 }));
  assert.throws(() => locationSchema.parse({ latitude: 0, longitude: 181 }));
  assert.deepEqual(locationSchema.parse({ latitude: 12.34, longitude: 56.78 }), { latitude: 12.34, longitude: 56.78 });
});
