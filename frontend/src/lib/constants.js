/**
 * Shared complaint constants.
 * Single source of truth — import from here everywhere in the frontend.
 * Backend mirror: backend/models/Department.js COMPLAINT_CATEGORIES
 */

export const COMPLAINT_CATEGORIES = [
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

export const COMPLAINT_STATUSES = [
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

// Terminal states — no further transitions allowed
export const TERMINAL_STATUSES = ['Rejected', 'Closed'];

// Active statuses — complaint is still open/actionable
export const ACTIVE_STATUSES = ['Submitted', 'Under Review', 'Needs Info', 'In Progress', 'Reopened'];

export const COMPLAINT_PRIORITIES = ['Low', 'Medium', 'High'];

/**
 * Maps a complaint status to its shadcn/ui Badge variant.
 * Used in every component that renders a status badge.
 */
export const STATUS_BADGE_VARIANT = {
  Submitted: 'secondary',
  'Under Review': 'secondary',
  'Needs Info': 'warning',
  'In Progress': 'default',
  Transferred: 'default',
  Resolved: 'outline',
  Reopened: 'warning',
  Rejected: 'destructive',
  Closed: 'destructive',
};

/**
 * Maps a complaint priority to its Tailwind CSS classes (bg + text + border),
 * with dark mode variants.
 */
export const PRIORITY_CLASSES = {
  High: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800',
  Medium: 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800',
  Low: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800',
};

/**
 * Valid state transitions — must match backend VALID_TRANSITIONS in complaintController.js.
 * Used by the status dropdown to show only legal next states.
 */
export const VALID_TRANSITIONS = {
  'Submitted':     ['Under Review', 'Rejected', 'In Progress'],
  'Under Review':  ['Needs Info', 'In Progress', 'Rejected'],
  'Needs Info':    ['Under Review', 'Rejected'],
  'In Progress':   ['Resolved', 'Under Review'],
  'Resolved':      ['Closed', 'Reopened'],
  'Reopened':      ['In Progress', 'Rejected'],
  'Transferred':   [],  // legacy — historical data only, no new transitions
  'Rejected':      [],
  'Closed':        [],
};
