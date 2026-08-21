import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { UserRole, CaseItem, Client, CaseDocument, CaseTask, PaymentMilestone, CaseMessage, AppointmentItem, CaseTemplate, StageId, Recommender, AuditLogEntry } from './types';
import { api } from './services/api';

import { Sidebar, NavTab } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { DashboardView } from './components/dashboard/DashboardView';
import { CasesListView } from './components/cases/CasesListView';
import { CaseDetailView } from './components/cases/CaseDetailView';
import { ClientsView } from './components/clients/ClientsView';
import { AdminManagementView } from './components/admin/AdminManagementView';
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
import { ResumeBuildingModal } from './components/modals/ResumeBuildingModal';
import { LoginPage } from './components/auth/LoginPage';
import { WhatsAppModal } from './components/communication/WhatsAppModal';
import { NewCaseCreationModal } from './components/modals/NewCaseCreationModal';
import { NewClientOnboardingModal } from './components/modals/NewClientOnboardingModal';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

// Tab to URL Route Path Mapping
const TAB_TO_PATH: Record<NavTab, string> = {
  dashboard: '/dashboard',
  cases: '/cases',
  clients: '/clients',
  adminManagement: '/admin-management',
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
  '/admin-management': 'adminManagement',
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
  const [userRole, setUserRole] = useState<UserRole>((localStorage.getItem('override_user_role') as UserRole) || 'admin');
  const [currentUserEmail, setCurrentUserEmail] = useState<string>('admin@babelglobal.com');
  const [currentUser, setCurrentUser] = useState<{ id: string; name: string; email: string; role: UserRole; avatar?: string } | null>(null);
  const [isSwitchingRole, setIsSwitchingRole] = useState(false);
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
      userEmail: 'admin@babelglobal.com',
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
  const [isResumeBuildingModalOpen, setIsResumeBuildingModalOpen] = useState(false);
  const [resumeBuildingCase, setResumeBuildingCase] = useState<CaseItem | null>(null);
  const [isNewCaseCreationModalOpen, setIsNewCaseCreationModalOpen] = useState(false);
  const [isNewClientOnboardingModalOpen, setIsNewClientOnboardingModalOpen] = useState(false);
  const [commViewMode, setCommViewMode] = useState<'hub' | 'whatsapp'>('whatsapp');
  const [caseToDelete, setCaseToDelete] = useState<{ id: string; number: string } | null>(null);
  const [caseDeleteSuccessMsg, setCaseDeleteSuccessMsg] = useState<string | null>(null);

  const handleOpenResumeBuilding = (c: CaseItem) => {
    setResumeBuildingCase(c);
    setIsResumeBuildingModalOpen(true);
  };

  const handleDeleteCase = (caseId: string, caseNumber: string) => {
    setCaseToDelete({ id: caseId, number: caseNumber });
  };

  const confirmDeleteCase = async () => {
    if (!caseToDelete) return;
    try {
      const res = await api.delete(`/cases/${caseToDelete.id}`);
      if (res.success) {
        setCases(prev => prev.filter(c => c.id !== caseToDelete.id));
        setCaseDeleteSuccessMsg(`Case ${caseToDelete.number} deleted successfully.`);
        if (selectedCaseId === caseToDelete.id) {
          setSelectedCaseId(null);
        }
      } else {
        alert(res.error || 'Failed to delete case');
      }
    } catch (err: any) {
      alert(err.message || 'Failed to delete case');
    } finally {
      setCaseToDelete(null);
    }
  };

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

  // 1. Auto Login on mount if token exists & fetch authenticated user profile
  useEffect(() => {
    const token = localStorage.getItem('jwt_token');
    if (token) {
      const fetchCurrentUser = async () => {
        try {
          const res = await api.get('/auth/me');
          if (res.success && res.user) {
            setIsAuthenticated(true);
            const savedRole = localStorage.getItem('override_user_role') as UserRole;
            setUserRole(savedRole || (res.user.role as UserRole));
            setCurrentUserEmail(res.user.email);
            setCurrentUser(res.user);
          } else {
            localStorage.removeItem('jwt_token');
            localStorage.removeItem('override_user_role');
            setIsAuthenticated(false);
            setCurrentUser(null);
          }
        } catch (e) {
          try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const payload = JSON.parse(window.atob(base64));
            setIsAuthenticated(true);
            const savedRole = localStorage.getItem('override_user_role') as UserRole;
            setUserRole(savedRole || (payload.role as UserRole));
            setCurrentUserEmail(payload.email);
          } catch (err) {
            localStorage.removeItem('jwt_token');
            setIsAuthenticated(false);
            setCurrentUser(null);
          }
        }
      };
      fetchCurrentUser();
    }
  }, []);

  // 2. Fetch data dynamically based on the active tab
  useEffect(() => {
    if (!isAuthenticated) return;

    const loadDataForTab = async () => {
      try {
        // If user is a client, always ensure their case is loaded via /cases/my-case
        if (userRole === 'client') {
          const myCaseRes = await api.get('/cases/my-case');
          if (myCaseRes.success && myCaseRes.data) {
            const mapped = mapCaseData(myCaseRes.data);
            setCases(prev => {
              const exists = prev.find(c => c.id === mapped.id);
              return exists
                ? prev.map(c => (c.id === mapped.id ? mapped : c))
                : [mapped, ...prev];
            });
            const myDocsRes = await api.get('/documents');
            if (myDocsRes.success) setDocuments(myDocsRes.data);
            const myMsgsRes = await api.get('/messages');
            if (myMsgsRes.success) setMessages(myMsgsRes.data);
          }
          return;
        }

        switch (activeTab) {
          case 'dashboard':
            // Dashboard needs stats, cases, tasks and clients (for new case dropdown)
            const statsRes = await api.get('/dashboard/stats');
            const dashboardCases = await api.get('/cases');
            if (dashboardCases.success) {
              setCases(dashboardCases.data.map(mapCaseData));
            }
            const dashboardTasks = await api.get('/tasks');
            if (dashboardTasks.success) {
              setTasks(dashboardTasks.data);
            }
            const dashboardClients = await api.get('/clients');
            if (dashboardClients.success) {
              setClients(dashboardClients.data);
            }
            break;

          case 'cases':
          case 'reviews':
          case 'forms':
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
  }, [isAuthenticated, activeTab, userRole]);

  const ROLE_ALLOWED_TABS: Record<UserRole, NavTab[]> = {
    superadmin: ['dashboard', 'clients', 'adminManagement', 'cases', 'documents', 'reviews', 'communication', 'payments', 'reports', 'settings'],
    admin: ['dashboard', 'cases', 'clients', 'tasks', 'documents', 'reviews', 'communication', 'appointments', 'payments', 'templates', 'reports', 'settings'],
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
      const res = await api.put('/settings', updatedSettings);
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
    setIsSwitchingRole(true);
    localStorage.setItem('override_user_role', role);

    setTimeout(() => {
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
      setIsSwitchingRole(false);
    }, 500);
  };

  // Auth Handlers with automatic workspace routing & activity logging
  const handleLogin = async (role: UserRole, email: string) => {
    localStorage.removeItem('override_user_role');
    setCurrentUserEmail(email);
    setIsAuthenticated(true);
    setUserRole(role);
    setSelectedCaseId(null);

    try {
      const res = await api.get('/auth/me');
      if (res.success && res.user) {
        setCurrentUser(res.user);
        setUserRole(res.user.role as UserRole);
        setCurrentUserEmail(res.user.email);
      }
    } catch (err) {
      console.error('Error fetching current user profile on login:', err);
    }

    const loginLog: AuditLogEntry = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      userEmail: email,
      action: role === 'admin' ? 'Case Admin Authentication' : role === 'superadmin' ? 'Super Admin Authentication' : 'Account Sign In',
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
    localStorage.removeItem('override_user_role');
    setIsAuthenticated(false);
    setCurrentUser(null);
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

  const handleCreateCase = async (formData: any) => {
    try {
      const res = await api.post('/cases', formData);
      if (res.success) {
        alert('Case created successfully!');
        // Refresh cases from backend to update dashboard immediately
        const casesRes = await api.get('/cases');
        if (casesRes.success) {
          setCases(casesRes.data.map(mapCaseData));
        }
      } else {
        throw new Error(res.error || 'Failed to create case');
      }
    } catch (err: any) {
      console.error('Error creating case:', err);
      throw err;
    }
  };

  const handleOnboardClient = async (formData: any) => {
    try {
      const res = await api.post('/clients', formData);
      if (res.success) {
        alert('Client onboarding successful!');
        // Refresh clients list instantly
        const clientsRes = await api.get('/clients');
        if (clientsRes.success) {
          setClients(clientsRes.data);
        }
      } else {
        throw new Error(res.error || 'Failed to onboard client');
      }
    } catch (err: any) {
      console.error('Error onboarding client:', err);
      throw err;
    }
  };

  const handleAddCase = async (newCase: CaseItem) => {
    // Append the client-side mapped object to state immediately for responsiveness
    setCases([newCase, ...cases]);
    
    // Then fetch updated lists from database to ensure full sync
    try {
      const [casesRes, clientsRes] = await Promise.all([
        api.get('/cases'),
        api.get('/clients')
      ]);
      
      if (casesRes.success) {
        setCases(casesRes.data.map(mapCaseData));
      }
      if (clientsRes.success) {
        setClients(clientsRes.data);
      }
    } catch (error) {
      console.error('Error syncing cases/clients after intake:', error);
    }
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
        clientName: apptData.clientName || 'Dr. Alexander Vance',
        clientEmail: apptData.clientEmail || 'client@babelglobal.com',
        type: apptData.type,
        specialist: apptData.specialist,
        date: apptData.date,
        time: apptData.time,
        duration: apptData.duration || '30 mins',
        status: 'Upcoming',
        meetingUrl: apptData.meetingUrl || `https://meet.babelglobal.com/call-${Math.floor(100 + Math.random() * 900)}`,
        notes: apptData.notes || ''
      };
      const data = await api.post('/appointments', payload);
      if (data.success) {
        setAppointments(prev => [...prev, data.data]);
        const updated = await api.get('/appointments');
        if (updated.success) setAppointments(updated.data);
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

  if (isSwitchingRole) {
    return (
      <div className="flex h-screen w-screen bg-slate-900 items-center justify-center flex-col space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        <p className="text-sm font-semibold text-slate-300">Switching workspace view...</p>
      </div>
    );
  }

  // If user is not authenticated or at /login route, render Login Page
  if (!isAuthenticated || location.pathname === '/login') {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <div className="flex h-screen bg-slate-100 font-sans text-slate-900 overflow-hidden">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={navigateToTab}
        userRole={userRole}
        setUserRole={handleRoleChange}
        openAIAssistant={() => setIsAiModalOpen(true)}
        openWhatsAppModal={() => setCommViewMode('whatsapp')}
        openHubLogs={() => setCommViewMode('hub')}
        activeCaseCount={roleFilteredCases.length}
        onLogout={handleLogout}
        isMobileOpen={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">
        <Header
          userRole={userRole}
          onChangeRole={currentUser?.role === 'superadmin' ? handleRoleChange : undefined}
          currentUser={currentUser}
          activeTab={activeTab}
          onNavigateTab={navigateToTab}
          openNewCaseModal={() => setIsNewCaseCreationModalOpen(true)}
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
              appointments={appointments}
              openNewDocModal={() => setIsNewDocModalOpen(true)}
              openAppointmentModal={() => setIsAppointmentModalOpen(true)}
              openSignModal={() => setIsSignModalOpen(true)}
              openQuestionnaireModal={() => setIsQuestionnaireModalOpen(true)}
              openResumeBuildingModal={handleOpenResumeBuilding}
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
                openResumeBuildingModal={handleOpenResumeBuilding}
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
                openNewCaseCreationModal={() => setIsNewCaseCreationModalOpen(true)}
                openNewClientOnboardingModal={() => setIsNewClientOnboardingModalOpen(true)}
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
                openResumeBuildingModal={handleOpenResumeBuilding}
                onDeleteCase={handleDeleteCase}
                userRole={userRole}
              />
            ) : (
              <CasesListView
                cases={roleFilteredCases}
                onSelectCase={handleSelectCase}
                onDeleteCase={handleDeleteCase}
                openNewCaseModal={() => setIsNewCaseModalOpen(true)}
                openAIAssistant={() => setIsAiModalOpen(true)}
                userRole={userRole}
              />
            )
          ) : activeTab === 'clients' ? (
            <ClientsView 
              clients={clients} 
              userRole={userRole} 
              openNewCaseModal={() => setIsNewCaseModalOpen(true)} 
              openNewClientOnboardingModal={() => setIsNewClientOnboardingModalOpen(true)}
              onUpdateClient={(updatedClient) => {
                setClients(prev => prev.map(c => c.id === updatedClient.id ? updatedClient : c));
              }}
              onDeleteClient={async (clientId) => {
                setClients(prev => prev.filter(c => c.id !== clientId));
                setCases(prev => prev.filter(c => c.clientId !== clientId));
                try {
                  const [casesRes, tasksRes, clientsRes] = await Promise.all([
                    api.get('/cases'),
                    api.get('/tasks'),
                    api.get('/clients')
                  ]);
                  if (casesRes.success) setCases(casesRes.data.map(mapCaseData));
                  if (tasksRes.success) setTasks(tasksRes.data);
                  if (clientsRes.success) setClients(clientsRes.data);
                } catch (e) {
                  console.error('Failed to refresh data after deletion:', e);
                }
              }}
            />
          ) : activeTab === 'adminManagement' ? (
            <AdminManagementView />
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
          ) : activeTab === 'reviews' || activeTab === 'forms' ? (
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
              clients={clients}
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
        onOpenResumeBuilding={handleOpenResumeBuilding}
      />

      <ResumeBuildingModal
        isOpen={isResumeBuildingModalOpen}
        onClose={() => setIsResumeBuildingModalOpen(false)}
        caseItem={resumeBuildingCase}
        onComplete={async () => {
          try {
            const casesRes = await api.get('/cases');
            if (casesRes.success) setCases(casesRes.data.map(mapCaseData));
            const docsRes = await api.get('/documents');
            if (docsRes.success) setDocuments(docsRes.data);
          } catch (e) {
            console.error(e);
          }
        }}
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
        clients={clients}
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

      <NewCaseCreationModal
        isOpen={isNewCaseCreationModalOpen}
        onClose={() => setIsNewCaseCreationModalOpen(false)}
        clients={clients}
        onCreateCase={handleCreateCase}
      />

      <NewClientOnboardingModal
        isOpen={isNewClientOnboardingModalOpen}
        onClose={() => setIsNewClientOnboardingModalOpen(false)}
        onOnboardClient={handleOnboardClient}
      />

      {/* React Confirm Delete Case Modal */}
      {caseToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in duration-150">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mb-4 mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 text-center mb-2">Delete Case Record?</h3>
            <p className="text-xs text-slate-600 text-center mb-6 leading-relaxed">
              Are you sure you want to permanently delete case <strong className="text-slate-900 font-mono">{caseToDelete.number}</strong>? All associated tasks, documents, and recommenders will be removed.
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setCaseToDelete(null)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-semibold text-xs hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteCase}
                className="flex-1 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs shadow-sm transition-colors cursor-pointer"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Case Deleted Success Modal */}
      {caseDeleteSuccessMsg && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in duration-150">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4 mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 text-center mb-2">Case Deleted</h3>
            <p className="text-xs text-slate-600 text-center mb-6 leading-relaxed">
              {caseDeleteSuccessMsg}
            </p>
            <button
              onClick={() => setCaseDeleteSuccessMsg(null)}
              className="w-full px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-sm transition-colors cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}


