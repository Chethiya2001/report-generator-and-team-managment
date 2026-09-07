import * as React from 'react';
import { Menu, Bell, User as UserIcon, LogOut } from 'lucide-react';
import { useAuthStore } from '../../store';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/Button';

interface HeaderProps {
  setSidebarOpen: (open: boolean) => void;
}

export const Header: React.FC<HeaderProps> = ({ setSidebarOpen }) => {
  const { currentUser, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="flex h-[72px] shrink-0 items-center justify-between border-b border-stone-200/80 bg-[#f8f7f4]/90 px-4 backdrop-blur sm:px-6 lg:px-8">
      <div className="flex items-center gap-4">
        <button
          className="md:hidden text-gray-500 hover:text-gray-700"
          onClick={() => setSidebarOpen(true)}
        >
          <Menu className="h-6 w-6" />
        </button>
        <div className="hidden md:block">
          {/* Breadcrumbs or Page Title could go here based on route */}
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <button className="text-gray-500 hover:text-gray-700 relative">
          <Bell className="h-5 w-5" />
          <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
        </button>
        
        <div className="h-8 w-px bg-gray-200 mx-2 hidden sm:block"></div>
        
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#dcebe4] text-[#285847]">
            {currentUser?.avatarUrl ? (
              <img src={currentUser.avatarUrl} alt={currentUser.name} className="h-8 w-8 rounded-full" />
            ) : (
              <UserIcon className="h-4 w-4" />
            )}
          </div>
          <div className="hidden text-sm sm:block">
            <p className="font-medium text-stone-800 leading-none">{currentUser?.name}</p>
            <p className="text-xs text-stone-500 mt-1 capitalize">{currentUser?.role.replace('_', ' ')}</p>
          </div>
          
          <Button variant="ghost" size="icon" onClick={handleLogout} className="ml-2 text-gray-500 hover:text-gray-900" title="Logout">
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
};
