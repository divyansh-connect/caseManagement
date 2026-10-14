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
  const [userRole, setUserRole] = useState<UserRole>('admin');
  const [currentUserEmail, setCurrentUserEmail] = useState<string>('');
  const [currentUser, setCurrentUser] = useState<{ id: string; name: string; email: string; role: UserRole; avatar?: string } | null>(null);
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
  const [messages, setMessages] = useState<CaseMessage[]>(() => {
    try {
      const cached = localStorage.getItem('babel_app_messages_cache');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return [];
  });

  useEffect(() => {
    if (messages.length > 0) {
      try {
        localStorage.setItem('babel_app_messages_cache', JSON.stringify(messages));
      } catch {}
    }
  }, [messages]);

  const handleMergeMessages = (incoming: CaseMessage[]) => {
    setMessages(prev => {
      const map = new Map<string, CaseMessage>();
      prev.forEach(m => map.set(m.id, m));
      incoming.forEach(m => map.set(m.id, m));
      return Array.from(map.values()).sort((a, b) => 
        (a.timestamp || '').localeCompare(b.timestamp || '')
      );
    });
  };
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
  const [commViewMode, setCommViewMode] = useState<'hub' | 'whatsapp'>('whatsapp');

  const handleOpenResumeBuilding = (c: CaseItem) => {
    setResumeBuildingCase(c);
    setIsResumeBuildingModalOpen(true);
  };

  // Mobile navigation drawer state
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  // Centralized case data properties mapper
  const mapCaseData = (c: any) => {
    let stage = Number(c.currentStage) || 1;
    if (stage > 7) {
      if (stage >= 9 && stage <= 12) stage = 4;
      else if (stage >= 13) stage = 5;
      else stage = 1;
    }

    return {
      ...c,
      currentStage: stage,
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
    };
  };

  // 1. Auto Login on mount if token exists & fetch authenticated user profile
  useEffect(() => {
    const token = localStorage.getItem('jwt_token');
    if (token) {
      const fetchCurrentUser = async () => {
        try {
          const res = await api.get('/auth/me');
          if (res.success && res.user) {
            setIsAuthenticated(true);
            setUserRole(res.user.role as UserRole);
            setCurrentUserEmail(res.user.email);
            setCurrentUser(res.user);
          } else {
            localStorage.removeItem('jwt_token');
            setIsAuthenticated(false);
            setCurrentUser(null);
          }
        } catch (e) {
          console.warn('[AUTH] Session verification failed, removing token');
          localStorage.removeItem('jwt_token');
          setIsAuthenticated(false);
          setCurrentUser(null);
        }
      };
      fetchCurrentUser();
    } else {
      setIsAuthenticated(false);
      setCurrentUser(null);
    }
  }, []);

  // Auto-sync: ensure any registered client missing an active case folder gets one created (e.g. demooooooo)
  const ensureCasesForClients = async (currentCases: CaseItem[]) => {
    try {
      const clientsRes = await api.get('/clients');
      if (!clientsRes.success || !Array.isArray(clientsRes.data)) return;
      
      const existingClientIds = new Set(
        currentCases.map(c => c.clientId || (c as any).client?.id).filter(Boolean)
      );

      const clientsWithoutCases = clientsRes.data.filter(
        (cl: any) => !existingClientIds.has(cl.id) && !existingClientIds.has(cl.clientId)
      );

      if (clientsWithoutCases.length > 0) {
        let createdAny = false;
        for (const cl of clientsWithoutCases) {
          try {
            const targetId = cl.id || cl.clientId;
            if (!targetId) continue;
            const newCaseRes = await api.post('/cases', {
              clientId: targetId,
              petitionCategory: 'EB-2 NIW',
              fieldCategory: cl.currentField || 'Proposed Endeavor',
              assignedWriter: 'Petition Drafter 1',
              assignedReviewer: 'Senior Reviewer',
              riskLevel: 'medium',
              targetFilingDate: '2026-12-31',
              uscisServiceCenter: 'Nebraska (NSC)',
              premiumProcessing: false
            });
            if (newCaseRes.success) {
              createdAny = true;
            }
          } catch (e) {
            console.error('Auto case init error for client', cl.name, e);
          }
        }

        if (createdAny) {
          const freshCases = await api.get('/cases');
          if (freshCases.success && Array.isArray(freshCases.data)) {
            setCases(freshCases.data.map(mapCaseData));
          }
        }
      }
    } catch (e) {
      console.error('Error ensuring cases for clients:', e);
    }
  };

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
              const mapped = dashboardCases.data.map(mapCaseData);
              setCases(mapped);
              ensureCasesForClients(mapped);
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
              const mapped = casesRes.data.map(mapCaseData);
              setCases(mapped);
              ensureCasesForClients(mapped);
            }
            break;

          case 'clients':
            const clientsRes = await api.get('/clients');
            if (clientsRes.success) {
              setClients(clientsRes.data);
              ensureCasesForClients(cases);
            }
            break;

          case 'tasks':
            const tasksRes = await api.get('/tasks');
            if (tasksRes.success) {
              setTasks(tasksRes.data);
            }
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
              }
              const myDocsRes = await api.get('/documents');
              if (myDocsRes.success) setDocuments(myDocsRes.data);
            }
            break;

          case 'documents':
            const docsRes = await api.get('/documents');
            if (docsRes.success) {
              setDocuments(docsRes.data);
            }
            break;

          case 'communication':
            if (userRole === 'client') {
              const myCaseRes = await api.get('/cases/my-case');
              if (myCaseRes.success && myCaseRes.data) {
                const mapped = mapCaseData(myCaseRes.data);
                setCases(prev => {
                  const exists = prev.find(c => c.id === mapped.id);
                  return exists ? prev.map(c => (c.id === mapped.id ? mapped : c)) : [mapped, ...prev];
                });
              }
            }
            // Chat needs cases (for selection) and message threads
            const commCases = await api.get('/cases');
            if (commCases.success && Array.isArray(commCases.data)) {
              const mappedCases = commCases.data.map(mapCaseData);
              setCases(prev => {
                if (userRole === 'client') {
                  const clientMatches = mappedCases.filter((c: any) => 
                    c.clientId === currentUser?.id || 
                    c.clientEmail === currentUser?.email || 
                    c.clientName === currentUser?.name
                  );
                  clientMatches.sort((a: any, b: any) => (b.documentsCount || 0) - (a.documentsCount || 0));
                  const otherCases = mappedCases.filter((c: any) => !clientMatches.some((m: any) => m.id === c.id));
                  return [...clientMatches, ...otherCases];
                }
                return mappedCases;
              });
            }
            const messagesRes = await api.get('/messages');
            if (messagesRes.success && Array.isArray(messagesRes.data)) {
              handleMergeMessages(messagesRes.data);
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
            const templatesCases = await api.get('/cases');
            if (templatesCases.success) {
              setCases(templatesCases.data.map(mapCaseData));
            }
            break;

          case 'settings':
            const settingsRes = await api.get('/settings');
            if (settingsRes.success) {
              setSystemSettings(settingsRes.data.settings);
              setActivityLogs(settingsRes.data.auditLogs);
            }
            break;

          // Client workspace tabs — fetch the client's own case via /cases/my-case
          case 'clientPortal':
          case 'postFiling':
          case 'forms':
            const myCaseRes = await api.get('/cases/my-case');
            if (myCaseRes.success && myCaseRes.data) {
              const mapped = mapCaseData(myCaseRes.data);
              setCases(prev => {
                // Replace existing entry if present, otherwise prepend
                const exists = prev.find(c => c.id === mapped.id);
                return exists
                  ? prev.map(c => (c.id === mapped.id ? mapped : c))
                  : [mapped, ...prev];
              });
              // Also load documents and messages for client portal tabs
              const myDocsRes = await api.get('/documents');
              if (myDocsRes.success) setDocuments(myDocsRes.data);
              const myMsgsRes = await api.get('/messages');
              if (myMsgsRes.success && Array.isArray(myMsgsRes.data)) {
                handleMergeMessages(myMsgsRes.data);
              }
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
    superadmin: ['dashboard', 'clients', 'adminManagement', 'cases', 'documents', 'reviews', 'communication', 'payments', 'templates', 'reports', 'settings'],
    admin: ['dashboard', 'cases', 'clients', 'tasks', 'documents', 'reviews', 'communication', 'appointments', 'payments', 'templates', 'reports', 'settings'],
    writer: ['dashboard', 'cases', 'tasks', 'documents', 'communication', 'templates'],
    reviewer: ['dashboard', 'cases', 'tasks', 'documents', 'forms', 'reviews', 'communication', 'templates', 'reports'],
    client: ['clientPortal', 'tasks', 'documents', 'forms', 'payments', 'communication', 'appointments', 'postFiling', 'settings'],
  };

  // Sync URL Path with Active Tab state & Route Access Control
  useEffect(() => {
    const path = location.pathname;

    // Strict unauthenticated route protection: redirect to /login
    if (!isAuthenticated) {
      if (path !== '/login') {
        navigate('/login', { replace: true });
      }
      return;
    }

    if (path === '/login') {
      const defaultTab = userRole === 'client' ? 'clientPortal' : 'dashboard';
      navigate(TAB_TO_PATH[activeTab] || TAB_TO_PATH[defaultTab] || '/dashboard', { replace: true });
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

  // Navigate to Tab & Update URL (supports optional filter parameters)
  const navigateToTab = (tab: NavTab, options?: { stageIds?: number[]; category?: string }) => {
    setActiveTab(tab);
    setSelectedCaseId(null);
    setIsMobileMenuOpen(false);
    let targetPath = TAB_TO_PATH[tab] || '/dashboard';
    if (tab === 'cases' && options) {
      const params = new URLSearchParams();
      if (options.stageIds && options.stageIds.length > 0) {
        params.set('stageIds', options.stageIds.join(','));
      }
      if (options.category) {
        params.set('category', options.category);
      }
      const qs = params.toString();
      if (qs) {
        targetPath = `${targetPath}?${qs}`;
      }
    }
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
  const handleLogin = async (role: UserRole, email: string) => {
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
    sessionStorage.clear();
    setIsAuthenticated(false);
    setCurrentUser(null);
    setCurrentUserEmail('');
    setUserRole('client');
    navigate('/login', { replace: true });
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

  const handleClientUpdated = async () => {
    try {
      const clientsRes = await api.get('/clients');
      if (clientsRes.success) {
        setClients(clientsRes.data);
      }
      const casesRes = await api.get('/cases');
      if (casesRes.success) {
        const mapped = casesRes.data.map(mapCaseData);
        setCases(mapped);
        ensureCasesForClients(mapped);
      }
      const tasksRes = await api.get('/tasks');
      if (tasksRes.success) {
        setTasks(tasksRes.data);
      }
    } catch (error) {
      console.error('Error refreshing database records:', error);
    }
  };

  const handleAddDoc = (newDocOrDocs: CaseDocument | CaseDocument[]) => {
    const docsArray = Array.isArray(newDocOrDocs) ? newDocOrDocs : [newDocOrDocs];
    setDocuments(prev => [...docsArray, ...prev]);
    // Also increment documentsCount on the specific cases
    setCases(prev => prev.map(c => {
      const addedForThisCase = docsArray.filter(d => d.caseId === c.id).length;
      if (addedForThisCase > 0) {
        return {
          ...c,
          documentsCount: c.documentsCount + addedForThisCase
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
      const activeClientName = apptData.clientName || currentUser?.name || cases[0]?.clientName || 'Client';
      const activeClientEmail = apptData.clientEmail || currentUser?.email || cases[0]?.clientEmail || '';
      const payload = {
        clientName: activeClientName,
        clientEmail: activeClientEmail,
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

  // Priority client case selector: match client id/email/name, and pick the case that has documents/activity
  const activeClientCase = React.useMemo(() => {
    if (userRole !== 'client') return null;
    const clientMatches = cases.filter(c => {
      const matchId = currentUser?.id && (c.clientId === currentUser.id || (c as any).client?.id === currentUser.id);
      const matchEmail = (currentUser?.email || currentUserEmail) && (
        c.clientEmail === currentUser?.email || 
        c.clientEmail === currentUserEmail ||
        (c as any).client?.email === currentUser?.email ||
        (c as any).client?.email === currentUserEmail
      );
      const matchName = currentUser?.name && (
        c.clientName === currentUser.name ||
        (c as any).client?.name === currentUser.name
      );
      return matchId || matchEmail || matchName;
    });

    if (clientMatches.length === 0) return cases[0];
    return clientMatches.sort((a, b) => (b.documentsCount || 0) - (a.documentsCount || 0))[0];
  }, [cases, userRole, currentUser, currentUserEmail]);

  // Filter cases accessible to current user role (Drafters can access assigned or active drafting pipeline cases)
  const roleFilteredCases = cases.filter(c => {
    if (userRole === 'writer') {
      const assigned = c.assignedWriter || '';
      return !assigned || assigned.includes('Drafter') || assigned.includes('Writer') || assigned.includes(currentUser?.name || '');
    }
    return true;
  });

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
          currentUser={currentUser}
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
              caseData={(userRole === 'client' && activeClientCase) ? activeClientCase : (roleFilteredCases.find(c => c.id === selectedCaseId) || roleFilteredCases[0] || cases[0])}
              documents={documents}
              messages={messages}
              appointments={appointments}
              payments={payments}
              openNewDocModal={() => setIsNewDocModalOpen(true)}
              openAppointmentModal={() => setIsAppointmentModalOpen(true)}
              openSignModal={() => setIsSignModalOpen(true)}
              openQuestionnaireModal={() => setIsQuestionnaireModalOpen(true)}
              openResumeBuildingModal={handleOpenResumeBuilding}
              activeNavTab={activeTab}
              onNavigateTab={navigateToTab}
              commViewMode={commViewMode}
              setCommViewMode={setCommViewMode}
              currentUser={currentUser}
              allCases={cases}
              onNewMessage={(newMsg) => setMessages(prev => [...prev, newMsg])}
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
                onNavigateTab={navigateToTab}
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
            <ClientsView 
              clients={clients} 
              userRole={userRole} 
              openNewCaseModal={() => setIsNewCaseModalOpen(true)} 
              onClientUpdated={handleClientUpdated}
            />
          ) : activeTab === 'adminManagement' ? (
            <AdminManagementView />
          ) : activeTab === 'tasks' ? (
            <TasksView
              tasks={tasks}
              userRole={userRole}
              cases={roleFilteredCases}
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
            <CommunicationView 
              cases={roleFilteredCases} 
              messages={messages} 
              viewMode={commViewMode} 
              userRole={userRole}
              currentUser={currentUser}
              onNewMessage={(newMsg) => setMessages(prev => [...prev, newMsg])}
            />
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
            <TemplatesView 
              templates={templates} 
              cases={roleFilteredCases}
              onRefreshCases={async () => {
                const casesRes = await api.get('/cases');
                if (casesRes.success) setCases(casesRes.data.map(mapCaseData));
              }}
              openAIAssistant={() => setIsAiModalOpen(true)} 
            />
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
        cases={roleFilteredCases}
        userRole={userRole}
        currentUser={currentUser}
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
        clientName={userRole === 'client' ? (currentUser?.name || cases[0]?.clientName) : (roleFilteredCases.find(c => c.id === selectedCaseId)?.clientName || clients[0]?.name || '')}
        clientEmail={userRole === 'client' ? (currentUser?.email || cases[0]?.clientEmail) : (roleFilteredCases.find(c => c.id === selectedCaseId)?.clientEmail || clients[0]?.email || '')}
        onBookAppointment={handleBookAppointment}
      />

      <ElectronicSignatureModal
        isOpen={isSignModalOpen}
        onClose={() => setIsSignModalOpen(false)}
        clientName={currentUser?.name || roleFilteredCases.find(c => c.id === selectedCaseId)?.clientName || cases[0]?.clientName || 'Client'}
      />

      <USCISFormQuestionnaireModal
        isOpen={isQuestionnaireModalOpen}
        onClose={() => setIsQuestionnaireModalOpen(false)}
        clientName={currentUser?.name || roleFilteredCases.find(c => c.id === selectedCaseId)?.clientName || cases[0]?.clientName || 'Client'}
        caseData={roleFilteredCases.find(c => c.id === selectedCaseId) || roleFilteredCases[0] || cases[0]}
      />
    </div>
  );
}


