import React, { createContext, useContext, useState } from 'react';
import { mockClients, mockCases, mockDocuments, mockTasks, mockReviews, mockActivity } from '../data/mockData';
import { STAGES } from '../data/stageConfig';

const CaseContext = createContext(null);

export const CaseProvider = ({ children }) => {
  const [clients, setClients] = useState(mockClients);
  const [cases, setCases] = useState(mockCases);
  const [documents, setDocuments] = useState(mockDocuments);
  const [tasks, setTasks] = useState(mockTasks);
  const [reviews, setReviews] = useState(mockReviews);
  const [activity, setActivity] = useState(mockActivity);
  const [activeModal, setActiveModal] = useState(null); // stores modal name or config

  const addClient = (newClient) => {
    const id = `CL-${100 + clients.length + 1}`;
    const clientData = { ...newClient, id, stage: 1, status: "Active" };
    setClients(prev => [clientData, ...prev]);
    logActivity("Added Client", "-", `Created profile for ${newClient.firstName} ${newClient.lastName}`);
  };

  const createCase = (newCase) => {
    const caseNumber = `NIW-2026-00${cases.length + 1}`;
    const caseData = { ...newCase, caseNumber, stage: 1, stageName: STAGES[0].name, status: "Active" };
    setCases(prev => [caseData, ...prev]);
    logActivity("Created Case", "-", `Initialized ${caseNumber} for ${newCase.clientName}`);
  };

  const updateStage = (caseNumber, newStageId) => {
    const targetStage = STAGES.find(s => s.id === newStageId);
    setCases(prev => prev.map(c => c.caseNumber === caseNumber ? { ...c, stage: newStageId, stageName: targetStage?.name } : c));
    logActivity("Updated Stage", "-", `Case ${caseNumber} moved to Stage ${newStageId}: ${targetStage?.name}`);
  };

  const addDocument = (doc) => {
    const id = `DOC-00${documents.length + 1}`;
    const newDoc = { ...doc, id, uploadDate: new Date().toISOString().split('T')[0], version: "v1", status: "Uploaded" };
    setDocuments(prev => [newDoc, ...prev]);
    logActivity("Uploaded Document", newDoc.name, `Category: ${newDoc.category}`);
  };

  const addTask = (task) => {
    const id = `TSK-00${tasks.length + 1}`;
    const newTask = { ...task, id, status: "Pending" };
    setTasks(prev => [newTask, ...prev]);
    logActivity("Created Task", "-", `Assigned: ${task.task} to ${task.assignedTo}`);
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
