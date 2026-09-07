import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore, useReportStore, useProjectStore } from '../store';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { format } from 'date-fns';

export const ReportHistory = () => {
  const { currentUser } = useAuthStore();
  const { reports } = useReportStore();
  const { projects } = useProjectStore();
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState('all');
  const [projectFilter, setProjectFilter] = React.useState('all');

  const myReports = reports
    .filter(r => r.userId === currentUser?.id)
    .sort((a, b) => new Date(b.weekStart).getTime() - new Date(a.weekStart).getTime());

  const filteredReports = myReports.filter(report => {
    const matchesStatus = statusFilter === 'all' || report.status === statusFilter;
    const matchesProject = projectFilter === 'all' || report.projectId === projectFilter;
    const matchesSearch = searchTerm === '' || 
      report.tasksCompleted.some(t => t.name.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesStatus && matchesProject && matchesSearch;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Approved': return <Badge variant="success">Approved</Badge>;
      case 'Needs Correction': return <Badge variant="destructive">Needs Correction</Badge>;
      case 'Submitted': return <Badge variant="secondary">Submitted</Badge>;
      case 'Draft': return <Badge variant="outline">Draft</Badge>;
      default: return <Badge variant="outline">Not Started</Badge>;
    }
  };

  const getProjectName = (projectId: string) => {
    return projects.find(p => p.id === projectId)?.name || 'Unknown Project';
  };

  return (
    <div className="w-full max-w-[1280px] mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">My Reports</h1>
          <p className="text-gray-500 mt-1">View and filter your past weekly reports.</p>
        </div>
        <Button onClick={() => navigate('/reports/new')}>New Report</Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Filter Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <Input 
                placeholder="Search tasks..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div>
              <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="all">All Statuses</option>
                <option value="Approved">Approved</option>
                <option value="Submitted">Submitted</option>
                <option value="Needs Correction">Needs Correction</option>
                <option value="Draft">Draft</option>
              </Select>
            </div>
            <div>
              <Select value={projectFilter} onChange={(e) => setProjectFilter(e.target.value)}>
                <option value="all">All Projects</option>
                {projects.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-3 py-3 sm:px-6">Week</th>
                <th className="px-3 py-3 sm:px-6">Project</th>
                <th className="px-3 py-3 sm:px-6 text-center">Tasks</th>
                <th className="px-3 py-3 sm:px-6 text-center">Hours</th>
                <th className="px-3 py-3 sm:px-6">Status</th>
                <th className="px-3 py-3 sm:px-6">Last Updated</th>
                <th className="px-3 py-3 sm:px-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredReports.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-3 py-8 sm:px-6 text-center text-gray-500">
                    No reports found matching your filters.
                  </td>
                </tr>
              ) : (
                filteredReports.map((report) => {
                  const weekStr = `${format(new Date(report.weekStart), 'MMM d')} - ${format(new Date(report.weekEnd), 'MMM d')}`;
                  const totalHours = Object.values(report.hoursBreakdown).reduce((a, b) => a + b, 0);
                  
                  return (
                    <tr key={report.id} className="bg-white border-b hover:bg-gray-50 transition-colors">
                      <td className="px-3 py-4 sm:px-6 font-medium text-gray-900 whitespace-nowrap">
                        {weekStr}
                      </td>
                      <td className="px-3 py-4 sm:px-6">
                        {getProjectName(report.projectId)}
                      </td>
                      <td className="px-3 py-4 sm:px-6 text-center">
                        {report.tasksCompleted.length}
                      </td>
                      <td className="px-3 py-4 sm:px-6 text-center">
                        {totalHours}h
                      </td>
                      <td className="px-3 py-4 sm:px-6">
                        {getStatusBadge(report.status)}
                      </td>
                      <td className="px-3 py-4 sm:px-6 text-gray-500">
                        {format(new Date(report.updatedAt), 'MMM d, yyyy')}
                      </td>
                      <td className="px-3 py-4 sm:px-6 text-right">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => navigate(`/reports/${report.id}`)}
                        >
                          View
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
