import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Plus, 
  Calendar, 
  RefreshCw, 
  Layers,
  Inbox,
  Film
} from 'lucide-react';
import { ClientProject, UserWorkflowPreferences, CoordinationLog, PendingWorkCategory } from './types';
import { INITIAL_PROJECTS, INITIAL_PREFERENCES } from './data/mockProjects';
import { computeUrgency, addDays, TODAY_STR, getDaysDifference } from './utils/dateUtils';
import { Header } from './components/Header';
import { UrgentAlertBanner } from './components/UrgentAlertBanner';
import { ProjectCard } from './components/ProjectCard';
import { CoordinationModal } from './components/CoordinationModal';
import { LogPingModal } from './components/LogPingModal';
import { MessageGeneratorModal } from './components/MessageGeneratorModal';
import { ConfirmDateModal } from './components/ConfirmDateModal';
import { QuestionnaireDrawer } from './components/QuestionnaireDrawer';
import { DeadlineTimeline } from './components/DeadlineTimeline';
import { ReminderPopupNotification } from './components/ReminderPopupNotification';
import { OfflineIndicator } from './components/OfflineIndicator';

const STORAGE_KEY = 'wedding_postprod_projects_v3';
const PREFS_KEY = 'wedding_postprod_prefs_v3';

export default function App() {
  const [projects, setProjects] = useState<ClientProject[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].pendingWorks) {
          return parsed;
        }
      }
      return INITIAL_PROJECTS;
    } catch {
      return INITIAL_PROJECTS;
    }
  });

  const [preferences, setPreferences] = useState<UserWorkflowPreferences>(() => {
    try {
      const saved = localStorage.getItem(PREFS_KEY);
      return saved ? JSON.parse(saved) : INITIAL_PREFERENCES;
    } catch {
      return INITIAL_PREFERENCES;
    }
  });

  // UI state
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [activeView, setActiveView] = useState<'cards' | 'timeline'>('cards');

  // Modals state
  const [isCoordinationModalOpen, setIsCoordinationModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<ClientProject | null>(null);

  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [activeLogProject, setActiveLogProject] = useState<ClientProject | null>(null);

  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
  const [activeMessageProject, setActiveMessageProject] = useState<ClientProject | null>(null);

  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [activeConfirmProject, setActiveConfirmProject] = useState<ClientProject | null>(null);

  const [isQuestionnaireOpen, setIsQuestionnaireOpen] = useState(false);
  const [isReminderPopupOpen, setIsReminderPopupOpen] = useState(false);

  // Automatically check for client-promised deadlines due today or overdue on app launch
  useEffect(() => {
    if (preferences.enableInAppPopupAlerts === false) return;
    
    const urgentCount = projects.filter(p => {
      if (p.status === 'resolved' || p.status === 'delivered') return false;
      const diff = p.clientPromisedDate ? getDaysDifference(p.clientPromisedDate, TODAY_STR) : null;
      return diff !== null && diff <= 0;
    }).length;

    // Show on initial load if urgent items exist and haven't been dismissed in current session
    const hasDismissedInSession = sessionStorage.getItem('wedding_popup_dismissed_session');
    if (urgentCount > 0 && !hasDismissedInSession) {
      setIsReminderPopupOpen(true);
    }
  }, [preferences.enableInAppPopupAlerts]);

  // Sync to local storage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
    } catch (e) {
      console.error('Failed to save projects to localStorage', e);
    }
  }, [projects]);

  useEffect(() => {
    try {
      localStorage.setItem(PREFS_KEY, JSON.stringify(preferences));
    } catch (e) {
      console.error('Failed to save preferences to localStorage', e);
    }
  }, [preferences]);

  // Filtering
  const filteredProjects = projects.filter(project => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = 
      project.coupleNames.toLowerCase().includes(q) ||
      (project.contactPerson && project.contactPerson.toLowerCase().includes(q)) ||
      (project.clientPhone && project.clientPhone.toLowerCase().includes(q)) ||
      (project.coordinationNeed && project.coordinationNeed.toLowerCase().includes(q)) ||
      project.pendingWorks.some(pw => pw.toLowerCase().includes(q));

    if (!matchesSearch) return false;

    if (activeFilter === 'action_needed') {
      if (project.status === 'resolved' || project.status === 'delivered') return false;
      return computeUrgency(project).isActionRequiredToday;
    }
    if (activeFilter === 'cat_album') {
      return project.pendingWorks.includes('album_pending');
    }
    if (activeFilter === 'cat_selection') {
      return project.pendingWorks.includes('selection_pending');
    }
    if (activeFilter === 'cat_video') {
      return project.pendingWorks.includes('video_changes');
    }
    if (activeFilter === 'cat_payment') {
      return project.pendingWorks.includes('payment_pending');
    }
    if (activeFilter === 'resolved') {
      return project.status === 'resolved' || project.status === 'delivered';
    }

    return true;
  });

  // Handlers
  const handleSaveProject = (projectData: Partial<ClientProject>) => {
    if (editingProject) {
      // Update existing
      setProjects(prev => prev.map(p => {
        if (p.id === editingProject.id) {
          const promisedDate = projectData.clientPromisedDate || p.clientPromisedDate;
          const daysDiff = promisedDate ? getDaysDifference(promisedDate, TODAY_STR) : 0;
          let newStatus = p.status;
          if (p.status !== 'resolved') {
            if (daysDiff === 0) newStatus = 'date_due_today';
            else if (daysDiff < 0) newStatus = 'date_overdue';
            else newStatus = 'date_promised_active';
          }

          return {
            ...p,
            ...projectData,
            status: newStatus,
          } as ClientProject;
        }
        return p;
      }));
    } else {
      // Create new client
      const promisedDate = projectData.clientPromisedDate || TODAY_STR;
      const daysDiff = getDaysDifference(promisedDate, TODAY_STR);
      let initialStatus: ClientProject['status'] = 'date_promised_active';
      if (daysDiff === 0) initialStatus = 'date_due_today';
      else if (daysDiff < 0) initialStatus = 'date_overdue';

      const newProject: ClientProject = {
        id: `proj-${Date.now()}`,
        coupleNames: projectData.coupleNames || 'New Client',
        weddingDate: projectData.weddingDate,
        contactPerson: projectData.contactPerson || 'Client',
        clientPhone: projectData.clientPhone || '',
        clientEmail: projectData.clientEmail,
        pendingWorks: projectData.pendingWorks && projectData.pendingWorks.length > 0 
          ? projectData.pendingWorks 
          : ['album_pending'],
        coordinationNeed: projectData.coordinationNeed,
        draftReviewLink: projectData.draftReviewLink,
        clientPromisedDate: promisedDate,
        status: initialStatus,
        nextFollowUpDate: promisedDate,
        totalFollowUpsSent: 0,
        notes: projectData.notes,
        logs: [
          {
            id: `log-${Date.now()}`,
            timestamp: new Date().toISOString(),
            channel: 'WhatsApp',
            actionTaken: `Created client coordination with promised date: ${promisedDate}`,
            newPromisedDate: promisedDate,
            nextReminderDate: promisedDate,
          }
        ],
        createdAt: new Date().toISOString()
      };
      setProjects(prev => [newProject, ...prev]);
    }
    setEditingProject(null);
  };

  const handleDeleteProject = (projectId: string) => {
    if (confirm('Are you sure you want to stop tracking this client?')) {
      setProjects(prev => prev.filter(p => p.id !== projectId));
    }
  };

  const handleQuickSnooze = (projectId: string, days: number) => {
    setProjects(prev => prev.map(p => {
      if (p.id === projectId) {
        const newDate = addDays(TODAY_STR, days);
        return {
          ...p,
          nextFollowUpDate: newDate,
          clientPromisedDate: newDate,
          status: 'date_promised_active'
        };
      }
      return p;
    }));
  };

  const handleSaveLog = (projectId: string, logData: {
    channel: 'WhatsApp' | 'Phone Call' | 'Email';
    actionTaken: string;
    clientResponse?: string;
    newPromisedDate?: string;
    nextReminderDate: string;
    isResolved?: boolean;
  }) => {
    setProjects(prev => prev.map(p => {
      if (p.id === projectId) {
        const newLog: CoordinationLog = {
          id: `log-${Date.now()}`,
          timestamp: new Date().toISOString(),
          channel: logData.channel,
          actionTaken: logData.actionTaken,
          clientResponse: logData.clientResponse,
          newPromisedDate: logData.newPromisedDate,
          nextReminderDate: logData.nextReminderDate
        };

        let updatedStatus = p.status;
        if (logData.isResolved) {
          updatedStatus = 'resolved';
        } else if (logData.newPromisedDate) {
          const daysDiff = getDaysDifference(logData.newPromisedDate, TODAY_STR);
          if (daysDiff === 0) updatedStatus = 'date_due_today';
          else if (daysDiff < 0) updatedStatus = 'date_overdue';
          else updatedStatus = 'date_promised_active';
        }

        return {
          ...p,
          lastPingDate: TODAY_STR,
          nextFollowUpDate: logData.nextReminderDate,
          clientPromisedDate: logData.newPromisedDate || p.clientPromisedDate,
          totalFollowUpsSent: p.totalFollowUpsSent + 1,
          status: updatedStatus,
          logs: [newLog, ...(p.logs || [])]
        };
      }
      return p;
    }));
  };

  const handleMarkPingSentFromTemplate = (projectId: string, channel: string, messageNote: string) => {
    const targetProject = projects.find(p => p.id === projectId);
    const nextDate = targetProject?.clientPromisedDate || addDays(TODAY_STR, 1);
    handleSaveLog(projectId, {
      channel: channel as any,
      actionTaken: messageNote,
      nextReminderDate: nextDate,
      isResolved: false
    });
  };

  const handleConfirmPromisedDate = (
    projectId: string, 
    promisedDate: string, 
    isResolved: boolean, 
    notes?: string
  ) => {
    setProjects(prev => prev.map(p => {
      if (p.id === projectId) {
        const daysDiff = getDaysDifference(promisedDate, TODAY_STR);
        let newStatus: ClientProject['status'] = 'date_promised_active';
        if (isResolved) {
          newStatus = 'resolved';
        } else if (daysDiff === 0) {
          newStatus = 'date_due_today';
        } else if (daysDiff < 0) {
          newStatus = 'date_overdue';
        }

        const confirmLog: CoordinationLog = {
          id: `log-${Date.now()}`,
          timestamp: new Date().toISOString(),
          channel: 'WhatsApp',
          actionTaken: isResolved 
            ? `Client feedback / payment marked updated in app! ${notes || ''}` 
            : `Client confirmed update date: ${promisedDate}. ${notes || ''}`,
          newPromisedDate: isResolved ? undefined : promisedDate,
          nextReminderDate: isResolved ? addDays(TODAY_STR, 10) : promisedDate
        };

        return {
          ...p,
          status: newStatus,
          clientPromisedDate: isResolved ? p.clientPromisedDate : promisedDate,
          nextFollowUpDate: isResolved ? p.nextFollowUpDate : promisedDate,
          logs: [confirmLog, ...(p.logs || [])]
        };
      }
      return p;
    }));
  };

  const handleResetDemoData = () => {
    if (confirm('Reset to wedding film sample clients (including Prashant & Sally with Album Pending)?')) {
      setProjects(INITIAL_PROJECTS);
      setPreferences(INITIAL_PREFERENCES);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-100/70 text-zinc-900 flex flex-col font-sans overflow-x-hidden w-full max-w-full">
      {/* App Header with Filter Bar & Metrics */}
      <Header
        projects={projects}
        preferences={preferences}
        onOpenNewModal={() => {
          setEditingProject(null);
          setIsCoordinationModalOpen(true);
        }}
        onOpenQuestionnaire={() => setIsQuestionnaireOpen(true)}
        onOpenReminderPopup={() => setIsReminderPopupOpen(true)}
        activeFilter={activeFilter}
        onSelectFilter={setActiveFilter}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 overflow-x-hidden min-w-0">
        {/* Urgent Alert Banner (Reminds on exact client date until updated in app) */}
        <UrgentAlertBanner
          projects={projects}
          onOpenMessageModal={proj => {
            setActiveMessageProject(proj);
            setIsMessageModalOpen(true);
          }}
          onOpenConfirmModal={proj => {
            setActiveConfirmProject(proj);
            setIsConfirmModalOpen(true);
          }}
          onOpenReminderPopup={() => setIsReminderPopupOpen(true)}
        />

        {/* View Switcher & Search Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search clients (e.g. Prashant & Sally), album, payment, phone..."
              className="w-full bg-white border border-zinc-200 rounded-lg pl-9 pr-3 py-2 text-xs focus:border-zinc-900 focus:outline-none shadow-2xs"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="bg-zinc-200/80 p-0.5 rounded-lg flex items-center text-xs flex-1 sm:flex-initial">
              <button
                onClick={() => setActiveView('cards')}
                className={`flex-1 sm:flex-initial justify-center px-3 py-1.5 rounded-md font-medium transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                  activeView === 'cards'
                    ? 'bg-white text-zinc-900 shadow-2xs font-semibold'
                    : 'text-zinc-600 hover:text-zinc-900'
                }`}
              >
                <Layers className="w-3.5 h-3.5 shrink-0" />
                <span>Client Cards</span>
              </button>
              <button
                onClick={() => setActiveView('timeline')}
                className={`flex-1 sm:flex-initial justify-center px-2.5 sm:px-3 py-1.5 rounded-md font-medium transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                  activeView === 'timeline'
                    ? 'bg-white text-zinc-900 shadow-2xs font-semibold'
                    : 'text-zinc-600 hover:text-zinc-900'
                }`}
              >
                <Calendar className="w-3.5 h-3.5 shrink-0" />
                <span className="hidden sm:inline">Promised Dates Schedule</span>
                <span className="sm:hidden">Schedule</span>
              </button>
            </div>

            <button
              onClick={handleResetDemoData}
              title="Reset to wedding sample data"
              className="p-2 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-500 hover:text-zinc-800 transition-colors shadow-2xs shrink-0"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Primary Views */}
        {activeView === 'cards' ? (
          <div>
            {filteredProjects.length === 0 ? (
              <div className="bg-white rounded-xl border border-zinc-200 p-12 text-center shadow-xs">
                <div className="w-12 h-12 rounded-full bg-zinc-100 flex items-center justify-center mx-auto text-zinc-400 mb-3">
                  <Film className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-semibold text-zinc-900">No matching clients found</h3>
                <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
                  {searchQuery || activeFilter !== 'all' 
                    ? 'Try clearing your search query or filter to see all clients.'
                    : 'Add your first client to start tracking their promised date and reminders.'}
                </p>
                <button
                  onClick={() => {
                    setEditingProject(null);
                    setIsCoordinationModalOpen(true);
                  }}
                  className="mt-4 inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-zinc-900 hover:bg-zinc-800 rounded-lg shadow-xs transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add New Client</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                {filteredProjects.map(project => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    onOpenMessageModal={p => {
                      setActiveMessageProject(p);
                      setIsMessageModalOpen(true);
                    }}
                    onOpenLogModal={p => {
                      setActiveLogProject(p);
                      setIsLogModalOpen(true);
                    }}
                    onConfirmDateModal={p => {
                      setActiveConfirmProject(p);
                      setIsConfirmModalOpen(true);
                    }}
                    onEditProject={p => {
                      setEditingProject(p);
                      setIsCoordinationModalOpen(true);
                    }}
                    onDeleteProject={handleDeleteProject}
                    onQuickSnooze={handleQuickSnooze}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          <DeadlineTimeline
            projects={filteredProjects}
            onSelectProject={p => {
              setActiveMessageProject(p);
              setIsMessageModalOpen(true);
            }}
            onConfirmDateModal={p => {
              setActiveConfirmProject(p);
              setIsConfirmModalOpen(true);
            }}
          />
        )}
      </main>

      {/* Modals & Drawers */}
      {isCoordinationModalOpen && (
        <CoordinationModal
          isOpen={isCoordinationModalOpen}
          onClose={() => {
            setIsCoordinationModalOpen(false);
            setEditingProject(null);
          }}
          onSave={handleSaveProject}
          initialProject={editingProject}
        />
      )}

      {isLogModalOpen && activeLogProject && (
        <LogPingModal
          isOpen={isLogModalOpen}
          project={activeLogProject}
          onClose={() => {
            setIsLogModalOpen(false);
            setActiveLogProject(null);
          }}
          onSaveLog={handleSaveLog}
        />
      )}

      {isMessageModalOpen && activeMessageProject && (
        <MessageGeneratorModal
          isOpen={isMessageModalOpen}
          project={activeMessageProject}
          onClose={() => {
            setIsMessageModalOpen(false);
            setActiveMessageProject(null);
          }}
          onMarkPingSent={handleMarkPingSentFromTemplate}
        />
      )}

      {isConfirmModalOpen && activeConfirmProject && (
        <ConfirmDateModal
          isOpen={isConfirmModalOpen}
          project={activeConfirmProject}
          onClose={() => {
            setIsConfirmModalOpen(false);
            setActiveConfirmProject(null);
          }}
          onConfirmPromisedDate={handleConfirmPromisedDate}
        />
      )}

      {isQuestionnaireOpen && (
        <QuestionnaireDrawer
          isOpen={isQuestionnaireOpen}
          onClose={() => setIsQuestionnaireOpen(false)}
          preferences={preferences}
          onSavePreferences={updated => setPreferences(updated)}
        />
      )}

      {isReminderPopupOpen && (
        <ReminderPopupNotification
          isOpen={isReminderPopupOpen}
          projects={projects}
          onClose={() => {
            setIsReminderPopupOpen(false);
            sessionStorage.setItem('wedding_popup_dismissed_session', 'true');
          }}
          onQuickSnooze={(projectId: string, days: number) => handleQuickSnooze(projectId, days)}
          onOpenConfirmModal={(project: ClientProject) => {
            setActiveConfirmProject(project);
            setIsConfirmModalOpen(true);
          }}
          onQuickMarkResolved={(projectId: string) => {
            handleConfirmPromisedDate(projectId, TODAY_STR, true, 'Marked updated via notification popup');
          }}
          onOpenDraftMessage={(project: ClientProject) => {
            setActiveMessageProject(project);
            setIsMessageModalOpen(true);
          }}
        />
      )}

      <OfflineIndicator />
    </div>
  );
}
