
import React from 'react';
import { useLocation } from 'react-router-dom';
import { ADMIN_NAV_ITEMS, USER_NAV_ITEMS } from '../../constants';
import { useAuth } from '../../hooks/useAuth';
import Button from '../common/Button';

interface HeaderProps {
    onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const location = useLocation();
  const { user, logout } = useAuth();

  const navItems = user?.role === 'admin' ? ADMIN_NAV_ITEMS : USER_NAV_ITEMS;
  
  const currentNavItem = navItems.find(item => location.pathname.startsWith(item.href) && (item.href !== '/' && !item.href.endsWith('dashboard')));
  const defaultNavItem = navItems[0];
  const pageTitle = currentNavItem ? currentNavItem.name : (defaultNavItem ? defaultNavItem.name : 'Dashboard');


  return (
    <header className="bg-white shadow-sm p-4 flex justify-between items-center z-20">
      <div className="flex items-center">
        <button onClick={onMenuClick} className="text-slate-600 md:hidden mr-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
        </button>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-800">{pageTitle}</h1>
      </div>
      <div className="flex items-center space-x-2 sm:space-x-4">
        <span className="text-slate-600 hidden sm:block">Welcome, {user?.name || 'User'}</span>
        
        {user?.profilePictureUrl ? (
            <img src={user.profilePictureUrl} alt="Profile" className="w-10 h-10 rounded-full object-cover" />
        ) : (
            <div className="w-10 h-10 bg-green-700 rounded-full flex items-center justify-center text-white font-bold uppercase">
              {user?.name?.[0] || 'U'}
            </div>
        )}

        <Button onClick={logout} variant="secondary" className="text-sm px-3 py-1.5">Logout</Button>
      </div>
    </header>
  );
};

export default Header;
