import React from 'react';
import { 
  Settings, 
  Building, 
  ShieldCheck, 
  Bell, 
  DollarSign, 
  Sliders,
  Check,
  Save,
  Clock,
  UserCheck
} from 'lucide-react';
import { AuditLogEntry } from '../../types';

interface SettingsViewProps {
  activityLogs?: AuditLogEntry[];
  settings?: any;
  onSaveSettings?: (settings: any) => Promise<void>;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ 
  activityLogs = [], 
  settings, 
  onSaveSettings 
}) => {
  const [companyName, setCompanyName] = React.useState('');
  const [specialistId, setSpecialistId] = React.useState('');

  // General Petition Fees
  const [filingFee, setFilingFee] = React.useState('$715');
  const [premiumFee, setPremiumFee] = React.useState('$2,965');
  const [asylumFee, setAsylumFee] = React.useState('$300');

  // AOS Fees
  const [aosI485, setAosI485] = React.useState('$1,440');
  const [aosI765, setAosI765] = React.useState('$260');
  const [aosI131, setAosI131] = React.useState('$630');
  const [aosI693, setAosI693] = React.useState('$0');
  const [aosG1145, setAosG1145] = React.useState('$0');
  const [aosI485SuppJ, setAosI485SuppJ] = React.useState('$0');

  // O-1 Visa Fees
  const [o1I129Standard, setO1I129Standard] = React.useState('$1,055');
  const [o1I129SmallNonprofit, setO1I129SmallNonprofit] = React.useState('$530');
  const [o1AsylumStandard, setO1AsylumStandard] = React.useState('$600');
  const [o1AsylumSmall, setO1AsylumSmall] = React.useState('$300');
  const [o1AsylumNonprofit, setO1AsylumNonprofit] = React.useState('$0');
  const [o1I907, setO1I907] = React.useState('$2,965');
  const [o1Ds160, setO1Ds160] = React.useState('$205');
  const [o1I539Paper, setO1I539Paper] = React.useState('$470');
  const [o1I539Online, setO1I539Online] = React.useState('$420');
  const [o1I539A, setO1I539A] = React.useState('$0');

  // Notifications
  const [whatsappAlerts, setWhatsappAlerts] = React.useState(true);
  const [emailRequests, setEmailRequests] = React.useState(true);
  const [appointmentReminders, setAppointmentReminders] = React.useState(true);
  const [quietHours, setQuietHours] = React.useState(true);
  const [showSavedToast, setShowSavedToast] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);

  React.useEffect(() => {
    if (settings) {
      setCompanyName(settings.companyName || 'Babel Global Editorial Services');
      setSpecialistId(settings.specialistId || 'BG-CONSULT-391024');
      setFilingFee(settings.filingFee || '$715');
      setPremiumFee(settings.premiumFee || '$2,965');
      setAsylumFee(settings.asylumFee || '$300');
      setWhatsappAlerts(settings.whatsappAlerts !== false);
      setEmailRequests(settings.emailRequests !== false);
      setAppointmentReminders(settings.appointmentReminders !== false);
      setQuietHours(settings.quietHours !== false);

      if (settings.feeDefaults) {
        const fd = settings.feeDefaults;
        if (fd.aos) {
          if (fd.aos.i485 !== undefined) setAosI485(fd.aos.i485);
          if (fd.aos.i765 !== undefined) setAosI765(fd.aos.i765);
          if (fd.aos.i131 !== undefined) setAosI131(fd.aos.i131);
          if (fd.aos.i693 !== undefined) setAosI693(fd.aos.i693);
          if (fd.aos.g1145 !== undefined) setAosG1145(fd.aos.g1145);
          if (fd.aos.i485SupplementJ !== undefined) setAosI485SuppJ(fd.aos.i485SupplementJ);
        }
        if (fd.o1) {
          if (fd.o1.i129Standard !== undefined) setO1I129Standard(fd.o1.i129Standard);
          if (fd.o1.i129SmallNonprofit !== undefined) setO1I129SmallNonprofit(fd.o1.i129SmallNonprofit);
          if (fd.o1.asylumProgramFeeStandard !== undefined) setO1AsylumStandard(fd.o1.asylumProgramFeeStandard);
          if (fd.o1.asylumProgramFeeSmall !== undefined) setO1AsylumSmall(fd.o1.asylumProgramFeeSmall);
          if (fd.o1.asylumProgramFeeNonprofit !== undefined) setO1AsylumNonprofit(fd.o1.asylumProgramFeeNonprofit);
          if (fd.o1.i907 !== undefined) setO1I907(fd.o1.i907);
          if (fd.o1.ds160 !== undefined) setO1Ds160(fd.o1.ds160);
          if (fd.o1.i539Paper !== undefined) setO1I539Paper(fd.o1.i539Paper);
          if (fd.o1.i539Online !== undefined) setO1I539Online(fd.o1.i539Online);
          if (fd.o1.i539A !== undefined) setO1I539A(fd.o1.i539A);
        }
      }
    }
  }, [settings]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const payload = {
        companyName,
        specialistId,
        filingFee,
        premiumFee,
        asylumFee,
        whatsappAlerts,
        emailRequests,
        appointmentReminders,
        quietHours,
        practiceAreas: [
          { id: 'eb2-niw', title: 'EB-2 NIW', subtitle: 'Dhanasar 3-Prong Analysis' },
          { id: 'eb1a', title: 'EB-1A Extraordinary', subtitle: '10-Criteria Matrix' },
          { id: 'o1', title: 'O-1 Visa', subtitle: 'Nonimmigrant Petitions' },
          { id: 'profile-building', title: 'Profile Building', subtitle: 'Academic & Industry Portfolio' }
        ],
        feeDefaults: {
          i140FilingFee: filingFee,
          i907PremiumFee: premiumFee,
          asylumProgramFeeSmall: asylumFee,
          aos: {
            i485: aosI485,
            i765: aosI765,
            i131: aosI131,
            i693: aosI693,
            g1145: aosG1145,
            i485SupplementJ: aosI485SuppJ
          },
          o1: {
            i129Standard: o1I129Standard,
            i129SmallNonprofit: o1I129SmallNonprofit,
            asylumProgramFeeStandard: o1AsylumStandard,
            asylumProgramFeeSmall: o1AsylumSmall,
            asylumProgramFeeNonprofit: o1AsylumNonprofit,
            i907: o1I907,
            ds160: o1Ds160,
            i539Paper: o1I539Paper,
            i539Online: o1I539Online,
            i539A: o1I539A
          }
        }
      };

      if (onSaveSettings) {
        await onSaveSettings(payload);
      }
      setShowSavedToast(true);
      setTimeout(() => setShowSavedToast(false), 3500);
    } catch (err: any) {
      alert(`Save failed: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 pb-12 w-full">
      {/* Toast Notification */}
      {showSavedToast && (
        <div className="bg-emerald-600 text-white px-4 py-3 rounded-xl shadow-lg flex items-center justify-between text-xs font-bold animate-fadeIn">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-200" />
            <span>System Settings successfully saved and updated in the database!</span>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-xs">
        <h1 className="text-lg sm:text-xl font-bold text-slate-800 tracking-tight">System Settings & Governance</h1>
        <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
          Configure firm practice settings, Super Admin governance, practice areas, and statutory USCIS fee defaults.
        </p>
      </div>

      {/* Audit History & Administrative Access Log */}
      <div className="bg-white rounded-xl p-4 sm:p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-blue-600" />
            <div>
              <h3 className="font-bold text-slate-800 text-sm">System Administrative Access & Activity History</h3>
              <p className="text-xs text-slate-500">Record of Super Admin access, role switches, and "View As" activities</p>
            </div>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
            {activityLogs.length} Events Recorded
          </span>
        </div>

        <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto pr-1">
          {activityLogs.length === 0 ? (
            <div className="py-6 text-center text-xs text-slate-400">No activity history recorded yet.</div>
          ) : (
            activityLogs.map((log) => (
              <div key={log.id} className="py-3 flex items-start justify-between text-xs gap-3">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-800">{log.action}</span>
                    <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono">
                      {log.userEmail}
                    </span>
                  </div>
                  <p className="text-slate-500 text-[11px]">{log.details}</p>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-slate-400 shrink-0">
                  <Clock className="w-3 h-3 text-slate-400" />
                  <span>{log.timestamp}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Main Settings Card */}
      <div className="bg-white rounded-xl p-4 sm:p-6 border border-slate-200 shadow-xs space-y-6">
        {/* Practice Group & Branding */}
        <div>
          <h3 className="font-bold text-slate-800 text-sm mb-3">Practice Group & Branding Details</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-600 font-semibold mb-1">Company / Business Name</label>
              <input 
                type="text" 
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500" 
              />
            </div>
            <div>
              <label className="block text-slate-600 font-semibold mb-1">Lead Immigration Specialist ID</label>
              <input 
                type="text" 
                value={specialistId}
                onChange={(e) => setSpecialistId(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono" 
              />
            </div>
          </div>
        </div>

        {/* Practice Areas & Editorial Offerings */}
        <div className="pt-4 border-t border-slate-100">
          <h3 className="font-bold text-slate-800 text-sm mb-2">Practice Areas & Editorial Offerings</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
            <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl text-slate-800">
              <span className="font-bold block text-blue-900">EB-2 NIW</span>
              <span className="text-[10px] text-slate-500">Dhanasar 3-Prong Analysis</span>
            </div>
            <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl text-slate-800">
              <span className="font-bold block text-blue-900">EB-1A Extraordinary</span>
              <span className="text-[10px] text-slate-500">10-Criteria Matrix</span>
            </div>
            <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl text-slate-800">
              <span className="font-bold block text-blue-900">O-1 Visa</span>
              <span className="text-[10px] text-slate-500">Nonimmigrant Petitions</span>
            </div>
            <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-slate-800">
              <span className="font-bold block text-emerald-900">Profile Building</span>
              <span className="text-[10px] text-emerald-700 font-medium">Academic &amp; Industry Portfolio</span>
            </div>
          </div>
        </div>

        {/* 1. Form I-140 & General Petition Fees */}
        <div className="pt-4 border-t border-slate-100 space-y-3">
          <div>
            <h3 className="font-bold text-slate-800 text-sm">USCIS Fee Calculation Defaults</h3>
            <p className="text-xs text-slate-500 mt-0.5">Primary immigrant petition and premium processing statutory fee rates.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block text-slate-600 font-semibold mb-1">Form I-140 Filing Fee</label>
              <input 
                type="text" 
                value={filingFee}
                onChange={(e) => setFilingFee(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500" 
              />
            </div>
            <div>
              <label className="block text-slate-600 font-semibold mb-1">Form I-907 Premium Fee</label>
              <input 
                type="text" 
                value={premiumFee}
                onChange={(e) => setPremiumFee(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold text-amber-700" 
              />
            </div>
            <div>
              <label className="block text-slate-600 font-semibold mb-1">Asylum Program Fee (Non-Profit/Small)</label>
              <input 
                type="text" 
                value={asylumFee}
                onChange={(e) => setAsylumFee(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500" 
              />
            </div>
          </div>
        </div>

        {/* 2. AOS (Adjustment of Status) Fees */}
        <div className="pt-4 border-t border-slate-100 space-y-3">
          <div>
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <span>Adjustment of Status (AOS) Fee Defaults</span>
              <span className="text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">
                Form I-485 Packet
              </span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Statutory fees for permanent residence adjustment, work authorization, and travel documents.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block text-slate-600 font-semibold mb-1">Form I-485 (Application to Register Permanent Residence)</label>
              <input 
                type="text" 
                value={aosI485}
                onChange={(e) => setAosI485(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold" 
              />
            </div>
            <div>
              <label className="block text-slate-600 font-semibold mb-1">Form I-765 (Employment Authorization Document)</label>
              <input 
                type="text" 
                value={aosI765}
                onChange={(e) => setAosI765(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500" 
              />
            </div>
            <div>
              <label className="block text-slate-600 font-semibold mb-1">Form I-131 (Application for Travel Document / AP)</label>
              <input 
                type="text" 
                value={aosI131}
                onChange={(e) => setAosI131(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500" 
              />
            </div>
            <div>
              <label className="block text-slate-600 font-semibold mb-1">Form I-693 (Medical Examination &amp; Vaccination Record)</label>
              <div className="relative">
                <input 
                  type="text" 
                  value={aosI693}
                  onChange={(e) => setAosI693(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-emerald-700 bg-emerald-100/70 px-1.5 py-0.5 rounded">
                  $0 USCIS Fee
                </span>
              </div>
            </div>
            <div>
              <label className="block text-slate-600 font-semibold mb-1">Form G-1145 (E-Notification of Application/Petition)</label>
              <div className="relative">
                <input 
                  type="text" 
                  value={aosG1145}
                  onChange={(e) => setAosG1145(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-emerald-700 bg-emerald-100/70 px-1.5 py-0.5 rounded">
                  $0 Fee
                </span>
              </div>
            </div>
            <div>
              <label className="block text-slate-600 font-semibold mb-1">Form I-485 Supplement J (Job Portability Confirmation)</label>
              <div className="relative">
                <input 
                  type="text" 
                  value={aosI485SuppJ}
                  onChange={(e) => setAosI485SuppJ(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-emerald-700 bg-emerald-100/70 px-1.5 py-0.5 rounded">
                  $0 Fee
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 3. O-1 Visa Fees */}
        <div className="pt-4 border-t border-slate-100 space-y-3">
          <div>
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <span>O-1 Visa Fee Defaults &amp; Tier Variants</span>
              <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-full">
                Form I-129 / O-1A &amp; O-1B
              </span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Petitioner tiers, employer size exemptions, consular DS-160, and dependent I-539 structures.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block text-slate-600 font-semibold mb-1">Form I-129 (Standard Employer)</label>
              <input 
                type="text" 
                value={o1I129Standard}
                onChange={(e) => setO1I129Standard(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold" 
              />
            </div>
            <div>
              <label className="block text-slate-600 font-semibold mb-1">Form I-129 (Small Employer / Qualifying Nonprofit)</label>
              <input 
                type="text" 
                value={o1I129SmallNonprofit}
                onChange={(e) => setO1I129SmallNonprofit(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold text-blue-700" 
              />
            </div>
            <div>
              <label className="block text-slate-600 font-semibold mb-1">Asylum Program Fee (Standard Employer)</label>
              <input 
                type="text" 
                value={o1AsylumStandard}
                onChange={(e) => setO1AsylumStandard(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500" 
              />
            </div>
            <div>
              <label className="block text-slate-600 font-semibold mb-1">Asylum Program Fee — Small Employer</label>
              <input 
                type="text" 
                value={o1AsylumSmall}
                onChange={(e) => setO1AsylumSmall(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500" 
              />
            </div>
            <div>
              <label className="block text-slate-600 font-semibold mb-1">Asylum Program Fee — Qualifying Nonprofit</label>
              <div className="relative">
                <input 
                  type="text" 
                  value={o1AsylumNonprofit}
                  onChange={(e) => setO1AsylumNonprofit(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-emerald-700 bg-emerald-100/70 px-1.5 py-0.5 rounded">
                  $0 Exempt
                </span>
              </div>
            </div>
            <div>
              <label className="block text-slate-600 font-semibold mb-1">Form I-907 Premium Processing Fee</label>
              <input 
                type="text" 
                value={o1I907}
                onChange={(e) => setO1I907(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold text-amber-700" 
              />
            </div>
            <div>
              <label className="block text-slate-600 font-semibold mb-1">Form DS-160 (Consular Visa Application)</label>
              <div className="relative">
                <input 
                  type="text" 
                  value={o1Ds160}
                  onChange={(e) => setO1Ds160(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-400">
                  per applicant
                </span>
              </div>
            </div>
            <div>
              <label className="block text-slate-600 font-semibold mb-1">Form I-539 (Paper Filing — Change/Extend Status)</label>
              <input 
                type="text" 
                value={o1I539Paper}
                onChange={(e) => setO1I539Paper(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500" 
              />
            </div>
            <div>
              <label className="block text-slate-600 font-semibold mb-1">Form I-539 (Online Filing — Change/Extend Status)</label>
              <input 
                type="text" 
                value={o1I539Online}
                onChange={(e) => setO1I539Online(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-emerald-700" 
              />
            </div>
            <div>
              <label className="block text-slate-600 font-semibold mb-1">Form I-539A (Supplemental Application for Dependents)</label>
              <div className="relative">
                <input 
                  type="text" 
                  value={o1I539A}
                  onChange={(e) => setO1I539A(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-emerald-700 bg-emerald-100/70 px-1.5 py-0.5 rounded">
                  $0 Fee
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Notifications & Messaging Dispatch Preferences */}
        <div className="pt-4 border-t border-slate-100 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-800 text-sm">System Messaging & Dispatch Preferences</h3>
              <p className="text-xs text-slate-500">Global notification triggers for clients and Babel Global Team</p>
            </div>
            <Bell className="w-4 h-4 text-blue-600" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <label className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between cursor-pointer">
              <div>
                <span className="font-semibold text-slate-800 block">WhatsApp Instant Alerts</span>
                <span className="text-[10px] text-slate-500">Send automatic WhatsApp messages on stage progress</span>
              </div>
              <input 
                type="checkbox" 
                checked={whatsappAlerts}
                onChange={(e) => setWhatsappAlerts(e.target.checked)}
                className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer" 
              />
            </label>

            <label className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between cursor-pointer">
              <div>
                <span className="font-semibold text-slate-800 block">Email Document Requests</span>
                <span className="text-[10px] text-slate-500">Notify clients via email when exhibit review requires action</span>
              </div>
              <input 
                type="checkbox" 
                checked={emailRequests}
                onChange={(e) => setEmailRequests(e.target.checked)}
                className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer" 
              />
            </label>

            <label className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between cursor-pointer">
              <div>
                <span className="font-semibold text-slate-800 block">Appointment Reminders</span>
                <span className="text-[10px] text-slate-500">Automated SMS & Email reminders 24 hrs prior to calls</span>
              </div>
              <input 
                type="checkbox" 
                checked={appointmentReminders}
                onChange={(e) => setAppointmentReminders(e.target.checked)}
                className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer" 
              />
            </label>

            <label className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between cursor-pointer">
              <div>
                <span className="font-semibold text-slate-800 block">Quiet Hours Enforcement</span>
                <span className="text-[10px] text-slate-500">Pause automated dispatch between 09:00 PM and 08:00 AM</span>
              </div>
              <input 
                type="checkbox" 
                checked={quietHours}
                onChange={(e) => setQuietHours(e.target.checked)}
                className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer" 
              />
            </label>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex justify-end">
          <button 
            disabled={isSaving}
            onClick={handleSave}
            className="w-full sm:w-auto px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg shadow-sm flex items-center justify-center gap-1.5 cursor-pointer border border-blue-500 disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{isSaving ? 'Saving Settings...' : 'Save System Settings'}</span>
          </button>
        </div>
      </div>

    </div>
  );
};
