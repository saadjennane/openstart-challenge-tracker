import { Action, Activity, Challenge, KPIs, Filters, FilterType } from './types';

// Check if an action is overdue
export const isOverdue = (action: Action): boolean => {
  if (action.is_done) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dueDate = new Date(action.due_date);
  dueDate.setHours(0, 0, 0, 0);
  return dueDate < today;
};

// Check if an action is an alert (urgent OR overdue)
export const isAlert = (action: Action): boolean => {
  if (action.is_done) return false;
  return action.is_urgent || isOverdue(action);
};

// Get all open (not done) actions
export const getOpenActions = (actions: Action[]): Action[] => {
  return actions.filter(a => !a.is_done);
};

// Check if action owner is an entity (not STARTUP, WENOV, or CEED)
const isEntityOwner = (owner: string): boolean => {
  return !['STARTUP', 'WENOV', 'CEED'].includes(owner);
};

// Compute KPIs from challenges
export const computeKpis = (challenges: Challenge[]): KPIs => {
  let actionsAWB = 0;
  let actionsStartup = 0;
  let alertsCount = 0;

  challenges.forEach(challenge => {
    const openActions = getOpenActions(challenge.actions);
    openActions.forEach(action => {
      // Count all entity owners (AWB, WafaSalaf, Wafa Cash, etc.) as "AWB"
      if (isEntityOwner(action.owner)) actionsAWB++;
      if (action.owner === 'STARTUP') actionsStartup++;
      if (isAlert(action)) alertsCount++;
    });
  });

  return {
    challengesCount: challenges.length,
    actionsAWB,
    actionsStartup,
    alertsCount,
  };
};

// Get time ago string
export const getTimeAgo = (dateStr: string): string => {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "1 day ago";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  return `${Math.floor(diffDays / 30)} months ago`;
};

// Get last comment/activity with time ago
export const getLastComment = (activities: Activity[]): { note: string; timeAgo: string } | null => {
  if (activities.length === 0) return null;

  const sorted = [...activities].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  const latest = sorted[0];
  return {
    note: latest.note,
    timeAgo: getTimeAgo(latest.created_at),
  };
};

// Get next actions sorted by urgency then due date
export const getNextActions = (actions: Action[], limit: number = 2): { actions: Action[]; remaining: number } => {
  const openActions = getOpenActions(actions);

  // Sort: alerts first (urgent + overdue), then by due date
  const sorted = [...openActions].sort((a, b) => {
    const aIsAlert = isAlert(a);
    const bIsAlert = isAlert(b);

    if (aIsAlert && !bIsAlert) return -1;
    if (!aIsAlert && bIsAlert) return 1;

    // Both are alerts or both are not - sort by due date
    return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
  });

  return {
    actions: sorted.slice(0, limit),
    remaining: Math.max(0, sorted.length - limit),
  };
};

// Get challenge alert score for sorting (higher = more urgent)
const getChallengeAlertScore = (challenge: Challenge): number => {
  const openActions = getOpenActions(challenge.actions);
  let score = 0;

  openActions.forEach(action => {
    if (action.is_urgent && isOverdue(action)) score += 100;
    else if (action.is_urgent) score += 50;
    else if (isOverdue(action)) score += 25;
  });

  return score;
};

// Get earliest due date for a challenge
const getEarliestDueDate = (challenge: Challenge): Date => {
  const openActions = getOpenActions(challenge.actions);
  if (openActions.length === 0) return new Date('9999-12-31');

  const dates = openActions.map(a => new Date(a.due_date));
  return new Date(Math.min(...dates.map(d => d.getTime())));
};

// Sort challenges: alerts first, then closest due date
export const sortChallenges = (challenges: Challenge[]): Challenge[] => {
  return [...challenges].sort((a, b) => {
    const scoreA = getChallengeAlertScore(a);
    const scoreB = getChallengeAlertScore(b);

    if (scoreA !== scoreB) return scoreB - scoreA;

    return getEarliestDueDate(a).getTime() - getEarliestDueDate(b).getTime();
  });
};

// Check if challenge has alerts
const hasAlerts = (challenge: Challenge): boolean => {
  return getOpenActions(challenge.actions).some(isAlert);
};

// Check if challenge has overdue actions
const hasOverdue = (challenge: Challenge): boolean => {
  return getOpenActions(challenge.actions).some(isOverdue);
};

// Check if challenge has urgent actions
const hasUrgent = (challenge: Challenge): boolean => {
  return getOpenActions(challenge.actions).some(a => a.is_urgent);
};

// Check if challenge has entity (AWB, WafaSalaf, etc.) open actions
const hasAWBActions = (challenge: Challenge): boolean => {
  return getOpenActions(challenge.actions).some(a => isEntityOwner(a.owner));
};

// Check if challenge has Startup open actions
const hasStartupActions = (challenge: Challenge): boolean => {
  return getOpenActions(challenge.actions).some(a => a.owner === 'STARTUP');
};

// Filter challenges based on filters
export const filterChallenges = (challenges: Challenge[], filters: Filters): Challenge[] => {
  let filtered = [...challenges];

  // Apply search filter
  if (filters.search) {
    const searchLower = filters.search.toLowerCase();
    filtered = filtered.filter(
      c =>
        c.name.toLowerCase().includes(searchLower) ||
        c.startup_name.toLowerCase().includes(searchLower)
    );
  }

  // Apply entity filter
  if (filters.entity) {
    filtered = filtered.filter(c => c.entity === filters.entity);
  }

  // Apply WENOV owner filter
  if (filters.wenovOwner) {
    filtered = filtered.filter(c => c.wenov_responsible === filters.wenovOwner);
  }

  // Apply main filter
  switch (filters.activeFilter) {
    case 'overdue':
      filtered = filtered.filter(hasOverdue);
      break;
    case 'urgent':
      filtered = filtered.filter(hasUrgent);
      break;
    case 'awb':
      filtered = filtered.filter(hasAWBActions);
      break;
    case 'startup':
      filtered = filtered.filter(hasStartupActions);
      break;
    case 'all':
    default:
      break;
  }

  return sortChallenges(filtered);
};

// Format due date
export const formatDueDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const dateOnly = new Date(dateStr);
  dateOnly.setHours(0, 0, 0, 0);

  if (dateOnly.getTime() === today.getTime()) return 'Today';
  if (dateOnly.getTime() === tomorrow.getTime()) return 'Tomorrow';

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

// Activity type icons and colors
export const getActivityTypeInfo = (type: Activity['type']): { icon: string; color: string; label: string } => {
  switch (type) {
    case 'call':
      return { icon: '📞', color: 'text-green-600', label: 'Call' };
    case 'meeting':
      return { icon: '👥', color: 'text-blue-600', label: 'Meeting' };
    case 'email':
      return { icon: '📧', color: 'text-purple-600', label: 'Email' };
    case 'note':
      return { icon: '📝', color: 'text-gray-600', label: 'Note' };
    default:
      return { icon: '📄', color: 'text-gray-600', label: 'Activity' };
  }
};
