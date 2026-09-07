import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { useReportStore, useUserStore, useProjectStore, useActivityStore } from '../store';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Select } from '../components/ui/Select';
import { Input } from '../components/ui/Input';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from 'recharts';
import { addDays, format, startOfWeek, subWeeks } from 'date-fns';
import { CheckCircle2, AlertCircle, Clock, FileText, User as UserIcon } from 'lucide-react';
import type { Project, Report, ReportStatus, User } from '../types';

type TeamStatusRow = { user: User; project?: Project; report?: Report; status: ReportStatus };

export const ManagerDashboard = () => {
  const navigate = useNavigate();
  const { reports } = useReportStore();
  const { users } = useUserStore();
  const { projects } = useProjectStore();
  const { activities } = useActivityStore();

  const currentWeekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  const [selectedWeeksAgo, setSelectedWeeksAgo] = React.useState(0);
  const [memberFilter, setMemberFilter] = React.useState('');
  const [projectFilter, setProjectFilter] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState('');
  const [dateFrom, setDateFrom] = React.useState(format(currentWeekStart, 'yyyy-MM-dd'));
  const [dateTo, setDateTo] = React.useState(format(addDays(currentWeekStart, 6), 'yyyy-MM-dd'));

  const selectWeek = (weeksAgo: number) => {
    const start = startOfWeek(subWeeks(new Date(), weeksAgo), { weekStartsOn: 1 });
    setSelectedWeeksAgo(weeksAgo);
    setDateFrom(format(start, 'yyyy-MM-dd'));
    setDateTo(format(addDays(start, 6), 'yyyy-MM-dd'));
  };

  const clearFilters = () => {
    const start = startOfWeek(new Date(), { weekStartsOn: 1 });
    setSelectedWeeksAgo(0);
    setMemberFilter('');
    setProjectFilter('');
    setStatusFilter('');
    setDateFrom(format(start, 'yyyy-MM-dd'));
    setDateTo(format(addDays(start, 6), 'yyyy-MM-dd'));
  };

  const teamMembers = users.filter(u => u.role === 'team_member' && (!memberFilter || u.id === memberFilter));
  const rangeReports = reports.filter(r =>
    (!dateFrom || r.weekStart >= dateFrom) &&
    (!dateTo || r.weekEnd <= dateTo) &&
    (!memberFilter || r.userId === memberFilter) &&
    (!projectFilter || r.projectId === projectFilter)
  );
  const targetReports = statusFilter === 'Not Started' ? [] : rangeReports.filter(r => !statusFilter || r.status === statusFilter);

  const reportsSubmitted = targetReports.filter(r => r.status !== 'Draft').length;
  const compliance = teamMembers.length > 0 ? Math.round((new Set(targetReports.filter(r => r.status !== 'Draft').map(r => r.userId)).size / teamMembers.length) * 100) : 0;
  const needsCorrection = targetReports.filter(r => r.status === 'Needs Correction').length;
  const openBlockers = targetReports.flatMap(r => r.blockers).length;

  const teamStatusData: TeamStatusRow[] = teamMembers.flatMap<TeamStatusRow>(member => {
    const memberReports = rangeReports.filter(r => r.userId === member.id);
    if (memberReports.length === 0) {
      const project = projects.find(p => p.id === member.projectId);
      return [{ user: member, project, report: undefined, status: 'Not Started' as ReportStatus }];
    }
    return memberReports.map(report => ({
      user: member,
      project: projects.find(p => p.id === report.projectId),
      report,
      status: report.status
    }));
  }).filter(row => (!projectFilter || row.project?.id === projectFilter) && (!statusFilter || row.status === statusFilter));

  // Chart Data: Work Distribution (Current Week)
  const workDistributionData = [
    { name: 'Dev', value: targetReports.reduce((acc, r) => acc + r.hoursBreakdown.development, 0) },
    { name: 'Test', value: targetReports.reduce((acc, r) => acc + r.hoursBreakdown.testing, 0) },
    { name: 'Meet', value: targetReports.reduce((acc, r) => acc + r.hoursBreakdown.meetings, 0) },
    { name: 'Doc', value: targetReports.reduce((acc, r) => acc + r.hoursBreakdown.documentation, 0) },
    { name: 'Plan', value: targetReports.reduce((acc, r) => acc + r.hoursBreakdown.planning, 0) },
  ];

  // Chart Data: Task Trend (Last 4 weeks)
  const taskTrendData = Array.from({ length: 4 }).map((_, i) => {
    const weekAgo = 3 - i;
    const ws = format(startOfWeek(subWeeks(new Date(), weekAgo), { weekStartsOn: 1 }), 'yyyy-MM-dd');
    const wReports = reports.filter(r => r.weekStart === ws && (!memberFilter || r.userId === memberFilter) && (!projectFilter || r.projectId === projectFilter) && (!statusFilter || statusFilter === 'Not Started' || r.status === statusFilter));
    const completed = wReports.flatMap(r => r.tasksCompleted).filter(t => t.status === 'Completed').length;
    return {
      name: `Week -${weekAgo}`,
      completed
    };
  });

  // Chart Data: Project Workload
  const projectWorkloadData = projects.map(p => {
    const pReports = targetReports.filter(r => r.projectId === p.id);
    const hours = pReports.reduce((acc, r) => acc + Object.values(r.hoursBreakdown).reduce((sum, h) => sum + h, 0), 0);
    return {
      name: p.name.substring(0, 10),
      hours
    };
  }).filter(d => d.hours > 0);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Approved': return <Badge variant="success">Approved</Badge>;
      case 'Needs Correction': return <Badge variant="destructive">Needs Correction</Badge>;
      case 'Submitted': return <Badge variant="secondary">Submitted</Badge>;
      case 'Draft': return <Badge variant="outline">Draft</Badge>;
      default: return <Badge variant="outline">Not Started</Badge>;
    }
  };

  return (
    <div className="w-full max-w-[1280px] mx-auto space-y-7">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-[28px] font-semibold tracking-[-0.035em] text-stone-900">Team Overview</h1>
          <p className="text-sm text-stone-500 mt-1.5">Monitor team progress, blockers, and report statuses.</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700 whitespace-nowrap">View Week:</span>
          <Select 
            value={selectedWeeksAgo.toString()} 
            onChange={(e) => selectWeek(Number(e.target.value))}
            className="w-48"
          >
            <option value="0">Current Week</option>
            <option value="1">Last Week</option>
            <option value="2">2 Weeks Ago</option>
            <option value="3">3 Weeks Ago</option>
          </Select>
        </div>
      </div>

      <Card>
        <CardContent className="grid gap-4 pt-5 sm:grid-cols-2 lg:grid-cols-6">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-stone-600">Team member</label>
            <Select value={memberFilter} onChange={e => setMemberFilter(e.target.value)}>
              <option value="">All members</option>
              {users.filter(u => u.role === 'team_member').map(user => <option key={user.id} value={user.id}>{user.name}</option>)}
            </Select>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-stone-600">Project</label>
            <Select value={projectFilter} onChange={e => setProjectFilter(e.target.value)}>
              <option value="">All projects</option>
              {projects.map(project => <option key={project.id} value={project.id}>{project.name}</option>)}
            </Select>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-stone-600">Status</label>
            <Select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
              <option value="">All statuses</option>
              <option value="Draft">Draft</option><option value="Submitted">Submitted</option>
              <option value="Needs Correction">Needs Correction</option><option value="Approved">Approved</option>
              <option value="Not Started">Not Started</option>
            </Select>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-stone-600">From</label>
            <Input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-stone-600">To</label>
            <Input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} />
          </div>
          <div className="flex items-end">
            <Button variant="outline" className="w-full" onClick={clearFilters}>Reset filters</Button>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-px overflow-hidden rounded-lg border border-stone-200 bg-stone-200">
        <Card className="rounded-none border-0 shadow-none">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500">Reports Submitted</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{reportsSubmitted}</p>
              </div>
              <div className="p-2 bg-stone-100 rounded-md"><FileText className="h-5 w-5 text-[#356b58]" /></div>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-none border-0 shadow-none">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500">Compliance</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{compliance}%</p>
              </div>
              <div className="p-2 bg-stone-100 rounded-md"><CheckCircle2 className="h-5 w-5 text-stone-600" /></div>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-none border-0 shadow-none">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500">Needs Correction</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{needsCorrection}</p>
              </div>
              <div className="p-2 bg-stone-100 rounded-md"><AlertCircle className="h-5 w-5 text-stone-600" /></div>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-none border-0 shadow-none">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500">Open Blockers</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{openBlockers}</p>
              </div>
              <div className="p-2 bg-stone-100 rounded-md"><AlertCircle className="h-5 w-5 text-stone-600" /></div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-6">
          {/* Team Report Status */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle>Team Report Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="px-4 py-3">Team Member</th>
                      <th className="px-4 py-3">Project</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Submitted</th>
                      <th className="px-4 py-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {teamStatusData.map((row) => (
                      <tr key={`${row.user.id}-${row.report?.id ?? 'not-started'}`} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium text-gray-900 flex items-center gap-2">
                          <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-xs">
                            <UserIcon className="h-3 w-3" />
                          </div>
                          {row.user.name}
                        </td>
                        <td className="px-4 py-3 text-gray-500">{row.project?.name || 'N/A'}</td>
                        <td className="px-4 py-3">{getStatusBadge(row.status)}</td>
                        <td className="px-4 py-3 text-gray-500">
                          {row.report?.updatedAt ? format(new Date(row.report.updatedAt), 'MMM d, HH:mm') : '-'}
                        </td>
                        <td className="px-4 py-3 text-right">
                          {row.report && row.status !== 'Draft' ? (
                            <Button 
                              variant={row.status === 'Submitted' ? 'default' : 'ghost'} 
                              size="sm"
                              onClick={() => navigate(row.status === 'Submitted' ? `/review/${row.report!.id}` : `/reports/${row.report!.id}`)}
                            >
                              {row.status === 'Submitted' ? 'Review' : 'View'}
                            </Button>
                          ) : (
                            <Button variant="ghost" size="sm" disabled>{row.status === 'Draft' ? 'Private draft' : 'N/A'}</Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Charts Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-semibold">Tasks Completed Trend</CardTitle>
              </CardHeader>
              <CardContent className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={taskTrendData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                    <RechartsTooltip />
                    <Line type="monotone" dataKey="completed" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-semibold">Project Workload (Hours)</CardTitle>
              </CardHeader>
              <CardContent className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={projectWorkloadData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                    <RechartsTooltip cursor={{ fill: '#f3f4f6' }} />
                    <Bar dataKey="hours" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
              <CardHeader>
                <CardTitle className="text-sm font-semibold">Work Distribution (Current Week)</CardTitle>
              </CardHeader>
              <CardContent className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={workDistributionData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                    <RechartsTooltip cursor={{ fill: '#f3f4f6' }} />
                    <Bar dataKey="value" fill="#10b981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
        </div>

        {/* Sidebar Area */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-200 before:to-transparent">
                {activities.slice(0, 5).map((activity, i) => (
                  <div key={activity.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-white border-2 border-gray-200 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 text-gray-500">
                      {activity.action === 'submitted_report' ? <FileText className="w-4 h-4" /> :
                       activity.action === 'approved_report' ? <CheckCircle2 className="w-4 h-4 text-green-500" /> :
                       <AlertCircle className="w-4 h-4 text-orange-500" />}
                    </div>
                    <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-3 rounded-lg border border-gray-100 bg-white shadow-sm">
                      <div className="flex items-center justify-between mb-1">
                        <div className="font-semibold text-gray-900 text-xs truncate">
                          {users.find(u => u.id === activity.userId)?.name}
                        </div>
                        <time className="text-xs text-gray-500">{format(new Date(activity.timestamp), 'MMM d, HH:mm')}</time>
                      </div>
                      <div className="text-xs text-gray-600 line-clamp-2">
                        {activity.description}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Open Blockers</CardTitle>
              <CardDescription>Key issues reported this week</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {targetReports.flatMap(r => 
                  r.blockers.map(b => ({ ...b, user: users.find(u => u.id === r.userId), reportId: r.id }))
                ).filter(b => b.isKeyIssue).length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">No key blockers reported.</p>
                ) : (
                  targetReports.flatMap(r => 
                    r.blockers.map(b => ({ ...b, user: users.find(u => u.id === r.userId), reportId: r.id }))
                  ).filter(b => b.isKeyIssue).map((blocker, i) => (
                    <div key={i} className="flex gap-3 p-3 bg-red-50/50 border border-red-100 rounded-md">
                      <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{blocker.description}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-gray-500">{blocker.user?.name}</span>
                          <span className="text-xs px-1.5 py-0.5 bg-red-100 text-red-800 rounded">Severity: {blocker.severity}</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
