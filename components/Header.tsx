
import React, { useState, useRef, useEffect } from 'react';
import { UserRole, User } from '../types';
import { UsersIcon, AcademicCapIcon, ChevronUpDownIcon, CheckIcon } from './icons/Icons';

interface HeaderProps {
  users: { [key: string]: User };
  authenticatedUser: User;
  onSwitchUser: (userId: string) => void;
  onReturnHome: () => void;
}

const Header: React.FC<HeaderProps> = ({ users, authenticatedUser, onSwitchUser, onReturnHome }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Fix: Cast the result of Object.values(users) to User[] to provide type information to TypeScript.
  // This resolves errors where properties of `u` (like `role`) were inaccessible because `u` was inferred as `unknown`.
  const studentUsers = (Object.values(users) as User[]).filter(u => u.role === UserRole.STUDENT);
  const facultyUsers = (Object.values(users) as User[]).filter(u => u.role === UserRole.FACULTY);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <header className="bg-gray-900/70 backdrop-blur-md sticky top-0 z-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <button onClick={onReturnHome} className="flex items-center space-x-3 group" aria-label="Return to homepage">
          <AcademicCapIcon className="h-8 w-8 text-cyan-400 transition-transform duration-300 group-hover:scale-110 group-hover:animate-pulse" />
          <h1 className="text-xl md:text-2xl font-bold text-white">
            Credit Exchange
          </h1>
        </button>
        
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(prev => !prev)}
            className="flex items-center space-x-2 bg-gray-800/50 p-2 rounded-lg border border-gray-700 text-sm font-medium text-gray-200 hover:bg-gray-700 transition-colors"
          >
            {authenticatedUser.role === UserRole.STUDENT ? <UsersIcon className="h-5 w-5 text-cyan-400" /> : <AcademicCapIcon className="h-5 w-5 text-cyan-400" />}
            <span>{authenticatedUser.name}</span>
            <ChevronUpDownIcon className="h-5 w-5 text-gray-400" />
          </button>
          
          {isDropdownOpen && (
             <div className="absolute right-0 mt-2 w-64 bg-gray-800 border border-gray-700 rounded-lg shadow-xl overflow-hidden animate-fade-in-down">
                <div className="p-2">
                  <span className="px-2 py-1 text-xs font-semibold text-gray-400">Students</span>
                  {studentUsers.map(user => (
                    <button 
                      key={user.id}
                      onClick={() => { onSwitchUser(user.id); setIsDropdownOpen(false); }}
                      className="w-full text-left flex items-center justify-between px-3 py-2 text-sm rounded-md hover:bg-gray-700 transition-colors"
                    >
                      <span>{user.name}</span>
                      {user.id === authenticatedUser.id && <CheckIcon className="h-4 w-4 text-cyan-400" />}
                    </button>
                  ))}
                </div>
                <div className="border-t border-gray-700 p-2">
                  <span className="px-2 py-1 text-xs font-semibold text-gray-400">Faculty</span>
                  {facultyUsers.map(user => (
                    <button 
                      key={user.id}
                      onClick={() => { onSwitchUser(user.id); setIsDropdownOpen(false); }}
                      className="w-full text-left flex items-center justify-between px-3 py-2 text-sm rounded-md hover:bg-gray-700 transition-colors"
                    >
                      <span>{user.name}</span>
                      {user.id === authenticatedUser.id && <CheckIcon className="h-4 w-4 text-cyan-400" />}
                    </button>
                  ))}
                </div>
             </div>
          )}
        </div>
      </div>
      <div className="h-px bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-50"></div>
       <style>{`
        @keyframes fade-in-down {
          from { opacity: 0; transform: translateY(-10px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-fade-in-down {
          animation: fade-in-down 0.15s ease-out forwards;
        }
      `}</style>
    </header>
  );
};

export default Header;
