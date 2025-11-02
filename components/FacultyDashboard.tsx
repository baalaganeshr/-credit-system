import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Project, RedemptionRequest, Status, User, UserRole } from '../types';
import Button from './Button';
import Modal from './Modal';
import { CheckIcon, XMarkIcon, MagnifyingGlassIcon, ChevronDownIcon, ArrowLeftIcon, ArrowRightIcon, StarIcon, PhotoIcon, ArrowsUpDownIcon, ClipboardDocumentListIcon, TicketIcon, ArrowTopRightOnSquareIcon, PencilIcon, SpinnerIcon, ArrowDownTrayIcon } from './icons/Icons';

interface FacultyDashboardProps {
  projects: Project[];
  redemptions: RedemptionRequest[];
  users: { [key: string]: User };
  onProjectDecision: (projectId: string, status: Status.APPROVED | Status.DENIED, credits: number, comments?: string) => void;
  onRedemptionDecision: (redemptionId: string, status: Status.APPROVED | Status.DENIED) => void;
  onProjectUpdate: (projectId: string, updates: Partial<Pick<Project, 'title' | 'description' | 'githubLink'>>) => void;
  onBulkProjectDecision: (projectIds: string[], status: Status.APPROVED | Status.DENIED, credits: number) => Promise<void>;
}

const formatDate = (date: Date): string => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}`;
};

const statusStyles: { [key in Status]: { badge: string; dot: string; dotGlow: string } } = {
  [Status.PENDING]: {
    badge: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
    dot: 'bg-yellow-400',
    dotGlow: 'shadow-[0_0_5px_1px_rgba(250,204,21,0.5)]',
  },
  [Status.APPROVED]: {
    badge: 'bg-green-500/20 text-green-300 border-green-500/30',
    dot: 'bg-green-400',
    dotGlow: 'shadow-[0_0_5px_1px_rgba(74,222,128,0.5)]',
  },
  [Status.DENIED]: {
    badge: 'bg-red-500/20 text-red-300 border-red-500/30',
    dot: 'bg-red-400',
    dotGlow: 'shadow-[0_0_5px_1px_rgba(248,113,113,0.5)]',
  },
};

const StatusBadge: React.FC<{ status: Status }> = ({ status }) => {
    const styles = statusStyles[status];
    return (
        <span className={`inline-flex items-center space-x-1.5 px-2.5 py-0.5 text-xs font-semibold rounded-full border ${styles.badge}`}>
            <span className={`h-2 w-2 rounded-full ${styles.dot} ${styles.dotGlow} ${status === Status.PENDING ? 'animate-pulse' : ''}`}></span>
            <span>{status}</span>
        </span>
    );
};

const ApproveProjectModal: React.FC<{
    project: Project;
    onApprove: (credits: number, comments: string) => void;
    onClose: () => void;
}> = ({ project, onApprove, onClose }) => {
    const [credits, setCredits] = useState(10);
    const [comments, setComments] = useState('');
    
    const handleSubmit = () => {
        onApprove(credits, comments);
        onClose();
    };

    return (
        <div className="space-y-4">
            <p>Assign credits for project: <strong>{project.title}</strong></p>
            <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Credits Awarded</label>
                <input
                    type="number"
                    value={credits}
                    onChange={(e) => setCredits(Number(e.target.value))}
                    className="w-full bg-gray-700 border-gray-600 rounded-md p-2 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition"
                    min="1"
                    max="100"
                />
            </div>
             <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Feedback / Comments (Optional)</label>
                <textarea
                    value={comments}
                    onChange={(e) => setComments(e.target.value)}
                    className="w-full bg-gray-700 border-gray-600 rounded-md p-2 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition h-24"
                    placeholder="e.g., Great work on the UI..."
                />
            </div>
            <div className="flex justify-end pt-4 space-x-2">
                <Button variant="secondary" onClick={onClose}>Cancel</Button>
                <Button variant="success" onClick={handleSubmit}>Approve & Award</Button>
            </div>
        </div>
    );
};

const DenyProjectModal: React.FC<{
    project: Project;
    onDeny: (comments: string) => void;
    onClose: () => void;
}> = ({ project, onDeny, onClose }) => {
    const [comments, setComments] = useState('');
    
    const handleSubmit = () => {
        onDeny(comments);
        onClose();
    };

    return (
        <div className="space-y-4">
            <p>You are about to deny the project: <strong>{project.title}</strong></p>
            <p className="text-sm text-gray-400">Please provide feedback for the student. This is required for denied submissions.</p>
            <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Feedback / Comments</label>
                <textarea
                    value={comments}
                    onChange={(e) => setComments(e.target.value)}
                    className="w-full bg-gray-700 border-gray-600 rounded-md p-2 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition h-24"
                    placeholder="e.g., The project scope is too simple..."
                    required
                />
            </div>
            <div className="flex justify-end pt-4 space-x-2">
                <Button variant="secondary" onClick={onClose}>Cancel</Button>
                <Button variant="danger" onClick={handleSubmit} disabled={!comments.trim()}>Confirm Denial</Button>
            </div>
        </div>
    );
};


const BulkApproveProjectModal: React.FC<{
    isOpen: boolean;
    count: number;
    onApprove: (credits: number) => void;
    onClose: () => void;
}> = ({ isOpen, count, onApprove, onClose }) => {
    const [credits, setCredits] = useState(10);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen) {
            // Reset state when modal opens
            setCredits(10);
            // Autofocus input
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [isOpen]);
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onApprove(credits);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Approve ${count} Projects`}>
          <form onSubmit={handleSubmit} className="space-y-4">
              <p>Assign credits for all <strong>{count}</strong> selected projects.</p>
              <div>
                  <label htmlFor="bulk-credits-input" className="block text-sm font-medium text-gray-400 mb-1">Credits Awarded (per project)</label>
                  <input
                      id="bulk-credits-input"
                      ref={inputRef}
                      type="number"
                      value={credits}
                      onChange={(e) => setCredits(Number(e.target.value))}
                      className="w-full bg-gray-700 border-gray-600 rounded-md p-2 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition"
                      min="1"
                      max="100"
                      required
                  />
              </div>
              <div className="flex justify-end pt-4 space-x-2">
                  <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                  <Button type="submit" variant="success">Approve & Award</Button>
              </div>
          </form>
        </Modal>
    );
};

