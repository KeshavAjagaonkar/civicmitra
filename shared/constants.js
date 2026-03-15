/**
 * Shared complaint domain constants.
 * Single source of truth for both backend and frontend.
 *
 * Backend usage:  const { CATEGORIES, STATUSES } = require('../../shared/constants');
 * Frontend usage: import { CATEGORIES, STATUSES } from '../../shared/constants';
 *                 (or keep using the frontend-specific lib/constants.js which may add UI mappings)
 */

const CATEGORIES = [
  'Roads',
  'Water Supply',
  'Sanitation',
  'Electricity',
  'Public Health',
  'Street Lights',
  'Drainage',
  'Garbage',
  'Other',
];

const STATUSES = [
  'Submitted',
  'Under Review',
  'Needs Info',
  'In Progress',
  'Transferred',
  'Resolved',
  'Reopened',
  'Rejected',
  'Closed',
];

const TERMINAL_STATUSES = ['Rejected', 'Closed', 'Transferred'];
const ACTIVE_STATUSES = ['Submitted', 'Under Review', 'Needs Info', 'In Progress', 'Reopened'];

const PRIORITIES = ['Low', 'Medium', 'High'];

const ROLES = ['citizen', 'staff', 'worker', 'admin'];

const VALID_TRANSITIONS = {
  'Submitted':     ['Under Review', 'Rejected', 'In Progress', 'Transferred'],
  'Under Review':  ['Needs Info', 'In Progress', 'Rejected', 'Transferred'],
  'Needs Info':    ['Under Review', 'Rejected'],
  'In Progress':   ['Resolved', 'Under Review'],
  'Resolved':      ['Closed', 'Reopened'],
  'Reopened':      ['In Progress', 'Rejected'],
  'Transferred':   [],
  'Rejected':      [],
  'Closed':        [],
};

const TIMELINE_ACTIONS = [
  'Complaint Submitted', 'Under Review', 'Needs Info', 'Assigned to Worker',
  'In Progress', 'Update', 'Resolved', 'Rejected', 'Transferred',
  'Reopened', 'Closed', 'Status Update', 'Department Assigned',
];

// CommonJS export for backend compatibility, ESM re-export possible via frontend bundler
module.exports = {
  CATEGORIES,
  STATUSES,
  TERMINAL_STATUSES,
  ACTIVE_STATUSES,
  PRIORITIES,
  ROLES,
  VALID_TRANSITIONS,
  TIMELINE_ACTIONS,
};
