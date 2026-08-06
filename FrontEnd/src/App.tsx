import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { UserRole, CaseItem, Client, CaseDocument, CaseTask, PaymentMilestone, CaseMessage, AppointmentItem, CaseTemplate, StageId, Recommender, AuditLogEntry } from './types';
import { api } from './services/api';
import { 
  INITIAL_CASES, 
  INITIAL_CLIENTS, 
  INITIAL_DOCUMENTS, 
  INITIAL_TASKS, 
  INITIAL_PAYMENTS, 
  CASE_TEMPLATES, 
  INITIAL_MESSAGES 
} from './data/mockData';

import { Sidebar, NavTab } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { DashboardView } from './components/dashboard/DashboardView';
import { CasesListView } from './components/cases/CasesListView';
import { CaseDetailView } from './components/cases/CaseDetailView';
import { ClientsView } from './components/clients/ClientsView';
import { TasksView } from './components/tasks/TasksView';
import { DocumentsView } from './components/documents/DocumentsView';
import { ReviewsView } from './components/reviews/ReviewsView';
import { CommunicationView } from './components/communication/CommunicationView';
import { PaymentsView } from './components/payments/PaymentsView';
import { TemplatesView } from './components/templates/TemplatesView';
import { ReportsView } from './components/reports/ReportsView';
import { SettingsView } from './components/settings/SettingsView';
import { ClientPortalView } from './components/clientPortal/ClientPortalView';
import { AppointmentsView } from './components/appointments/AppointmentsView';

import { AIAssistantModal } from './components/ai/AIAssistantModal';
import { NewCaseModal } from './components/modals/NewCaseModal';
import { NewDocModal } from './components/modals/NewDocModal';
import { NewRecommenderModal } from './components/modals/NewRecommenderModal';
import { AppointmentBookingModal } from './components/modals/AppointmentBookingModal';
import { ElectronicSignatureModal } from './components/modals/ElectronicSignatureModal';
import { USCISFormQuestionnaireModal } from './components/modals/USCISFormQuestionnaireModal';
import { LoginPage } from './components/auth/LoginPage';
import { WhatsAppModal } from './components/communication/WhatsAppModal';

// Tab to URL Route Path Mapping
const TAB_TO_PATH: Record<NavTab, string> = {
  dashboard: '/dashboard',
  cases: '/cases',
  clients: '/clients',
  tasks: '/tasks',
  documents: '/documents',
  reviews: '/reviews',
  communication: '/communication',
  payments: '/payments',
  templates: '/templates',
  reports: '/reports',
  settings: '/settings',
  clientPortal: '/client-portal',
  forms: '/forms',
  appointments: '/appointments',
  postFiling: '/post-filing',
};

