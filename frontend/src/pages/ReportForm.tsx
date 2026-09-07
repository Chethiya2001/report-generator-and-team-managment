import * as React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Plus, Trash2, Save, Send } from 'lucide-react';
import { startOfWeek, endOfWeek, format, subWeeks } from 'date-fns';

import { useAuthStore, useReportStore, useProjectStore } from '../store';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Label } from '../components/ui/Label';
import { Select } from '../components/ui/Select';
import { Textarea } from '../components/ui/Textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { useToast } from '../components/ui/Toast';

const taskSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Task name is required'),
  priority: z.enum(['Low', 'Medium', 'High', 'Critical']),
  plannedPercentage: z.number().min(0).max(100),
  actualPercentage: z.number().min(0).max(100),
  status: z.enum(['Not Started', 'In Progress', 'Completed', 'Blocked']),
  timePlanned: z.number().min(0),
  timeSpent: z.number().min(0),
  deliverable: z.string(),
});

const blockerSchema = z.object({
  id: z.string(),
  description: z.string().min(1, 'Description required'),
  severity: z.enum(['Low', 'Medium', 'High']),
  isKeyIssue: z.boolean(),
});

const achievementSchema = z.object({
  id: z.string(),
  description: z.string().min(1, 'Description required'),
  isKeyAchievement: z.boolean(),
});

const formSchema = z.object({
  weekStart: z.string().min(1, 'Week is required'),
  projectId: z.string().min(1, 'Project is required'),
  tasksCompleted: z.array(taskSchema).min(1, 'At least one task is required'),
  tasksPlanned: z.string(),
  blockers: z.array(blockerSchema),
  achievements: z.array(achievementSchema),
  hoursBreakdown: z.object({
    development: z.number().min(0),
    testing: z.number().min(0),
    meetings: z.number().min(0),
    documentation: z.number().min(0),
    planning: z.number().min(0),
    other: z.number().min(0),
  }),
  notes: z.string(),
  links: z.string(),
});

type FormValues = z.infer<typeof formSchema>;

