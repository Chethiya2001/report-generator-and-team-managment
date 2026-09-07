import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Activity } from '../types';
import { seedActivities } from '../data/seedData';

interface ActivityState {
  activities: Activity[];
  isInitialized: boolean;
  initialize: () => void;
  addActivity: (activity: Omit<Activity, 'id' | 'timestamp'>) => void;
}

export const useActivityStore = create<ActivityState>()(
  persist(
    (set, get) => ({
      activities: [],
      isInitialized: false,
      initialize: () => {
        if (!get().isInitialized) {
          set({ activities: seedActivities, isInitialized: true });
        }
      },
      addActivity: (activityData) => {
        const newActivity: Activity = {
          ...activityData,
          id: `act-${Date.now()}`,
          timestamp: new Date().toISOString(),
        };
        set((state) => ({ activities: [newActivity, ...state.activities] })); // Prepend for timeline
      },
    }),
    {
      name: 'teampulse-activity-storage',
    }
  )
);
