export * from './authStore';
export * from './projectStore';
export * from './userStore';
export * from './activityStore';
export * from './reportStore';

import { useProjectStore } from './projectStore';
import { useUserStore } from './userStore';
import { useActivityStore } from './activityStore';
import { useReportStore } from './reportStore';
import { useAuthStore } from './authStore';

export const initializeStores = () => {
  useProjectStore.getState().initialize();
  useReportStore.getState().initialize();

  // The users endpoint is manager-only. A member's own identity comes from auth.
  if (useAuthStore.getState().currentUser?.role === 'manager') {
    useUserStore.getState().initialize();
    useActivityStore.getState().initialize();
  }
};

export const resetDemoData = () => {
  localStorage.removeItem('teampulse-auth-storage');
  localStorage.removeItem('teampulse-project-storage');
  localStorage.removeItem('teampulse-user-storage');
  localStorage.removeItem('teampulse-activity-storage');
  localStorage.removeItem('teampulse-report-storage');
  window.location.reload();
};
