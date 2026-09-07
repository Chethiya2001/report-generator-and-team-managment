import * as React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useReportStore, useAuthStore, useUserStore } from '../store';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Textarea } from '../components/ui/Textarea';
import { Label } from '../components/ui/Label';
import { useToast } from '../components/ui/Toast';
import { ArrowLeft, Check, X } from 'lucide-react';

export const ReviewPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { reports, approveReport, requestCorrection } = useReportStore();
  const { currentUser } = useAuthStore();
  const { users } = useUserStore();
  const { addToast } = useToast();

  const [comment, setComment] = React.useState('');
  const [isRejecting, setIsRejecting] = React.useState(false);

  const report = reports.find(r => r.id === id);

  if (!report) {
    return <div className="p-8 text-center text-gray-500">Report not found</div>;
  }

  const employee = users.find(u => u.id === report.userId);

  if (currentUser?.role !== 'manager') {
    return <div className="p-8 text-center text-red-500">Unauthorized</div>;
  }

  if (report.status !== 'Submitted') {
    return (
      <div className="max-w-3xl mx-auto py-12 text-center">
        <h2 className="text-xl font-semibold mb-2">Review Not Possible</h2>
        <p className="text-gray-500 mb-6">This report is currently in {report.status} status and cannot be reviewed.</p>
        <Button onClick={() => navigate(`/reports/${report.id}`)}>View Report</Button>
      </div>
    );
  }

  const handleApprove = async () => {
    if (!currentUser) return;
    await approveReport(report.id, currentUser.id);
    addToast('Report approved successfully.', 'success');
    navigate('/dashboard');
  };

  const handleRequestCorrection = async () => {
    if (!comment.trim()) {
      addToast('Please provide a comment explaining what needs to be corrected.', 'error');
      return;
    }
    if (!currentUser) return;
    
    await requestCorrection(report.id, currentUser.id, comment);
    addToast('Changes requested successfully.', 'success');
    navigate('/dashboard');
  };

  return (
    <div className="w-full max-w-[1280px] mx-auto space-y-6 pb-12">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Review Report
          </h1>
          <p className="text-gray-500 mt-1">
            Submitted by {employee?.name}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Manager Review Panel</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex gap-4">
            <Button 
              className={`flex-1 flex items-center justify-center gap-2 ${!isRejecting ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-gray-200'}`}
              onClick={handleApprove}
              disabled={isRejecting}
            >
              <Check className="h-4 w-4" /> Approve Report
            </Button>
            <Button 
              variant="outline"
              className={`flex-1 flex items-center justify-center gap-2 ${isRejecting ? 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100' : ''}`}
              onClick={() => setIsRejecting(!isRejecting)}
            >
              <X className="h-4 w-4" /> Request Changes
            </Button>
          </div>

          {isRejecting && (
            <div className="space-y-4 pt-4 border-t border-gray-100 animate-in slide-in-from-top-2">
              <div className="space-y-2">
                <Label htmlFor="comment">Explain what needs to be corrected</Label>
                <Textarea 
                  id="comment"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Please provide clear instructions on what needs to be fixed..."
                  className="min-h-[100px]"
                />
              </div>
              <div className="flex justify-end gap-3">
                <Button variant="ghost" onClick={() => setIsRejecting(false)}>Cancel</Button>
                <Button variant="destructive" onClick={handleRequestCorrection}>
                  Send Back for Correction
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="mt-8">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Report Summary</h3>
        <Card>
          <CardContent className="p-0">
            <div className="grid grid-cols-2 divide-x divide-gray-100 border-b border-gray-100">
              <div className="p-4 text-center">
                <p className="text-sm font-medium text-gray-500">Tasks Completed</p>
                <p className="text-2xl font-semibold mt-1 text-gray-900">{report.tasksCompleted.length}</p>
              </div>
              <div className="p-4 text-center">
                <p className="text-sm font-medium text-gray-500">Total Hours</p>
                <p className="text-2xl font-semibold mt-1 text-gray-900">
                  {Object.values(report.hoursBreakdown).reduce((a, b) => a + b, 0)}h
                </p>
              </div>
            </div>
            <div className="p-4 flex justify-center">
              <Button variant="outline" onClick={() => navigate(`/reports/${report.id}`)} className="w-full">
                View Full Report Details
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

