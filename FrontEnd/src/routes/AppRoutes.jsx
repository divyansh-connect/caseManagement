import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCase } from '../context/CaseContext';
import { USER_ROLES } from '../data/stageConfig';

import { Header } from '../components/global/Header';
import { Sidebar } from '../components/global/Sidebar';

import { Login } from '../pages/auth/Login';

import { AdminDashboard } from '../pages/admin/Dashboard';
import { AdminClients } from '../pages/admin/Clients';
import { AdminCases } from '../pages/admin/Cases';
import { AdminDocuments } from '../pages/admin/Documents';
import { AdminTasks } from '../pages/admin/Tasks';
import { AdminReviews } from '../pages/admin/Reviews';
import { AdminCommunication } from '../pages/admin/Communication';
import { AdminPayments } from '../pages/admin/Payments';
import { AdminTemplates } from '../pages/admin/Templates';
import { AdminReports } from '../pages/admin/Reports';
import { AdminSettings } from '../pages/admin/Settings';

import { ClientDashboard } from '../pages/client/ClientDashboard';

import { AddClientModal } from '../components/modals/AddClientModal';
import { CreateCaseModal } from '../components/modals/CreateCaseModal';
import { UploadDocumentModal } from '../components/modals/UploadDocumentModal';

export const AppRoutes = () => {
  const { user } = useAuth();
  const { activeModal, setActiveModal } = useCase();

  if (!user) {
    return <Login />;
  }

  const role = user.role;

  return (
    <div className="h-screen flex flex-col bg-slate-950 overflow-hidden">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 p-6 overflow-y-auto max-w-7xl mx-auto w-full">
          <Routes>
            {/* Admin Routes */}
            {role === USER_ROLES.ADMIN && (
              <>
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                <Route path="/admin/clients" element={<AdminClients />} />
                <Route path="/admin/cases" element={<AdminCases />} />
                <Route path="/admin/documents" element={<AdminDocuments />} />
                <Route path="/admin/tasks" element={<AdminTasks />} />
                <Route path="/admin/reviews" element={<AdminReviews />} />
                <Route path="/admin/communication" element={<AdminCommunication />} />
                <Route path="/admin/payments" element={<AdminPayments />} />
                <Route path="/admin/templates" element={<AdminTemplates />} />
                <Route path="/admin/reports" element={<AdminReports />} />
                <Route path="/admin/settings" element={<AdminSettings />} />
                <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
              </>
            )}

            {/* Writer Routes */}
            {role === USER_ROLES.WRITER && (
              <>
                <Route path="/writer/dashboard" element={<AdminDashboard />} />
                <Route path="/writer/cases" element={<AdminCases />} />
                <Route path="/writer/tasks" element={<AdminTasks />} />
                <Route path="*" element={<Navigate to="/writer/dashboard" replace />} />
              </>
            )}

            {/* Reviewer Routes */}
            {role === USER_ROLES.REVIEWER && (
              <>
                <Route path="/reviewer/dashboard" element={<AdminDashboard />} />
                <Route path="/reviewer/reviews" element={<AdminReviews />} />
                <Route path="/reviewer/tasks" element={<AdminTasks />} />
                <Route path="*" element={<Navigate to="/reviewer/dashboard" replace />} />
              </>
            )}

            {/* Client Routes */}
            {role === USER_ROLES.CLIENT && (
              <>
                <Route path="/client/dashboard" element={<ClientDashboard />} />
                <Route path="/client/my-case" element={<ClientDashboard />} />
                <Route path="/client/documents" element={<AdminDocuments />} />
                <Route path="/client/questionnaires" element={<ClientDashboard />} />
                <Route path="/client/terms" element={<ClientDashboard />} />
                <Route path="/client/payments" element={<AdminPayments />} />
                <Route path="/client/messages" element={<AdminCommunication />} />
                <Route path="/client/profile" element={<ClientDashboard />} />
                <Route path="*" element={<Navigate to="/client/dashboard" replace />} />
              </>
            )}
          </Routes>
        </main>
      </div>

      {/* Global Common Modals */}
      <AddClientModal isOpen={activeModal === 'ADD_CLIENT'} onClose={() => setActiveModal(null)} />
      <CreateCaseModal isOpen={activeModal === 'CREATE_CASE'} onClose={() => setActiveModal(null)} />
      <UploadDocumentModal isOpen={activeModal === 'UPLOAD_DOCUMENT'} onClose={() => setActiveModal(null)} />
    </div>
  );
};