const EditProjectModal: React.FC<{
    project: Project;
    onSave: (updates: { title: string; description: string; githubLink: string }) => void;
    onClose: () => void;
}> = ({ project, onSave, onClose }) => {
    const [title, setTitle] = useState(project.title);
    const [description, setDescription] = useState(project.description);
    const [githubLink, setGithubLink] = useState(project.githubLink);

    const handleSubmit = () => {
        onSave({ title, description, githubLink });
        onClose();
    };

    return (
        <div className="space-y-4">
            <p className="text-lg font-semibold">Editing Project: <strong>{project.title}</strong></p>
            <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Project Title</label>
                <input type="text" value={title} onChange={e => setTitle(e.target.value)} required className="w-full bg-gray-700 border-gray-600 rounded-md p-2 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition"/>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Description</label>
                <textarea value={description} onChange={e => setDescription(e.target.value)} required className="w-full bg-gray-700 border-gray-600 rounded-md p-2 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition h-24"/>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">GitHub Link</label>
                <input type="url" value={githubLink} onChange={e => setGithubLink(e.target.value)} required className="w-full bg-gray-700 border-gray-600 rounded-md p-2 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition"/>
            </div>
            <div className="flex justify-end pt-4 space-x-2">
                <Button variant="secondary" onClick={onClose}>Cancel</Button>
                <Button variant="primary" onClick={handleSubmit}>Save Changes</Button>
            </div>
        </div>
    );
};


const StudentProfileModal: React.FC<{
  user: User;
  projects: Project[];
  redemptions: RedemptionRequest[];
  onClose: () => void;
}> = ({ user, projects, redemptions, onClose }) => {
  const [activeTab, setActiveTab] = useState('projects');
  const sortedProjects = useMemo(() => [...projects].sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()), [projects]);
  const sortedRedemptions = useMemo(() => [...redemptions].sort((a, b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime()), [redemptions]);

  return (
    <Modal isOpen={true} onClose={onClose} title={`${user.name}'s Profile`} size="3xl">
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
          <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700/50">
            <p className="text-sm text-gray-400">Current Credits</p>
            <div className="flex items-center justify-center space-x-2 mt-1">
              <StarIcon className="h-6 w-6 text-yellow-400" />
              <p className="text-2xl font-bold">{user.credits}</p>
            </div>
          </div>
          <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700/50">
            <p className="text-sm text-gray-400">Projects Submitted</p>
            <p className="text-2xl font-bold mt-1">{projects.length}</p>
          </div>
          <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700/50">
            <p className="text-sm text-gray-400">Applications Submitted</p>
            <p className="text-2xl font-bold mt-1">{redemptions.length}</p>
          </div>
        </div>
        
        <div>
           <div className="border-b border-gray-700">
              <nav className="-mb-px flex space-x-6" aria-label="Tabs" role="tablist">
                <button
                  id="projects-tab"
                  role="tab"
                  aria-controls="projects-panel"
                  aria-selected={activeTab === 'projects'}
                  onClick={() => setActiveTab('projects')}
                  className={`flex items-center whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === 'projects'
                      ? 'border-cyan-400 text-cyan-400'
                      : 'border-transparent text-gray-400 hover:text-white hover:border-gray-500'
                  }`}
                >
                  <ClipboardDocumentListIcon className="h-5 w-5 mr-2" />
                  <span>Projects ({projects.length})</span>
                </button>
                <button
                  id="applications-tab"
                  role="tab"
                  aria-controls="applications-panel"
                  aria-selected={activeTab === 'applications'}
                  onClick={() => setActiveTab('applications')}
                  className={`flex items-center whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === 'applications'
                      ? 'border-cyan-400 text-cyan-400'
                      : 'border-transparent text-gray-400 hover:text-white hover:border-gray-500'
                  }`}
                >
                  <TicketIcon className="h-5 w-5 mr-2" />
                  <span>Applications ({redemptions.length})</span>
                </button>
              </nav>
            </div>

            <div className="pt-6">
              <div
                id="projects-panel"
                role="tabpanel"
                tabIndex={0}
                aria-labelledby="projects-tab"
                hidden={activeTab !== 'projects'}
                className="space-y-3 max-h-80 overflow-y-auto pr-2 focus:outline-none"
              >
                {sortedProjects.length === 0 && <p className="text-gray-500 text-center py-4">No projects submitted yet.</p>}
                {sortedProjects.map(p => (
                  <div key={p.id} className="bg-gray-900/50 p-3 rounded-md flex justify-between items-center">
                    <div>
                      <p className="font-medium">{p.title}</p>
                      <p className="text-xs text-gray-500">{formatDate(p.submittedAt)}</p>
                    </div>
                    <div className="flex items-center space-x-3 flex-shrink-0">
                      {p.status === Status.APPROVED && <span className="text-sm font-semibold text-green-400">+{p.creditsAwarded} Cr</span>}
                      <StatusBadge status={p.status} />
                    </div>
                  </div>
                ))}
              </div>
              <div
                id="applications-panel"
                role="tabpanel"
                tabIndex={0}
                aria-labelledby="applications-tab"
                hidden={activeTab !== 'applications'}
                className="space-y-3 max-h-80 overflow-y-auto pr-2 focus:outline-none"
              >
                {sortedRedemptions.length === 0 && <p className="text-gray-500 text-center py-4">No applications made yet.</p>}
                {sortedRedemptions.map(r => (
                  <div key={r.id} className="bg-gray-900/50 p-3 rounded-md flex justify-between items-center">
                    <div>
                      <p className="font-medium">{r.type}</p>
                      <p className="text-xs text-gray-500">{formatDate(r.requestedAt)}</p>
                    </div>
                    <StatusBadge status={r.status} />
                  </div>
                ))}
              </div>
          </div>
        </div>

      </div>
    </Modal>
  );
};

