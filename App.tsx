
import React, { useState, useCallback, useEffect } from 'react';
import { UserRole, Project, RedemptionRequest, Status, User } from './types';
import { USERS, PROJECTS, REDEMPTIONS } from './constants';
import Header from './components/Header';
import StudentDashboard from './components/StudentDashboard';
import FacultyDashboard from './components/FacultyDashboard';
import LandingPage from './components/LandingPage';
import { CheckIcon, XMarkIcon } from './components/icons/Icons';


interface ToastMessage {
  id: number;
  message: string;
  type: 'success' | 'error';
}

interface ToastProps {
  toast: ToastMessage;
  onDismiss: (id: number) => void;
}

const Toast: React.FC<ToastProps> = ({ toast, onDismiss }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, 5000);
    return () => clearTimeout(timer);
  }, [toast, onDismiss]);

  const isSuccess = toast.type === 'success';

  return (
    <div className={`w-full max-w-sm p-4 rounded-lg shadow-lg flex items-center space-x-3 text-white border ${isSuccess ? 'bg-green-500/20 border-green-500/30' : 'bg-red-500/20 border-red-500/30'} animate-toast-in`}>
      <div className={`p-1.5 rounded-full ${isSuccess ? 'bg-green-500/90' : 'bg-red-500/90'}`}>
        {isSuccess ? <CheckIcon className="h-5 w-5" /> : <XMarkIcon className="h-5 w-5" />}
      </div>
      <p className="flex-grow text-sm font-medium">{toast.message}</p>
      <button onClick={() => onDismiss(toast.id)} className="p-1 rounded-full hover:bg-white/10 transition-colors">
        <XMarkIcon className="h-4 w-4 text-gray-300" />
      </button>
    </div>
  );
};


