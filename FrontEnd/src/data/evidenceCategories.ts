export const EVIDENCE_CATEGORIES = [
  'Identity & Personal Information',
  'Petition Documents',
  'Education & Academic Credentials',
  'Employment & Professional History',
  'Professional Achievements & Contributions',
  'Publications & Scholarly Research',
  'Media & Online Recognition',
  'Professional Memberships & Associations',
  'Awards & Recognition',
  'Expert & Recommendation Letters',
  'Judging, Reviewing & Evaluation',
  'Leadership, Leading & Critical Roles',
  'Original Contributions & Impact',
  'Exhibitions, Showcases & Creative Works',
  'Financial, Salary & Commercial Evidence',
  'Compensation Benchmarking',
  'Business & Entrepreneurship',
  'EB-2 Qualification Evidence',
  'Proposed Endeavor',
  'Substantial Merit & National Importance',
  'Well Positioned to Advance Proposed Endeavor',
  'Benefit of Waiving Job Offer & Labor Certification',
  'Performing Arts / Commercial Success',
  'Independent Corroboration',
  'Case Strategy & Legal Analysis',
  'Final Merits',
  'Others'
] as const;

export type EvidenceCategory = (typeof EVIDENCE_CATEGORIES)[number] | (string & {});

export const EVIDENCE_CATEGORY_GROUPS: { group: string; categories: EvidenceCategory[] }[] = [
  {
    group: 'Personal & Background',
    categories: [
      'Identity & Personal Information',
      'Petition Documents',
      'Education & Academic Credentials',
      'Employment & Professional History'
    ]
  },
  {
    group: 'Professional Standing & Impact',
    categories: [
      'Professional Achievements & Contributions',
      'Publications & Scholarly Research',
      'Media & Online Recognition',
      'Professional Memberships & Associations',
      'Awards & Recognition',
      'Expert & Recommendation Letters'
    ]
  },
  {
    group: 'Extraordinary / Critical Evidence',
    categories: [
      'Judging, Reviewing & Evaluation',
      'Leadership, Leading & Critical Roles',
      'Original Contributions & Impact',
      'Exhibitions, Showcases & Creative Works',
      'Performing Arts / Commercial Success'
    ]
  },
  {
    group: 'Financial & Business',
    categories: [
      'Financial, Salary & Commercial Evidence',
      'Compensation Benchmarking',
      'Business & Entrepreneurship'
    ]
  },
  {
    group: 'EB-2 NIW Dhanasar Prongs & Merits',
    categories: [
      'EB-2 Qualification Evidence',
      'Proposed Endeavor',
      'Substantial Merit & National Importance',
      'Well Positioned to Advance Proposed Endeavor',
      'Benefit of Waiving Job Offer & Labor Certification',
      'Independent Corroboration',
      'Case Strategy & Legal Analysis',
      'Final Merits'
    ]
  },
  {
    group: 'General',
    categories: ['Others']
  }
];
