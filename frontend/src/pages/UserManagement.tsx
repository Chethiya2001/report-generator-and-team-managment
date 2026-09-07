import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserStore, useProjectStore, useAuthStore, useReportStore } from '../store';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';
import { Label } from '../components/ui/Label';
import { Select } from '../components/ui/Select';
import { useToast } from '../components/ui/Toast';
import { User as UserIcon, Plus, X } from 'lucide-react';
import type { Role } from '../types';

export const UserManagement = () => {
  const { users, addUser, deactivateUser } = useUserStore();
  const { projects } = useProjectStore();
  const { reports } = useReportStore();
  const { currentUser } = useAuthStore();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [open, setOpen] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [deactivatingId, setDeactivatingId] = React.useState<string | null>(null);
  const [form, setForm] = React.useState({
    name: '', email: '', role: 'team_member' as Role, projectId: '', password: ''
  });

  if (currentUser?.role !== 'manager') {
    return <div className="p-8 text-center text-red-500">Unauthorized</div>;
  }

  const close = () => {
    if (saving) return;
    setOpen(false);
    setForm({ name: '', email: '', role: 'team_member', projectId: '', password: '' });
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.name.trim() || !form.email.trim()) {
      addToast('Name and email are required.', 'error');
      return;
    }
    if (form.password.length < 8) {
      addToast('Password must be at least 8 characters.', 'error');
      return;
    }

    setSaving(true);
    try {
      await addUser({
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        role: form.role,
        projectId: form.projectId || undefined,
        active: true,
        password: form.password
      });
      addToast('Team member added successfully.', 'success');
      close();
    } catch (error) {
      addToast(error instanceof Error ? error.message : 'Could not add the team member.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const deactivate = async (id: string, name: string) => {
    if (!window.confirm(`Deactivate ${name}? They will no longer be able to sign in, but their reports will be preserved.`)) return;
    setDeactivatingId(id);
    try {
      await deactivateUser(id);
      addToast(`${name} has been deactivated.`, 'success');
    } catch (error) {
      addToast(error instanceof Error ? error.message : 'Could not deactivate this member.', 'error');
    } finally {
      setDeactivatingId(null);
    }
  };

  return (
    <div className="w-full max-w-[1280px] mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-[28px] font-semibold tracking-[-0.035em] text-stone-900">Team Members</h1>
          <p className="text-sm text-stone-500 mt-1.5">Manage access, roles, and project assignments.</p>
        </div>
        <Button onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4 mr-2" /> Add member
        </Button>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-stone-500 uppercase bg-stone-50 border-b border-stone-200">
              <tr>
                <th className="px-3 py-3 sm:px-6">Member</th><th className="px-3 py-3 sm:px-6">Role</th>
                <th className="px-3 py-3 sm:px-6">Project</th><th className="px-3 py-3 sm:px-6 text-center">Reports</th>
                <th className="px-3 py-3 sm:px-6">Status</th><th className="px-3 py-3 sm:px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => {
                const project = projects.find(p => p.id === user.projectId);
                const reportCount = reports.filter(r => r.userId === user.id).length;
                return <tr key={user.id} className="bg-white border-b border-stone-100 hover:bg-stone-50/70">
                  <td className="px-3 py-4 sm:px-6"><div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-md bg-[#e2eee8] flex items-center justify-center text-[#356b58] shrink-0"><UserIcon className="h-4 w-4" /></div>
                    <div><p className="font-medium text-stone-900">{user.name}</p><p className="text-xs text-stone-500">{user.email}</p></div>
                  </div></td>
                  <td className="px-3 py-4 sm:px-6 capitalize">{user.role.replace('_', ' ')}</td>
                  <td className="px-3 py-4 sm:px-6 text-stone-500">{project?.name || '-'}</td>
                  <td className="px-3 py-4 sm:px-6 text-center font-medium">{reportCount}</td>
                  <td className="px-3 py-4 sm:px-6">{user.active ? <Badge variant="success">Active</Badge> : <Badge variant="secondary">Inactive</Badge>}</td>
                  <td className="px-3 py-4 sm:px-6 text-right">
                    {user.role !== 'manager' && <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="sm" onClick={() => navigate(`/team/${user.id}`)}>View profile</Button>
                      {user.active && <Button variant="ghost" size="sm" className="text-red-600 hover:bg-red-50 hover:text-red-700" disabled={deactivatingId === user.id} onClick={() => deactivate(user.id, user.name)}>
                        {deactivatingId === user.id ? 'Deactivating...' : 'Deactivate'}
                      </Button>}
                    </div>}
                  </td>
                </tr>;
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {open && <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/40 p-4" onMouseDown={e => e.target === e.currentTarget && close()}>
        <Card className="w-full max-w-lg shadow-2xl">
          <div className="flex items-start justify-between border-b border-stone-200 px-6 py-5">
            <div><h2 className="text-lg font-semibold text-stone-900">Add team member</h2><p className="mt-1 text-sm text-stone-500">Create login access and assign their initial role.</p></div>
            <button onClick={close} className="rounded-md p-1 text-stone-400 hover:bg-stone-100 hover:text-stone-700" aria-label="Close"><X className="h-5 w-5" /></button>
          </div>
          <form onSubmit={submit} className="space-y-5 p-6">
            <div className="space-y-2"><Label htmlFor="member-name">Full name</Label><Input id="member-name" value={form.name} onChange={e => setForm(v => ({...v, name:e.target.value}))} placeholder="e.g. Nimal Perera" autoFocus required /></div>
            <div className="space-y-2"><Label htmlFor="member-email">Work email</Label><Input id="member-email" type="email" value={form.email} onChange={e => setForm(v => ({...v, email:e.target.value}))} placeholder="name@company.com" required /></div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2"><Label htmlFor="member-role">Role</Label><Select id="member-role" value={form.role} onChange={e => setForm(v => ({...v, role:e.target.value as Role}))}><option value="team_member">Team member</option><option value="manager">Manager</option></Select></div>
              <div className="space-y-2"><Label htmlFor="member-project">Project</Label><Select id="member-project" value={form.projectId} onChange={e => setForm(v => ({...v, projectId:e.target.value}))}><option value="">No project</option>{projects.filter(p => p.status === 'active').map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</Select></div>
            </div>
            <div className="space-y-2"><Label htmlFor="member-password">Temporary password</Label><Input id="member-password" type="password" minLength={8} value={form.password} onChange={e => setForm(v => ({...v, password:e.target.value}))} placeholder="At least 8 characters" required /><p className="text-xs text-stone-500">Share this securely with the new member.</p></div>
            <div className="flex justify-end gap-3 border-t border-stone-100 pt-5"><Button type="button" variant="outline" onClick={close}>Cancel</Button><Button type="submit" disabled={saving}>{saving ? 'Adding&' : 'Add member'}</Button></div>
          </form>
        </Card>
      </div>}
    </div>
  );
};
