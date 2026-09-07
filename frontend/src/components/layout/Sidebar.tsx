import * as React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileText, 
  Clock, 
  Users, 
  Briefcase, 
  Settings, 
  Activity,
  X
} from 'lucide-react';
import { useAuthStore } from '../../store';
import { cn } from '../../lib/utils';

interface SidebarProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ open, setOpen }) => {
  const { currentUser } = useAuthStore();
  const location = useLocation();
  const isManager = currentUser?.role === 'manager';

  const navItems = [
    ...(isManager ? [
      { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
      { name: 'Team', href: '/team', icon: Users },
      { name: 'Projects', href: '/projects', icon: Briefcase },
    ] : [
      { name: 'My Dashboard', href: '/my-dashboard', icon: LayoutDashboard },
      { name: 'New Report', href: '/reports/new', icon: FileText },
      { name: 'My Reports', href: '/my-reports', icon: Clock },
    ]),
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile overlay */}
      <div 
        className={cn(
          "fixed inset-0 z-20 bg-gray-900/50 transition-opacity md:hidden",
          open ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={() => setOpen(false)}
      />

      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-30 w-60 transform bg-[#18352c] border-r border-[#18352c] transition-transform duration-200 ease-in-out md:static md:translate-x-0 flex flex-col",
        open ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex h-[72px] items-center justify-between px-5 border-b border-white/10">
          <div className="flex items-center gap-3 text-[#b9dfce]">
            <img src="/team.png" alt="TeamPulse" className="h-9 w-9 shrink-0 rounded-md object-contain" />
            <span className="text-[17px] font-semibold tracking-[-0.02em] text-white">TeamPulse</span>
          </div>
          <button 
            className="md:hidden text-gray-500 hover:text-gray-700"
            onClick={() => setOpen(false)}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-5 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname.startsWith(item.href) && (item.href !== '/reports/new' || location.pathname === '/reports/new');
            
            return (
              <NavLink
                key={item.name}
                to={item.href}
                className={cn(
                  "group flex items-center rounded-md px-3 py-2.5 text-[13px] font-medium transition-colors",
                  isActive
                    ? "bg-white/12 text-white"
                    : "text-[#c6d6cf] hover:bg-white/7 hover:text-white"
                )}
                onClick={() => setOpen(false)}
              >
                <item.icon
                  className={cn(
                    "mr-3 h-5 w-5 flex-shrink-0 transition-colors",
                    isActive ? "text-[#b9dfce]" : "text-[#78978b] group-hover:text-[#b9dfce]"
                  )}
                  aria-hidden="true"
                />
                {item.name}
              </NavLink>
            );
          })}
        </nav>

        <div className="border-t border-white/10 p-4">
          <div className="flex items-center">
            <div className="ml-3">
              <p className="text-xs font-medium uppercase tracking-[0.14em] text-[#8eaaa0]">Weekly reporting</p>
              <p className="mt-1 text-xs text-[#c6d6cf]">Workspace</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
