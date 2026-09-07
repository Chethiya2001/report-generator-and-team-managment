import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore, useReportStore } from '../store';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { FileText, Clock, AlertCircle, CheckCircle2, Play } from 'lucide-react';
import { startOfWeek, format } from 'date-fns';

export const TeamMemberDashboard = () => {
  const { currentUser } = useAuthStore();
  const { reports } = useReportStore();
  const navigate = useNavigate();

  // Find current week report
  const currentWeekDate = startOfWeek(new Date(), { weekStartsOn: 1 });
  const currentWeekDateStr = format(currentWeekDate, 'yyyy-MM-dd');
  
  const myReports = reports.filter(r => r.userId === currentUser?.id).sort((a, b) => new Date(b.weekStart).getTime() - new Date(a.weekStart).getTime());
  const currentReport = myReports.find(r => r.weekStart === currentWeekDateStr);
  const recentReports = myReports.filter(r => r.id !== currentReport?.id).slice(0, 3);

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
      <div>
        <h1 className="text-[28px] font-semibold tracking-[-0.035em] text-stone-900">Good morning, {currentUser?.name}</h1>
        <p className="text-gray-500 mt-1">Your report workspace for the week.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="md:col-span-2 overflow-hidden border-stone-200">
          <CardHeader className="bg-[#edf3ef] border-b border-[#dbe8e1] pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">Current Weekly Report</CardTitle>
                <CardDescription>Week of {format(currentWeekDate, 'MMM d, yyyy')}</CardDescription>
              </div>
              {getStatusBadge(currentReport?.status || 'Not Started')}
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            {!currentReport ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <FileText className="h-12 w-12 text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900">No report started for this week</h3>
                <p className="mt-1 text-sm text-gray-500 max-w-sm">
                  Start your weekly report early to keep track of your tasks and hours as you go.
                </p>
                <Button className="mt-6" onClick={() => navigate('/reports/new')}>
                  Start Weekly Report
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {currentReport.status === 'Needs Correction' && currentReport.reviews.length > 0 && (
                  <div className="rounded-md bg-red-50 p-4 border border-red-200">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <AlertCircle className="h-5 w-5 text-red-400" aria-hidden="true" />
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-red-800">Changes requested</h3>
                        <div className="mt-2 text-sm text-red-700">
                          <p>{currentReport.reviews[0].comment}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 rounded-lg bg-gray-50 border border-gray-100">
                    <p className="text-sm font-medium text-gray-500">Tasks Completed</p>
                    <p className="text-2xl font-semibold mt-1">{currentReport.tasksCompleted.filter(t => t.status === 'Completed').length}</p>
                  </div>
                  <div className="p-4 rounded-lg bg-gray-50 border border-gray-100">
                    <p className="text-sm font-medium text-gray-500">Total Hours</p>
                    <p className="text-2xl font-semibold mt-1">
                      {Object.values(currentReport.hoursBreakdown).reduce((a, b) => a + b, 0)}h
                    </p>
                  </div>
                  <div className="p-4 rounded-lg bg-gray-50 border border-gray-100">
                    <p className="text-sm font-medium text-gray-500">Blockers</p>
                    <p className="text-2xl font-semibold mt-1">{currentReport.blockers.length}</p>
                  </div>
                  <div className="p-4 rounded-lg bg-gray-50 border border-gray-100">
                    <p className="text-sm font-medium text-gray-500">Last Updated</p>
                    <p className="text-sm font-semibold mt-2">{format(new Date(currentReport.updatedAt), 'MMM d, HH:mm')}</p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
          {currentReport && (
            <CardFooter className="bg-gray-50/50 border-t border-gray-100 pt-4 flex justify-end gap-3">
              {currentReport.status === 'Draft' && (
                <Button onClick={() => navigate(`/reports/${currentReport.id}/edit`)}>Continue Report</Button>
              )}
              {currentReport.status === 'Needs Correction' && (
                <Button onClick={() => navigate(`/reports/${currentReport.id}/edit`)}>Edit Report</Button>
              )}
              {(currentReport.status === 'Submitted' || currentReport.status === 'Approved') && (
                <Button onClick={() => navigate(`/reports/${currentReport.id}`)}>
                  {currentReport.status === 'Approved' ? 'View Approved Report' : 'View Report'}
                </Button>
              )}
            </CardFooter>
          )}
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Recent Reports</CardTitle>
            <CardDescription>Your past weekly submissions</CardDescription>
          </CardHeader>
          <CardContent>
            {recentReports.length === 0 ? (
              <p className="text-sm text-gray-500 py-4 text-center">No recent reports found.</p>
            ) : (
              <div className="space-y-4">
                {recentReports.map(report => (
                  <div key={report.id} className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-md bg-[#e2eee8] flex items-center justify-center text-[#356b58]">
                        {report.status === 'Approved' ? <CheckCircle2 className="h-5 w-5" /> : <Clock className="h-5 w-5" />}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          Week of {format(new Date(report.weekStart), 'MMM d, yyyy')}
                        </p>
                        <p className="text-sm text-gray-500">
                          {report.tasksCompleted.length} tasks • {Object.values(report.hoursBreakdown).reduce((a, b) => a + b, 0)}h
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      {getStatusBadge(report.status)}
                      <Button variant="ghost" size="sm" onClick={() => navigate(`/reports/${report.id}`)}>
                        View
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {myReports.length > 3 && (
              <div className="mt-4 flex justify-center">
                <Button variant="link" onClick={() => navigate('/my-reports')}>
                  View all history
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
