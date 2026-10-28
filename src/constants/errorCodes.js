module.exports = Object.freeze({
  AUTH_001: { code: 'AUTH_001', message: 'Invalid credentials' },
  AUTH_002: { code: 'AUTH_002', message: 'Token expired or invalid' },
  USER_001: { code: 'USER_001', message: 'User not found' },
  USER_002: { code: 'USER_002', message: 'User already exists' },
  INCIDENT_001: { code: 'INCIDENT_001', message: 'Incident not found' },
  INCIDENT_002: { code: 'INCIDENT_002', message: 'Invalid status transition' },
  INCIDENT_003: { code: 'INCIDENT_003', message: 'Unauthorized action on incident' },
  ASSIGNMENT_001: { code: 'ASSIGNMENT_001', message: 'Assignment not found' },
  VALIDATION_001: { code: 'VALIDATION_001', message: 'Validation failed' },
});
