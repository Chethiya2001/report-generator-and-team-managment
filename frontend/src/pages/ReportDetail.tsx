import * as React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useReportStore, useUserStore, useProjectStore, useAuthStore } from '../store';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { format } from 'date-fns';
import { CheckCircle2, AlertCircle, Clock, ArrowLeft } from 'lucide-react';

const formatDate = (value: string | null | undefined, pattern: string, fallback = 'Date unavailable') => {
  if (!value) return fallback;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? fallback : format(date, pattern);
};

export const ReportDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { reports } = useReportStore();
  const { users } = useUserStore();
  const { projects } = useProjectStore();
  const { currentUser } = useAuthStore();

  const [selectedVersion, setSelectedVersion] = React.useState<number | null>(null);

  const report = reports.find(r => r.id === id);

  if (!report) {
    return <div className="p-8 text-center text-gray-500">Report not found</div>;
  }

  const employee = users.find(u => u.id === report.userId);
  const project = projects.find(p => p.id === report.projectId);

  const isManager = currentUser?.role === 'manager';

  // Make sure team members can't view others' reports
  if (!isManager && report.userId !== currentUser?.id) {
    return <div className="p-8 text-center text-red-500">Unauthorized</div>;
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Approved': return <Badge variant="success">Approved</Badge>;
      case 'Needs Correction': return <Badge variant="destructive">Needs Correction</Badge>;
      case 'Submitted': return <Badge variant="secondary">Submitted</Badge>;
      case 'Draft': return <Badge variant="outline">Draft</Badge>;
      default: return <Badge variant="outline">Not Started</Badge>;
    }
  };

  const displayContent = selectedVersion !== null 
    ? report.versions.find(v => v.version === selectedVersion)?.content 
    : report;

  if (!displayContent) {
    return <div className="p-8 text-center text-gray-500">Version content not found</div>;
  }

  const totalHours = Object.values(displayContent.hoursBreakdown).reduce((a, b) => a + b, 0);

  return (
    <div className="w-full max-w-[1280px] mx-auto space-y-6 pb-12">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            {isManager ? `${employee?.name}'s Report` : 'Weekly Report'}
          </h1>
          <p className="text-gray-500 mt-1">
            Week of {formatDate(report.weekStart, 'MMM d, yyyy')} • {project?.name}
          </p>
        </div>
        <div className="ml-auto flex items-center gap-4">
          {getStatusBadge(report.status)}
          {isManager && report.status === 'Submitted' && (
            <Button onClick={() => navigate(`/review/${report.id}`)}>Review Report</Button>
          )}
          {!isManager && report.status === 'Needs Correction' && (
            <Button onClick={() => navigate(`/reports/${report.id}/edit`)}>Edit Report</Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          
          {report.reviews.length > 0 && selectedVersion === null && (
            <Card className={report.reviews[0].status === 'Needs Correction' ? "border-red-200 bg-red-50/50" : "border-green-200 bg-green-50/50"}>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  {report.reviews[0].status === 'Needs Correction' ? (
                    <><AlertCircle className="h-4 w-4 text-red-500" /> Manager Feedback</>
                  ) : (
                    <><CheckCircle2 className="h-4 w-4 text-green-500" /> Approval Note</>
                  )}
                </CardTitle>
                <CardDescription>
                  Version {report.reviews[0].version} reviewed by {users.find(u => u.id === report.reviews[0].reviewerId)?.name} on {formatDate(report.reviews[0].timestamp, 'MMM d, HH:mm')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-700">{report.reviews[0].comment || 'No comment provided.'}</p>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Tasks Completed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-gray-500 uppercase bg-gray-50">
                    <tr>
                      <th className="px-4 py-2">Task Name</th>
                      <th className="px-4 py-2">Priority</th>
                      <th className="px-4 py-2">Completion</th>
                      <th className="px-4 py-2">Hours</th>
                      <th className="px-4 py-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayContent.tasksCompleted.map((task: any) => (
                      <tr key={task.id} className="border-b border-gray-100">
                        <td className="px-4 py-3 font-medium text-gray-900">{task.name}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded text-xs ${
                            task.priority === 'Critical' ? 'bg-red-100 text-red-800' :
                            task.priority === 'High' ? 'bg-orange-100 text-orange-800' :
                            task.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {task.priority}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div className="h-full bg-blue-500" style={{ width: `${task.actualPercentage}%` }} />
                            </div>
                            <span className="text-xs text-gray-500">{task.actualPercentage}%</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">{task.timeSpent}h</td>
                        <td className="px-4 py-3">
                          <Badge variant={task.status === 'Completed' ? 'success' : task.status === 'In Progress' ? 'secondary' : 'outline'}>
                            {task.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tasks Planned for Next Week</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 whitespace-pre-wrap">{displayContent.tasksPlanned || 'None specified.'}</p>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Blockers</CardTitle>
              </CardHeader>
              <CardContent>
                {displayContent.blockers.length === 0 ? (
                  <p className="text-gray-500 text-sm">No blockers reported.</p>
                ) : (
                  <ul className="space-y-3">
                    {displayContent.blockers.map((b: any) => (
                      <li key={b.id} className="flex gap-2 text-sm">
                        <AlertCircle className={`h-4 w-4 shrink-0 mt-0.5 ${b.isKeyIssue ? 'text-red-500' : 'text-orange-400'}`} />
                        <div>
                          <p className={`font-medium ${b.isKeyIssue ? 'text-red-700' : 'text-gray-900'}`}>{b.description}</p>
                          <p className="text-xs text-gray-500 mt-0.5">Severity: {b.severity}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Achievements</CardTitle>
              </CardHeader>
              <CardContent>
                {displayContent.achievements.length === 0 ? (
                  <p className="text-gray-500 text-sm">No achievements reported.</p>
                ) : (
                  <ul className="space-y-3">
                    {displayContent.achievements.map((a: any) => (
                      <li key={a.id} className="flex gap-2 text-sm">
                        <CheckCircle2 className={`h-4 w-4 shrink-0 mt-0.5 ${a.isKeyAchievement ? 'text-green-500' : 'text-blue-400'}`} />
                        <p className={`font-medium ${a.isKeyAchievement ? 'text-green-700' : 'text-gray-900'}`}>{a.description}</p>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Hours Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(displayContent.hoursBreakdown).map(([key, value]) => (
                  <div key={key} className="flex justify-between items-center text-sm">
                    <span className="capitalize text-gray-600">{key}</span>
                    <span className="font-medium text-gray-900">{value as number}h</span>
                  </div>
                ))}
                <div className="pt-3 mt-3 border-t border-gray-100 flex justify-between items-center font-bold">
                  <span>Total</span>
                  <span className="text-blue-600">{totalHours}h</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {(displayContent.notes || displayContent.links) && (
            <Card>
              <CardHeader>
                <CardTitle>Additional Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {displayContent.notes && (
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase">Notes</p>
                    <p className="text-sm text-gray-700 mt-1">{displayContent.notes}</p>
                  </div>
                )}
                {displayContent.links && (
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase">Links</p>
                    <a href={displayContent.links} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline mt-1 block truncate">
                      {displayContent.links}
                    </a>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {report.versions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Version History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-200 before:to-transparent">
                  <button 
                    onClick={() => setSelectedVersion(null)}
                    className={`relative flex items-center justify-between w-full p-2 rounded-md transition-colors ${selectedVersion === null ? 'bg-blue-50 border border-blue-200' : 'hover:bg-gray-50 border border-transparent'}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`h-2 w-2 rounded-full ${selectedVersion === null ? 'bg-blue-600' : 'bg-gray-300'}`} />
                      <div className="text-left">
                        <p className={`text-sm font-medium ${selectedVersion === null ? 'text-blue-900' : 'text-gray-900'}`}>Current Version</p>
                        <p className="text-xs text-gray-500">{formatDate(report.updatedAt, 'MMM d, HH:mm')}</p>
                      </div>
                    </div>
                  </button>
                  
                  {report.versions.map((v) => (
                    <button 
                      key={v.version}
                      onClick={() => setSelectedVersion(v.version)}
                      className={`relative flex items-center justify-between w-full p-2 rounded-md transition-colors ${selectedVersion === v.version ? 'bg-blue-50 border border-blue-200' : 'hover:bg-gray-50 border border-transparent'}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`h-2 w-2 rounded-full ${selectedVersion === v.version ? 'bg-blue-600' : 'bg-gray-300'}`} />
                        <div className="text-left">
                          <p className={`text-sm font-medium ${selectedVersion === v.version ? 'text-blue-900' : 'text-gray-900'}`}>Version {v.version}</p>
                          <p className="text-xs text-gray-500">{formatDate(v.submittedAt, 'MMM d, HH:mm', 'Not submitted yet')}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