const ITEMS_PER_PAGE = 5;
type SortByType = 'date-desc' | 'date-asc' | 'student-asc' | 'student-desc';

const FacultyDashboard: React.FC<FacultyDashboardProps> = ({ projects, redemptions, users, onProjectDecision, onRedemptionDecision, onProjectUpdate, onBulkProjectDecision }) => {
    const [activeTab, setActiveTab] = useState<'submissions' | 'redemptions'>('submissions');
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);
    const [denyingProject, setDenyingProject] = useState<Project | null>(null);
    const [editingProject, setEditingProject] = useState<Project | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
    const [filterStudentId, setFilterStudentId] = useState<string>('all');
    const [filterStatus, setFilterStatus] = useState<Status>(Status.PENDING);
    const [sortBy, setSortBy] = useState<SortByType>('date-desc');
    const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);
    const sortDropdownRef = useRef<HTMLDivElement>(null);
    const [expandedProjectId, setExpandedProjectId] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [redemptionFilterStatus, setRedemptionFilterStatus] = useState<Status>(Status.PENDING);
    const [imageToPreview, setImageToPreview] = useState<{url: string, title: string} | null>(null);
    const [viewingStudent, setViewingStudent] = useState<User | null>(null);
    const [selectedProjectIds, setSelectedProjectIds] = useState<string[]>([]);
    const [isBulkApproveModalOpen, setIsBulkApproveModalOpen] = useState(false);
    const [studentSearchQuery, setStudentSearchQuery] = useState('');
    const [isProcessingBulk, setIsProcessingBulk] = useState(false);

    const studentList = useMemo(() => {
        return Object.values(users).filter(u => u.role === UserRole.STUDENT);
    }, [users]);

    const searchedStudents = useMemo(() => {
        if (!studentSearchQuery.trim()) {
            return [];
        }
        const searchLower = studentSearchQuery.toLowerCase();
        return Object.values(users).filter(
            (user) => user.role === UserRole.STUDENT && user.name.toLowerCase().includes(searchLower)
        );
    }, [studentSearchQuery, users]);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchQuery(searchQuery);
        }, 300);

        return () => {
            clearTimeout(timer);
        };
    }, [searchQuery]);

    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (sortDropdownRef.current && !sortDropdownRef.current.contains(event.target as Node)) {
          setIsSortDropdownOpen(false);
        }
      };
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, []);

    const pendingProjectsCount = useMemo(() => projects.filter(p => p.status === Status.PENDING).length, [projects]);
    const pendingRedemptionsCount = useMemo(() => redemptions.filter(r => r.status === Status.PENDING).length, [redemptions]);

    const filteredProjects = useMemo(() => {
        let filtered = projects.filter(p => 
            p.status === filterStatus && 
            (filterStudentId === 'all' || p.studentId === filterStudentId)
        );
        if (debouncedSearchQuery) {
            const searchLower = debouncedSearchQuery.toLowerCase();
            filtered = filtered.filter(p => {
                const studentName = users[p.studentId]?.name || '';
                return p.title.toLowerCase().includes(searchLower) || studentName.toLowerCase().includes(searchLower);
            });
        }
        filtered.sort((a, b) => {
          switch (sortBy) {
            case 'date-asc':
              return new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime();
            case 'student-asc': {
              const nameA = users[a.studentId]?.name || '';
              const nameB = users[b.studentId]?.name || '';
              return nameA.localeCompare(nameB);
            }
            case 'student-desc': {
              const nameA = users[a.studentId]?.name || '';
              const nameB = users[b.studentId]?.name || '';
              return nameB.localeCompare(nameA);
            }
            case 'date-desc':
            default:
              return new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime();
          }
        });
        return filtered;
    }, [projects, debouncedSearchQuery, users, sortBy, filterStudentId, filterStatus]);

    useEffect(() => {
        setCurrentPage(1);
        setSelectedProjectIds([]);
    }, [debouncedSearchQuery, sortBy, activeTab, filterStudentId, filterStatus]);
    
    const totalPages = Math.ceil(filteredProjects.length / ITEMS_PER_PAGE);
    const paginatedProjects = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredProjects.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [filteredProjects, currentPage]);

    const filteredRedemptions = useMemo(() => {
        return [...redemptions]
            .filter(r => r.status === redemptionFilterStatus)
            .sort((a, b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime());
    }, [redemptions, redemptionFilterStatus]);

    const handleToggleSelectProject = (projectId: string) => {
      setSelectedProjectIds(prev =>
        prev.includes(projectId)
          ? prev.filter(id => id !== projectId)
          : [...prev, projectId]
      );
    };

    const handleSelectAllOnPage = () => {
        const pageIds = paginatedProjects.map(p => p.id);
        const pageIdsSet = new Set(pageIds);
        const allOnPageAreSelected = pageIds.length > 0 && pageIds.every(id => selectedProjectIds.includes(id));

        if (allOnPageAreSelected) {
            setSelectedProjectIds(prev => prev.filter(id => !pageIdsSet.has(id)));
        } else {
            setSelectedProjectIds(prev => {
                const newSelections = new Set(prev);
                pageIds.forEach(id => newSelections.add(id));
                return Array.from(newSelections);
            });
        }
    };

    const handleBulkDeny = async () => {
        if (window.confirm(`Are you sure you want to deny ${selectedProjectIds.length} selected projects? This action cannot be undone.`)) {
            setIsProcessingBulk(true);
            await onBulkProjectDecision(selectedProjectIds, Status.DENIED, 0);
            setSelectedProjectIds([]);
            setIsProcessingBulk(false);
        }
    };

    const handleBulkApprove = async (credits: number) => {
        setIsProcessingBulk(true);
        await onBulkProjectDecision(selectedProjectIds, Status.APPROVED, credits);
        setSelectedProjectIds([]);
        setIsBulkApproveModalOpen(false);
        setIsProcessingBulk(false);
    };

    const handleExportCSV = () => {
        if (filteredProjects.length === 0) {
            return;
        }

        const escapeCSV = (str: string | number): string => {
            const value = String(str);
            if (value.includes(',') || value.includes('"') || value.includes('\n')) {
                const escapedValue = value.replace(/"/g, '""');
                return `"${escapedValue}"`;
            }
            return value;
        };

        const headers = [
            'Project ID', 'Submission Date', 'Student Name', 'Project Title', 
            'Status', 'Credits Awarded', 'Description', 'GitHub Link'
        ];

        const rows = filteredProjects.map(p => {
            const studentName = users[p.studentId]?.name || 'N/A';
            return [
                escapeCSV(p.id),
                escapeCSV(formatDate(p.submittedAt)),
                escapeCSV(studentName),
                escapeCSV(p.title),
                escapeCSV(p.status),
                escapeCSV(p.creditsAwarded),
                escapeCSV(p.description),
                escapeCSV(p.githubLink),
            ].join(',');
        });

        const csvContent = [headers.join(','), ...rows].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        if (link.href) {
            URL.revokeObjectURL(link.href);
        }
        const url = URL.createObjectURL(blob);
        link.href = url;
        const timestamp = new Date().toISOString().slice(0, 10);
        link.setAttribute('download', `project_submissions_${timestamp}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };


    const sortOptions: {label: string, value: SortByType}[] = [
        { label: 'Newest First', value: 'date-desc' },
        { label: 'Oldest First', value: 'date-asc' },
        { label: 'Student Name A-Z', value: 'student-asc' },
        { label: 'Student Name Z-A', value: 'student-desc' },
    ];
    const currentSortLabel = sortOptions.find(o => o.value === sortBy)?.label;


    const TabButton: React.FC<{
        tabId: 'submissions' | 'redemptions';
        label: string;
        count: number;
        icon: React.ReactNode;
    }> = ({ tabId, label, count, icon }) => (
        <button
            onClick={() => setActiveTab(tabId)}
            className={`flex items-center space-x-2 px-3 py-2 text-sm font-medium rounded-t-md border-b-2 transition-colors ${
                activeTab === tabId
                    ? 'border-cyan-400 text-cyan-400'
                    : 'border-transparent text-gray-400 hover:text-white'
            }`}
        >
            {icon}
            <span>{label}</span>
            {count > 0 && <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-cyan-500/20 text-cyan-300">{count}</span>}
        </button>
    );

    const allOnPageSelected = paginatedProjects.length > 0 && paginatedProjects.every(p => selectedProjectIds.includes(p.id));

    const noSubmissionsText = () => {
        if (searchQuery) return 'No matching submissions found.';
        return `No ${filterStatus.toLowerCase()} submissions.`;
    };

    return (
        <div className="space-y-6">
            {selectedProject && (
                <Modal isOpen={!!selectedProject} onClose={() => setSelectedProject(null)} title="Approve Project">
                    <ApproveProjectModal 
                        project={selectedProject}
                        onClose={() => setSelectedProject(null)}
                        onApprove={(credits, comments) => onProjectDecision(selectedProject.id, Status.APPROVED, credits, comments)}
                    />
                </Modal>
            )}

            {denyingProject && (
                <Modal isOpen={!!denyingProject} onClose={() => setDenyingProject(null)} title="Deny Project">
                    <DenyProjectModal
                        project={denyingProject}
                        onClose={() => setDenyingProject(null)}
                        onDeny={(comments) => onProjectDecision(denyingProject.id, Status.DENIED, 0, comments)}
                    />
                </Modal>
            )}

            <BulkApproveProjectModal
              isOpen={isBulkApproveModalOpen}
              onClose={() => setIsBulkApproveModalOpen(false)}
              onApprove={handleBulkApprove}
              count={selectedProjectIds.length}
            />

            {editingProject && (
                <Modal isOpen={!!editingProject} onClose={() => setEditingProject(null)} title="Edit Project Details">
                    <EditProjectModal
                        project={editingProject}
                        onClose={() => setEditingProject(null)}
                        onSave={(updates) => {
                            onProjectUpdate(editingProject.id, updates);
                            setEditingProject(null);
                        }}
                    />
                </Modal>
            )}

            {imageToPreview && (
                <Modal isOpen={!!imageToPreview} onClose={() => setImageToPreview(null)} title={imageToPreview.title} size="3xl">
                    <div className="bg-gray-900 p-2 rounded-lg">
                        <img src={imageToPreview.url} alt={`Screenshot for ${imageToPreview.title}`} className="w-full rounded-md object-contain max-h-[80vh]" />
                    </div>
                </Modal>
            )}

            {viewingStudent && (
                <StudentProfileModal
                    user={viewingStudent}
                    projects={projects.filter(p => p.studentId === viewingStudent.id)}
                    redemptions={redemptions.filter(r => r.studentId === viewingStudent.id)}
                    onClose={() => setViewingStudent(null)}
                />
            )}

            <div className="bg-gray-800/30 border border-gray-700/50 rounded-lg shadow-lg overflow-hidden">
                <div className="px-6 pt-5 border-b border-gray-700/80">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-bold">Faculty Dashboard</h2>
                    </div>

                    <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="bg-gray-900/40 p-4 rounded-lg border border-gray-700/60 flex items-center space-x-4">
                            <div className="p-3 rounded-full bg-cyan-500/10">
                                <ClipboardDocumentListIcon className="h-6 w-6 text-cyan-400" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-400">Pending Submissions</p>
                                <p className="text-2xl font-bold text-white">{pendingProjectsCount}</p>
                            </div>
                        </div>
                        <div className="bg-gray-900/40 p-4 rounded-lg border border-gray-700/60 flex items-center space-x-4">
                            <div className="p-3 rounded-full bg-orange-500/10">
                                <TicketIcon className="h-6 w-6 text-orange-400" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-400">Pending Applications</p>
                                <p className="text-2xl font-bold text-white">{pendingRedemptionsCount}</p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6">
                        <h3 className="text-base font-semibold text-gray-300 mb-2">Find Student Profile</h3>
                        <div className="relative">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                                <MagnifyingGlassIcon className="h-5 w-5 text-gray-500" />
                            </span>
                            <input
                                type="text"
                                placeholder="Search by student name..."
                                value={studentSearchQuery}
                                onChange={(e) => setStudentSearchQuery(e.target.value)}
                                className="w-full bg-gray-700/80 border-gray-600/70 rounded-md p-2 pl-10 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition"
                            />
                             {studentSearchQuery && (
                                <div className="absolute w-full mt-1 bg-gray-900 border border-gray-700 rounded-md max-h-48 overflow-y-auto z-10 shadow-lg">
                                {searchedStudents.length > 0 ? (
                                    searchedStudents.map(student => (
                                    <button 
                                        key={student.id} 
                                        onClick={() => {
                                        setViewingStudent(student);
                                        setStudentSearchQuery('');
                                        }}
                                        className="w-full text-left px-4 py-2 hover:bg-gray-700 transition-colors flex justify-between items-center"
                                    >
                                        <span>{student.name}</span>
                                        <span className="text-xs text-gray-400">View Profile</span>
                                    </button>
                                    ))
                                ) : (
                                    <p className="text-gray-500 text-center py-4">No students found.</p>
                                )}
                                </div>
                            )}
                        </div>
                    </div>

                    <nav className="mt-4 -mb-px flex space-x-4">
                        <TabButton tabId="submissions" label="Project Submissions" count={pendingProjectsCount} icon={<ClipboardDocumentListIcon className="h-5 w-5"/>} />
                        <TabButton tabId="redemptions" label="Flexibility Applications" count={pendingRedemptionsCount} icon={<TicketIcon className="h-5 w-5"/>}/>
                    </nav>
                </div>

                <div className="p-6">
                    {activeTab === 'submissions' && (
                        <div className="animate-fade-in space-y-4">
                            <div className="flex flex-col md:flex-row gap-4">
                                <div className="flex flex-col sm:flex-row gap-4 flex-grow">
                                    <div className="relative flex-grow">
                                        <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                                            <MagnifyingGlassIcon className="h-5 w-5 text-gray-500" />
                                        </span>
                                        <input
                                            type="text"
                                            placeholder="Search by title or student..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="w-full bg-gray-700/80 border-gray-600/70 rounded-md p-2 pl-10 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition"
                                        />
                                    </div>
                                    <div className="relative w-full sm:w-auto sm:min-w-[200px]">
                                        <label htmlFor="student-filter" className="sr-only">Filter by student</label>
                                        <select
                                            id="student-filter"
                                            value={filterStudentId}
                                            onChange={(e) => setFilterStudentId(e.target.value)}
                                            className="w-full h-full bg-gray-700/80 border-gray-600/70 rounded-md py-2 pl-3 pr-8 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition appearance-none"
                                        >
                                            <option value="all">All Students</option>
                                            {studentList.map(student => (
                                                <option key={student.id} value={student.id}>{student.name}</option>
                                            ))}
                                        </select>
                                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                                            <ChevronDownIcon className="h-4 w-4" />
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-2 flex-shrink-0">
                                    <Button onClick={handleExportCSV} variant="secondary" disabled={filteredProjects.length === 0} title="Export current view to CSV" className="h-full px-3 py-1.5 text-sm">
                                        <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                                        <span>Export</span>
                                    </Button>
                                    <div className="relative" ref={sortDropdownRef}>
                                      <button
                                          onClick={() => setIsSortDropdownOpen(prev => !prev)}
                                          className="flex-shrink-0 px-3 py-1.5 h-full text-sm font-medium rounded-md flex items-center space-x-2 transition-colors duration-200 bg-gray-800/50 border border-gray-700 text-gray-300 hover:bg-gray-700"
                                      >
                                          <ArrowsUpDownIcon className="h-4 w-4" />
                                          <span>{currentSortLabel}</span>
                                          <ChevronDownIcon className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${isSortDropdownOpen ? 'rotate-180' : ''}`} />
                                      </button>
                                       {isSortDropdownOpen && (
                                        <div className="absolute right-0 mt-2 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-10 animate-fade-in-down">
                                            <div className="p-1">
                                                {sortOptions.map(option => (
                                                    <button
                                                        key={option.value}
                                                        onClick={() => {
                                                            setSortBy(option.value);
                                                            setIsSortDropdownOpen(false);
                                                        }}
                                                        className={`w-full text-left flex items-center justify-between px-3 py-2 text-sm rounded-md transition-colors hover:bg-cyan-500/10 hover:text-cyan-300' ${sortBy === option.value ? 'text-cyan-400' : ''}`}
                                                    >
                                                        <span>{option.label}</span>
                                                        {sortBy === option.value && <CheckIcon className="h-4 w-4 text-cyan-400" />}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center space-x-1 p-1 bg-gray-900/40 rounded-lg self-start border border-gray-700/50 w-fit">
                                {Object.values(Status).map(status => (
                                    <button
                                        key={status}
                                        onClick={() => setFilterStatus(status)}
                                        className={`px-3 py-1 text-sm font-semibold rounded-md transition-all duration-200 ${
                                            filterStatus === status
                                                ? 'bg-cyan-500/80 text-white shadow-sm'
                                                : 'text-gray-400 hover:bg-gray-700/50 hover:text-gray-200'
                                        }`}
                                    >
                                        {status}
                                    </button>
                                ))}
                            </div>

                            {paginatedProjects.length > 0 && filterStatus === Status.PENDING && (
                              <div className="flex items-center space-x-3 p-2 bg-gray-900/30 border border-gray-700/50 rounded-md">
                                  <input
                                      type="checkbox"
                                      id="select-all"
                                      checked={allOnPageSelected}
                                      onChange={handleSelectAllOnPage}
                                      className="h-5 w-5 rounded bg-gray-700 border-gray-600 text-cyan-600 focus:ring-cyan-500 cursor-pointer"
                                  />
                                  <label htmlFor="select-all" className="text-sm font-medium text-gray-300 cursor-pointer">Select all on page</label>
                              </div>
                            )}

                            <div className="space-y-3">
                                {paginatedProjects.length === 0 && <div className="text-gray-400 text-center py-8 border-2 border-dashed border-gray-700 rounded-lg">{noSubmissionsText()}</div>}
                                {paginatedProjects.map(p => (
                                    <ProjectAccordionItem key={p.id} project={p} users={users} expandedProjectId={expandedProjectId} setExpandedProjectId={setExpandedProjectId} setImageToPreview={setImageToPreview} onApprove={setSelectedProject} onDeny={setDenyingProject} onViewStudent={(student) => setViewingStudent(student)} onEditProject={setEditingProject}
                                    isSelected={selectedProjectIds.includes(p.id)}
                                    onSelect={handleToggleSelectProject}
                                    />
                                ))}
                            </div>
                            
                            {totalPages > 1 && (
                                <div className="mt-4 flex justify-between items-center pt-4 border-t border-gray-700">
                                    <Button onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1} variant="secondary"><ArrowLeftIcon className="h-4 w-4 mr-2"/><span>Previous</span></Button>
                                    <span className="text-sm font-medium text-gray-400">Page {currentPage} of {totalPages}</span>
                                    <Button onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages} variant="secondary"><span>Next</span><ArrowRightIcon className="h-4 w-4 ml-2"/></Button>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'redemptions' && (
                        <div className="animate-fade-in space-y-4">
                            <div className="flex items-center gap-4">
                                <label htmlFor="redemption-status-filter" className="text-sm font-medium text-gray-400 flex-shrink-0">Filter by status:</label>
                                <div className="relative w-full sm:w-auto sm:min-w-[200px]">
                                    <select
                                        id="redemption-status-filter"
                                        value={redemptionFilterStatus}
                                        onChange={(e) => setRedemptionFilterStatus(e.target.value as Status)}
                                        className="w-full h-full bg-gray-700/80 border-gray-600/70 rounded-md py-2 pl-3 pr-8 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition appearance-none"
                                    >
                                        {Object.values(Status).map(status => (
                                            <option key={status} value={status}>{status}</option>
                                        ))}
                                    </select>
                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                                        <ChevronDownIcon className="h-4 w-4" />
                                    </div>
                                </div>
                            </div>
                             <div className="space-y-3">
                                {filteredRedemptions.length === 0 && <div className="text-gray-400 text-center py-8 border-2 border-dashed border-gray-700 rounded-lg">{`No ${redemptionFilterStatus.toLowerCase()} applications.`}</div>}
                                {filteredRedemptions.map(r => (
                                    <div key={r.id} className="bg-gray-900/50 p-4 rounded-lg flex justify-between items-center">
                                        <div>
                                            <p className="font-medium">{r.type}</p>
                                            <p className="text-sm text-gray-400">From: {users[r.studentId]?.name || 'Unknown'} | Cost: {r.creditsCost} credits</p>
                                        </div>
                                        {r.status === Status.PENDING ? (
                                        <div className="flex space-x-2">
                                            <Button variant="danger" onClick={() => onRedemptionDecision(r.id, Status.DENIED)} className="p-2"><XMarkIcon className="h-4 w-4" /></Button>
                                            <Button variant="success" onClick={() => onRedemptionDecision(r.id, Status.APPROVED)} className="p-2"><CheckIcon className="h-4 w-4" /></Button>
                                        </div>
                                        ) : ( <StatusBadge status={r.status} /> )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {selectedProjectIds.length > 0 && filterStatus === Status.PENDING && (
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30 bg-gray-800/80 backdrop-blur-md border border-gray-700 shadow-2xl rounded-lg p-3 flex items-center space-x-4 animate-fade-in-up">
                    {isProcessingBulk ? (
                        <>
                            <SpinnerIcon className="h-5 w-5 animate-spin text-cyan-400" />
                            <span className="font-semibold text-white px-2">Processing...</span>
                        </>
                    ) : (
                        <>
                            <span className="font-semibold text-white px-2">{selectedProjectIds.length} selected</span>
                            <div className="w-px h-6 bg-gray-600"></div>
                            <Button variant="danger" onClick={handleBulkDeny} className="!py-1.5 !px-3"><XMarkIcon className="h-4 w-4 mr-2"/>Deny</Button>
                            <Button variant="success" onClick={() => setIsBulkApproveModalOpen(true)} className="!py-1.5 !px-3"><CheckIcon className="h-4 w-4 mr-2"/>Approve</Button>
                        </>
                    )}
              </div>
            )}

             <style>{`
                @keyframes fade-in {
                from { opacity: 0; transform: translateY(5px); }
                to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in {
                animation: fade-in 0.3s ease-out forwards;
                }
                @keyframes fade-in-up {
                from { opacity: 0; transform: translate(-50%, 10px); }
                to { opacity: 1; transform: translate(-50%, 0); }
                }
                .animate-fade-in-up {
                    animation: fade-in-up 0.3s ease-out forwards;
                }
                @keyframes fade-in-down {
                  from { opacity: 0; transform: translateY(-10px) scale(0.95); }
                  to { opacity: 1; transform: translateY(0) scale(1); }
                }
                .animate-fade-in-down {
                  animation: fade-in-down 0.15s ease-out forwards;
                }
            `}</style>
        </div>
    );
};

const ProjectAccordionItem: React.FC<{
    project: Project;
    users: { [key: string]: User };
    expandedProjectId: string | null;
    setExpandedProjectId: (id: string | null) => void;
    setImageToPreview: (img: {url: string, title: string} | null) => void;
    onApprove: (p: Project) => void;
    onDeny: (p: Project) => void;
    onViewStudent: (student: User) => void;
    onEditProject: (project: Project) => void;
    isSelected: boolean;
    onSelect: (projectId: string) => void;
}> = ({ project, users, expandedProjectId, setExpandedProjectId, setImageToPreview, onApprove, onDeny, onViewStudent, onEditProject, isSelected, onSelect }) => {
    const isExpanded = expandedProjectId === project.id;
    const p = project;
    const student = users[project.studentId];

    return (
        <div className={`bg-gray-900/50 rounded-lg transition-all duration-300 ease-in-out ${isSelected && p.status === Status.PENDING ? 'ring-2 ring-cyan-500/80' : 'ring-0 ring-cyan-500/0'}`}>
            <div className="p-4 flex items-center">
                <div className="pr-4 w-10 flex-shrink-0">
                   {p.status === Status.PENDING && (
                     <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => {
                            e.stopPropagation();
                            onSelect(p.id);
                        }}
                        className="h-5 w-5 rounded bg-gray-700 border-gray-600 text-cyan-600 focus:ring-cyan-500 cursor-pointer"
                    />
                   )}
                </div>
                <div className="flex-grow cursor-pointer" onClick={() => setExpandedProjectId(isExpanded ? null : p.id)}>
                    <div className="flex justify-between items-center">
                        <div className="flex-1 pr-4 min-w-0">
                            <h3 className="font-semibold truncate" title={p.title}>{p.title}</h3>
                             <p className="text-sm text-gray-400 mt-1">
                                <span className="font-medium text-gray-500">From:</span> <button
                                    onClick={(e) => { e.stopPropagation(); student && onViewStudent(student); }}
                                    disabled={!student}
                                    className="ml-1 text-cyan-400 hover:underline font-medium disabled:text-gray-500 disabled:no-underline"
                                >
                                    {student?.name || 'Unknown'}
                                </button>
                                <span className="text-gray-600 mx-2">&bull;</span>
                                <span className="font-medium text-gray-300">{formatDate(p.submittedAt)}</span>
                            </p>
                        </div>
                        <div className="flex-shrink-0 flex items-center space-x-4">
                           {p.status === Status.APPROVED && (
                                <div className="text-sm font-semibold text-green-400">+{p.creditsAwarded} Credits</div>
                            )}
                            <StatusBadge status={p.status} />
                            <ChevronDownIcon className={`h-5 w-5 text-gray-400 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                        </div>
                    </div>
                </div>
            </div>

            <div className={`transition-all duration-500 ease-in-out overflow-hidden ${isExpanded ? 'max-h-[1000px]' : 'max-h-0'}`}>
                <div className={`px-4 pb-4 pt-4 border-t border-gray-800 transition-opacity duration-500 ${isExpanded ? 'opacity-100' : 'opacity-0'}`}>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-6">
                        <div className="space-y-4">
                             <div>
                                <h4 className="text-sm font-semibold text-gray-400 mb-1">Full Description</h4>
                                <p className="text-sm text-gray-300 whitespace-pre-wrap leading-relaxed">{p.description}</p>
                            </div>
                            <div>
                                <h4 className="text-sm font-semibold text-gray-400 mb-1">GitHub Repository</h4>
                                <a href={p.githubLink} target="_blank" rel="noopener noreferrer" className="text-sm text-cyan-400 hover:underline flex items-center space-x-1.5 w-fit" onClick={e => e.stopPropagation()}>
                                    <span>View on GitHub</span>
                                    <ArrowTopRightOnSquareIcon className="h-4 w-4" />
                                </a>
                            </div>
                            {p.facultyComments && (
                                <div className="pt-2">
                                    <h4 className="text-sm font-semibold text-gray-400 mb-2">Faculty Feedback</h4>
                                    <div className="bg-gray-900 p-3 rounded-md border border-gray-700/50">
                                        <p className="text-sm text-gray-300 whitespace-pre-wrap leading-relaxed">{p.facultyComments}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                        <div>
                            <h4 className="text-sm font-semibold text-gray-400 mb-2">Screenshot</h4>
                            {p.screenshotUrl ? (
                                <div className="group relative cursor-pointer rounded-md overflow-hidden border-2 border-gray-700 hover:border-cyan-500 transition-colors duration-300" onClick={(e) => { e.stopPropagation(); setImageToPreview({ url: p.screenshotUrl!, title: p.title }); }}>
                                    <img src={p.screenshotUrl} alt={`Screenshot for ${p.title}`} className="w-full h-80 object-contain bg-gray-950/50 rounded-sm" />
                                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 transition-all flex items-center justify-center"><MagnifyingGlassIcon className="h-10 w-10 text-white opacity-0 group-hover:opacity-100" /></div>
                                </div>
                            ) : (
                                <div className="border-2 border-dashed border-gray-700 rounded-md h-80 flex flex-col items-center justify-center"><PhotoIcon className="h-10 w-10 text-gray-600 mb-2" /><p className="text-sm text-gray-500">No screenshot.</p></div>
                            )}
                        </div>
                    </div>
                    {p.status === Status.PENDING && (
                        <div className="mt-6 pt-4 border-t border-gray-700/50 flex justify-end items-center space-x-3">
                             <Button variant="secondary" onClick={(e) => { e.stopPropagation(); onEditProject(p); }} className="px-3 py-1.5"><PencilIcon className="h-4 w-4 mr-1" /><span>Edit</span></Button>
                            <Button variant="danger" onClick={(e) => { e.stopPropagation(); onDeny(p); }} className="px-3 py-1.5"><XMarkIcon className="h-4 w-4 mr-1" /><span>Deny</span></Button>
                            <Button variant="success" onClick={(e) => { e.stopPropagation(); onApprove(p); }} className="px-3 py-1.5"><CheckIcon className="h-4 w-4 mr-1" /><span>Approve</span></Button>
                        </div>
                    )}
                     {p.status !== Status.PENDING && (
                        <div className="mt-4 pt-4 border-t border-gray-700/50 flex justify-between items-center text-sm text-gray-400">
                           <span>Decision made. No further actions available.</span>
                           {p.status === Status.DENIED && <span className="font-semibold text-red-400">Project Denied</span>}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};


export default FacultyDashboard;