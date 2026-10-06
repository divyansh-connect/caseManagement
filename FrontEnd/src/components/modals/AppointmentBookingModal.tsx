import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Calendar, Clock, Video, UserCheck, CheckCircle2, FileText, Globe, User } from 'lucide-react';
import { Client } from '../../types';

interface AppointmentBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  clientName?: string;
  clients?: Client[];
  onBookAppointment?: (appointment: {
    clientName: string;
    clientEmail: string;
    type: string;
    specialist: string;
    date: string;
    time: string;
    duration: string;
    meetingUrl?: string;
    notes: string;
  }) => void;
}

export const AppointmentBookingModal: React.FC<AppointmentBookingModalProps> = ({
  isOpen,
  onClose,
  clientName = '',
  clients = [],
  onBookAppointment
}) => {
  const [selectedClientId, setSelectedClientId] = useState<string>(clients[0]?.id || '');
  const [customClientName, setCustomClientName] = useState<string>(clientName || (clients[0]?.name || 'Dr. Alexander Vance'));
  const [customClientEmail, setCustomClientEmail] = useState<string>(clients[0]?.email || 'client@babelglobal.com');
  const [selectedType, setSelectedType] = useState('1-on-1 Endeavor Strategy Session');
  const [selectedSpecialist, setSelectedSpecialist] = useState('Senior Reviewer');
  const [selectedDate, setSelectedDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 2);
    return d.toISOString().split('T')[0];
  });
  const [selectedTime, setSelectedTime] = useState('10:00 AM EST');
  const [selectedDuration, setSelectedDuration] = useState('45 mins');
  const [notes, setNotes] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  React.useEffect(() => {
    if (clients.length > 0 && !selectedClientId) {
      setSelectedClientId(clients[0].id);
      setCustomClientName(clients[0].name);
      setCustomClientEmail(clients[0].email);
    }
  }, [clients]);

  if (!isOpen) return null;

  const handleClientChange = (clientId: string) => {
    setSelectedClientId(clientId);
    const found = clients.find(c => c.id === clientId);
    if (found) {
      setCustomClientName(found.name);
      setCustomClientEmail(found.email);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const appointment = {
      clientName: customClientName,
      clientEmail: customClientEmail,
      type: selectedType,
      specialist: selectedSpecialist,
      date: selectedDate,
      time: selectedTime,
      duration: selectedDuration,
      meetingUrl: `https://meet.babelglobal.com/call-${Math.floor(100 + Math.random() * 900)}`,
      notes
    };

    if (onBookAppointment) {
      onBookAppointment(appointment);
    }

    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      onClose();
    }, 1500);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Book Strategy Consultation Session"
      subtitle="Schedule a direct video call with your assigned Babel Global immigration specialists"
    >
      {isSuccess ? (
        <div className="py-8 text-center space-y-3 animate-fadeIn">
          <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-slate-800">Consultation Scheduled!</h3>
          <p className="text-xs text-slate-600 max-w-xs mx-auto">
            Calendar invite sent to <strong className="text-blue-600">{customClientEmail}</strong>.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Client Selection (for Admin/Superadmin) */}
          {clients && clients.length > 0 ? (
            <div>
              <label className="block text-slate-700 font-bold mb-1">Select Candidate / Client *</label>
              <select
                value={selectedClientId}
                onChange={(e) => handleClientChange(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
              >
                {clients.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.email})
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Client Name *</label>
                <input
                  type="text"
                  required
                  value={customClientName}
                  onChange={(e) => setCustomClientName(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-bold mb-1">Client Email *</label>
                <input
                  type="email"
                  required
                  value={customClientEmail}
                  onChange={(e) => setCustomClientEmail(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}

          {/* Consultation Type Selector */}
          <div>
            <label className="block text-slate-700 font-bold mb-1.5">Select Meeting Purpose *</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {[
                { title: '1-on-1 Endeavor Strategy Session', duration: '45 mins', desc: 'Define national importance and Dhanasar arguments' },
                { title: 'Exhibit & Citation Audit Call', duration: '30 mins', desc: 'Review uploaded publications, patents & Google Scholar data' },
                { title: 'Recommendation Letter Sync', duration: '30 mins', desc: 'Review expert testimonial drafts & recommender outreach' },
                { title: 'Final Filing Sign-off Session', duration: '20 mins', desc: 'Final review of Form I-140 packet prior to USCIS dispatch' }
              ].map((opt) => (
                <div
                  key={opt.title}
                  onClick={() => {
                    setSelectedType(opt.title);
                    setSelectedDuration(opt.duration);
                  }}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    selectedType === opt.title
                      ? 'bg-blue-50 border-blue-500 ring-1 ring-blue-300'
                      : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800 text-[11px] truncate">{opt.title}</span>
                    <span className="text-[10px] font-semibold text-blue-700 bg-blue-100/60 px-1.5 py-0.5 rounded shrink-0">
                      {opt.duration}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1 leading-tight">{opt.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Specialist Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-bold mb-1">Assign Specialist *</label>
              <select
                value={selectedSpecialist}
                onChange={(e) => setSelectedSpecialist(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
              >
                <option value="Senior Reviewer">Senior Reviewer</option>
                <option value="Petition Drafter 1">Petition Drafter 1</option>
                <option value="Petition Drafter 2">Petition Drafter 2</option>
                <option value="Lead Immigration Specialist">Lead Immigration Specialist</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Preferred Date *</label>
              <input
                type="date"
                required
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Time Slots */}
          <div>
            <label className="block text-slate-700 font-bold mb-1.5">Select Time Slot (EST) *</label>
            <div className="grid grid-cols-4 gap-2">
              {['09:30 AM EST', '11:00 AM EST', '02:30 PM EST', '04:00 PM EST'].map((slot) => (
                <button
                  key={slot}
                  type="button"
                  onClick={() => setSelectedTime(slot)}
                  className={`py-2 px-1 rounded-lg text-[11px] font-semibold border transition-all text-center cursor-pointer ${
                    selectedTime === slot
                      ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {slot}
                </button>
              ))}
            </div>
          </div>

          {/* Additional Notes */}
          <div>
            <label className="block text-slate-700 font-bold mb-1">Specific Questions or Topics (Optional)</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. I would like to review Exhibit 14 citation counts and Prong 2 draft wording..."
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
              <Globe className="w-3.5 h-3.5 text-blue-600" />
              <span>Includes Google Meet Video Link & iCal File</span>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg border border-slate-200 text-slate-700 font-semibold hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-sm cursor-pointer"
              >
                Confirm Appointment
              </button>
            </div>
          </div>
        </form>
      )}
    </Modal>
  );
};
