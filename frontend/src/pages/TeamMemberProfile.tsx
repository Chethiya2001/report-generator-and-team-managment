import * as React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useUserStore, useProjectStore, useReportStore, useAuthStore } from '../store';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { ArrowLeft, User as UserIcon, Mail, Briefcase, FileText } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';

export const TeamMemberProfile = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { users } = useUserStore();
  const { projects } = useProjectStore();
  const { reports } = useReportStore();
  const { currentUser } = useAuthStore();

  if (currentUser?.role !== 'manager') {
    return <div className="p-8 text-center text-red-500">Unauthorized</div>;
  }

  const user = users.find(u => u.id === userId);
  
  if (!user) {
    return <div className="p-8 text-center text-gray-500">User not found</div>;
  }

  const project = projects.find(p => p.id === user.projectId);
  const userReports = reports
    .filter(r => r.userId === user.id)
    .sort((a, b) => new Date(b.weekStart).getTime() - new Date(a.weekStart).getTime());

  // Stats
  const reportsSubmitted = userReports.length;
  const approvedReports = userReports.filter(r => r.status === 'Approved').length;
  const approvalRate = reportsSubmitted > 0 ? Math.round((approvedReports / reportsSubmitted) * 100) : 0;
  
  const totalHours = userReports.reduce((acc, r) => acc + Object.values(r.hoursBreakdown).reduce((a, b) => a + b, 0), 0);
  const avgHours = reportsSubmitted > 0 ? Math.round(totalHours / reportsSubmitted) : 0;
  
  const openBlockers = userReports.flatMap(r => r.blockers).length;

  // Chart Data
  const chartData = userReports.slice(0, 8).reverse().map(r => ({
    name: format(new Date(r.weekStart), 'MMM d'),
    tasks: r.tasksCompleted.filter(t => t.status === 'Completed').length,
    hours: Object.values(r.hoursBreakdown).reduce((a, b) => a + b, 0)
  }));

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
    <div className="w-full max-w-[1280px] mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Team Member Profile</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <div className="h-24 w-24 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 mb-4">
                  <UserIcon className="h-12 w-12" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">{user.name}</h2>
                <p className="text-sm text-gray-500 capitalize">{user.role.replace('_', ' ')}</p>
                <div className="mt-4 flex items-center justify-center gap-2 text-sm text-gray-600">
                  <Mail className="h-4 w-4" /> {user.email}
                </div>
                <div className="mt-2 flex items-center justify-center gap-2 text-sm text-gray-600">
                  <Briefcase className="h-4 w-4" /> {project?.name || 'No Project'}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Performance Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-500 text-sm">Reports Submitted</span>
                <span className="font-semibold text-gray-900">{reportsSubmitted}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500 text-sm">Approval Rate</span>
                <span className="font-semibold text-gray-900">{approvalRate}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500 text-sm">Avg Weekly Hours</span>
                <span className="font-semibold text-gray-900">{avgHours}h</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500 text-sm">Total Blockers</span>
                <span className="font-semibold text-gray-900">{openBlockers}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Trends</CardTitle>
              <CardDescription>Completed tasks and hours logged over recent weeks.</CardDescription>
            </CardHeader>
            <CardContent className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                  <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                  <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                  <RechartsTooltip />
                  <Line yAxisId="left" type="monotone" name="Tasks" dataKey="tasks" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} />
                  <Line yAxisId="right" type="monotone" name="Hours" dataKey="hours" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Report History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="px-4 py-3">Week</th>
                      <th className="px-4 py-3">Tasks</th>
                      <th className="px-4 py-3">Hours</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {userReports.slice(0, 5).map((report) => (
                      <tr key={report.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium text-gray-900">
                          {format(new Date(report.weekStart), 'MMM d, yyyy')}
                        </td>
                        <td className="px-4 py-3 text-gray-500">{report.tasksCompleted.length}</td>
                        <td className="px-4 py-3 text-gray-500">
                          {Object.values(report.hoursBreakdown).reduce((a, b) => a + b, 0)}h
                        </td>
                        <td className="px-4 py-3">{getStatusBadge(report.status)}</td>
                        <td className="px-4 py-3 text-right">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => navigate(report.status === 'Submitted' ? `/review/${report.id}` : `/reports/${report.id}`)}
                          >
                            <FileText className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                    {userReports.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-4 py-6 text-center text-gray-500">No reports found for this user.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
