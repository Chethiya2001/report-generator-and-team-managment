export type Role = 'manager' | 'team_member';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatarUrl?: string;
  projectId?: string;
  active: boolean;
}

export type ProjectStatus = 'active' | 'completed' | 'on_hold';

export interface Project {
  id: string;
  name: string;
  description: string;
  category: string;
  status: ProjectStatus;
  createdAt: string;
}

export type TaskPriority = 'Low' | 'Medium' | 'High' | 'Critical';
export type TaskStatus = 'Not Started' | 'In Progress' | 'Completed' | 'Blocked';

export interface ReportTask {
  id: string;
  name: string;
  priority: TaskPriority;
  plannedPercentage: number;
  actualPercentage: number;
  status: TaskStatus;
  timePlanned: number; // in hours
  timeSpent: number; // in hours
  deliverable: string;
}

export type BlockerSeverity = 'Low' | 'Medium' | 'High';

export interface Blocker {
  id: string;
  description: string;
  severity: BlockerSeverity;
  isKeyIssue: boolean;
}

export interface Achievement {
  id: string;
  description: string;
  isKeyAchievement: boolean;
}

export interface HoursBreakdown {
  development: number;
  testing: number;
  meetings: number;
  documentation: number;
  planning: number;
  other: number;
}

export type ReportStatus = 'Draft' | 'Submitted' | 'Needs Correction' | 'Approved' | 'Not Started';

export interface Review {
  id: string;
  reviewerId: string;
  version: number;
  comment: string;
  timestamp: string;
  status: 'Approved' | 'Needs Correction';
}

export interface ReportVersion {
  version: number;
  submittedAt: string;
  content: {
    tasksCompleted: ReportTask[];
    tasksPlanned: string;
    blockers: Blocker[];
    achievements: Achievement[];
    hoursBreakdown: HoursBreakdown;
    notes: string;
    links: string;
  };
}

export interface Report {
  id: string;
  userId: string;
  projectId: string;
  weekStart: string; // ISO date string YYYY-MM-DD
  weekEnd: string; // ISO date string YYYY-MM-DD
  status: ReportStatus;
  
  tasksCompleted: ReportTask[];
  tasksPlanned: string;
  blockers: Blocker[];
  achievements: Achievement[];
  hoursBreakdown: HoursBreakdown;
  notes: string;
  links: string;
  
  reviews: Review[];
  versions: ReportVersion[];
  
  createdAt: string;
  updatedAt: string;
}

export type ActivityAction = 
  | 'submitted_report' 
  | 'approved_report' 
  | 'requested_changes' 
  | 'created_project' 
  | 'added_user';

export interface Activity {
  id: string;
  userId: string;
  action: ActivityAction;
  targetId?: string; // e.g. report id
  description: string;
  timestamp: string;
}
