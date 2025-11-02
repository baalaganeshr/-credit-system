
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
    <header className="bg-gray-900/70 backdrop-blur-md sticky top-0 z-50 safe-area-inset-top">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center min-h-[60px]">
        <button onClick={onReturnHome} className="flex items-center space-x-3 group touch-manipulation" aria-label="Return to homepage">
          <AcademicCapIcon className="h-7 w-7 sm:h-8 sm:w-8 text-cyan-400 transition-transform duration-300 group-hover:scale-110 group-active:scale-95" />
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white leading-tight">
            <span className="hidden xs:inline">Credit Exchange</span>
            <span className="xs:hidden">Credits</span>
          </h1>
        </button>
        
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(prev => !prev)}
            className="flex items-center space-x-2 bg-gray-800/60 backdrop-blur-sm px-3 py-2.5 rounded-xl border border-gray-600/50 text-sm font-medium text-gray-200 hover:bg-gray-700/80 active:bg-gray-600 transition-all duration-200 min-w-[120px] touch-manipulation shadow-lg"
          >
            {authenticatedUser.role === UserRole.STUDENT ? 
              <UsersIcon className="h-5 w-5 text-cyan-400 flex-shrink-0" /> : 
              <AcademicCapIcon className="h-5 w-5 text-cyan-400 flex-shrink-0" />
            }
            <span className="truncate flex-1 text-left">{authenticatedUser.name}</span>
            <ChevronUpDownIcon className="h-5 w-5 text-gray-400 flex-shrink-0" />
          </button>
          
          {isDropdownOpen && (
             <div className="absolute right-0 mt-3 w-72 sm:w-80 bg-gray-800/95 backdrop-blur-md border border-gray-600/50 rounded-2xl shadow-2xl overflow-hidden animate-fade-in-down max-h-[70vh] overflow-y-auto">
                <div className="p-1">
                  <div className="px-4 py-3 text-xs font-bold text-gray-300 uppercase tracking-wider bg-gray-700/30 rounded-xl mb-1">
                    👨‍🎓 Students
                  </div>
                  <div className="space-y-1">
                    {studentUsers.map(user => (
                      <button 
                        key={user.id}
                        onClick={() => { onSwitchUser(user.id); setIsDropdownOpen(false); }}
                        className="w-full text-left flex items-center justify-between px-4 py-3 text-sm rounded-xl hover:bg-gray-700/60 active:bg-gray-600/80 transition-all duration-150 touch-manipulation group"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="h-8 w-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                            {user.name.charAt(0)}
                          </div>
                          <span className="text-gray-100 font-medium">{user.name}</span>
                        </div>
                        {user.id === authenticatedUser.id && (
                          <div className="flex items-center space-x-2">
                            <span className="text-xs text-cyan-400 font-medium">Current</span>
                            <CheckIcon className="h-5 w-5 text-cyan-400" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="border-t border-gray-600/30 p-1">
                  <div className="px-4 py-3 text-xs font-bold text-gray-300 uppercase tracking-wider bg-gray-700/30 rounded-xl mb-1">
                    👨‍🏫 Faculty
                  </div>
                  <div className="space-y-1">
                    {facultyUsers.map(user => (
                      <button 
                        key={user.id}
                        onClick={() => { onSwitchUser(user.id); setIsDropdownOpen(false); }}
                        className="w-full text-left flex items-center justify-between px-4 py-3 text-sm rounded-xl hover:bg-gray-700/60 active:bg-gray-600/80 transition-all duration-150 touch-manipulation group"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="h-8 w-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                            {user.name.charAt(0)}
                          </div>
                          <span className="text-gray-100 font-medium">{user.name}</span>
                        </div>
                        {user.id === authenticatedUser.id && (
                          <div className="flex items-center space-x-2">
                            <span className="text-xs text-cyan-400 font-medium">Current</span>
                            <CheckIcon className="h-5 w-5 text-cyan-400" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
             </div>
          )}
        </div>
      </div>
      <div className="h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent"></div>
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
