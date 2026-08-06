import { WorkflowStage, CaseItem, Client, CaseDocument, CaseTask, PaymentMilestone, CaseTemplate, CaseMessage } from '../types';

export const WORKFLOW_STAGES: WorkflowStage[] = [
  { id: 1, name: 'Client Registration & Intake', description: 'Initial onboarding, background questionnaire, & eligibility screening.', category: 'Intake', typicalDays: 2 },
  { id: 2, name: 'CV & Supporting Documents', description: 'Client uploads academic degrees, transcripts, publications, & CV.', category: 'Intake', typicalDays: 5 },
  { id: 3, name: 'Qualification Evaluation', description: 'Specialist assessment of Advanced Degree or Exceptional Ability threshold.', category: 'Evaluation', typicalDays: 3 },
  { id: 4, name: 'Terms & Conditions', description: 'Retainer agreement signing & representation scope definition.', category: 'Evaluation', typicalDays: 2 },
  { id: 5, name: 'Payment', description: 'Initial retainer fee processing & account activation.', category: 'Evaluation', typicalDays: 1 },
  { id: 6, name: 'Proposed Endeavor & Recommenders', description: 'Drafting U.S. National Importance endeavor statement & identifying expert recommenders.', category: 'Endeavor & Evidence', typicalDays: 7 },
  { id: 7, name: 'Client Feedback', description: 'Refining endeavor statement with client Q&A and field focus alignment.', category: 'Endeavor & Evidence', typicalDays: 4 },
  { id: 8, name: 'Research & Evidence', description: 'Gathering citation reports, media coverage, industry statistics & government initiatives.', category: 'Endeavor & Evidence', typicalDays: 10 },
  { id: 9, name: 'Draft Preparation', description: 'Drafting 3-5 expert recommendation letters & petition memo outline.', category: 'Drafting & Review', typicalDays: 12 },
  { id: 10, name: 'Client Review', description: 'Client reviews recommendation letters & background exhibits for accuracy.', category: 'Drafting & Review', typicalDays: 5 },
  { id: 11, name: 'Petition Draft', description: 'Formulating Petition Memorandum applying Dhanasar 3-Prong framework.', category: 'Drafting & Review', typicalDays: 10 },
  { id: 12, name: 'Final Client Review', description: 'Senior Reviewer audit & final client approval of complete petition package.', category: 'Drafting & Review', typicalDays: 4 },
  { id: 13, name: 'Petition Package', description: 'Assembling I-140, ETA-9089, index of exhibits, & shipping to USCIS.', category: 'Final Filing', typicalDays: 3 },
  { id: 14, name: 'Case Completion', description: 'USCIS receipt notice issued, tracking number recorded, & I-797 tracking active.', category: 'Final Filing', typicalDays: 1 }
];


export const INITIAL_CLIENTS: Client[] = [
  {
    id: 'c-101',
    name: 'Dr. Elena Rostova',
    email: 'elena.rostova@quantum-labs.io',
    phone: '+1 (555) 382-9102',
    countryOfBirth: 'Ukraine',
    currentField: 'Quantum Machine Learning & Optimization',
    highestDegree: 'Ph.D.',
    university: 'MIT',
    citationsCount: 418,
    publicationsCount: 14,
    patentsCount: 3,
    status: 'Active',
    createdAt: '2025-01-10'
  },
  {
    id: 'c-102',
    name: 'Carlos Mendez, M.S.',
    email: 'carlos.mendez@cleanenergygrid.com',
    phone: '+1 (555) 714-2289',
    countryOfBirth: 'Mexico',
    currentField: 'Smart Grid Energy Storage Integration',
    highestDegree: 'Master\'s',
    university: 'Stanford University',
    citationsCount: 195,
    publicationsCount: 8,
    patentsCount: 2,
    status: 'Active',
    createdAt: '2025-01-14'
  },
  {
    id: 'c-103',
    name: 'Dr. Amara Okafor',
    email: 'a.okafor@oncology-ai.org',
    phone: '+1 (555) 890-3341',
    countryOfBirth: 'Nigeria',
    currentField: 'Computational Oncology & Genomics',
    highestDegree: 'Ph.D.',
    university: 'Johns Hopkins University',
    citationsCount: 620,
    publicationsCount: 22,
    patentsCount: 1,
    status: 'Active',
    createdAt: '2025-01-18'
  },
  {
    id: 'c-104',
    name: 'Dr. Vikram Patel',
    email: 'vikram.p@robotics-core.ai',
    phone: '+1 (555) 412-9830',
    countryOfBirth: 'India',
    currentField: 'Autonomous Robotics for Agriculture',
    highestDegree: 'Ph.D.',
    university: 'Carnegie Mellon University',
    citationsCount: 310,
    publicationsCount: 11,
    patentsCount: 4,
    status: 'Active',
    createdAt: '2025-02-01'
  },
  {
    id: 'c-105',
    name: 'Sofia Al-Mansoor',
    email: 'sofia.mansoor@cyberfortress.net',
    phone: '+1 (555) 901-4421',
    countryOfBirth: 'Jordan',
    currentField: 'Zero-Trust Cybersecurity for Critical Infrastructure',
    highestDegree: 'Bachelor\'s + 5 yrs',
    university: 'UC Berkeley',
    citationsCount: 88,
    publicationsCount: 5,
    patentsCount: 1,
    status: 'Active',
    createdAt: '2025-02-05'
  }
];

