import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  INITIAL_CLIENTS, 
  INITIAL_CASES, 
  INITIAL_DOCUMENTS, 
  INITIAL_TASKS 
} from '../data/mockData';
import { api } from '../services/api';
import { STAGES } from '../data/stageConfig';

const CaseContext = createContext(null);

export const CaseProvider = ({ children }) => {
  const [clients, setClients] = useState([]);
  const [cases, setCases] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [activity, setActivity] = useState([]);
  const [activeModal, setActiveModal] = useState(null);

  // Load database tables on context initialization
  useEffect(() => {
    const loadDatabase = async () => {
      try {
        const clientsRes = await api.get('/clients');
        if (clientsRes.success) {
          const mappedClients = clientsRes.data.map(c => ({
            ...c,
            firstName: c.name?.split(' ')[0] || 'Client',
            lastName: c.name?.split(' ').slice(1).join(' ') || 'User',
            assignedStaff: 'Drafter 1'
          }));
          setClients(mappedClients);
        } else {
          // Fallback
          setClients(INITIAL_CLIENTS.map(c => ({
            ...c,
            firstName: c.name?.split(' ')[0] || 'Client',
            lastName: c.name?.split(' ').slice(1).join(' ') || 'User',
            assignedStaff: 'Drafter 1'
          })));
        }

        const casesRes = await api.get('/cases');
        if (casesRes.success) {
          const mappedCases = casesRes.data.map(c => ({
            ...c,
            firstName: c.client?.name?.split(' ')[0] || 'Client',
            lastName: c.client?.name?.split(' ').slice(1).join(' ') || 'User',
            clientName: c.client?.name || 'Unknown',
            clientEmail: c.client?.email || '',
            assignedStaff: c.assignedWriter || 'Drafter 1',
            status: c.status || 'Active'
          }));
          setCases(mappedCases);
        } else {
          setCases(INITIAL_CASES.map(c => ({
            ...c,
            firstName: c.clientName?.split(' ')[0] || 'Client',
            lastName: c.clientName?.split(' ').slice(1).join(' ') || 'User',
            assignedStaff: c.assignedWriter || 'Drafter 1',
            status: 'Active'
          })));
        }

        const docsRes = await api.get('/documents');
        if (docsRes.success) {
          setDocuments(docsRes.data);
        } else {
          setDocuments(INITIAL_DOCUMENTS);
        }

        const tasksRes = await api.get('/tasks');
        if (tasksRes.success) {
          setTasks(tasksRes.data);
        } else {
          setTasks(INITIAL_TASKS);
        }
      } catch (err) {
        console.error('Failed to load database in CaseContext:', err);
      }
    };
    loadDatabase();
  }, []);

  const addClient = async (newClient) => {
    try {
      const data = await api.post('/clients', {
        name: `${newClient.firstName} ${newClient.lastName}`,
        email: newClient.email,
        phone: newClient.phone || '+1 (555) 012-3456',
        countryOfBirth: newClient.countryOfBirth || 'United States',
        currentField: newClient.currentField || 'Quantum Computing',
        highestDegree: 'Ph.D.',
        university: 'Stanford University'
      });

      if (data.success) {
        const clientData = {
          ...data.data,
          firstName: data.data.name?.split(' ')[0] || 'Client',
          lastName: data.data.name?.split(' ').slice(1).join(' ') || 'User',
          assignedStaff: 'Drafter 1',
          status: 'Active'
        };
        setClients(prev => [clientData, ...prev]);
        logActivity("Added Client", "-", `Created profile for ${clientData.firstName} ${clientData.lastName}`);
      }
    } catch (err) {
      console.error('Failed to add client:', err);
    }
  };

  const createCase = async (newCase) => {
    try {
      const selectedClient = clients.find(c => `${c.firstName} ${c.lastName}` === newCase.clientName) || clients[0];
      const data = await api.post('/cases', {
        clientId: selectedClient?.id || 'client-101',
        petitionCategory: newCase.petitionCategory || 'EB-2 NIW',
        fieldCategory: newCase.fieldCategory || 'Computer Science',
        assignedWriter: 'Petition Drafter 1',
        assignedReviewer: 'Senior Reviewer',
        riskLevel: 'low',
        targetFilingDate: '2026-06-15',
        uscisServiceCenter: 'Nebraska (NSC)',
        premiumProcessing: true
      });

      if (data.success) {
        const caseData = {
          ...data.data,
          firstName: selectedClient?.firstName || 'Client',
          lastName: selectedClient?.lastName || 'User',
          clientName: selectedClient ? `${selectedClient.firstName} ${selectedClient.lastName}` : 'Unknown',
          clientEmail: selectedClient?.email || '',
          assignedStaff: 'Petition Drafter 1',
          status: 'Active'
        };
        setCases(prev => [caseData, ...prev]);
        logActivity("Created Case", "-", `Initialized ${caseData.caseNumber} for ${caseData.clientName}`);
      }
    } catch (err) {
      console.error('Failed to create case:', err);
    }
  };

  const updateStage = async (caseNumber, newStageId) => {
    try {
      const targetStage = STAGES.find(s => s.id === newStageId);
      const data = await api.patch(`/cases/${caseNumber}/stage`, { stageId: newStageId });
      if (data.success) {
        setCases(prev => prev.map(c => c.caseNumber === caseNumber ? { ...c, stage: newStageId, stageName: targetStage?.name } : c));
        logActivity("Updated Stage", "-", `Case ${caseNumber} moved to Stage ${newStageId}: ${targetStage?.name}`);
      }
    } catch (err) {
      console.error('Failed to update stage:', err);
    }
  };

  const addDocument = async (doc) => {
    try {
      const formData = new FormData();
      formData.append('caseId', doc.caseId || 'case-101');
      formData.append('category', doc.category || 'CV');
      formData.append('file', doc.file); // Expects raw file from upload input

      const data = await api.post('/documents', formData, true);
      if (data.success) {
        setDocuments(prev => [data.data, ...prev]);
        logActivity("Uploaded Document", data.data.name, `Category: ${data.data.category}`);
      }
    } catch (err) {
      console.error('Failed to add document:', err);
    }
  };

  const addTask = async (task) => {
    try {
      const data = await api.post('/tasks', {
        caseId: task.caseId || 'case-101',
        title: task.task || task.title,
        assignedRole: 'writer',
        assignedToName: task.assignedTo || 'Sarah Jenkins',
        stageId: task.stageId || 9,
        dueDate: task.dueDate || '2026-05-15',
        priority: 'medium'
      });

      if (data.success) {
        setTasks(prev => [data.data, ...prev]);
        logActivity("Created Task", "-", `Assigned: ${data.data.title} to ${data.data.assignedToName}`);
      }
    } catch (err) {
      console.error('Failed to create task:', err);
    }
  };

  const logActivity = (action, doc, notes) => {
    const newLog = {
      date: new Date().toISOString().replace('T', ' ').substring(0, 16),
      user: "Current User",
      action,
      document: doc || "-",
      notes
    };
    setActivity(prev => [newLog, ...prev]);
  };

  return (
    <CaseContext.Provider value={{
      clients, cases, documents, tasks, reviews, activity, activeModal,
      setActiveModal, addClient, createCase, updateStage, addDocument, addTask, logActivity
    }}>
      {children}
    </CaseContext.Provider>
  );
};

export const useCase = () => useContext(CaseContext);