const ToastContainer: React.FC<{ toasts: ToastMessage[]; onDismiss: (id: number) => void; }> = ({ toasts, onDismiss }) => {
  return (
    <div className="fixed top-5 right-5 z-[100] space-y-2">
      {toasts.map(toast => (
        <Toast key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
       <style>{`
        @keyframes toast-in {
          from { opacity: 0; transform: translateX(100%); }
          to { opacity: 1; transform: translateX(0); }
        }
        .animate-toast-in {
          animation: toast-in 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};


function App() {
  const [appLaunched, setAppLaunched] = useState(false);
  const [authenticatedUserId, setAuthenticatedUserId] = useState<string>('student1');
  const [users, setUsers] = useState<{[key: string]: User}>(USERS);
  const [projects, setProjects] = useState<Project[]>(PROJECTS);
  const [redemptions, setRedemptions] = useState<RedemptionRequest[]>(REDEMPTIONS);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((message: string, type: 'success' | 'error') => {
    setToasts(prev => [...prev, { id: Date.now(), message, type }]);
  }, []);

  const removeToast = useCallback((id: number) => {
      setToasts(prev => prev.filter(t => t.id !== id));
  }, []);


  const authenticatedUser = users[authenticatedUserId];

  const handleReturnHome = useCallback(() => {
    setAppLaunched(false);
  }, []);

  const handleProjectSubmit = useCallback((newProject: Omit<Project, 'id' | 'studentId' | 'status' | 'creditsAwarded' | 'submittedAt'>) => {
    setProjects(prev => [
      {
        ...newProject,
        id: `proj${Date.now()}`,
        studentId: authenticatedUser.id,
        status: Status.PENDING,
        creditsAwarded: 0,
        submittedAt: new Date(),
        screenshotUrl: newProject.screenshotFile ? URL.createObjectURL(newProject.screenshotFile) : undefined,
      },
      ...prev,
    ]);
    addToast("Project submitted successfully!", 'success');
  }, [authenticatedUser.id, addToast]);

  const handleProjectDecision = useCallback((projectId: string, status: Status.APPROVED | Status.DENIED, credits: number, comments?: string) => {
    let studentToNotify: string | null = null;
    setProjects(prev =>
      prev.map(p => {
        if (p.id === projectId) {
          studentToNotify = p.studentId;
          if (status === Status.APPROVED) {
            setUsers(u => ({...u, [p.studentId]: {...u[p.studentId], credits: u[p.studentId].credits + credits}}));
          }
          return { ...p, status, creditsAwarded: credits, facultyComments: comments };
        }
        return p;
      })
    );
     if (studentToNotify) {
        const studentName = users[studentToNotify]?.name || 'A student';
        const projectTitle = projects.find(p => p.id === projectId)?.title || 'a project';
        if (status === Status.APPROVED) {
          addToast(`${studentName}'s project "${projectTitle}" approved!`, 'success');
        } else {
          addToast(`${studentName}'s project "${projectTitle}" was denied.`, 'error');
        }
    }
  }, [addToast, users, projects]);
  
  const handleRedemptionRequest = useCallback((newRequest: Omit<RedemptionRequest, 'id' | 'studentId' | 'status' | 'requestedAt'>) => {
    if(authenticatedUser.credits < newRequest.creditsCost) {
        addToast("Not enough credits to redeem!", 'error');
        return;
    }

    setUsers(u => ({...u, [authenticatedUser.id]: {...u[authenticatedUser.id], credits: u[authenticatedUser.id].credits - newRequest.creditsCost}}));
    setRedemptions(prev => [
        {
            ...newRequest,
            id: `redeem${Date.now()}`,
            studentId: authenticatedUser.id,
            status: Status.PENDING,
            requestedAt: new Date(),
        },
        ...prev,
    ]);
    addToast("Your application for academic flexibility has been submitted.", 'success');
  }, [authenticatedUser, addToast]);


  const handleRedemptionDecision = useCallback((redemptionId: string, status: Status.APPROVED | Status.DENIED) => {
    setRedemptions(prev =>
      prev.map(r => {
        if (r.id === redemptionId) {
          if (status === Status.DENIED) {
             setUsers(u => ({...u, [r.studentId]: {...u[r.studentId], credits: u[r.studentId].credits + r.creditsCost}}));
          }
          return { ...r, status };
        }
        return r;
      })
    );
  }, []);

  const handleProjectUpdate = useCallback((projectId: string, updates: Partial<Pick<Project, 'title' | 'description' | 'githubLink'>>) => {
    setProjects(prev =>
      prev.map(p =>
        p.id === projectId ? { ...p, ...updates } : p
      )
    );
    addToast("Project details updated.", 'success');
  }, [addToast]);

  // Fix: Changed function to `async` to return a `Promise<void>`, matching the expected prop type in `FacultyDashboard`.
  const handleBulkProjectDecision = useCallback(async (projectIds: string[], status: Status.APPROVED | Status.DENIED, credits: number) => {
    const creditsToAddPerStudent: { [studentId: string]: number } = {};

    setProjects(prevProjects =>
      prevProjects.map(p => {
        if (projectIds.includes(p.id) && p.status === Status.PENDING) {
          if (status === Status.APPROVED) {
            creditsToAddPerStudent[p.studentId] = (creditsToAddPerStudent[p.studentId] || 0) + credits;
          }
          return { ...p, status, creditsAwarded: status === Status.APPROVED ? credits : 0 };
        }
        return p;
      })
    );

    if (Object.keys(creditsToAddPerStudent).length > 0 && status === Status.APPROVED) {
      setUsers(prevUsers => {
        const newUsers = { ...prevUsers };
        for (const studentId in creditsToAddPerStudent) {
          if (newUsers[studentId]) {
            newUsers[studentId] = {
              ...newUsers[studentId],
              credits: newUsers[studentId].credits + creditsToAddPerStudent[studentId],
            };
          }
        }
        return newUsers;
      });
    }

    const message = status === Status.APPROVED ? `${projectIds.length} projects approved.` : `${projectIds.length} projects denied.`;
    addToast(message, status === Status.APPROVED ? 'success' : 'error');
  }, [addToast]);


  if (!appLaunched) {
    return <LandingPage onEnter={() => setAppLaunched(true)} />;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
      <Header
        users={users}
        authenticatedUser={authenticatedUser}
        onSwitchUser={setAuthenticatedUserId}
        onReturnHome={handleReturnHome}
      />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {authenticatedUser.role === UserRole.STUDENT ? (
          <StudentDashboard
            user={authenticatedUser}
            projects={projects.filter(p => p.studentId === authenticatedUser.id)}
            redemptions={redemptions.filter(r => r.studentId === authenticatedUser.id)}
            onProjectSubmit={handleProjectSubmit}
            onRedemptionRequest={handleRedemptionRequest}
          />
        ) : (
          <FacultyDashboard
            projects={projects}
            redemptions={redemptions}
            users={users}
            onProjectDecision={handleProjectDecision}
            onRedemptionDecision={handleRedemptionDecision}
            onProjectUpdate={handleProjectUpdate}
            onBulkProjectDecision={handleBulkProjectDecision}
          />
        )}
      </main>
    </div>
  );
}

export default App;