export const INITIAL_CASES: CaseItem[] = [
  {
    id: 'case-101',
    caseNumber: 'NIW-2025-089',
    clientId: 'c-101',
    clientName: 'Dr. Elena Rostova',
    clientEmail: 'elena.rostova@quantum-labs.io',
    petitionCategory: 'EB-2 NIW',
    fieldCategory: 'Quantum Machine Learning & Optimization',
    currentStage: 9, // Draft Preparation
    assignedWriter: 'Petition Drafter 1',
    assignedReviewer: 'Senior Reviewer',
    riskLevel: 'low',
    targetFilingDate: '2025-03-20',
    uscisServiceCenter: 'Nebraska (NSC)',
    premiumProcessing: true,
    dhanasar: {
      prong1: {
        title: 'Substantial Merit & National Importance',
        endeavorSummary: 'Developing error-mitigated quantum algorithms for grid optimization and fault-tolerant encryption to secure US power infrastructure.',
        usImpactAreas: ['DOE Grid Security Modernization', 'Executive Order 14028 on Cybersecurity', 'National Quantum Initiative Act'],
        nationalImportanceScore: 94
      },
      prong2: {
        title: 'Well Positioned to Advance the Endeavor',
        educationTrack: 'Ph.D. in Quantum Engineering from MIT with 418 citations across IEEE & Physical Review Letters.',
        keyAchievements: ['Developed Q-Optimizer algorithm cited by IBM Quantum', 'Principal Investigator on $1.2M NSF SBIR Phase I grant', 'Reviewer for 4 flagship physics journals'],
        citationPercentile: 'Top 1% in Quantum Computing (Google Scholar)',
        fundingSecured: '$1,200,000 NSF Grant'
      },
      prong3: {
        title: 'On Balance Beneficial to Waive Job Offer & PERM',
        urgencyArguments: ['Urgent national defense requirement for quantum resilience', 'PERM process would cause 18+ month delay compromising defense partnerships', 'Endeavor relies on independent cross-institutional research collaboration'],
        uniqueExpertise: 'Rostova possesses rare dual expertise in quantum state tomography and tensor network compression.'
      }
    },
    recommenders: [
      {
        id: 'rec-1',
        caseId: 'case-101',
        name: 'Dr. Arthur Pendelton',
        title: 'Chair of Physics & Quantum Technology',
        organization: 'MIT Research Laboratory',
        relationship: 'Academic Advisor',
        status: 'Letter Signed',
        cvReceived: true,
        keyContributionsMentioned: ['Pioneered quantum fault mitigation', 'Supervised 3 milestone publications']
      },
      {
        id: 'rec-2',
        caseId: 'case-101',
        name: 'Dr. Samantha Wu',
        title: 'Chief Scientist for Defense Systems',
        organization: 'Sandia National Laboratories',
        relationship: 'Independent Expert',
        status: 'Drafting Letter',
        cvReceived: true,
        keyContributionsMentioned: ['Validated quantum algorithm resilience on government hardware testbed']
      },
      {
        id: 'rec-3',
        caseId: 'case-101',
        name: 'Prof. Henrik Lindqvist',
        title: 'Director of Quantum Institute',
        organization: 'ETH Zurich',
        relationship: 'Independent Expert',
        status: 'Outreach Sent',
        cvReceived: true,
        keyContributionsMentioned: ['Cites Dr. Rostova in 12 independent peer-reviewed papers']
      }
    ],
    documentsCount: 18,
    notes: 'Drafting Prong 1 Memo. Client provided updated citation verification report showing +35 new citations this month.',
    lastUpdated: '2025-02-28 14:30'
  },
  {
    id: 'case-102',
    caseNumber: 'EB1A-2025-092',
    clientId: 'c-102',
    clientName: 'Carlos Mendez, M.S.',
    clientEmail: 'carlos.mendez@cleanenergygrid.com',
    petitionCategory: 'EB-1A',
    fieldCategory: 'Smart Grid Energy Storage Integration',
    currentStage: 6, // Proposed Endeavor & Recommenders
    assignedWriter: 'Petition Drafter 2',
    assignedReviewer: 'Senior Reviewer',
    riskLevel: 'medium',
    targetFilingDate: '2025-04-10',
    uscisServiceCenter: 'Texas (TSC)',
    premiumProcessing: true,
    eb1aCriteria: {
      prizes: true,
      membership: true,
      media: false,
      judging: true,
      originalContributions: true,
      scholarlyArticles: true,
      exhibitions: false,
      leadingRole: true,
      highSalary: true,
      commercialSuccess: false
    },

    dhanasar: {
      prong1: {
        title: 'Substantial Merit & National Importance',
        endeavorSummary: 'Designing decentralized battery energy management systems (BEMS) to integrate intermittent solar and wind capacity into the US electrical grid.',
        usImpactAreas: ['Bipartisan Infrastructure Law Grid Resilience', 'FERC Order 2222 Compliance', 'Decarbonization Targets 2035'],
        nationalImportanceScore: 88
      },
      prong2: {
        title: 'Well Positioned to Advance the Endeavor',
        educationTrack: 'M.S. in Electrical Engineering from Stanford with 8 patents pending and 195 citations.',
        keyAchievements: ['Engineered microgrid controller deployed across 14 California utility sub-stations', 'Author of 8 IEEE transactions papers'],
        citationPercentile: 'Top 5% in Power Electronics',
        fundingSecured: '$450,000 CEC Innovation Award'
      },
      prong3: {
        title: 'On Balance Beneficial to Waive Job Offer & PERM',
        urgencyArguments: ['US grid stabilization demands immediate deployment prior to upcoming peak summer load', 'Contractual nature of utility consulting makes PERM employer tied sponsorship unfeasible'],
        uniqueExpertise: 'Custom firmware expertise bridging legacy SCADA systems with lithium-ferrophosphate storage systems.'
      }
    },
    recommenders: [
      {
        id: 'rec-4',
        caseId: 'case-102',
        name: 'Dr. Gregory Vance',
        title: 'VP of Engineering',
        organization: 'NextEra Energy',
        relationship: 'Industry Collaborator',
        status: 'Drafting Letter',
        cvReceived: true,
        keyContributionsMentioned: ['Tested Mendez firmware in utility scale battery bank']
      }
    ],
    documentsCount: 12,
    notes: 'Awaiting client detailed endeavor questionnaire. Need 2 additional independent recommenders.',
    lastUpdated: '2025-02-27 10:15'
  },
  {
    id: 'case-103',
    caseNumber: 'NIW-2025-078',
    clientId: 'c-103',
    clientName: 'Dr. Amara Okafor',
    clientEmail: 'a.okafor@oncology-ai.org',
    fieldCategory: 'Computational Oncology & Genomics',
    currentStage: 12, // Final Client Review
    assignedWriter: 'Sarah Jenkins (Petition Specialist)',
    assignedReviewer: 'Rachel Zhang, Esq. (Partner)',
    riskLevel: 'low',
    targetFilingDate: '2025-03-05',
    uscisServiceCenter: 'Nebraska (NSC)',
    premiumProcessing: true,
    dhanasar: {
      prong1: {
        title: 'Substantial Merit & National Importance',
        endeavorSummary: 'Leveraging deep transformer models to predict drug response in rare pediatric sarcomas, addressing critical gaps in targeted cancer therapies.',
        usImpactAreas: ['National Cancer Institute Moonshot Initiative', 'Precision Medicine Task Force', 'FDA Accelerated Approval Pathway'],
        nationalImportanceScore: 98
      },
      prong2: {
        title: 'Well Positioned to Advance the Endeavor',
        educationTrack: 'Ph.D. from Johns Hopkins with 620 citations, Nature Cancer cover article, and 4 NIH grants as co-investigator.',
        keyAchievements: ['Created SarcomaDB utilized by 40+ US medical research centers', 'Keynote speaker at AACR 2024'],
        citationPercentile: 'Top 0.5% in Bio-Data Science',
        fundingSecured: '$2,800,000 NIH R01 Co-Investigator'
      },
      prong3: {
        title: 'On Balance Beneficial to Waive Job Offer & PERM',
        urgencyArguments: ['Pediatric oncology research requires rapid cross-border data sharing unsupported by PERM employer locks', 'Immediate public health urgency to reduce pediatric mortality'],
        uniqueExpertise: 'Single-cell transcriptomics combined with spatial multi-omics modeling.'
      }
    },
    recommenders: [
      {
        id: 'rec-5',
        caseId: 'case-103',
        name: 'Dr. Lawrence Sterling',
        title: 'Director of Pediatric Oncology',
        organization: 'Memorial Sloan Kettering',
        relationship: 'Independent Expert',
        status: 'Verified',
        cvReceived: true,
        keyContributionsMentioned: ['Applied Dr. Okafor algorithms in clinical trials']
      },
      {
        id: 'rec-6',
        caseId: 'case-103',
        name: 'Dr. Claire Dupont',
        title: 'Head of Genomics',
        organization: 'Institut Curie',
        relationship: 'Independent Expert',
        status: 'Verified',
        cvReceived: true,
        keyContributionsMentioned: ['International reference on SarcomaDB dataset']
      }
    ],
    documentsCount: 26,
    notes: 'Final petition packet assembled. Client review in progress. Exhibit list contains 42 verified exhibits.',
    lastUpdated: '2025-02-28 17:00'
  },
  {
    id: 'case-104',
    caseNumber: 'NIW-2025-104',
    clientId: 'c-104',
    clientName: 'Dr. Vikram Patel',
    clientEmail: 'vikram.p@robotics-core.ai',
    fieldCategory: 'Autonomous Robotics for Agriculture',
    currentStage: 3, // Qualification Evaluation
    assignedWriter: 'Marcus Vance (Senior Writer)',
    assignedReviewer: 'David Miller, Esq. (Managing Partner)',
    riskLevel: 'medium',
    targetFilingDate: '2025-04-30',
    uscisServiceCenter: 'Texas (TSC)',
    premiumProcessing: false,
    dhanasar: {
      prong1: {
        title: 'Substantial Merit & National Importance',
        endeavorSummary: 'Building autonomous precision weeding and crop monitoring robots to combat agricultural labor shortages and lower chemical pesticide runoff.',
        usImpactAreas: ['USDA Sustainable Agriculture Strategy', 'Clean Water Act Off-farm Runoff Reductions'],
        nationalImportanceScore: 86
      },
      prong2: {
        title: 'Well Positioned to Advance the Endeavor',
        educationTrack: 'Ph.D. in Robotics from CMU, 310 citations, 4 robotics patents.',
        keyAchievements: ['Commercialized autonomous navigation module', 'Featured in ASABE Technology Review'],
        citationPercentile: 'Top 3% in Agricultural Automation',
        fundingSecured: '$800,000 USDA Innovation Grant'
      },
      prong3: {
        title: 'On Balance Beneficial to Waive Job Offer & PERM',
        urgencyArguments: ['Seasonal farming cycles require urgent deployment of automated systems before harvest'],
        uniqueExpertise: 'Real-time computer vision hardware running at ultra-low power on farm machinery.'
      }
    },
    recommenders: [],
    documentsCount: 8,
    notes: 'Verifying Ph.D. diploma evaluation and citation indexing report.',
    lastUpdated: '2025-02-25 09:30'
  },
  {
    id: 'case-105',
    caseNumber: 'NIW-2025-061',
    clientId: 'c-105',
    clientName: 'Sofia Al-Mansoor',
    clientEmail: 'sofia.mansoor@cyberfortress.net',
    fieldCategory: 'Zero-Trust Cybersecurity for Critical Infrastructure',
    currentStage: 14, // Case Completion
    assignedWriter: 'Sarah Jenkins (Petition Specialist)',
    assignedReviewer: 'Rachel Zhang, Esq. (Partner)',
    riskLevel: 'low',
    targetFilingDate: '2025-01-15',
    uscisServiceCenter: 'Nebraska (NSC)',
    premiumProcessing: true,
    dhanasar: {
      prong1: {
        title: 'Substantial Merit & National Importance',
        endeavorSummary: 'Designing zero-trust authentication protocols for SCADA systems governing US water treatment plants and municipal grids.',
        usImpactAreas: ['CISA Critical Infrastructure Directive', 'National Cybersecurity Strategy 2023'],
        nationalImportanceScore: 92
      },
      prong2: {
        title: 'Well Positioned to Advance the Endeavor',
        educationTrack: 'B.S. in Computer Science + 7 years progressive engineering leadership; 88 citations & 1 patent.',
        keyAchievements: ['Exceptional Ability criteria satisfied under 6/7 regulatory prongs', 'Key speaker at DEF CON Infrastructure Track'],
        citationPercentile: 'Top 10% in Operational Technology Security',
        fundingSecured: '$600,000 Corporate Innovation Fund'
      },
      prong3: {
        title: 'On Balance Beneficial to Waive Job Offer & PERM',
        urgencyArguments: ['Immediate cyber threat climate against US water networks mandates independent technical deployment'],
        uniqueExpertise: 'Legacy industrial protocol hardening without network downtime.'
      }
    },
    recommenders: [],
    documentsCount: 31,
    notes: 'APPROVED! I-797 Notice of Approval received from NSC on Feb 20, 2025. Priority date locked.',
    lastUpdated: '2025-02-20 11:00'
  }
];

