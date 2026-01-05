// Fixed owners + entity names (WafaSalaf, Wafa Cash, AWB RH, etc.)
export type ActionOwner = 'STARTUP' | 'WENOV' | 'CEED' | 'AWB' | (string & {});
export type ActivityType = 'call' | 'meeting' | 'email' | 'note';
export type ContactGroup = 'WENOV' | 'Metier' | 'Startup' | 'OpenStart';
export type ChallengeStatus = 'ongoing' | 'overdue' | 'standby' | 'done';

export interface Action {
  id: string;
  challenge_id: string;
  title: string;
  owner: ActionOwner;
  due_date: string;
  is_done: boolean;
  is_urgent: boolean;
  assignee_id?: string;
  assignee_name?: string;
}

export interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  function: string;
  company: string;
  email: string;
  phone: string;
  group: ContactGroup;
}

export interface Activity {
  id: string;
  challenge_id: string;
  type: ActivityType;
  note: string;
  link?: string;
  created_at: string;
}

export interface Challenge {
  id: string;
  name: string;
  wenov_responsible: string;
  entity: string;
  startup_name: string;
  status: ChallengeStatus;
  contacts: Contact[];
  actions: Action[];
  activities: Activity[];
}

export interface KPIs {
  challengesCount: number;
  actionsAWB: number;
  actionsStartup: number;
  alertsCount: number;
}

export type FilterType = 'all' | 'overdue' | 'urgent' | 'awb' | 'startup' | 'alerts';

export interface Filters {
  activeFilter: FilterType;
  search: string;
  entity: string;
  wenovOwner: string;
}
