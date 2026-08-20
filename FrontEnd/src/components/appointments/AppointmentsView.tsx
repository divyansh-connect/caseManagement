import React, { useState } from 'react';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Video, 
  UserCheck, 
  Plus, 
  Search, 
  CheckCircle2, 
  ExternalLink,
  User,
  CalendarCheck,
  Trash2,
  XCircle,
  RotateCcw,
  Check,
  X
} from 'lucide-react';
import { UserRole, Client } from '../../types';
import { api } from '../../services/api';

export interface AppointmentItem {
  id: string;
  clientName: string;
  clientEmail: string;
  type: string;
  specialist: string;
  date: string;
  time: string;
  duration: string;
  status: 'Upcoming' | 'Completed' | 'Rescheduled' | 'Cancelled';
  meetingUrl: string;
  notes?: string;
}

interface AppointmentsViewProps {
  appointments: AppointmentItem[];
  setAppointments: React.Dispatch<React.SetStateAction<AppointmentItem[]>>;
  clients?: Client[];
  userRole?: UserRole;
  openBookingModal: () => void;
}

export const AppointmentsView: React.FC<AppointmentsViewProps> = ({
  appointments,
  setAppointments,
  clients = [],
  userRole = 'admin',
  openBookingModal
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Upcoming' | 'Completed' | 'Cancelled'>('All');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleUpdateStatus = async (id: string, newStatus: AppointmentItem['status']) => {
    setActionLoadingId(id);
    try {
      const res = await api.patch(`/appointments/${id}`, { status: newStatus });
      if (res.success) {
        setAppointments(prev => prev.map(a => a.id === id ? { ...a, status: newStatus } : a));
        showToast(`Appointment status updated to ${newStatus}`);
      }
    } catch (err: any) {
      alert(`Status update failed: ${err.message}`);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDeleteAppointment = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this appointment?')) return;
    setActionLoadingId(id);
    try {
      const res = await api.delete(`/appointments/${id}`);
      if (res.success) {
        setAppointments(prev => prev.filter(a => a.id !== id));
        showToast('Appointment deleted successfully');
      }
    } catch (err: any) {
      alert(`Delete failed: ${err.message}`);
    } finally {
      setActionLoadingId(null);
    }
  };

  const filteredAppointments = appointments.filter(apt => {
    const matchesSearch = 
      apt.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      apt.specialist.toLowerCase().includes(searchQuery.toLowerCase()) ||
      apt.type.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All' || apt.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const upcomingCount = appointments.filter(a => a.status === 'Upcoming').length;
  const completedCount = appointments.filter(a => a.status === 'Completed').length;

  return (
    <div className="space-y-6 pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="bg-emerald-600 text-white px-4 py-3 rounded-xl shadow-lg flex items-center justify-between text-xs font-bold animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-200" />
            <span>{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="text-white hover:text-emerald-200 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Top Banner Header */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-blue-100 border border-blue-200 text-blue-600 flex items-center justify-center font-bold shrink-0 shadow-xs">
              <CalendarIcon className="w-5.5 h-5.5" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Appointments &amp; Strategy Consultations</h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Manage 1-on-1 petition strategy calls, exhibit audits &amp; recommender sync sessions
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={openBookingModal}
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-2 cursor-pointer transition-all border border-blue-500 shrink-0"
        >
          <Plus className="w-4 h-4 text-amber-300" />
          <span>Book New Strategy Session</span>
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
            <CalendarCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase text-slate-400">Total Consultations</p>
            <h3 className="text-xl font-extrabold text-slate-800">{appointments.length} Sessions</h3>
            <span className="text-[10px] font-medium text-emerald-600">Real-time database sync</span>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase text-slate-400">Upcoming Sessions</p>
            <h3 className="text-xl font-extrabold text-amber-600">{upcomingCount} Scheduled</h3>
            <span className="text-[10px] font-medium text-slate-500">Google Meet Links Active</span>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase text-slate-400">Completed Sessions</p>
            <h3 className="text-xl font-extrabold text-emerald-600">{completedCount} Debriefed</h3>
            <span className="text-[10px] font-medium text-emerald-600">Notes &amp; Audio Recorded</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Search Bar */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search client, specialist, meeting type..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
          {(['All', 'Upcoming', 'Completed', 'Cancelled'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                statusFilter === st
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Appointments List */}
      <div className="space-y-4">
        {filteredAppointments.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
            <CalendarIcon className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-700">No appointments found</h3>
            <p className="text-xs text-slate-400 mt-1">Book a new strategy session or adjust your filter query.</p>
          </div>
        ) : (
          filteredAppointments.map((apt) => {
            const isUpcoming = apt.status === 'Upcoming';
            const isCompleted = apt.status === 'Completed';
            const isCancelled = apt.status === 'Cancelled';
            const isLoadingThis = actionLoadingId === apt.id;

            return (
              <div 
                key={apt.id}
                className={`bg-white rounded-2xl border p-5 shadow-xs transition-all flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 ${
                  isUpcoming ? 'border-blue-300 ring-1 ring-blue-100/60' : 'border-slate-200'
                }`}
              >
                {/* Left Block: Icon + Details */}
                <div className="flex items-start gap-4 min-w-0">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold shrink-0 ${
                    isUpcoming ? 'bg-blue-600 text-white shadow-md' : isCancelled ? 'bg-rose-100 text-rose-600' : 'bg-slate-100 text-slate-500'
                  }`}>
                    <Video className="w-6 h-6" />
                  </div>

                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                        isUpcoming 
                          ? 'bg-amber-100 text-amber-800 border border-amber-300 animate-pulse' 
                          : isCancelled
                          ? 'bg-rose-100 text-rose-800 border border-rose-300'
                          : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      }`}>
                        {apt.status}
                      </span>
                      <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                        {apt.duration}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900 truncate">
                      {apt.type}
                    </h3>

                    <div className="text-xs text-slate-600 flex flex-wrap items-center gap-3">
                      <span className="font-bold text-slate-800 flex items-center gap-1">
                        <User className="w-3.5 h-3.5 text-slate-400" /> Client: {apt.clientName}
                      </span>
                      <span>•</span>
                      <span className="font-semibold text-slate-700 flex items-center gap-1">
                        <UserCheck className="w-3.5 h-3.5 text-blue-600" /> Specialist: {apt.specialist}
                      </span>
                    </div>

                    {apt.notes && (
                      <p className="text-[11px] text-slate-500 italic bg-slate-50 p-2 rounded-lg border border-slate-100 mt-2">
                        "{apt.notes}"
                      </p>
                    )}
                  </div>
                </div>

                {/* Right Block: Date/Time Badge & Action Buttons */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 shrink-0 self-stretch lg:self-auto justify-between lg:justify-end border-t lg:border-t-0 pt-3 lg:pt-0 border-slate-100 w-full lg:w-auto">
                  <div className="text-left lg:text-right">
                    <div className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5 lg:justify-end">
                      <CalendarIcon className="w-3.5 h-3.5 text-blue-600" />
                      <span>{apt.date}</span>
                    </div>
                    <div className="text-xs font-semibold text-slate-500 flex items-center gap-1.5 lg:justify-end mt-0.5">
                      <Clock className="w-3.5 h-3.5 text-amber-500" />
                      <span>{apt.time}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto">
                    {isUpcoming && (
                      <a
                        href={apt.meetingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm flex items-center gap-1.5 transition-all border border-emerald-500 cursor-pointer"
                      >
                        <Video className="w-3.5 h-3.5" />
                        <span>Join Call</span>
                        <ExternalLink className="w-3 h-3 ml-0.5" />
                      </a>
                    )}

                    {(userRole === 'admin' || userRole === 'superadmin') && (
                      <>
                        {isUpcoming && (
                          <>
                            <button
                              disabled={isLoadingThis}
                              onClick={() => handleUpdateStatus(apt.id, 'Completed')}
                              className="px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs rounded-xl border border-blue-200 transition-colors flex items-center gap-1 cursor-pointer"
                              title="Mark as Completed"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Complete</span>
                            </button>
                            <button
                              disabled={isLoadingThis}
                              onClick={() => handleUpdateStatus(apt.id, 'Cancelled')}
                              className="px-3 py-2 bg-amber-50 hover:bg-amber-100 text-amber-700 font-bold text-xs rounded-xl border border-amber-200 transition-colors flex items-center gap-1 cursor-pointer"
                              title="Cancel Session"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              <span>Cancel</span>
                            </button>
                          </>
                        )}

                        {!isUpcoming && (
                          <button
                            disabled={isLoadingThis}
                            onClick={() => handleUpdateStatus(apt.id, 'Upcoming')}
                            className="px-3 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 transition-colors flex items-center gap-1 cursor-pointer"
                            title="Reopen Session"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>Reopen</span>
                          </button>
                        )}

                        <button
                          disabled={isLoadingThis}
                          onClick={() => handleDeleteAppointment(apt.id)}
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl border border-transparent hover:border-rose-200 transition-colors cursor-pointer"
                          title="Delete Record"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