export const ReportForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { currentUser } = useAuthStore();
  const { reports, createReport, updateReport, submitReport } = useReportStore();
  const { projects } = useProjectStore();

  const isEditMode = !!id;
  const existingReport = isEditMode ? reports.find(r => r.id === id) : null;

  // Generate week options (current week + 4 previous)
  const weekOptions = React.useMemo(() => {
    return Array.from({ length: 5 }).map((_, i) => {
      const start = startOfWeek(subWeeks(new Date(), i), { weekStartsOn: 1 });
      const end = endOfWeek(subWeeks(new Date(), i), { weekStartsOn: 1 });
      return {
        value: format(start, 'yyyy-MM-dd'),
        label: `${format(start, 'MMM d')} - ${format(end, 'MMM d, yyyy')}`
      };
    });
  }, []);

  const { register, control, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: existingReport ? {
      weekStart: existingReport.weekStart,
      projectId: existingReport.projectId,
      tasksCompleted: existingReport.tasksCompleted,
      tasksPlanned: existingReport.tasksPlanned,
      blockers: existingReport.blockers,
      achievements: existingReport.achievements,
      hoursBreakdown: existingReport.hoursBreakdown,
      notes: existingReport.notes,
      links: existingReport.links,
    } : {
      weekStart: weekOptions[0].value,
      projectId: currentUser?.projectId || '',
      tasksCompleted: [{ id: `new-${Date.now()}`, name: '', priority: 'Medium', plannedPercentage: 100, actualPercentage: 0, status: 'In Progress', timePlanned: 0, timeSpent: 0, deliverable: '' }],
      tasksPlanned: '',
      blockers: [],
      achievements: [],
      hoursBreakdown: { development: 0, testing: 0, meetings: 0, documentation: 0, planning: 0, other: 0 },
      notes: '',
      links: '',
    }
  });

  const { fields: taskFields, append: appendTask, remove: removeTask } = useFieldArray({
    control,
    name: 'tasksCompleted'
  });

  const { fields: blockerFields, append: appendBlocker, remove: removeBlocker } = useFieldArray({
    control,
    name: 'blockers'
  });

  const { fields: achievementFields, append: appendAchievement, remove: removeAchievement } = useFieldArray({
    control,
    name: 'achievements'
  });

  const hours = watch('hoursBreakdown');
  const totalHours = Object.values(hours).reduce((a, b) => (Number(a) || 0) + (Number(b) || 0), 0);

  // Handle single key issue / achievement
  const handleKeyIssueChange = (index: number) => {
    const blockers = watch('blockers');
    blockers.forEach((_, i) => {
      setValue(`blockers.${i}.isKeyIssue`, i === index);
    });
  };

  const handleKeyAchievementChange = (index: number) => {
    const achievements = watch('achievements');
    achievements.forEach((_, i) => {
      setValue(`achievements.${i}.isKeyAchievement`, i === index);
    });
  };

  const onSubmit = async (data: FormValues, status: 'Draft' | 'Submitted') => {
    if (!currentUser) return;

    try {
      if (!isEditMode) {
        const duplicate = reports.find(report =>
          report.userId === currentUser.id &&
          report.projectId === data.projectId &&
          report.weekStart === data.weekStart
        );

        if (duplicate) {
          const canEdit = duplicate.status === 'Draft' || duplicate.status === 'Needs Correction';
          addToast(
            canEdit
              ? 'A report already exists for this project and week. Opening it now.'
              : "This week's report is already " + duplicate.status.toLowerCase() + '.',
            canEdit ? 'info' : 'error'
          );
          navigate(canEdit ? `/reports/${duplicate.id}/edit` : `/reports/${duplicate.id}`);
          return;
        }
      }

      const weekEnd = format(endOfWeek(new Date(data.weekStart), { weekStartsOn: 1 }), 'yyyy-MM-dd');
      
      let reportId = id;
      
      if (isEditMode && reportId) {
        await updateReport(reportId, {
          ...data,
          weekEnd,
          status: status === 'Submitted' ? 'Draft' : 'Draft', // Will be upgraded by submitReport if needed
        });
      } else {
        reportId = await createReport({
          ...data,
          userId: currentUser.id,
          weekEnd,
          status: 'Draft',
        });
      }

      if (status === 'Submitted' && reportId) {
        await submitReport(reportId);
        addToast('Report submitted successfully for review.', 'success');
      } else {
        addToast('Draft saved successfully.', 'success');
      }

      navigate('/my-dashboard');
    } catch (error) {
      addToast(error instanceof Error ? error.message : 'An error occurred while saving the report.', 'error');
    }
  };

  if (isEditMode && existingReport?.status !== 'Draft' && existingReport?.status !== 'Needs Correction') {
    return (
      <div className="max-w-4xl mx-auto py-12 text-center">
        <h2 className="text-xl font-semibold mb-2">Cannot Edit Report</h2>
        <p className="text-gray-500 mb-6">This report has already been submitted or approved.</p>
        <Button onClick={() => navigate('/my-reports')}>Back to Reports</Button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1280px] mx-auto space-y-6 pb-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">
          {isEditMode ? 'Edit Weekly Report' : 'New Weekly Report'}
        </h1>
        <p className="text-gray-500 mt-1">Fill out your progress for the week.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="min-w-0 space-y-2">
          <Label htmlFor="weekStart">Week Of</Label>
          <Select id="weekStart" {...register('weekStart')}>
            {weekOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </Select>
          {errors.weekStart && <p className="text-xs text-red-500">{errors.weekStart.message}</p>}
        </div>
        <div className="min-w-0 space-y-2">
          <Label htmlFor="projectId">Project / Category</Label>
          <Select id="projectId" {...register('projectId')}>
            <option value="">Select Project</option>
            {projects.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </Select>
          {errors.projectId && <p className="text-xs text-red-500">{errors.projectId.message}</p>}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>1. Tasks Completed</CardTitle>
          <CardDescription>Log the tasks you worked on this week.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {errors.tasksCompleted?.message && (
            <p className="text-sm font-medium text-red-500">{errors.tasksCompleted.message}</p>
          )}
          
          <div className="overflow-x-auto pb-4">
            <table className="w-full min-w-[800px] text-sm text-left">
              <thead className="text-xs text-gray-500 uppercase bg-gray-50">
                <tr>
                  <th className="px-3 py-2 w-1/4">Task Name</th>
                  <th className="px-3 py-2 w-[100px]">Priority</th>
                  <th className="px-3 py-2 w-[80px]">Plan %</th>
                  <th className="px-3 py-2 w-[80px]">Act %</th>
                  <th className="px-3 py-2 w-[120px]">Status</th>
                  <th className="px-3 py-2 w-[80px]">Hrs Plan</th>
                  <th className="px-3 py-2 w-[80px]">Hrs Spt</th>
                  <th className="px-3 py-2">Deliverable</th>
                  <th className="px-3 py-2 w-[50px]"></th>
                </tr>
              </thead>
              <tbody>
                {taskFields.map((field, index) => (
                  <tr key={field.id} className="border-b border-gray-100">
                    <td className="px-2 py-2">
                      <Input {...register(`tasksCompleted.${index}.name`)} placeholder="Task" className="h-8" />
                    </td>
                    <td className="px-2 py-2">
                      <Select {...register(`tasksCompleted.${index}.priority`)} className="h-8 py-1">
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                        <option value="Critical">Critical</option>
                      </Select>
                    </td>
                    <td className="px-2 py-2">
                      <Input type="number" {...register(`tasksCompleted.${index}.plannedPercentage`, { valueAsNumber: true })} className="h-8" />
                    </td>
                    <td className="px-2 py-2">
                      <Input type="number" {...register(`tasksCompleted.${index}.actualPercentage`, { valueAsNumber: true })} className="h-8" />
                    </td>
                    <td className="px-2 py-2">
                      <Select {...register(`tasksCompleted.${index}.status`)} className="h-8 py-1">
                        <option value="Not Started">Not Started</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Completed">Completed</option>
                        <option value="Blocked">Blocked</option>
                      </Select>
                    </td>
                    <td className="px-2 py-2">
                      <Input type="number" {...register(`tasksCompleted.${index}.timePlanned`, { valueAsNumber: true })} className="h-8" />
                    </td>
                    <td className="px-2 py-2">
                      <Input type="number" {...register(`tasksCompleted.${index}.timeSpent`, { valueAsNumber: true })} className="h-8" />
                    </td>
                    <td className="px-2 py-2">
                      <Input {...register(`tasksCompleted.${index}.deliverable`)} placeholder="Link/Item" className="h-8" />
                    </td>
                    <td className="px-2 py-2 text-right">
                      <Button variant="ghost" size="icon" type="button" onClick={() => removeTask(index)} className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Button 
            type="button" 
            variant="outline" 
            size="sm" 
            onClick={() => appendTask({ id: `new-${Date.now()}`, name: '', priority: 'Medium', plannedPercentage: 100, actualPercentage: 0, status: 'In Progress', timePlanned: 0, timeSpent: 0, deliverable: '' })}
            className="flex w-full items-center gap-2 whitespace-nowrap sm:w-auto"
          >
            <Plus className="h-4 w-4" /> Add Task
          </Button>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>2. Tasks Planned for Next Week</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea 
              {...register('tasksPlanned')} 
              placeholder="What do you plan to accomplish next week?"
              className="min-h-[150px]"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>5. Hours Worked</CardTitle>
            <CardDescription>Breakdown of your time.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label className="text-xs">Development</Label>
                <Input type="number" {...register('hoursBreakdown.development', { valueAsNumber: true })} className="h-8" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Testing</Label>
                <Input type="number" {...register('hoursBreakdown.testing', { valueAsNumber: true })} className="h-8" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Meetings</Label>
                <Input type="number" {...register('hoursBreakdown.meetings', { valueAsNumber: true })} className="h-8" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Documentation</Label>
                <Input type="number" {...register('hoursBreakdown.documentation', { valueAsNumber: true })} className="h-8" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Planning</Label>
                <Input type="number" {...register('hoursBreakdown.planning', { valueAsNumber: true })} className="h-8" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Other</Label>
                <Input type="number" {...register('hoursBreakdown.other', { valueAsNumber: true })} className="h-8" />
              </div>
            </div>
            <div className="mt-6 p-3 bg-gray-50 rounded-md border border-gray-200 flex justify-between items-center">
              <span className="font-medium text-gray-700">Total Hours</span>
              <span className="text-xl font-bold text-blue-600">{totalHours}h</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>3. Blockers / Challenges</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {blockerFields.map((field, index) => (
              <div key={field.id} className="p-3 bg-gray-50 border border-gray-200 rounded-md space-y-3 relative">
                <Button 
                  variant="ghost" size="icon" type="button" 
                  onClick={() => removeBlocker(index)} 
                  className="absolute top-2 right-2 h-6 w-6 text-gray-400 hover:text-red-500"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
                <div>
                  <Input {...register(`blockers.${index}.description`)} placeholder="Describe blocker..." className="h-8 mb-2" />
                  <div className="flex items-center gap-4">
                    <Select {...register(`blockers.${index}.severity`)} className="h-8 py-1 w-32">
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                    </Select>
                    <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                      <input 
                        type="checkbox" 
                        {...register(`blockers.${index}.isKeyIssue`)} 
                        onChange={() => handleKeyIssueChange(index)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      Key Issue
                    </label>
                  </div>
                </div>
              </div>
            ))}
            <Button 
              type="button" variant="outline" size="sm" 
              onClick={() => appendBlocker({ id: `b-${Date.now()}`, description: '', severity: 'Medium', isKeyIssue: false })}
            >
              Add Blocker
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>4. Achievements</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {achievementFields.map((field, index) => (
              <div key={field.id} className="p-3 bg-gray-50 border border-gray-200 rounded-md space-y-3 relative">
                <Button 
                  variant="ghost" size="icon" type="button" 
                  onClick={() => removeAchievement(index)} 
                  className="absolute top-2 right-2 h-6 w-6 text-gray-400 hover:text-red-500"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
                <div>
                  <Input {...register(`achievements.${index}.description`)} placeholder="Describe achievement..." className="h-8 mb-2" />
                  <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                    <input 
                      type="checkbox" 
                      {...register(`achievements.${index}.isKeyAchievement`)} 
                      onChange={() => handleKeyAchievementChange(index)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    Key Achievement
                  </label>
                </div>
              </div>
            ))}
            <Button 
              type="button" variant="outline" size="sm" 
              onClick={() => appendAchievement({ id: `a-${Date.now()}`, description: '', isKeyAchievement: false })}
            >
              Add Achievement
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>6. Notes / Links</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Notes (Optional)</Label>
            <Textarea {...register('notes')} placeholder="Any additional notes or context..." />
          </div>
          <div className="space-y-2">
            <Label>Links (Optional)</Label>
            <Input {...register('links')} placeholder="Jira, PR links, docs, etc." />
          </div>
        </CardContent>
      </Card>

      <div className="sticky bottom-3 z-20 mt-8 rounded-lg border border-stone-200 bg-white/95 px-3 py-3 shadow-[0_8px_30px_rgba(28,25,23,0.10)] backdrop-blur sm:px-4 flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
        <Button className="w-full sm:w-auto" variant="ghost" type="button" onClick={() => navigate('/my-dashboard')}>Cancel</Button>
        <div className="grid w-full grid-cols-1 gap-2 min-[430px]:grid-cols-2 sm:flex sm:w-auto sm:gap-3">
          <Button 
            variant="outline" 
            type="button" 
            onClick={handleSubmit((d) => onSubmit(d, 'Draft'))}
            className="flex w-full items-center gap-2 whitespace-nowrap sm:w-auto"
          >
            <Save className="h-4 w-4" /> Save Draft
          </Button>
          <Button 
            type="button"
            onClick={handleSubmit((d) => onSubmit(d, 'Submitted'))}
            className="flex w-full items-center gap-2 whitespace-nowrap sm:w-auto"
          >
            <Send className="h-4 w-4" /> Submit for Review
          </Button>
        </div>
      </div>
    </div>
  );
};

