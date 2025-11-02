

import React, { useState, useMemo } from 'react';
import { Project, RedemptionRequest, User, RedemptionType, Status } from '../types';
import { CREDIT_COSTS } from '../constants';
import Card from './Card';
import Button from './Button';
import Modal from './Modal';
import { PlusIcon, StarIcon, ArrowRightIcon, ClipboardDocumentListIcon, CheckIcon, XMarkIcon, ArrowTopRightOnSquareIcon, TicketIcon } from './icons/Icons';

interface StudentDashboardProps {
  user: User;
  projects: Project[];
  redemptions: RedemptionRequest[];
  onProjectSubmit: (project: Omit<Project, 'id' | 'studentId' | 'status' | 'creditsAwarded' | 'submittedAt'>) => void;
  onRedemptionRequest: (request: Omit<RedemptionRequest, 'id' | 'studentId' | 'status' | 'requestedAt'>) => void;
}

const statusInfo: { [key in Status]: { icon: React.ReactNode; color: string; } } = {
  [Status.PENDING]: { icon: <ClipboardDocumentListIcon className="h-6 w-6" />, color: 'text-yellow-400 bg-yellow-400/10' },
  [Status.APPROVED]: { icon: <CheckIcon className="h-6 w-6" />, color: 'text-green-400 bg-green-400/10' },
  [Status.DENIED]: { icon: <XMarkIcon className="h-6 w-6" />, color: 'text-red-400 bg-red-400/10' },
};

const statusColorMap: { [key in Status]: string } = {
  [Status.PENDING]: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
  [Status.APPROVED]: 'bg-green-500/20 text-green-300 border-green-500/30',
  [Status.DENIED]: 'bg-red-500/20 text-red-300 border-red-500/30',
};

