

import React from 'react';
import { NavLink } from 'react-router-dom';
import { ADMIN_NAV_ITEMS, USER_NAV_ITEMS } from '../../constants';
import { useAuth } from '../../hooks/useAuth';

const Logo = () => (
    <div className="flex flex-col items-center justify-center py-4 border-b border-slate-200">
        <img src="/logo.jpeg" alt="Ibadan City Polytechnic Logo" className="w-24" />
        <span className="text-green-800 font-semibold text-lg mt-2 text-center">Moshood Abiola Polytechnic Library</span>
    </div>
);

interface SidebarProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen }) => {
  const { user, pendingLoanCount } = useAuth();
  const linkClasses = "flex items-center justify-between px-4 py-3 text-slate-600 hover:bg-slate-100 rounded-md transition-colors";
  const activeLinkClasses = "bg-green-100 font-semibold text-green-700";

  const navItems = user?.role === 'admin' ? ADMIN_NAV_ITEMS : USER_NAV_ITEMS;
  
  const sidebarClasses = `
    bg-white text-slate-700 flex flex-col p-4 transition-transform duration-300 ease-in-out
    fixed inset-y-0 left-0 z-40 w-64 md:relative md:translate-x-0 md:border-r md:border-slate-200
    ${isOpen ? 'translate-x-0' : '-translate-x-full'}
  `;

  return (
    <>
      {/* Backdrop for mobile */}
      {isOpen && (
          <div 
              className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
              onClick={() => setIsOpen(false)}
          ></div>
      )}
      <aside className={sidebarClasses}>
        <Logo />
        <nav className="mt-6 flex-grow">
          <ul className="space-y-2">
            {navItems.map((item) => (
              <li key={item.name}>
                <NavLink
                  to={item.href}
                  end={item.href.endsWith('dashboard')}
                  className={({ isActive }) =>
                    `${linkClasses} ${isActive ? activeLinkClasses : ''}`
                  }
                  onClick={() => setIsOpen(false)} // Close on navigation
                >
                  <div className="flex items-center">
                      <span className="mr-3">{item.icon}</span>
                      {item.name}
                  </div>
                  {item.name === 'Loan Management' && pendingLoanCount > 0 && (
                      <span className="bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                          {pendingLoanCount}
                      </span>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
        <div className="pt-4 border-t border-slate-200">
           <p className="text-xs text-slate-400 text-center">&copy; 2025 Library System</p>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