const PATH_TO_TAB: Record<string, NavTab> = {
  '/dashboard': 'dashboard',
  '/cases': 'cases',
  '/clients': 'clients',
  '/tasks': 'tasks',
  '/documents': 'documents',
  '/reviews': 'reviews',
  '/communication': 'communication',
  '/payments': 'payments',
  '/templates': 'templates',
  '/reports': 'reports',
  '/settings': 'settings',
  '/client-portal': 'clientPortal',
  '/forms': 'forms',
  '/appointments': 'appointments',
  '/post-filing': 'postFiling',
};

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [userRole, setUserRole] = useState<UserRole>('admin');
  const [currentUserEmail, setCurrentUserEmail] = useState<string>('admin@juris-flow.com');
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);

  // Modals State
  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);
  const [isSignModalOpen, setIsSignModalOpen] = useState(false);
  const [isQuestionnaireModalOpen, setIsQuestionnaireModalOpen] = useState(false);




  // System Administrative Access & Activity History Log State
  const [activityLogs, setActivityLogs] = useState<AuditLogEntry[]>([
    {
      id: 'log-1',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      userEmail: 'admin@juris-flow.com',
      action: 'Super Admin Initialization',
      targetRole: 'admin',
      details: 'Super Administrator session initialized with unrestricted system access permissions.'
    }
  ]);

  // Core App State (default empty, loaded from backend)
  const [cases, setCases] = useState<CaseItem[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [documents, setDocuments] = useState<CaseDocument[]>([]);
  const [tasks, setTasks] = useState<CaseTask[]>([]);
  const [payments, setPayments] = useState<PaymentMilestone[]>([]);
  const [messages, setMessages] = useState<CaseMessage[]>([]);
  const [appointments, setAppointments] = useState<AppointmentItem[]>([]);
  const [templates, setTemplates] = useState<CaseTemplate[]>([]);
  const [systemSettings, setSystemSettings] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [isNewCaseModalOpen, setIsNewCaseModalOpen] = useState(false);
  const [isNewDocModalOpen, setIsNewDocModalOpen] = useState(false);
  const [isNewRecModalOpen, setIsNewRecModalOpen] = useState(false);
  const [commViewMode, setCommViewMode] = useState<'hub' | 'whatsapp'>('whatsapp');

  // Mobile navigation drawer state
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  // Centralized case data properties mapper
  const mapCaseData = (c: any) => ({
    ...c,
    clientName: c.client?.name || 'Unknown',
    clientEmail: c.client?.email || '',
    dhanasar: c.dhanasarProngs || {
      prong1: { title: 'Substantial Merit & National Importance', endeavorSummary: '', usImpactAreas: [], nationalImportanceScore: 0 },
      prong2: { title: 'Well Positioned to Advance the Endeavor', educationTrack: '', keyAchievements: [], citationPercentile: '', fundingSecured: '' },
      prong3: { title: 'On Balance Beneficial to Waive Job Offer & PERM', urgencyArguments: [], uniqueExpertise: '' }
    },
    recommenders: c.recommenders || [],
    documentsCount: c.documents?.length || 0,
    notes: c.notes || '',
    lastUpdated: c.lastUpdated ? c.lastUpdated.substring(0, 16).replace('T', ' ') : ''
  });

  // 1. Auto Login on mount if token exists
  useEffect(() => {
    const token = localStorage.getItem('jwt_token');
    if (token) {
      try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const payload = JSON.parse(window.atob(base64));
        setIsAuthenticated(true);
        setUserRole(payload.role);
        setCurrentUserEmail(payload.email);
      } catch (e) {
        localStorage.removeItem('jwt_token');
      }
    }
  }, []);

  // 2. Fetch data dynamically based on the active tab
  useEffect(() => {
    if (!isAuthenticated) return;

    const loadDataForTab = async () => {
      try {
        switch (activeTab) {
          case 'dashboard':
            // Dashboard needs stats, cases and tasks
            const statsRes = await api.get('/dashboard/stats');
            const dashboardCases = await api.get('/cases');
            if (dashboardCases.success) {
              setCases(dashboardCases.data.map(mapCaseData));
            }
            const dashboardTasks = await api.get('/tasks');
            if (dashboardTasks.success) {
              setTasks(dashboardTasks.data);
            }
            break;

          case 'cases':
          case 'reviews':
            const casesRes = await api.get('/cases');
            if (casesRes.success) {
              setCases(casesRes.data.map(mapCaseData));
            }
            break;

          case 'clients':
            const clientsRes = await api.get('/clients');
            if (clientsRes.success) {
              setClients(clientsRes.data);
            }
            break;

          case 'tasks':
            const tasksRes = await api.get('/tasks');
            if (tasksRes.success) {
              setTasks(tasksRes.data);
            }
            break;

          case 'documents':
            const docsRes = await api.get('/documents');
            if (docsRes.success) {
              setDocuments(docsRes.data);
            }
            break;

          case 'communication':
            // Chat needs cases (for selection) and message threads
            const commCases = await api.get('/cases');
            if (commCases.success) {
              setCases(commCases.data.map(mapCaseData));
            }
            const messagesRes = await api.get('/messages');
            if (messagesRes.success) {
              setMessages(messagesRes.data);
            }
            break;

          case 'payments':
            // Payments needs cases (for syncing invoice) and milestones
            const payCases = await api.get('/cases');
            if (payCases.success) {
              setCases(payCases.data.map(mapCaseData));
            }
            const paymentsRes = await api.get('/payments');
            if (paymentsRes.success) {
              setPayments(paymentsRes.data);
            }
            break;

          case 'appointments':
            const appointmentsRes = await api.get('/appointments');
            if (appointmentsRes.success) {
              setAppointments(appointmentsRes.data);
            }
            break;

          case 'templates':
            const templatesRes = await api.get('/templates');
            if (templatesRes.success) {
              setTemplates(templatesRes.data);
            }
            break;

          case 'settings':
            const settingsRes = await api.get('/settings');
            if (settingsRes.success) {
              setSystemSettings(settingsRes.data.settings);
              setActivityLogs(settingsRes.data.auditLogs);
            }
            break;

          default:
            break;
        }
      } catch (error) {
        console.error(`Error loading data for tab ${activeTab}:`, error);
      }
    };

    loadDataForTab();
  }, [isAuthenticated, activeTab]);

  const ROLE_ALLOWED_TABS: Record<UserRole, NavTab[]> = {
    superadmin: ['dashboard', 'cases', 'clients', 'tasks', 'documents', 'reviews', 'communication', 'payments', 'templates', 'reports', 'settings'],
    admin: ['dashboard', 'cases', 'clients', 'tasks', 'documents', 'reviews', 'communication', 'payments', 'templates', 'reports'],
    writer: ['dashboard', 'cases', 'tasks', 'documents', 'communication', 'templates'],
    reviewer: ['dashboard', 'cases', 'tasks', 'documents', 'forms', 'reviews', 'communication', 'reports'],
    client: ['clientPortal', 'tasks', 'documents', 'forms', 'payments', 'communication', 'appointments', 'postFiling', 'settings'],
  };

  // Sync URL Path with Active Tab state & Route Access Control
  useEffect(() => {
    const path = location.pathname;

    if (path === '/login') {
      if (isAuthenticated) {
        navigate(TAB_TO_PATH[activeTab], { replace: true });
      }
      return;
    }

    if (path.startsWith('/cases/')) {
      const allowed = ROLE_ALLOWED_TABS[userRole] || [];
      if (!allowed.includes('cases')) {
        const defaultTab = userRole === 'client' ? 'clientPortal' : 'dashboard';
        navigate(TAB_TO_PATH[defaultTab], { replace: true });
        return;
      }
      const caseIdFromUrl = path.replace('/cases/', '');
      if (userRole === 'writer') {
        const isAssigned = cases.some(c => c.id === caseIdFromUrl && (c.assignedWriter.includes('Petition Drafter 1') || c.assignedWriter.includes('Drafter 1')));
        if (!isAssigned) {
          navigate('/cases', { replace: true });
          return;
        }
      }
      setActiveTab('cases');
      setSelectedCaseId(caseIdFromUrl);
      return;
    }

    const matchedTab = PATH_TO_TAB[path];
    if (matchedTab) {
      const allowed = ROLE_ALLOWED_TABS[userRole] || [];
      if (!allowed.includes(matchedTab)) {
        const defaultTab = userRole === 'client' ? 'clientPortal' : 'dashboard';
        navigate(TAB_TO_PATH[defaultTab], { replace: true });
        return;
      }
      setActiveTab(matchedTab);
      setSelectedCaseId(null);
    } else if (path === '/' || path === '') {
      if (!isAuthenticated) {
        navigate('/login', { replace: true });
      } else {
        const defaultTab = userRole === 'client' ? 'clientPortal' : 'dashboard';
        navigate(TAB_TO_PATH[defaultTab], { replace: true });
      }
    }
  }, [location.pathname, userRole, isAuthenticated]);

  const handleSaveSettings = async (updatedSettings: any) => {
    try {
      const res = await api.patch('/settings', updatedSettings);
      if (res.success) {
        setSystemSettings(res.data);
        const settingsRes = await api.get('/settings');
        if (settingsRes.success) {
          setSystemSettings(settingsRes.data.settings);
          setActivityLogs(settingsRes.data.auditLogs);
        }
      }
    } catch (error) {
      console.error('Error saving system settings:', error);
    }
  };

  // Navigate to Tab & Update URL
  const navigateToTab = (tab: NavTab) => {
    setActiveTab(tab);
    setSelectedCaseId(null);
    setIsMobileMenuOpen(false);
    const targetPath = TAB_TO_PATH[tab] || '/dashboard';
    navigate(targetPath);
  };

  // Helper to change role & switch to appropriate role workspace view + log "View As" activity
  const handleRoleChange = (role: UserRole) => {
    const newLog: AuditLogEntry = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      userEmail: currentUserEmail,
      action: 'View As / Role Switch',
      targetRole: role,
      details: `Super Admin accessed role workspace: ${role.toUpperCase()}`
    };
    setActivityLogs(prev => [newLog, ...prev]);

    setUserRole(role);
    setSelectedCaseId(null);
    let defaultTab: NavTab = 'dashboard';
    if (role === 'client') {
      defaultTab = 'clientPortal';
    } else if (role === 'writer') {
      defaultTab = 'cases';
    } else if (role === 'reviewer') {
      defaultTab = 'reviews';
    }
    navigateToTab(defaultTab);
  };

  // Auth Handlers with automatic workspace routing & activity logging
  const handleLogin = (role: UserRole, email: string) => {
    setCurrentUserEmail(email);
    setIsAuthenticated(true);
    setUserRole(role);
    setSelectedCaseId(null);

    const loginLog: AuditLogEntry = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      userEmail: email,
      action: role === 'admin' ? 'Super Admin Authentication' : 'Account Sign In',
      targetRole: role,
      details: `Signed in to portal. Automatically routed to ${role.toUpperCase()} assigned workspace.`
    };
    setActivityLogs(prev => [loginLog, ...prev]);

    let targetTab: NavTab = 'dashboard';
    if (role === 'client') targetTab = 'clientPortal';
    else if (role === 'writer') targetTab = 'cases';
    else if (role === 'reviewer') targetTab = 'reviews';

    setActiveTab(targetTab);
    navigate(TAB_TO_PATH[targetTab]);
  };

  const handleLogout = () => {
    localStorage.removeItem('jwt_token');
    setIsAuthenticated(false);
    navigate('/login');
  };

  // Case Selection with URL sync
  const handleSelectCase = (caseId: string) => {
    setSelectedCaseId(caseId);
    setActiveTab('cases');
    navigate(`/cases/${caseId}`);
  };

  const handleUpdateStage = async (caseId: string, newStage: StageId) => {
    const caseToUpdate = cases.find(c => c.id === caseId);
    if (!caseToUpdate) return;

    try {
      const data = await api.patch(`/cases/${caseToUpdate.caseNumber}/stage`, { stageId: newStage });
      if (data.success) {
        setCases(cases.map(c => {
          if (c.id === caseId) {
            return {
              ...c,
              currentStage: newStage,
              lastUpdated: new Date().toISOString().replace('T', ' ').substring(0, 16)
            };
          }
          return c;
        }));
      } else {
        alert('Failed to update stage');
      }
    } catch (error) {
      console.error('Error updating stage:', error);
    }
  };

  const handleAddCase = (newCase: CaseItem) => {
    setCases([newCase, ...cases]);
  };

  const handleAddDoc = (newDoc: CaseDocument) => {
    setDocuments([newDoc, ...documents]);
    // Also increment documentsCount on the specific case
    setCases(cases.map(c => {
      if (c.id === newDoc.caseId) {
        return {
          ...c,
          documentsCount: c.documentsCount + 1
        };
      }
      return c;
    }));
  };

  const handleAddRecommender = (rec: Recommender) => {
    if (!selectedCaseId) return;
    setCases(cases.map(c => {
      if (c.id === selectedCaseId) {
        return { ...c, recommenders: [...c.recommenders, rec] };
      }
      return c;
    }));
  };

  const handleBookAppointment = async (apptData: any) => {
    try {
      const payload = {
        clientName: 'Dr. Alexander Vance',
        clientEmail: 'client@babelglobal.com',
        type: apptData.type,
        specialist: apptData.specialist,
        date: apptData.date,
        time: apptData.time,
        duration: '30 mins',
        status: 'Upcoming',
        meetingUrl: 'https://meet.babelglobal.com/call-892',
        notes: apptData.notes
      };
      const data = await api.post('/appointments', payload);
      if (data.success) {
        setAppointments(prev => [...prev, data.data]);
      }
    } catch (err: any) {
      alert(`Booking failed: ${err.message}`);
    }
  };

  // Current active case detail object
  const activeCase = cases.find(c => c.id === selectedCaseId);

  // Filter cases accessible to current user role (Drafters can only access cases assigned to them)
  const roleFilteredCases = cases.filter(c => {
    if (userRole === 'writer') {
      return c.assignedWriter.includes('Petition Drafter 1') || c.assignedWriter.includes('Drafter 1');
    }
    return true;
  });

  // If user is not authenticated or at /login route, render Login Page
  if (!isAuthenticated || location.pathname === '/login') {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <div className="flex h-screen bg-slate-100 font-sans text-slate-800 antialiased overflow-hidden">
      {/* Left Sidebar (Desktop & Mobile Drawer) */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={navigateToTab}
        userRole={userRole}
        setUserRole={handleRoleChange}
        openAIAssistant={() => {
          setIsMobileMenuOpen(false);
          setIsAiModalOpen(true);
        }}
        openWhatsAppModal={() => {
          setCommViewMode('whatsapp');
        }}
        openHubLogs={() => {
          setCommViewMode('hub');
        }}
        activeCaseCount={roleFilteredCases.length}
        onLogout={handleLogout}
        isMobileOpen={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">
        <Header
          userRole={userRole}
          activeTab={activeTab}
          onNavigateTab={navigateToTab}
          openNewCaseModal={() => setIsNewCaseModalOpen(true)}
          openNewDocModal={() => setIsNewDocModalOpen(true)}
          openAIAssistant={() => setIsAiModalOpen(true)}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onLogout={handleLogout}
          onToggleMobileMenu={() => setIsMobileMenuOpen(prev => !prev)}
        />

        <main className="flex-1 p-3 sm:p-6 overflow-y-auto max-w-full">
          {userRole === 'client' || activeTab === 'clientPortal' ? (
            <ClientPortalView
              caseData={roleFilteredCases.find(c => c.id === selectedCaseId) || roleFilteredCases[0] || cases[0]}
              documents={documents}
              messages={messages}
              openNewDocModal={() => setIsNewDocModalOpen(true)}
              openAppointmentModal={() => setIsAppointmentModalOpen(true)}
              openSignModal={() => setIsSignModalOpen(true)}
              openQuestionnaireModal={() => setIsQuestionnaireModalOpen(true)}
              activeNavTab={activeTab}
              onNavigateTab={navigateToTab}
              commViewMode={commViewMode}
              setCommViewMode={setCommViewMode}
            />
          ) : activeTab === 'dashboard' ? (
            selectedCaseId ? (
              <CaseDetailView
                caseData={roleFilteredCases.find(c => c.id === selectedCaseId) || roleFilteredCases[0] || cases[0]}
                documents={documents}
                messages={messages}
                onBack={() => {
                  setSelectedCaseId(null);
                  navigate('/cases');
                }}
                onUpdateStage={handleUpdateStage}
                openAIAssistant={() => setIsAiModalOpen(true)}
                openNewDocModal={() => setIsNewDocModalOpen(true)}
                openNewRecommenderModal={() => setIsNewRecModalOpen(true)}
                userRole={userRole}
              />
            ) : (
              <DashboardView
                cases={roleFilteredCases}
                tasks={tasks}
                onSelectCase={handleSelectCase}
                openNewCaseModal={() => setIsNewCaseModalOpen(true)}
                openAIAssistant={() => setIsAiModalOpen(true)}
                userRole={userRole}
              />
            )
          ) : activeTab === 'cases' ? (
            selectedCaseId ? (
              <CaseDetailView
                caseData={roleFilteredCases.find(c => c.id === selectedCaseId) || roleFilteredCases[0] || cases[0]}
                documents={documents}
                messages={messages}
                onBack={() => {
                  setSelectedCaseId(null);
                  navigate('/cases');
                }}
                onUpdateStage={handleUpdateStage}
                openAIAssistant={() => setIsAiModalOpen(true)}
                openNewDocModal={() => setIsNewDocModalOpen(true)}
                openNewRecommenderModal={() => setIsNewRecModalOpen(true)}
                userRole={userRole}
              />
            ) : (
              <CasesListView
                cases={roleFilteredCases}
                onSelectCase={handleSelectCase}
                openNewCaseModal={() => setIsNewCaseModalOpen(true)}
                openAIAssistant={() => setIsAiModalOpen(true)}
                userRole={userRole}
              />
            )
          ) : activeTab === 'clients' ? (
            <ClientsView clients={clients} userRole={userRole} openNewCaseModal={() => setIsNewCaseModalOpen(true)} />
          ) : activeTab === 'tasks' ? (
            <TasksView
              tasks={tasks}
              userRole={userRole}
              onAddTask={(newTask) => setTasks([newTask, ...tasks])}
            />
          ) : activeTab === 'documents' ? (
            <DocumentsView
              documents={documents}
              openNewDocModal={() => setIsNewDocModalOpen(true)}
              openAIAssistant={() => setIsAiModalOpen(true)}
            />
          ) : activeTab === 'reviews' ? (
            <ReviewsView
              cases={roleFilteredCases}
              onSelectCase={handleSelectCase}
              openAIAssistant={() => setIsAiModalOpen(true)}
              onUpdateStage={handleUpdateStage}
            />
          ) : activeTab === 'communication' ? (
            <CommunicationView cases={roleFilteredCases} messages={messages} viewMode={commViewMode} />
          ) : activeTab === 'appointments' ? (
            <AppointmentsView
              appointments={appointments}
              setAppointments={setAppointments}
              userRole={userRole}
              openBookingModal={() => setIsAppointmentModalOpen(true)}
            />
          ) : activeTab === 'payments' ? (
            <PaymentsView payments={payments} cases={cases} />
          ) : activeTab === 'templates' ? (
            <TemplatesView templates={templates} openAIAssistant={() => setIsAiModalOpen(true)} />
          ) : activeTab === 'reports' ? (
            <ReportsView />
          ) : activeTab === 'settings' ? (
            <SettingsView 
              activityLogs={activityLogs} 
              settings={systemSettings} 
              onSaveSettings={handleSaveSettings}
            />
          ) : null}
        </main>
      </div>

      {/* Global Modals */}
      <AIAssistantModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
      />

      <NewCaseModal
        isOpen={isNewCaseModalOpen && (userRole === 'superadmin' || userRole === 'admin')}
        onClose={() => setIsNewCaseModalOpen(false)}
        onAddCase={handleAddCase}
      />

      <NewDocModal
        isOpen={isNewDocModalOpen}
        onClose={() => setIsNewDocModalOpen(false)}
        onAddDoc={handleAddDoc}
        caseId={selectedCaseId || cases[0]?.id}
      />

      <NewRecommenderModal
        isOpen={isNewRecModalOpen}
        onClose={() => setIsNewRecModalOpen(false)}
        onAddRecommender={handleAddRecommender}
        caseId={selectedCaseId || cases[0]?.id}
      />

      <AppointmentBookingModal
        isOpen={isAppointmentModalOpen}
        onClose={() => setIsAppointmentModalOpen(false)}
        onBookAppointment={handleBookAppointment}
      />

      <ElectronicSignatureModal
        isOpen={isSignModalOpen}
        onClose={() => setIsSignModalOpen(false)}
      />

      <USCISFormQuestionnaireModal
        isOpen={isQuestionnaireModalOpen}
        onClose={() => setIsQuestionnaireModalOpen(false)}
      />
    </div>
  );
}


