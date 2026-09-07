import * as React from 'react';
import { useAuthStore, resetDemoData } from '../store';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Label } from '../components/ui/Label';
import { Select } from '../components/ui/Select';
import { RefreshCw, User as UserIcon } from 'lucide-react';
import { useToast } from '../components/ui/Toast';

export const Settings = () => {
  const { currentUser } = useAuthStore();
  const { addToast } = useToast();

  const handleSave = () => {
    addToast('Settings saved successfully (simulated).', 'success');
  };

  const handleResetData = () => {
    if (confirm('Are you sure you want to reset all demo data? This will reload the page and restore original seed data.')) {
      resetDemoData();
    }
  };

  return (
    <div className="w-full max-w-[1280px] mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Settings</h1>
        <p className="text-gray-500 mt-1">Manage your application preferences and profile.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4 mb-4">
                <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-700">
                  <UserIcon className="h-8 w-8" />
                </div>
                <Button variant="outline" size="sm">Change Avatar</Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" defaultValue={currentUser?.name || ''} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input id="email" defaultValue={currentUser?.email || ''} readOnly className="bg-gray-50" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Input id="role" defaultValue={currentUser?.role.replace('_', ' ') || ''} readOnly className="bg-gray-50 capitalize" />
                </div>
              </div>
              <div className="pt-4 flex justify-end">
                <Button onClick={handleSave}>Save Profile</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Application Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="weekStart">Week Starts On</Label>
                  <Select id="weekStart" defaultValue="1">
                    <option value="0">Sunday</option>
                    <option value="1">Monday</option>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dateFormat">Date Format</Label>
                  <Select id="dateFormat" defaultValue="MMM d, yyyy">
                    <option value="MMM d, yyyy">Aug 31, 2026</option>
                    <option value="MM/dd/yyyy">08/31/2026</option>
                    <option value="dd/MM/yyyy">31/08/2026</option>
                  </Select>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="notifications">Email Notifications</Label>
                  <Select id="notifications" defaultValue="all">
                    <option value="all">All notifications (Mentions, Reminders, Approvals)</option>
                    <option value="important">Important only (Approvals, Rejections)</option>
                    <option value="none">None</option>
                  </Select>
                </div>
              </div>
              <div className="pt-4 flex justify-end">
                <Button onClick={handleSave}>Save Preferences</Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-red-200">
            <CardHeader className="bg-red-50/50 pb-4">
              <CardTitle className="text-red-700">Developer Tools</CardTitle>
              <CardDescription className="text-red-600/80">Demo environment only</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <p className="text-sm text-gray-600 mb-4">
                Reset the local storage database to the original seed data state. This will erase all user-created content.
              </p>
              <Button variant="destructive" className="w-full flex items-center justify-center gap-2" onClick={handleResetData}>
                <RefreshCw className="h-4 w-4" /> Reset Demo Data
              </Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>About App</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-gray-600 space-y-2">
                <p><strong>Name:</strong> TeamPulse</p>
                <p><strong>Version:</strong> 1.0.0 (Demo)</p>
                <p><strong>Architecture:</strong> Frontend-only, Zustand LocalStorage</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
