import type { User, Project, Report, Activity, ReportTask, Blocker, Achievement, HoursBreakdown } from '../types';
import { addDays, subWeeks, subDays, startOfWeek, endOfWeek, formatISO } from 'date-fns';

const today = new Date();
const currentWeekStart = startOfWeek(today, { weekStartsOn: 1 });
const currentWeekEnd = endOfWeek(today, { weekStartsOn: 1 });

const formatD = (d: Date) => formatISO(d, { representation: 'date' });

// ---------------------------------------------------------
// PROJECTS
// ---------------------------------------------------------
export const seedProjects: Project[] = [
  {
    id: 'proj-1',
    name: 'Client Portal',
    description: 'B2B portal for client self-service',
    category: 'Customer Facing',
    status: 'active',
    createdAt: formatISO(subWeeks(today, 12))
  },
  {
    id: 'proj-2',
    name: 'Internal Tooling',
    description: 'Internal admin dashboards and tools',
    category: 'Internal',
    status: 'active',
    createdAt: formatISO(subWeeks(today, 20))
  },
  {
    id: 'proj-3',
    name: 'Mobile App',
    description: 'React Native mobile application',
    category: 'Mobile',
    status: 'active',
    createdAt: formatISO(subWeeks(today, 5))
  },
  {
    id: 'proj-4',
    name: 'R&D',
    description: 'Research and development initiatives',
    category: 'Research',
    status: 'active',
    createdAt: formatISO(subWeeks(today, 30))
  },
  {
    id: 'proj-5',
    name: 'Marketing',
    description: 'Marketing website and campaigns',
    category: 'Marketing',
    status: 'active',
    createdAt: formatISO(subWeeks(today, 15))
  }
];

// ---------------------------------------------------------
// USERS
// ---------------------------------------------------------
export const seedUsers: User[] = [
  {
    id: 'u-1',
    name: 'Alex Johnson',
    email: 'alex@demo.com',
    role: 'team_member',
    projectId: 'proj-1',
    active: true,
  },
  {
    id: 'u-2',
    name: 'Sarah Wilson',
    email: 'sarah@demo.com',
    role: 'team_member',
    projectId: 'proj-2',
    active: true,
  },
  {
    id: 'u-3',
    name: 'Daniel Lee',
    email: 'daniel@demo.com',
    role: 'team_member',
    projectId: 'proj-3',
    active: true,
  },
  {
    id: 'u-4',
    name: 'Emily Brown',
    email: 'emily@demo.com',
    role: 'team_member',
    projectId: 'proj-4',
    active: true,
  },
  {
    id: 'u-5',
    name: 'Michael Smith',
    email: 'michael@demo.com',
    role: 'team_member',
    projectId: 'proj-5',
    active: true,
  },
  {
    id: 'u-manager',
    name: 'John Smith',
    email: 'manager@demo.com',
    role: 'manager',
    active: true,
  }
];

// ---------------------------------------------------------
// HELPER FOR REPORTS
// ---------------------------------------------------------

const generateReport = (
  id: string,
  userId: string,
  projectId: string,
  weeksAgo: number,
  status: Report['status'],
  tasksCompleted: ReportTask[],
  tasksPlanned: string,
  hoursBreakdown: HoursBreakdown,
  reviewComment?: string
): Report => {
  const weekStart = startOfWeek(subWeeks(today, weeksAgo), { weekStartsOn: 1 });
  const weekEnd = endOfWeek(subWeeks(today, weeksAgo), { weekStartsOn: 1 });
  const submittedAt = formatISO(addDays(weekEnd, 1)); // Submitted on Monday following the week
  
  const report: Report = {
    id,
    userId,
    projectId,
    weekStart: formatD(weekStart),
    weekEnd: formatD(weekEnd),
    status,
    tasksCompleted,
    tasksPlanned,
    blockers: [],
    achievements: [{
      id: `ach-${id}`,
      description: 'Completed planned tasks on time',
      isKeyAchievement: true
    }],
    hoursBreakdown,
    notes: 'Regular weekly progress.',
    links: 'https://github.com/company/repo/pulls',
    reviews: reviewComment ? [{
      id: `rev-${id}`,
      reviewerId: 'u-manager',
      version: 1,
      comment: reviewComment,
      timestamp: formatISO(addDays(weekEnd, 2)),
      status: status === 'Needs Correction' ? 'Needs Correction' : 'Approved'
    }] : [],
    versions: [],
    createdAt: formatISO(subDays(weekEnd, 2)),
    updatedAt: submittedAt,
  };

  if (status === 'Submitted' || status === 'Approved' || status === 'Needs Correction') {
    report.versions.push({
      version: 1,
      submittedAt,
      content: {
        tasksCompleted,
        tasksPlanned,
        blockers: [],
        achievements: report.achievements,
        hoursBreakdown,
        notes: report.notes,
        links: report.links
      }
    });
  }

  return report;
};

