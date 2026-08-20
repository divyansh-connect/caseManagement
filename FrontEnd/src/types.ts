export type UserRole = 'superadmin' | 'admin' | 'writer' | 'reviewer' | 'client';

export type StageId = 
  | 1  // Consultation and Onboarding
  | 2  // Case Strategy & Recommendation Letters
  | 3  // Forms Preparation
  | 4  // Petition Drafting & Review
  | 5  // Final Package Preparation
  | 6  // Filed with USCIS & Tracking
  | 7; // Optional Add-On: Concurrent Form I-485 Filing

export interface WorkflowStage {
  id: StageId;
  name: string;
  description: string;
  category: 'Intake' | 'Evaluation' | 'Endeavor & Evidence' | 'Drafting & Review' | 'Final Filing';
  typicalDays: number;
}

export type RiskLevel = 'low' | 'medium' | 'high';

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  countryOfBirth: string;
  currentField: string;
  highestDegree: 'Ph.D.' | 'Master\'s' | 'Bachelor\'s + 5 yrs' | 'Exceptional Ability';
  university: string;
  citationsCount?: number;
  publicationsCount?: number;
  patentsCount?: number;
  status: 'Active' | 'On Hold' | 'Approved' | 'Archived';
  avatar?: string;
  createdAt: string;
}

export interface DhanasarProngs {
  prong1: {
    title: 'Substantial Merit & National Importance';
    endeavorSummary: string;
    usImpactAreas: string[];
    nationalImportanceScore: number; // 1-100
  };
  prong2: {
    title: 'Well Positioned to Advance the Endeavor';
    educationTrack: string;
    keyAchievements: string[];
    citationPercentile: string;
    fundingSecured: string;
  };
  prong3: {
    title: 'On Balance Beneficial to Waive Job Offer & PERM';
    urgencyArguments: string[];
    uniqueExpertise: string;
  };
}

export interface Recommender {
  id: string;
  caseId: string;
  name: string;
  title: string;
  organization: string;
  relationship: 'Independent Expert' | 'Academic Advisor' | 'Industry Collaborator' | 'Government Official';
  status: 'Identified' | 'Outreach Sent' | 'Drafting Letter' | 'Letter Signed' | 'Verified';
  cvReceived: boolean;
  letterDraftUrl?: string;
  keyContributionsMentioned: string[];
}

export interface CaseDocument {
  id: string;
  caseId: string;
  name: string;
  category: 'CV' | 'Degree' | 'Transcript' | 'Publication' | 'Citation Report' | 'Recommendation Letter' | 'Expert Opinion' | 'Form I-140' | 'ETA-9089' | 'Exhibits Index';
  exhibitNumber?: string;
  fileSize: string;
  uploadedBy: string;
  uploadedAt: string;
  status: 'Pending Review' | 'Verified' | 'Needs Revision' | 'Approved';
  aiSummary?: string;
}

export interface CaseTask {
  id: string;
  caseId: string;
  title: string;
  assignedRole: UserRole;
  assignedToName: string;
  stageId: StageId;
  dueDate: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  completed: boolean;
}

export interface PaymentMilestone {
  id: string;
  caseId: string;
  description: string;
  amount: number;
  dueDate: string;
  status: 'Paid' | 'Pending' | 'Overdue';
  paidAt?: string;
}

export interface CaseMessage {
  id: string;
  caseId: string;
  senderName: string;
  senderRole: UserRole;
  content: string;
  timestamp: string;
  attachments?: string[];
}

export type PetitionCategory = 'EB-2 NIW' | 'EB-1A' | 'O-1' | 'Resume Building' | 'Profile Building' | 'Mexico TR Visa';


export interface Eb1aCriteria {
  prizes: boolean;
  membership: boolean;
  media: boolean;
  judging: boolean;
  originalContributions: boolean;
  scholarlyArticles: boolean;
  exhibitions: boolean;
  leadingRole: boolean;
  highSalary: boolean;
  commercialSuccess: boolean;
}

export interface CaseItem {
  id: string;
  caseNumber: string; // e.g. NIW-2025-089 or EB1A-2025-092
  clientId: string;
  clientName: string;
  clientEmail: string;
  petitionCategory?: PetitionCategory;
  fieldCategory: string; // e.g., "Artificial Intelligence", "Renewable Energy Grid"
  currentStage: StageId;
  assignedWriter: string;
  assignedReviewer: string;
  riskLevel: RiskLevel;
  targetFilingDate: string;
  uscisServiceCenter: 'Nebraska (NSC)' | 'Texas (TSC)';
  premiumProcessing: boolean;
  dhanasar: DhanasarProngs;
  eb1aCriteria?: Eb1aCriteria;
  recommenders: Recommender[];
  documentsCount: number;
  notes: string;
  lastUpdated: string;
}


export interface CaseTemplate {
  id: string;
  industry: string;
  title: string;
  description: string;
  sampleEndeavor: string;
  suggestedProng1Points: string[];
  suggestedProng2Points: string[];
  suggestedProng3Points: string[];
  recommendedExhibits: string[];
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  userEmail: string;
  action: string;
  targetRole?: UserRole;
  details: string;
}

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

