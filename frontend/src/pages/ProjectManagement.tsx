import * as React from 'react';
import { useProjectStore, useAuthStore } from '../store';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';
import { Label } from '../components/ui/Label';
import { Select } from '../components/ui/Select';
import { Plus, Edit2, Trash2, X } from 'lucide-react';
import { useToast } from '../components/ui/Toast';
import type { Project, ProjectStatus } from '../types';

type ProjectForm = { name: string; description: string; category: string; status: ProjectStatus };
const emptyForm: ProjectForm = { name: '', description: '', category: 'Project', status: 'active' };

export const ProjectManagement = () => {
  const { projects, addProject, updateProject, deleteProject } = useProjectStore();
  const { currentUser } = useAuthStore();
  const { addToast } = useToast();
  const [isAdding, setIsAdding] = React.useState(false);
  const [editingProject, setEditingProject] = React.useState<Project | null>(null);
  const [form, setForm] = React.useState<ProjectForm>(emptyForm);
  const [saving, setSaving] = React.useState(false);
  const [deletingId, setDeletingId] = React.useState<string | null>(null);

  if (currentUser?.role !== 'manager') return <div className="p-8 text-center text-red-500">Unauthorized</div>;

  const openAdd = () => {
    setEditingProject(null);
    setForm(emptyForm);
    setIsAdding(true);
  };

  const openEdit = (project: Project) => {
    setIsAdding(false);
    setEditingProject(project);
    setForm({ name: project.name, description: project.description, category: project.category || 'Project', status: project.status });
  };

  const closeForm = () => {
    if (saving) return;
    setIsAdding(false);
    setEditingProject(null);
    setForm(emptyForm);
  };

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.name.trim()) {
      addToast('Project name is required.', 'error');
      return;
    }
    setSaving(true);
    try {
      if (editingProject) {
        await updateProject(editingProject.id, { ...form, name: form.name.trim(), description: form.description.trim() });
        addToast('Project updated successfully.', 'success');
      } else {
        await addProject({ ...form, name: form.name.trim(), description: form.description.trim() });
        addToast('Project created successfully.', 'success');
      }
      setIsAdding(false);
      setEditingProject(null);
      setForm(emptyForm);
    } catch (error) {
      addToast(error instanceof Error ? error.message : 'Could not save the project.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (project: Project) => {
    if (!window.confirm(`Delete ${project.name}? Projects with reports cannot be deleted.`)) return;
    setDeletingId(project.id);
    try {
      await deleteProject(project.id);
      addToast('Project deleted.', 'success');
    } catch (error) {
      addToast(error instanceof Error ? error.message : 'Could not delete the project.', 'error');
    } finally {
      setDeletingId(null);
    }
  };

  const formVisible = isAdding || editingProject !== null;

  return (
    <div className="w-full max-w-[1280px] mx-auto space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-[28px] font-semibold tracking-[-0.035em] text-stone-900">Projects</h1>
          <p className="mt-1.5 text-sm text-stone-500">Manage projects used to categorize weekly reports.</p>
        </div>
        <Button onClick={openAdd}><Plus className="mr-2 h-4 w-4" /> Add project</Button>
      </div>

      {formVisible && <Card className="border-[#cbded5]">
        <CardHeader className="flex-row items-start justify-between">
          <div><CardTitle>{editingProject ? 'Edit project' : 'Create project'}</CardTitle>
            <p className="mt-1.5 text-sm text-stone-500">{editingProject ? 'Update the project details and availability.' : 'Add a project for weekly report categorization.'}</p>
          </div>
          <button onClick={closeForm} className="rounded-md p-1 text-stone-400 hover:bg-stone-100" aria-label="Close"><X className="h-5 w-5" /></button>
        </CardHeader>
        <CardContent>
          <form onSubmit={save} className="space-y-5">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2"><Label htmlFor="project-name">Project name</Label><Input id="project-name" value={form.name} onChange={e => setForm(v => ({ ...v, name: e.target.value }))} autoFocus required /></div>
              <div className="space-y-2"><Label htmlFor="project-status">Status</Label><Select id="project-status" value={form.status} onChange={e => setForm(v => ({ ...v, status: e.target.value as ProjectStatus }))}><option value="active">Active</option><option value="completed">Completed</option></Select></div>
              <div className="space-y-2 md:col-span-2"><Label htmlFor="project-description">Description</Label><Input id="project-description" value={form.description} onChange={e => setForm(v => ({ ...v, description: e.target.value }))} placeholder="Short project description" /></div>
            </div>
            <div className="flex justify-end gap-2 border-t border-stone-100 pt-5"><Button type="button" variant="ghost" onClick={closeForm}>Cancel</Button><Button type="submit" disabled={saving}>{saving ? 'Saving...' : editingProject ? 'Save changes' : 'Create project'}</Button></div>
          </form>
        </CardContent>
      </Card>}

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-stone-200 bg-stone-50 text-xs uppercase text-stone-500">
              <tr><th className="px-3 py-3 sm:px-6">Project</th><th className="px-3 py-3 sm:px-6">Description</th><th className="px-3 py-3 sm:px-6">Status</th><th className="px-3 py-3 text-right sm:px-6">Actions</th></tr>
            </thead>
            <tbody>
              {projects.map(project => <tr key={project.id} className="border-b border-stone-100 bg-white hover:bg-stone-50/70">
                <td className="px-3 py-4 font-medium text-stone-900 sm:px-6">{project.name}</td>
                <td className="px-3 py-4 text-stone-500 sm:px-6">{project.description || '-'}</td>
                <td className="px-3 py-4 sm:px-6"><Badge variant={project.status === 'active' ? 'success' : 'secondary'}>{project.status}</Badge></td>
                <td className="px-3 py-4 sm:px-6"><div className="flex justify-end gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-stone-500" onClick={() => openEdit(project)} title="Edit project"><Edit2 className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:bg-red-50 hover:text-red-700" disabled={deletingId === project.id} onClick={() => remove(project)} title="Delete project"><Trash2 className="h-4 w-4" /></Button>
                </div></td>
              </tr>)}
              {projects.length === 0 && <tr><td colSpan={4} className="px-3 py-10 text-center text-stone-500 sm:px-6">No projects found.</td></tr>}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