export const INITIAL_DOCUMENTS: CaseDocument[] = [
  {
    id: 'doc-1',
    caseId: 'case-101',
    name: 'Dr_Elena_Rostova_CV_2025.pdf',
    category: 'CV',
    exhibitNumber: 'Exhibit 101',
    fileSize: '2.4 MB',
    uploadedBy: 'Client (Elena Rostova)',
    uploadedAt: '2025-01-11',
    status: 'Verified',
    aiSummary: 'Extensive CV detailing Ph.D. from MIT, 14 publications, 418 citations, 3 patents, and peer review records for 4 physics journals.'
  },
  {
    id: 'doc-2',
    caseId: 'case-101',
    name: 'MIT_PhD_Diploma_Official_Evaluation.pdf',
    category: 'Degree',
    exhibitNumber: 'Exhibit 102',
    fileSize: '1.8 MB',
    uploadedBy: 'Client (Elena Rostova)',
    uploadedAt: '2025-01-12',
    status: 'Verified',
    aiSummary: 'Official MIT Diploma for Doctor of Philosophy in Quantum Science & Engineering, conferred June 2021.'
  },
  {
    id: 'doc-3',
    caseId: 'case-101',
    name: 'Google_Scholar_Citation_Report_Feb2025.pdf',
    category: 'Citation Report',
    exhibitNumber: 'Exhibit 103',
    fileSize: '4.1 MB',
    uploadedBy: 'Sarah Jenkins',
    uploadedAt: '2025-02-15',
    status: 'Verified',
    aiSummary: 'Verified citation graph proving 418 citations across 32 countries, ranking candidate in top 1% for quantum optimization algorithms.'
  },
  {
    id: 'doc-4',
    caseId: 'case-101',
    name: 'Expert_Letter_Dr_Pendelton_Signed.pdf',
    category: 'Recommendation Letter',
    exhibitNumber: 'Exhibit 201',
    fileSize: '890 KB',
    uploadedBy: 'Sarah Jenkins',
    uploadedAt: '2025-02-24',
    status: 'Approved',
    aiSummary: 'Signed letter from MIT Dept Chair attesting to original algorithmic contributions and substantial national merit of quantum endeavor.'
  },
  {
    id: 'doc-5',
    caseId: 'case-101',
    name: 'NSF_Grant_Award_Letter_1_2M.pdf',
    category: 'Publication',
    exhibitNumber: 'Exhibit 304',
    fileSize: '1.2 MB',
    uploadedBy: 'Client (Elena Rostova)',
    uploadedAt: '2025-01-20',
    status: 'Verified',
    aiSummary: 'Official National Science Foundation Award Notice designating Dr. Rostova as Principal Investigator for $1.2M quantum grid project.'
  },
  {
    id: 'doc-6',
    caseId: 'case-103',
    name: 'SarcomaDB_Nature_Cancer_Cover_Article.pdf',
    category: 'Publication',
    exhibitNumber: 'Exhibit 105',
    fileSize: '5.6 MB',
    uploadedBy: 'Client (Amara Okafor)',
    uploadedAt: '2025-01-19',
    status: 'Verified',
    aiSummary: 'Peer-reviewed research paper published in Nature Cancer with editorial highlight and cover commentary.'
  }
];

