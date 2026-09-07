import * as React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useAuthStore } from '../../store';
import { AIAssistant } from '../AIAssistant';

export const AppLayout = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isManager = useAuthStore((state) => state.currentUser?.role === 'manager');
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return (
    <div className="flex h-screen bg-[#f4f3ef] font-sans">
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header setSidebarOpen={setSidebarOpen} />
        <main className="page-enter flex-1 overflow-y-auto px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <Outlet />
        </main>
      </div>
      {isManager && <AIAssistant />}
    </div>
  );
};