const StatusBadge: React.FC<{ status: Status }> = ({ status }) => (
    <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full border ${statusColorMap[status]}`}>
        {status}
    </span>
);

const MAX_DESC_LENGTH = 500;
const GITHUB_URL_REGEX = /^(https?:\/\/)?(www\.)?github\.com\/[a-zA-Z0-9-]+\/[a-zA-Z0-9-._]+(\/)?$/;

const ProjectForm: React.FC<{ onSubmit: (data: any) => void; onClose: () => void }> = ({ onSubmit, onClose }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [githubLink, setGithubLink] = useState('');
    const [screenshotFile, setScreenshotFile] = useState<File | undefined>(undefined);
    const [isGithubLinkTouched, setIsGithubLinkTouched] = useState(false);

    const isGithubLinkValid = useMemo(() => {
        if (!githubLink) return false;
        return GITHUB_URL_REGEX.test(githubLink);
    }, [githubLink]);
    
    const isFormValid = useMemo(() => {
        return title.trim() !== '' &&
               description.trim() !== '' &&
               description.length <= MAX_DESC_LENGTH &&
               isGithubLinkValid;
    }, [title, description, isGithubLinkValid]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!isFormValid) return;
        onSubmit({ title, description, githubLink, screenshotFile });
        onClose();
    };
    
    const handleGithubLinkChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setGithubLink(e.target.value);
        if (!isGithubLinkTouched) {
            setIsGithubLinkTouched(true);
        }
    };
    
    const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        if (e.target.value.length <= MAX_DESC_LENGTH) {
            setDescription(e.target.value);
        }
    };

    const githubInputClasses = useMemo(() => {
        let baseClasses = "w-full bg-gray-700 border rounded-md p-2 focus:ring-2 transition pr-10 ";
        if (!isGithubLinkTouched || !githubLink.trim()) {
             return baseClasses + "border-gray-600 focus:ring-cyan-500 focus:border-cyan-500";
        }
        if (isGithubLinkValid) {
            return baseClasses + "border-green-500/50 focus:ring-green-500 focus:border-green-500 text-green-300";
        } else {
            return baseClasses + "border-red-500/50 focus:ring-red-500 focus:border-red-500 text-red-300";
        }
    }, [isGithubLinkTouched, githubLink, isGithubLinkValid]);

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label htmlFor="project-title" className="block text-sm font-medium text-gray-400 mb-1">Project Title</label>
                <input id="project-title" type="text" value={title} onChange={e => setTitle(e.target.value)} required className="w-full bg-gray-700 border-gray-600 rounded-md p-2 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition"/>
            </div>
            <div>
                 <div className="flex justify-between items-center mb-1">
                    <label htmlFor="project-description" className="block text-sm font-medium text-gray-400">Description</label>
                    <span className={`text-xs font-mono ${description.length >= MAX_DESC_LENGTH ? 'text-red-400' : 'text-gray-500'}`}>
                        {description.length}/{MAX_DESC_LENGTH}
                    </span>
                </div>
                <textarea id="project-description" value={description} onChange={handleDescriptionChange} required className="w-full bg-gray-700 border-gray-600 rounded-md p-2 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition h-24"/>
            </div>
            <div>
                <label htmlFor="github-link" className="block text-sm font-medium text-gray-400 mb-1">GitHub Link</label>
                 <div className="relative">
                    <input id="github-link" type="url" value={githubLink} onChange={handleGithubLinkChange} onBlur={() => setIsGithubLinkTouched(true)} required className={githubInputClasses} placeholder="https://github.com/user/repo"/>
                    {isGithubLinkTouched && githubLink.trim() && (
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                            {isGithubLinkValid ? (
                                <CheckIcon className="h-5 w-5 text-green-500" />
                            ) : (
                                <XMarkIcon className="h-5 w-5 text-red-500" />
                            )}
                        </div>
                    )}
                </div>
                {isGithubLinkTouched && githubLink.trim() && !isGithubLinkValid && (
                    <p className="mt-1.5 text-xs text-red-400">Please enter a valid GitHub repository URL.</p>
                )}
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Screenshot</label>
                <input type="file" accept="image/*" onChange={e => setScreenshotFile(e.target.files?.[0])} className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-gray-700 file:text-cyan-400 hover:file:bg-gray-600"/>
            </div>
            <div className="flex justify-end pt-4 space-x-2">
                <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                <Button type="submit" disabled={!isFormValid}>Submit Project</Button>
            </div>
        </form>
    );
};

const StudentDashboard: React.FC<StudentDashboardProps> = ({ user, projects, redemptions, onProjectSubmit, onRedemptionRequest }) => {
    const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
    const [isRedemptionModalOpen, setIsRedemptionModalOpen] = useState(false);
    const [redemptionType, setRedemptionType] = useState<RedemptionType>(RedemptionType.ALTERNATIVE_ASSESSMENT);

    const handleConfirmRedemption = () => {
        const cost = CREDIT_COSTS[redemptionType];
        onRedemptionRequest({ type: redemptionType, creditsCost: cost });
        setIsRedemptionModalOpen(false);
    };

    return (
        <div className="space-y-8">
            <Modal isOpen={isProjectModalOpen} onClose={() => setIsProjectModalOpen(false)} title="Submit New Project">
                <ProjectForm onSubmit={onProjectSubmit} onClose={() => setIsProjectModalOpen(false)} />
            </Modal>

            <Modal 
                isOpen={isRedemptionModalOpen} 
                onClose={() => setIsRedemptionModalOpen(false)} 
                title="Confirm Credit Application"
                size="md"
            >
                <div className="space-y-4">
                    <p className="text-gray-300">
                        You are about to apply for an 
                        <strong className="text-white"> {redemptionType}</strong>. 
                        This will deduct <strong className="text-cyan-400">{CREDIT_COSTS[redemptionType]} credits</strong> from your balance.
                    </p>
                    <p className="text-sm text-gray-400">
                        Your application will be sent to the faculty for review. Please confirm you wish to proceed.
                    </p>
                    <div className="flex justify-end items-center pt-4 space-x-2">
                         <div className="flex items-center space-x-2 mr-auto">
                            <TicketIcon className="h-5 w-5 text-orange-400"/>
                            <span className="text-gray-400 text-sm">Cost: <span className="font-bold text-white">{CREDIT_COSTS[redemptionType]} credits</span></span>
                        </div>
                        <Button variant="secondary" onClick={() => setIsRedemptionModalOpen(false)}>Cancel</Button>
                        <Button variant="primary" onClick={handleConfirmRedemption}>
                            Confirm & Apply
                        </Button>
                    </div>
                </div>
            </Modal>
            
            <Card>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="flex-1">
                        <h2 className="text-lg font-semibold text-gray-300 mb-2">Welcome, {user.name.split(' ')[0]}</h2>
                        <div className="flex items-center space-x-3">
                            <div className="p-2 bg-yellow-400/10 rounded-full"><StarIcon className="h-8 w-8 text-yellow-400" /></div>
                            <div>
                                <p className="text-4xl font-bold">{user.credits}</p>
                                <p className="text-gray-400 text-sm -mt-1">credits available</p>
                            </div>
                        </div>
                    </div>
                    <div className="w-full md:w-px h-px md:h-20 bg-gray-700/50"></div>
                    <div className="flex-1 w-full">
                        <h2 className="text-lg font-semibold text-gray-300 mb-3">Apply Credits for Flexibility</h2>
                        <div className="flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-3">
                            <select
                                value={redemptionType}
                                onChange={e => setRedemptionType(e.target.value as RedemptionType)}
                                className="w-full sm:w-auto flex-grow bg-gray-700 border-gray-600 rounded-md py-[9px] px-3 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition"
                            >
                                <option value={RedemptionType.ALTERNATIVE_ASSESSMENT}>Alternative Assessment ({CREDIT_COSTS[RedemptionType.ALTERNATIVE_ASSESSMENT]} credits)</option>
                                <option value={RedemptionType.FLEXIBLE_TUTORIAL}>Flexible Tutorial ({CREDIT_COSTS[RedemptionType.FLEXIBLE_TUTORIAL]} credits)</option>
                            </select>
                            <Button onClick={() => setIsRedemptionModalOpen(true)} className="w-full sm:w-auto" disabled={user.credits < CREDIT_COSTS[redemptionType]}>
                                <span>Apply Credits</span>
                                <ArrowRightIcon className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            </Card>
            
            <Card>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">My Projects</h2>
                    <Button onClick={() => setIsProjectModalOpen(true)}>
                        <PlusIcon className="h-5 w-5" />
                        <span>Submit Project</span>
                    </Button>
                </div>
                <div className="space-y-3">
                    {projects.length === 0 && <p className="text-center py-8 text-gray-500">You haven't submitted any projects yet.</p>}
                    {projects.map(p => (
                        <div key={p.id} className="bg-gray-900/50 p-4 rounded-lg flex items-center space-x-4 transition-colors hover:bg-gray-900">
                            <div className={`flex-shrink-0 p-2 rounded-full ${statusInfo[p.status].color}`}>
                                {statusInfo[p.status].icon}
                            </div>
                            <div className="flex-grow">
                                <h3 className="font-semibold">{p.title}</h3>
                                <a href={p.githubLink} target="_blank" rel="noopener noreferrer" className="text-sm text-cyan-400 hover:underline flex items-center space-x-1 w-fit">
                                    <span>GitHub Link</span>
                                    <ArrowTopRightOnSquareIcon className="h-3 w-3" />
                                </a>
                            </div>
                            <div className="flex items-center space-x-4 flex-shrink-0">
                               {p.status === Status.APPROVED && <div className="text-sm font-semibold text-green-400">+{p.creditsAwarded} Credits</div>}
                                <StatusBadge status={p.status} />
                            </div>
                        </div>
                    ))}
                </div>
            </Card>

            <Card>
                <h2 className="text-xl font-bold mb-4">Application History</h2>
                <div className="space-y-3">
                    {redemptions.length === 0 && <p className="text-center py-8 text-gray-500">You haven't applied for academic flexibility yet.</p>}
                    {redemptions.map(r => (
                         <div key={r.id} className="bg-gray-900/50 p-4 rounded-lg flex items-center space-x-4 transition-colors hover:bg-gray-900">
                            <div className={`flex-shrink-0 p-2 rounded-full ${statusInfo[r.status].color}`}>
                                {statusInfo[r.status].icon}
                            </div>
                            <div className="flex-grow">
                                <p className="font-medium">{r.type}</p>
                                <p className="text-sm text-gray-400">Cost: {r.creditsCost} credits on {new Date(r.requestedAt).toLocaleDateString()}</p>
                            </div>
                             <StatusBadge status={r.status} />
                        </div>
                    ))}
                </div>
            </Card>

        </div>
    );
};

export default StudentDashboard;