export const INITIAL_TASKS: CaseTask[] = [
  {
    id: 't-1',
    caseId: 'case-101',
    title: 'Finalize Expert Recommendation Letter #2 (Sandia Labs)',
    assignedRole: 'writer',
    assignedToName: 'Sarah Jenkins',
    stageId: 9,
    dueDate: '2025-03-03',
    priority: 'high',
    completed: false
  },
  {
    id: 't-2',
    caseId: 'case-101',
    title: 'Run AI Dhanasar Prong 1 National Importance Check',
    assignedRole: 'writer',
    assignedToName: 'Sarah Jenkins',
    stageId: 9,
    dueDate: '2025-03-04',
    priority: 'medium',
    completed: true
  },
  {
    id: 't-3',
    caseId: 'case-101',
    title: 'Senior Attorney Review of Draft Form I-140 Cover Letter',
    assignedRole: 'reviewer',
    assignedToName: 'David Miller, Esq.',
    stageId: 10,
    dueDate: '2025-03-08',
    priority: 'urgent',
    completed: false
  },
  {
    id: 't-4',
    caseId: 'case-102',
    title: 'Review Client Proposed Endeavor Questionnaire Answers',
    assignedRole: 'writer',
    assignedToName: 'Marcus Vance',
    stageId: 6,
    dueDate: '2025-03-02',
    priority: 'high',
    completed: false
  },
  {
    id: 't-5',
    caseId: 'case-103',
    title: 'Print & Index Exhibit Tabs 1-42 for FedEx Package',
    assignedRole: 'admin',
    assignedToName: 'Intake Desk',
    stageId: 13,
    dueDate: '2025-03-04',
    priority: 'high',
    completed: false
  }
];