// ---------------------------------------------------------
// REPORTS
// ---------------------------------------------------------
export const seedReports: Report[] = [
  // Current Week (weeksAgo = 0)
  // Alex - Approved
  generateReport(
    'rep-alex-0', 'u-1', 'proj-1', 0, 'Approved',
    [
      { id: 't1', name: 'Implement authentication flow', priority: 'High', plannedPercentage: 100, actualPercentage: 100, status: 'Completed', timePlanned: 8, timeSpent: 8, deliverable: 'Auth Module' },
      { id: 't2', name: 'Build dashboard layout', priority: 'Medium', plannedPercentage: 100, actualPercentage: 100, status: 'Completed', timePlanned: 12, timeSpent: 10, deliverable: 'Dashboard UI' }
    ],
    'Start working on user profile page',
    { development: 20, testing: 5, meetings: 5, documentation: 2, planning: 3, other: 0 }
  ),
  // Sarah - Submitted
  generateReport(
    'rep-sarah-0', 'u-2', 'proj-2', 0, 'Submitted',
    [
      { id: 't3', name: 'Fix responsive layout', priority: 'High', plannedPercentage: 100, actualPercentage: 90, status: 'In Progress', timePlanned: 10, timeSpent: 12, deliverable: 'CSS Fixes' },
      { id: 't4', name: 'Update dependencies', priority: 'Low', plannedPercentage: 100, actualPercentage: 100, status: 'Completed', timePlanned: 4, timeSpent: 3, deliverable: 'package.json' }
    ],
    'Complete responsive fixes, start next feature',
    { development: 15, testing: 10, meetings: 5, documentation: 0, planning: 2, other: 0 }
  ),
  // Daniel - Needs Correction
  generateReport(
    'rep-daniel-0', 'u-3', 'proj-3', 0, 'Needs Correction',
    [
      { id: 't5', name: 'Investigate production issue', priority: 'Critical', plannedPercentage: 100, actualPercentage: 80, status: 'In Progress', timePlanned: 8, timeSpent: 16, deliverable: 'Bug investigation' }
    ],
    'Continue investigating issue',
    { development: 20, testing: 10, meetings: 5, documentation: 0, planning: 0, other: 0 },
    'Please add more details about the production issue investigation and any potential blockers.'
  ),
  // Emily - Approved
  generateReport(
    'rep-emily-0', 'u-4', 'proj-4', 0, 'Approved',
    [
      { id: 't6', name: 'Write unit tests for core module', priority: 'Medium', plannedPercentage: 100, actualPercentage: 100, status: 'Completed', timePlanned: 16, timeSpent: 15, deliverable: 'Test suite' }
    ],
    'Start integration testing',
    { development: 15, testing: 15, meetings: 4, documentation: 2, planning: 1, other: 0 }
  ),
  // Michael - Not Started (No report for current week, handled by logic looking for missing weeks)
  
  // Previous Week (weeksAgo = 1)
  // Alex - Approved
  generateReport(
    'rep-alex-1', 'u-1', 'proj-1', 1, 'Approved',
    [
      { id: 't7', name: 'Database schema design', priority: 'High', plannedPercentage: 100, actualPercentage: 100, status: 'Completed', timePlanned: 10, timeSpent: 12, deliverable: 'Schema' }
    ],
    'Implement authentication',
    { development: 25, testing: 5, meetings: 5, documentation: 5, planning: 0, other: 0 }
  ),
  // Sarah - Approved
  generateReport(
    'rep-sarah-1', 'u-2', 'proj-2', 1, 'Approved',
    [
      { id: 't8', name: 'Internal tool refactor', priority: 'Medium', plannedPercentage: 100, actualPercentage: 100, status: 'Completed', timePlanned: 20, timeSpent: 22, deliverable: 'Refactored code' }
    ],
    'Fix responsive layout',
    { development: 22, testing: 10, meetings: 3, documentation: 2, planning: 3, other: 0 }
  ),

  // Previous Week (weeksAgo = 2)
  // Alex - Approved
  generateReport(
    'rep-alex-2', 'u-1', 'proj-1', 2, 'Approved',
    [
      { id: 't9', name: 'Initial setup', priority: 'Medium', plannedPercentage: 100, actualPercentage: 100, status: 'Completed', timePlanned: 10, timeSpent: 8, deliverable: 'Repo setup' }
    ],
    'Database schema design',
    { development: 20, testing: 0, meetings: 8, documentation: 10, planning: 2, other: 0 }
  ),
];

// ---------------------------------------------------------
// ACTIVITIES
// ---------------------------------------------------------
export const seedActivities: Activity[] = [
  {
    id: 'act-1',
    userId: 'u-1',
    action: 'submitted_report',
    targetId: 'rep-alex-0',
    description: 'Alex Johnson submitted a weekly report.',
    timestamp: formatISO(subDays(today, 1))
  },
  {
    id: 'act-2',
    userId: 'u-manager',
    action: 'approved_report',
    targetId: 'rep-alex-0',
    description: 'John Smith approved Alex Johnson\'s report.',
    timestamp: formatISO(subDays(today, 0.5))
  },
  {
    id: 'act-3',
    userId: 'u-manager',
    action: 'requested_changes',
    targetId: 'rep-daniel-0',
    description: 'John Smith requested changes on Daniel Lee\'s report.',
    timestamp: formatISO(today)
  }
];
