import React from 'react';
import Button from './Button';
import { AcademicCapIcon, ArrowRightIcon, CloudArrowUpIcon, StarIcon, ClipboardDocumentListIcon, SparklesIcon, TicketIcon, WrenchScrewdriverIcon } from './icons/Icons';

interface LandingPageProps {
  onEnter: () => void;
}

const FeatureCard: React.FC<{
  icon: React.ReactNode;
  title: string;
  description: string;
  align?: 'left' | 'right';
}> = ({ icon, title, description, align = 'left' }) => (
  <div className={`flex flex-col md:flex-row items-center gap-8 md:gap-12 ${align === 'right' ? 'md:flex-row-reverse' : ''}`}>
    <div className="flex-shrink-0 w-48 h-48 bg-gray-800/50 border border-gray-700/50 rounded-2xl flex items-center justify-center shadow-lg relative">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-transparent rounded-2xl"></div>
        <div className="relative text-cyan-400">{icon}</div>
    </div>
    <div className={`flex-1 text-center ${align === 'left' ? 'md:text-left' : 'md:text-right'}`}>
      <h3 className="text-2xl font-bold text-white mb-3">{title}</h3>
      <p className="text-gray-400 max-w-md mx-auto md:mx-0">{description}</p>
    </div>
  </div>
);


const LandingPage: React.FC<LandingPageProps> = ({ onEnter }) => {
  return (
    <div className="min-h-screen w-full bg-[#111] text-gray-200 flex flex-col items-center justify-center p-4 sm:p-6 md:p-8 overflow-x-hidden">
      
      <div className="absolute inset-0 z-0 opacity-50">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-gray-900 via-gray-900 to-black"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzMiAzMiIgd2lkdGg9IjMyIiBoZWlnaHQ9IjMyIiBmaWxsPSJub25lIiBzdHJva2U9InJnYmEoMjU1LDI1NSwyNTUsMC4wNSkiPjxwYXRoIGQ9Ik0wIC41SDMybTAtMTBWMzJNMCAxNS41SDMyTTAtMjUuNVYzMiIvPjwvc3ZnPg==')_repeat]"></div>
      </div>

       <div className="absolute top-0 left-0 h-96 w-96 bg-cyan-500/20 rounded-full blur-3xl animate-pulse-slow opacity-20 -translate-x-1/4 -translate-y-1/4"></div>
       <div className="absolute bottom-0 right-0 h-96 w-96 bg-cyan-500/20 rounded-full blur-3xl animate-pulse-slow opacity-20 translate-x-1/4 translate-y-1/4"></div>

      <main className="relative z-10 flex flex-col items-center w-full max-w-7xl mx-auto">
        <section className="text-center py-16 md:py-24 scroll-animate">
          <div className="relative inline-block mb-6">
              <div className="absolute -inset-2 bg-cyan-400/20 rounded-full blur-2xl"></div>
              <AcademicCapIcon className="relative h-16 w-16 md:h-20 md:w-20 text-cyan-400 mx-auto" />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tighter mb-4 bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-400">
            Transform Projects into Progress
          </h1>
          <p className="text-lg md:text-xl text-gray-400 mb-10 max-w-3xl mx-auto">
            A dynamic credit exchange system where your hard work is rewarded with academic flexibility.
          </p>
          <Button onClick={onEnter} variant="primary" className="px-8 py-3 text-lg group">
              <span>Launch Dashboard</span>
              <ArrowRightIcon className="h-5 w-5 ml-2 transition-transform duration-300 group-hover:translate-x-1" />
          </Button>
        </section>

        <section className="w-full py-16 md:py-24 space-y-16 md:space-y-24">
          <div className="scroll-animate text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white">The Student Journey</h2>
            <p className="text-gray-400 mt-2">From submission to reward, a seamless path to academic flexibility.</p>
          </div>

          <div className="space-y-16 md:space-y-24">
              <div className="scroll-animate">
                 <FeatureCard 
                    icon={<CloudArrowUpIcon className="h-20 w-20"/>}
                    title="1. Submit Your Work"
                    description="Easily upload your projects, from code repositories to design portfolios. Our simple submission form gets your work in front of faculty in minutes."
                    align="left"
                 />
              </div>
               <div className="scroll-animate">
                 <FeatureCard 
                    icon={<StarIcon className="h-20 w-20 text-yellow-400"/>}
                    title="2. Earn Credit Points"
                    description="Faculty review your submission, provide feedback, and award credits for exceptional work. Watch your credit balance grow as you showcase your skills."
                    align="right"
                 />
              </div>
               <div className="scroll-animate">
                 <FeatureCard 
                    icon={<TicketIcon className="h-20 w-20"/>}
                    title="3. Achieve Academic Flexibility"
                    description="Apply your earned credits toward alternative assessments or flexible tutorial arrangements. Utilize your points through the dashboard to tailor your academic journey."
                    align="left"
                 />
              </div>
          </div>
        </section>

        <section className="w-full py-16 md:py-24 space-y-16 md:space-y-24">
          <div className="scroll-animate text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white">The Faculty Workflow</h2>
            <p className="text-gray-400 mt-2">A streamlined process to review, reward, and foster student talent.</p>
          </div>

          <div className="space-y-16 md:space-y-24">
              <div className="scroll-animate">
                 <FeatureCard 
                    icon={<ClipboardDocumentListIcon className="h-20 w-20"/>}
                    title="1. Review Submissions"
                    description="Access all student projects in a centralized dashboard. View project details, GitHub links, and screenshots in an organized, easy-to-navigate interface."
                    align="left"
                 />
              </div>
               <div className="scroll-animate">
                 <FeatureCard 
                    icon={<SparklesIcon className="h-20 w-20 text-yellow-400"/>}
                    title="2. Award & Approve"
                    description="Recognize outstanding work by approving projects and assigning credit points. Deny submissions with constructive feedback to encourage improvement."
                    align="right"
                 />
              </div>
               <div className="scroll-animate">
                 <FeatureCard 
                    icon={<WrenchScrewdriverIcon className="h-20 w-20"/>}
                    title="3. Facilitate Student Growth"
                    description="Review student applications for credit-based academic flexibility. Approve or deny requests to ensure pedagogical integrity and support student success."
                    align="left"
                 />
              </div>
          </div>
        </section>
      </main>

      <footer className="relative z-10 w-full max-w-7xl mx-auto text-center py-8 mt-16 border-t border-gray-800">
        <p className="text-gray-500 text-sm">&copy; {new Date().getFullYear()} Credit Exchange. All Rights Reserved.</p>
      </footer>

      <style>{`
        @keyframes pulse-slow {
            0%, 100% { transform: scale(1); opacity: 0.2; }
            50% { transform: scale(1.1); opacity: 0.3; }
        }
        .animate-pulse-slow {
            animation: pulse-slow 8s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        .scroll-animate {
            transition-delay: 150ms;
        }
      `}</style>
    </div>
  );
};

export default LandingPage;