export const INITIAL_PAYMENTS: PaymentMilestone[] = [
  { id: 'p-1', caseId: 'case-101', description: 'Initial Retainer Fee (Intake & Endeavor Setup)', amount: 4000, dueDate: '2025-01-10', status: 'Paid', paidAt: '2025-01-10' },
  { id: 'p-2', caseId: 'case-101', description: 'Milestone 2: Petition Draft & Recommendation Letters', amount: 3500, dueDate: '2025-02-25', status: 'Paid', paidAt: '2025-02-24' },
  { id: 'p-3', caseId: 'case-101', description: 'USCIS Premium Processing Fee ($2,965)', amount: 2965, dueDate: '2025-03-10', status: 'Pending' },
  { id: 'p-4', caseId: 'case-102', description: 'Initial Retainer Fee', amount: 4000, dueDate: '2025-01-14', status: 'Paid', paidAt: '2025-01-14' },
  { id: 'p-5', caseId: 'case-102', description: 'Milestone 2: Petition Draft', amount: 3500, dueDate: '2025-03-15', status: 'Pending' }
];

export const CASE_TEMPLATES: CaseTemplate[] = [
  {
    id: 'tpl-1',
    industry: 'Artificial Intelligence & Machine Learning',
    title: 'AI/ML Research Scientist & Infrastructure Engineer',
    description: 'Tailored for candidates advancing foundation models, computer vision, natural language processing, or AI chip acceleration.',
    sampleEndeavor: 'Pioneering energy-efficient machine learning architectures for enterprise cybersecurity and real-time medical diagnostics in the United States.',
    suggestedProng1Points: [
      'Aligns with Executive Order on Safe, Secure, and Trustworthy Artificial Intelligence',
      'Addresses critical semiconductor efficiency bottlenecks reducing server grid load',
      'Enhances national economic competitiveness against international state-sponsored AI initiatives'
    ],
    suggestedProng2Points: [
      'Top-tier conference publications (NeurIPS, CVPR, ICML) demonstrating field leadership',
      'Open-source repository adoption metrics (GitHub stars, PyTorch core integrations)',
      'Peer review record for IEEE Transactions and ACM digital libraries'
    ],
    suggestedProng3Points: [
      'PERM labor certification requires tied employer sponsorship, hindering multi-institutional open AI collaboration',
      'Rapid pace of AI model iteration requires immediate research deployment without 2-year PERM processing latency'
    ],
    recommendedExhibits: [
      'Google Scholar Citation Index & World Percentile Chart',
      'GitHub Repository Impact & Downstream Commercial Usage Log',
      'Executive Order 14110 AI Policy Excerpt',
      'Conference Acceptance Rate Verification Letters'
    ]
  },
  {
    id: 'tpl-2',
    industry: 'Clean Energy & Power Infrastructure',
    title: 'Renewable Microgrid & Battery Systems Specialist',
    description: 'Designed for engineers developing battery management, hydrogen fuel cells, wind grid integration, or solar forecasting.',
    sampleEndeavor: 'Engineering resilient microgrid management platforms to integrate high-penetration renewable power into aging US electrical utility networks.',
    suggestedProng1Points: [
      'Fulfills Bipartisan Infrastructure Law mandates for grid modernization',
      'Mitigates catastrophic blackout risks during climate extreme weather events',
      'Accelerates US transition away from fossil-fuel baseline dependency'
    ],
    suggestedProng2Points: [
      'Utility-scale pilot deployment certifications and patents',
      'State energy commission research awards (e.g. CEC, NYSERDA grants)',
      'IEEE Power & Energy Society peer-reviewed articles'
    ],
    suggestedProng3Points: [
      'Contractual utility deployment model makes standard permanent labor certification unworkable',
      'Urgent grid safety risks demand immediate application of candidate proprietary software algorithms'
    ],
    recommendedExhibits: [
      'US Department of Energy Grid Modernization Index',
      'Utility Deployment Verification Letters from Senior Engineers',
      'Patent Application Index & Claims Specifications'
    ]
  },
  {
    id: 'tpl-3',
    industry: 'Biomedical & Healthcare Innovation',
    title: 'Computational Oncologist & Medical Device Pioneer',
    description: 'Designed for researchers working in drug discovery, genomics, surgical robotics, medical image AI, or therapeutics.',
    sampleEndeavor: 'Developing precision genomic algorithms to predict therapeutic efficacy and reduce adverse drug reactions in underserved cancer patient demographics.',
    suggestedProng1Points: [
      'Directly advances the NIH Cancer Moonshot mission to reduce cancer mortality by 50%',
      'Reduces national healthcare expenditure by preventing ineffective drug regimens',
      'Promotes health equity in complex multi-ethnic genetic research datasets'
    ],
    suggestedProng2Points: [
      'High-impact medical journal citations (Nature Medicine, Lancet Oncology, Cell)',
      'NIH / NSF grant co-investigator role or SBIR commercialization awards',
      'Clinical trial protocol approvals incorporating candidate algorithms'
    ],
    suggestedProng3Points: [
      'Public health urgency of pediatric and rare cancer research demands immediate waiver of labor certification',
      'Academic and hospital mobility essential for cross-institutional patient trial data analysis'
    ],
    recommendedExhibits: [
      'NCI Cancer Moonshot Official Policy Documentation',
      'Clinical Trial Protocol References & Co-Author Verification',
      'Journal Impact Factor & Editorial Commentary Letters'
    ]
  }
];

export const INITIAL_MESSAGES: CaseMessage[] = [
  {
    id: 'm-1',
    caseId: 'case-101',
    senderName: 'Dr. Elena Rostova',
    senderRole: 'client',
    content: 'Hi, I just uploaded the updated Google Scholar report reflecting our latest citation count of 418. Please let me know if you need the revised conference certificate!',
    timestamp: '2025-02-28 14:15'
  },
  {
    id: 'm-2',
    caseId: 'case-101',
    senderName: 'Petition Drafter 1',
    senderRole: 'writer',
    content: 'Thank you Dr. Rostova! That 418 figure is fantastic. I am incorporating it into Prong 2 Section B right now. We are on track for reviewer audit by Friday.',
    timestamp: '2025-02-28 14:28'
  }
];

