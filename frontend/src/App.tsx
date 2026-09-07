import * as React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { ToastProvider } from './components/ui/Toast';
import { initializeStores } from './store';
import { Login } from './pages/Login';

import { ManagerDashboard } from './pages/ManagerDashboard';
import { TeamMemberDashboard } from './pages/TeamMemberDashboard';
import { ReportForm } from './pages/ReportForm';
import { ReportHistory } from './pages/ReportHistory';
import { ReportDetail } from './pages/ReportDetail';
import { ReviewPage } from './pages/ReviewPage';
import { ProjectManagement } from './pages/ProjectManagement';
import { UserManagement } from './pages/UserManagement';
import { TeamMemberProfile } from './pages/TeamMemberProfile';
import { Settings } from './pages/Settings';

function App() {
  React.useEffect(() => {
    initializeStores();
  }, []);

  return (
    <ToastProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route element={<AppLayout />}>
            {/* Common Protected Routes */}
            <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
            <Route path="/reports/:id" element={<ProtectedRoute><ReportDetail /></ProtectedRoute>} />

            {/* Manager Routes */}
            <Route path="/dashboard" element={<ProtectedRoute allowedRoles={['manager']}><ManagerDashboard /></ProtectedRoute>} />
            <Route path="/team" element={<ProtectedRoute allowedRoles={['manager']}><UserManagement /></ProtectedRoute>} />
            <Route path="/team/:userId" element={<ProtectedRoute allowedRoles={['manager']}><TeamMemberProfile /></ProtectedRoute>} />
            <Route path="/review/:id" element={<ProtectedRoute allowedRoles={['manager']}><ReviewPage /></ProtectedRoute>} />
            <Route path="/projects" element={<ProtectedRoute allowedRoles={['manager']}><ProjectManagement /></ProtectedRoute>} />
            <Route path="/users" element={<ProtectedRoute allowedRoles={['manager']}><UserManagement /></ProtectedRoute>} />

            {/* Team Member Routes */}
            <Route path="/my-dashboard" element={<ProtectedRoute allowedRoles={['team_member']}><TeamMemberDashboard /></ProtectedRoute>} />
            <Route path="/my-reports" element={<ProtectedRoute allowedRoles={['team_member']}><ReportHistory /></ProtectedRoute>} />
            <Route path="/reports/new" element={<ProtectedRoute allowedRoles={['team_member']}><ReportForm /></ProtectedRoute>} />
            <Route path="/reports/:id/edit" element={<ProtectedRoute allowedRoles={['team_member']}><ReportForm /></ProtectedRoute>} />
            
            {/* Default redirect */}
            <Route path="/" element={<ProtectedRoute><Navigate to="/login" replace /></ProtectedRoute>} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  );
}

export default App;
