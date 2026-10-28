const test = require('node:test');
const assert = require('node:assert/strict');
const incidentService = require('../src/services/incident.service');
const ROLES = require('../src/constants/roles');
const ASSIGNMENT_STATUS = require('../src/constants/assignmentStatus');

test('canAccessIncident enforces ownership and role scoping', () => {
  const incident = {
    id: 10,
    reporter_id: 1,
    assignments: [
      { responder_id: 5, assignment_status: ASSIGNMENT_STATUS.ACCEPTED },
    ],
  };

  // 1. Admin can access any incident
  assert.equal(incidentService.canAccessIncident(incident, { id: 99, role: ROLES.ADMIN }), true);

  // 2. Incident owner reporter can access
  assert.equal(incidentService.canAccessIncident(incident, { id: 1, role: ROLES.REPORTER }), true);

  // 3. Different reporter CANNOT access another reporter's incident
  assert.equal(incidentService.canAccessIncident(incident, { id: 2, role: ROLES.REPORTER }), false);

  // 4. Assigned responder can access
  assert.equal(incidentService.canAccessIncident(incident, { id: 5, role: ROLES.RESPONDER }), true);

  // 5. Unassigned responder CANNOT access
  assert.equal(incidentService.canAccessIncident(incident, { id: 6, role: ROLES.RESPONDER }), false);
});

test('serializeIncident sanitizes responder and reporter contact details appropriately', () => {
  const rawIncident = {
    id: 10,
    title: 'Emergency',
    reporter_id: 1,
    reporter: { id: 1, full_name: 'Reporter One', email: 'rep@example.com', phone: '9000000001' },
    assignments: [
      {
        id: 100,
        responder_id: 5,
        assignment_status: ASSIGNMENT_STATUS.ASSIGNED,
        responder: { id: 5, full_name: 'Responder Five', email: 'resp@example.com', phone: '9000000005', responder_type: 'ambulance' },
      },
    ],
  };

  // Reporter view: never sees responder email or phone
  const serializedForReporter = incidentService.serializeIncident(JSON.parse(JSON.stringify(rawIncident)), { id: 1, role: ROLES.REPORTER });
  assert.equal(serializedForReporter.assignments[0].responder.full_name, 'Responder Five');
  assert.equal(serializedForReporter.assignments[0].responder.email, undefined);
  assert.equal(serializedForReporter.assignments[0].responder.phone, undefined);

  // Responder view while status is only ASSIGNED: cannot see reporter phone or email
  const serializedForAssigned = incidentService.serializeIncident(JSON.parse(JSON.stringify(rawIncident)), { id: 5, role: ROLES.RESPONDER });
  assert.equal(serializedForAssigned.reporter.full_name, 'Reporter One');
  assert.equal(serializedForAssigned.reporter.phone, undefined);
  assert.equal(serializedForAssigned.reporter.email, undefined);

  // Responder view once status is ACCEPTED: sees reporter phone, but NEVER reporter email
  const acceptedIncident = JSON.parse(JSON.stringify(rawIncident));
  acceptedIncident.assignments[0].assignment_status = ASSIGNMENT_STATUS.ACCEPTED;
  const serializedForAccepted = incidentService.serializeIncident(acceptedIncident, { id: 5, role: ROLES.RESPONDER });
  assert.equal(serializedForAccepted.reporter.full_name, 'Reporter One');
  assert.equal(serializedForAccepted.reporter.phone, '9000000001');
  assert.equal(serializedForAccepted.reporter.email, undefined);
});
