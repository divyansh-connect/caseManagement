-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Aug 13, 2026 at 07:54 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `casemanagement`
--

-- --------------------------------------------------------

--
-- Table structure for table `appointments`
--

CREATE TABLE `appointments` (
  `id` varchar(191) NOT NULL,
  `client_name` varchar(191) NOT NULL,
  `client_email` varchar(191) NOT NULL,
  `type` varchar(191) NOT NULL,
  `specialist` varchar(191) NOT NULL,
  `date` varchar(191) NOT NULL,
  `time` varchar(191) NOT NULL,
  `duration` varchar(191) NOT NULL,
  `status` varchar(191) NOT NULL,
  `meeting_url` varchar(191) NOT NULL,
  `notes` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `appointments`
--

INSERT INTO `appointments` (`id`, `client_name`, `client_email`, `type`, `specialist`, `date`, `time`, `duration`, `status`, `meeting_url`, `notes`) VALUES
('apt-101', 'Dr. Elena Rostova', 'elena.rostova@quantum-labs.io', '1-on-1 Endeavor Strategy Session', 'Senior Reviewer (Rachel Zhang, Esq.)', '2026-03-08', '02:00 PM EST', '45 mins', 'Upcoming', 'https://meet.babelglobal.com/call-892', 'Reviewing updated Google Scholar metrics (+35 citations) and Dhanasar Prong 1 wording.'),
('apt-102', 'Carlos Mendez, M.S.', 'carlos.mendez@cleanenergygrid.com', 'Recommendation Letter Sync', 'Petition Drafter 2 (Marcus Vance)', '2026-03-10', '11:00 AM EST', '30 mins', 'Upcoming', 'https://meet.babelglobal.com/call-410', 'Selecting 2 additional independent recommenders for Smart Grid Microgrid petition.'),
('apt-103', 'Dr. Amara Okafor', 'a.okafor@oncology-ai.org', 'Final Filing Sign-off Session', 'Managing Partner (David Miller, Esq.)', '2026-03-04', '04:00 PM EST', '20 mins', 'Completed', 'https://meet.babelglobal.com/call-105', 'Verified 42 exhibits and Form I-140 blue ink signature before FedEx dispatch.'),
('apt-104', 'Dr. Vikram Patel', 'vikram.p@robotics-core.ai', 'Exhibit & Citation Audit Call', 'Lead Specialist (Sarah Jenkins)', '2026-02-26', '09:30 AM EST', '30 mins', 'Completed', 'https://meet.babelglobal.com/call-312', 'Audited CMU Ph.D. diploma evaluation and USDA grant award notice.'),
('apt-105', 'Sofia Al-Mansoor', 'sofia.mansoor@cyberfortress.net', 'Post-Filing Approval Debrief', 'Senior Reviewer (Rachel Zhang, Esq.)', '2026-02-21', '01:30 PM EST', '30 mins', 'Completed', 'https://meet.babelglobal.com/call-901', 'Reviewed I-797 Approval Notice from Nebraska Service Center.');

-- --------------------------------------------------------

--
-- Table structure for table `audit_logs`
--

CREATE TABLE `audit_logs` (
  `id` varchar(191) NOT NULL,
  `action` varchar(191) NOT NULL,
  `user_email` varchar(191) NOT NULL,
  `details` text NOT NULL,
  `timestamp` varchar(191) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `audit_logs`
--

INSERT INTO `audit_logs` (`id`, `action`, `user_email`, `details`, `timestamp`) VALUES
('446b90b7-6b96-4c16-8333-e2ce291ea645', 'System Settings Updated', 'admin@babelglobal.com', 'Firm configuration branding, practice areas, and USCIS calculation fees successfully revised by superadmin.', '02:44 pm'),
('log-1', 'Account Sign In', 'superadmin@babelglobal.com', 'Signed in to portal. Automatically routed to SUPERADMIN assigned workspace.', '04:30 pm'),
('log-2', 'Super Admin Initialization', 'admin@juris-flow.com', 'Super Administrator session initialized with unrestricted system access permissions.', '04:28 pm');

-- --------------------------------------------------------

--
-- Table structure for table `cases`
--

CREATE TABLE `cases` (
  `id` varchar(191) NOT NULL,
  `case_number` varchar(191) NOT NULL,
  `client_id` varchar(191) NOT NULL,
  `petition_category` varchar(191) NOT NULL,
  `field_category` varchar(191) NOT NULL,
  `current_stage` int(11) NOT NULL DEFAULT 1,
  `assigned_writer` varchar(191) DEFAULT NULL,
  `assigned_reviewer` varchar(191) DEFAULT NULL,
  `risk_level` varchar(191) NOT NULL DEFAULT 'medium',
  `target_filing_date` varchar(191) NOT NULL,
  `uscis_service_center` varchar(191) NOT NULL,
  `premium_processing` tinyint(1) NOT NULL DEFAULT 0,
  `dhanasar_prongs` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`dhanasar_prongs`)),
  `eb1a_criteria` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`eb1a_criteria`)),
  `notes` text DEFAULT NULL,
  `last_updated` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `cases`
--

INSERT INTO `cases` (`id`, `case_number`, `client_id`, `petition_category`, `field_category`, `current_stage`, `assigned_writer`, `assigned_reviewer`, `risk_level`, `target_filing_date`, `uscis_service_center`, `premium_processing`, `dhanasar_prongs`, `eb1a_criteria`, `notes`, `last_updated`) VALUES
('4bc9eb89-9191-40dc-aed1-dd2e56db122c', 'NIW-2026-008', 'f9200b17-dff5-4606-be0f-3c47bad77f43', 'Resume Building', 'Software Engineering & AI', 1, 'Petition Drafter 1', 'Senior Reviewer', 'low', '2026-12-31', 'Nebraska (NSC)', 1, NULL, NULL, NULL, '2026-08-10 06:04:58.306'),
('9eb43161-1110-4a62-9763-314043dd5ec0', 'NIW-2026-007', '748d7393-96b4-4924-95ad-66db0e4f9adf', 'Resume Building', 'Software Engineering & AI', 1, 'Petition Drafter 1', 'Senior Reviewer', 'low', '2026-12-31', 'Nebraska (NSC)', 1, NULL, NULL, NULL, '2026-08-10 06:04:46.757'),
('a90d6716-f80d-46e3-afa2-9901bc3c1169', 'NIW-2026-009', '4178f42d-6afc-4304-841e-0fbe709f1be7', 'Resume Building', 'Software Engineering & AI', 3, 'Petition Drafter 1', 'Senior Reviewer', 'low', '2026-12-31', 'Nebraska (NSC)', 1, NULL, NULL, NULL, '2026-08-10 06:15:10.821'),
('c6965db6-5395-4c6f-a95b-4935634dcba0', 'NIW-2026-006', '4f34b180-2153-4ee8-a859-301a734d27b2', 'EB-2 NIW', 'xyz', 1, 'Petition Drafter 1', 'Senior Reviewer', 'low', '2025-05-15', 'Texas (TSC)', 1, NULL, NULL, NULL, '2026-08-07 08:39:44.361'),
('case-101', 'NIW-2025-089', 'c-101', 'EB-2 NIW', 'Quantum Machine Learning & Optimization', 9, 'Petition Drafter 1', 'Senior Reviewer', 'low', '2025-03-20', 'Nebraska (NSC)', 1, '{\"prong1\":{\"title\":\"Substantial Merit & National Importance\",\"endeavorSummary\":\"Developing error-mitigated quantum algorithms for grid optimization and fault-tolerant encryption to secure US power infrastructure.\",\"usImpactAreas\":[\"DOE Grid Security Modernization\",\"Executive Order 14028 on Cybersecurity\",\"National Quantum Initiative Act\"],\"nationalImportanceScore\":94},\"prong2\":{\"title\":\"Well Positioned to Advance the Endeavor\",\"educationTrack\":\"Ph.D. in Quantum Engineering from MIT with 418 citations across IEEE & Physical Review Letters.\",\"keyAchievements\":[\"Developed Q-Optimizer algorithm cited by IBM Quantum\",\"Principal Investigator on $1.2M NSF SBIR Phase I grant\",\"Reviewer for 4 flagship physics journals\"],\"citationPercentile\":\"Top 1% in Quantum Computing (Google Scholar)\",\"fundingSecured\":\"$1,200,000 NSF Grant\"},\"prong3\":{\"title\":\"On Balance Beneficial to Waive Job Offer & PERM\",\"urgencyArguments\":[\"Urgent national defense requirement for quantum resilience\",\"PERM process would cause 18+ month delay compromising defense partnerships\",\"Endeavor relies on independent cross-institutional research collaboration\"],\"uniqueExpertise\":\"Rostova possesses rare dual expertise in quantum state tomography and tensor network compression.\"}}', NULL, 'Drafting Prong 1 Memo. Client provided updated citation verification report showing +35 new citations this month.', '2026-08-07 07:43:21.911'),
('case-102', 'EB1A-2025-092', 'c-102', 'EB-1A', 'Smart Grid Energy Storage Integration', 6, 'Petition Drafter 2', 'Senior Reviewer', 'medium', '2025-04-10', 'Texas (TSC)', 1, '{\"prong1\":{\"title\":\"Substantial Merit & National Importance\",\"endeavorSummary\":\"Designing decentralized battery energy management systems (BEMS) to integrate intermittent solar and wind capacity into the US electrical grid.\",\"usImpactAreas\":[\"Bipartisan Infrastructure Law Grid Resilience\",\"FERC Order 2222 Compliance\",\"Decarbonization Targets 2035\"],\"nationalImportanceScore\":88},\"prong2\":{\"title\":\"Well Positioned to Advance the Endeavor\",\"educationTrack\":\"M.S. in Electrical Engineering from Stanford with 8 patents pending and 195 citations.\",\"keyAchievements\":[\"Engineered microgrid controller deployed across 14 California utility sub-stations\",\"Author of 8 IEEE transactions papers\"],\"citationPercentile\":\"Top 5% in Power Electronics\",\"fundingSecured\":\"$450,000 CEC Innovation Award\"},\"prong3\":{\"title\":\"On Balance Beneficial to Waive Job Offer & PERM\",\"urgencyArguments\":[\"US grid stabilization demands immediate deployment prior to upcoming peak summer load\",\"Contractual nature of utility consulting makes PERM employer tied sponsorship unfeasible\"],\"uniqueExpertise\":\"Custom firmware expertise bridging legacy SCADA systems with lithium-ferrophosphate storage systems.\"}}', '{\"prizes\":true,\"membership\":true,\"media\":false,\"judging\":true,\"originalContributions\":true,\"scholarlyArticles\":true,\"exhibitions\":false,\"leadingRole\":true,\"highSalary\":true,\"commercialSuccess\":false}', 'Awaiting client detailed endeavor questionnaire. Need 2 additional independent recommenders.', '2026-08-07 07:43:21.916'),
('case-103', 'NIW-2025-078', 'c-103', 'EB-2 NIW', 'Computational Oncology & Genomics', 12, 'Sarah Jenkins (Petition Specialist)', 'Rachel Zhang, Esq. (Partner)', 'low', '2025-03-05', 'Nebraska (NSC)', 1, '{\"prong1\":{\"title\":\"Substantial Merit & National Importance\",\"endeavorSummary\":\"Leveraging deep transformer models to predict drug response in rare pediatric sarcomas, addressing critical gaps in targeted cancer therapies.\",\"usImpactAreas\":[\"National Cancer Institute Moonshot Initiative\",\"Precision Medicine Task Force\",\"FDA Accelerated Approval Pathway\"],\"nationalImportanceScore\":98},\"prong2\":{\"title\":\"Well Positioned to Advance the Endeavor\",\"educationTrack\":\"Ph.D. from Johns Hopkins with 620 citations, Nature Cancer cover article, and 4 NIH grants as co-investigator.\",\"keyAchievements\":[\"Created SarcomaDB utilized by 40+ US medical research centers\",\"Keynote speaker at AACR 2024\"],\"citationPercentile\":\"Top 0.5% in Bio-Data Science\",\"fundingSecured\":\"$2,800,000 NIH R01 Co-Investigator\"},\"prong3\":{\"title\":\"On Balance Beneficial to Waive Job Offer & PERM\",\"urgencyArguments\":[\"Pediatric oncology research requires rapid cross-border data sharing unsupported by PERM employer locks\",\"Immediate public health urgency to reduce pediatric mortality\"],\"uniqueExpertise\":\"Single-cell transcriptomics combined with spatial multi-omics modeling.\"}}', NULL, 'Final petition packet assembled. Client review in progress. Exhibit list contains 42 verified exhibits.', '2026-08-07 07:43:21.923'),
('case-104', 'NIW-2025-104', 'c-104', 'EB-2 NIW', 'Autonomous Robotics for Agriculture', 3, 'Marcus Vance (Senior Writer)', 'David Miller, Esq. (Managing Partner)', 'medium', '2025-04-30', 'Texas (TSC)', 0, '{\"prong1\":{\"title\":\"Substantial Merit & National Importance\",\"endeavorSummary\":\"Building autonomous precision weeding and crop monitoring robots to combat agricultural labor shortages and lower chemical pesticide runoff.\",\"usImpactAreas\":[\"USDA Sustainable Agriculture Strategy\",\"Clean Water Act Off-farm Runoff Reductions\"],\"nationalImportanceScore\":86},\"prong2\":{\"title\":\"Well Positioned to Advance the Endeavor\",\"educationTrack\":\"Ph.D. in Robotics from CMU, 310 citations, 4 robotics patents.\",\"keyAchievements\":[\"Commercialized autonomous navigation module\",\"Featured in ASABE Technology Review\"],\"citationPercentile\":\"Top 3% in Agricultural Automation\",\"fundingSecured\":\"$800,000 USDA Innovation Grant\"},\"prong3\":{\"title\":\"On Balance Beneficial to Waive Job Offer & PERM\",\"urgencyArguments\":[\"Seasonal farming cycles require urgent deployment of automated systems before harvest\"],\"uniqueExpertise\":\"Real-time computer vision hardware running at ultra-low power on farm machinery.\"}}', NULL, 'Verifying Ph.D. diploma evaluation and citation indexing report.', '2026-08-07 07:43:21.926'),
('case-105', 'NIW-2025-061', 'c-105', 'EB-2 NIW', 'Zero-Trust Cybersecurity for Critical Infrastructure', 14, 'Sarah Jenkins (Petition Specialist)', 'Rachel Zhang, Esq. (Partner)', 'low', '2025-01-15', 'Nebraska (NSC)', 1, '{\"prong1\":{\"title\":\"Substantial Merit & National Importance\",\"endeavorSummary\":\"Designing zero-trust authentication protocols for SCADA systems governing US water treatment plants and municipal grids.\",\"usImpactAreas\":[\"CISA Critical Infrastructure Directive\",\"National Cybersecurity Strategy 2023\"],\"nationalImportanceScore\":92},\"prong2\":{\"title\":\"Well Positioned to Advance the Endeavor\",\"educationTrack\":\"B.S. in Computer Science + 7 years progressive engineering leadership; 88 citations & 1 patent.\",\"keyAchievements\":[\"Exceptional Ability criteria satisfied under 6/7 regulatory prongs\",\"Key speaker at DEF CON Infrastructure Track\"],\"citationPercentile\":\"Top 10% in Operational Technology Security\",\"fundingSecured\":\"$600,000 Corporate Innovation Fund\"},\"prong3\":{\"title\":\"On Balance Beneficial to Waive Job Offer & PERM\",\"urgencyArguments\":[\"Immediate cyber threat climate against US water networks mandates independent technical deployment\"],\"uniqueExpertise\":\"Legacy industrial protocol hardening without network downtime.\"}}', NULL, 'APPROVED! I-797 Notice of Approval received from NSC on Feb 20, 2025. Priority date locked.', '2026-08-07 07:43:21.931');

-- --------------------------------------------------------

--
-- Table structure for table `clients`
--

CREATE TABLE `clients` (
  `id` varchar(191) NOT NULL,
  `name` varchar(191) NOT NULL,
  `email` varchar(191) NOT NULL,
  `phone` varchar(191) NOT NULL,
  `country_of_birth` varchar(191) NOT NULL,
  `current_field` varchar(191) NOT NULL,
  `highest_degree` varchar(191) NOT NULL,
  `university` varchar(191) NOT NULL,
  `citations_count` int(11) NOT NULL DEFAULT 0,
  `publications_count` int(11) NOT NULL DEFAULT 0,
  `patents_count` int(11) NOT NULL DEFAULT 0,
  `status` varchar(191) NOT NULL DEFAULT 'Active',
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `clients`
--

INSERT INTO `clients` (`id`, `name`, `email`, `phone`, `country_of_birth`, `current_field`, `highest_degree`, `university`, `citations_count`, `publications_count`, `patents_count`, `status`, `created_at`) VALUES
('4178f42d-6afc-4304-841e-0fbe709f1be7', 'Test Resume Candidate', 'resume.candidate.1786341909321@example.com', '+1 555-0192', 'United States', 'Software Engineering & AI', 'Ph.D.', 'Stanford University', 0, 0, 0, 'Active', '2026-08-10 06:05:09.324'),
('4f34b180-2153-4ee8-a859-301a734d27b2', 'diya ', 'dia@gmail.com', '+1 (555) 012-3456', 'United States', 'xyz', 'Ph.D.', 'Standard University', 0, 0, 0, 'Active', '2026-08-07 08:39:44.278'),
('748d7393-96b4-4924-95ad-66db0e4f9adf', 'Test Resume Candidate', 'resume.candidate.1786341886723@example.com', '+1 555-0192', 'United States', 'Software Engineering & AI', 'Ph.D.', 'Stanford University', 0, 0, 0, 'Active', '2026-08-10 06:04:46.736'),
('c-101', 'Dr. Elena Rostova', 'elena.rostova@quantum-labs.io', '+1 (555) 382-9102', 'Ukraine', 'Quantum Machine Learning & Optimization', 'Ph.D.', 'MIT', 418, 14, 3, 'Active', '2026-08-07 07:43:21.892'),
('c-102', 'Carlos Mendez, M.S.', 'carlos.mendez@cleanenergygrid.com', '+1 (555) 714-2289', 'Mexico', 'Smart Grid Energy Storage Integration', 'Master\'s', 'Stanford University', 195, 8, 2, 'Active', '2026-08-07 07:43:21.895'),
('c-103', 'Dr. Amara Okafor', 'a.okafor@oncology-ai.org', '+1 (555) 890-3341', 'Nigeria', 'Computational Oncology & Genomics', 'Ph.D.', 'Johns Hopkins University', 620, 22, 1, 'Active', '2026-08-07 07:43:21.898'),
('c-104', 'Dr. Vikram Patel', 'vikram.p@robotics-core.ai', '+1 (555) 412-9830', 'India', 'Autonomous Robotics for Agriculture', 'Ph.D.', 'Carnegie Mellon University', 310, 11, 4, 'Active', '2026-08-07 07:43:21.901'),
('c-105', 'Sofia Al-Mansoor', 'sofia.mansoor@cyberfortress.net', '+1 (555) 901-4421', 'Jordan', 'Zero-Trust Cybersecurity for Critical Infrastructure', 'Bachelor\'s + 5 yrs', 'UC Berkeley', 88, 5, 1, 'Active', '2026-08-07 07:43:21.904'),
('f9200b17-dff5-4606-be0f-3c47bad77f43', 'Test Resume Candidate', 'resume.candidate.1786341898294@example.com', '+1 555-0192', 'United States', 'Software Engineering & AI', 'Ph.D.', 'Stanford University', 0, 0, 0, 'Active', '2026-08-10 06:04:58.297');

-- --------------------------------------------------------

--
-- Table structure for table `documents`
--

CREATE TABLE `documents` (
  `id` varchar(191) NOT NULL,
  `case_id` varchar(191) NOT NULL,
  `name` varchar(191) NOT NULL,
  `category` varchar(191) NOT NULL,
  `file_size` varchar(191) NOT NULL,
  `uploaded_by` varchar(191) NOT NULL,
  `uploaded_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `status` varchar(191) NOT NULL DEFAULT 'Pending Review',
  `file_url` varchar(191) NOT NULL,
  `cloudinary_id` varchar(191) DEFAULT NULL,
  `ai_summary` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `documents`
--

INSERT INTO `documents` (`id`, `case_id`, `name`, `category`, `file_size`, `uploaded_by`, `uploaded_at`, `status`, `file_url`, `cloudinary_id`, `ai_summary`) VALUES
('3f708dc8-1cb5-47ae-a0dd-920a2c0030a8', 'c6965db6-5395-4c6f-a95b-4935634dcba0', 'batch AWS.pdf', 'Publication', '22 KB', 'Dr. Alexander Vance', '2026-08-07 08:58:12.704', 'Pending Review', 'https://res.cloudinary.com/demo/image/upload/v1625078776/sample.jpg', 'mock-doc-1786093092693', 'AI analysis completed for batch AWS.pdf under category Publication. Verified size of 22 KB.'),
('c7b18176-3013-44eb-81b6-f80b5c9d8402', 'a90d6716-f80d-46e3-afa2-9901bc3c1169', 'sample_evidence.zip', 'Exhibits & Evidence', '0 KB', 'Case Administrator', '2026-08-11 05:10:57.499', 'Pending Review', 'https://res.cloudinary.com/i14k7hvk/raw/upload/v1786425057/case_documents/x3wr1f6bgwar2kqltjka', 'case_documents/x3wr1f6bgwar2kqltjka', 'AI analysis completed for sample_evidence.zip under category Exhibits & Evidence. Verified size of 0 KB.'),
('doc-1', 'case-101', 'Dr_Elena_Rostova_CV_2025.pdf', 'CV', '2.4 MB', 'Client (Elena Rostova)', '2026-08-07 07:43:21.959', 'Verified', 'https://res.cloudinary.com/demo/image/upload/v1570975139/sample.pdf', NULL, 'Extensive CV detailing Ph.D. from MIT, 14 publications, 418 citations, 3 patents, and peer review records for 4 physics journals.'),
('doc-2', 'case-101', 'MIT_PhD_Diploma_Official_Evaluation.pdf', 'Degree', '1.8 MB', 'Client (Elena Rostova)', '2026-08-07 07:43:21.961', 'Verified', 'https://res.cloudinary.com/demo/image/upload/v1570975139/sample.pdf', NULL, 'Official MIT Diploma for Doctor of Philosophy in Quantum Science & Engineering, conferred June 2021.'),
('doc-3', 'case-101', 'Google_Scholar_Citation_Report_Feb2025.pdf', 'Citation Report', '4.1 MB', 'Sarah Jenkins', '2026-08-07 07:43:21.966', 'Verified', 'https://res.cloudinary.com/demo/image/upload/v1570975139/sample.pdf', NULL, 'Verified citation graph proving 418 citations across 32 countries, ranking candidate in top 1% for quantum optimization algorithms.'),
('doc-4', 'case-101', 'Expert_Letter_Dr_Pendelton_Signed.pdf', 'Recommendation Letter', '890 KB', 'Sarah Jenkins', '2026-08-07 07:43:21.969', 'Approved', 'https://res.cloudinary.com/demo/image/upload/v1570975139/sample.pdf', NULL, 'Signed letter from MIT Dept Chair attesting to original algorithmic contributions and substantial national merit of quantum endeavor.'),
('doc-5', 'case-101', 'NSF_Grant_Award_Letter_1_2M.pdf', 'Publication', '1.2 MB', 'Client (Elena Rostova)', '2026-08-07 07:43:21.971', 'Verified', 'https://res.cloudinary.com/demo/image/upload/v1570975139/sample.pdf', NULL, 'Official National Science Foundation Award Notice designating Dr. Rostova as Principal Investigator for $1.2M quantum grid project.'),
('doc-6', 'case-103', 'SarcomaDB_Nature_Cancer_Cover_Article.pdf', 'Publication', '5.6 MB', 'Client (Amara Okafor)', '2026-08-07 07:43:21.974', 'Verified', 'https://res.cloudinary.com/demo/image/upload/v1570975139/sample.pdf', NULL, 'Peer-reviewed research paper published in Nature Cancer with editorial highlight and cover commentary.');

-- --------------------------------------------------------

--
-- Table structure for table `messages`
--

CREATE TABLE `messages` (
  `id` varchar(191) NOT NULL,
  `case_id` varchar(191) NOT NULL,
  `sender_name` varchar(191) NOT NULL,
  `sender_role` varchar(191) NOT NULL,
  `content` text NOT NULL,
  `timestamp` varchar(191) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `messages`
--

INSERT INTO `messages` (`id`, `case_id`, `sender_name`, `sender_role`, `content`, `timestamp`) VALUES
('m-1', 'case-101', 'Dr. Elena Rostova', 'client', 'Hi, I just uploaded the updated Google Scholar report reflecting our latest citation count of 418. Please let me know if you need the revised conference certificate!', '2025-02-28 14:15'),
('m-2', 'case-101', 'Petition Drafter 1', 'writer', 'Thank you Dr. Rostova! That 418 figure is fantastic. I am incorporating it into Prong 2 Section B right now. We are on track for reviewer audit by Friday.', '2025-02-28 14:28');

-- --------------------------------------------------------

--
-- Table structure for table `payments`
--

CREATE TABLE `payments` (
  `id` varchar(191) NOT NULL,
  `case_id` varchar(191) NOT NULL,
  `description` varchar(191) NOT NULL,
  `amount` double NOT NULL,
  `due_date` varchar(191) NOT NULL,
  `status` varchar(191) NOT NULL,
  `paid_at` varchar(191) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `payments`
--

INSERT INTO `payments` (`id`, `case_id`, `description`, `amount`, `due_date`, `status`, `paid_at`) VALUES
('p-1', 'case-101', 'Initial Retainer Fee (Intake & Endeavor Setup)', 4000, '2025-01-10', 'Paid', '2025-01-10'),
('p-2', 'case-101', 'Milestone 2: Petition Draft & Recommendation Letters', 3500, '2025-02-25', 'Paid', '2025-02-24'),
('p-3', 'case-101', 'USCIS Premium Processing Fee ($2,965)', 2965, '2025-03-10', 'Pending', NULL),
('p-4', 'case-102', 'Initial Retainer Fee', 4000, '2025-01-14', 'Paid', '2025-01-14'),
('p-5', 'case-102', 'Milestone 2: Petition Draft', 3500, '2025-03-15', 'Pending', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `recommenders`
--

CREATE TABLE `recommenders` (
  `id` varchar(191) NOT NULL,
  `case_id` varchar(191) NOT NULL,
  `name` varchar(191) NOT NULL,
  `title` varchar(191) NOT NULL,
  `organization` varchar(191) NOT NULL,
  `relationship` varchar(191) NOT NULL,
  `status` varchar(191) NOT NULL,
  `cv_received` tinyint(1) NOT NULL DEFAULT 0,
  `letter_draft_url` varchar(191) DEFAULT NULL,
  `key_contributions_mentioned` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`key_contributions_mentioned`))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `recommenders`
--

INSERT INTO `recommenders` (`id`, `case_id`, `name`, `title`, `organization`, `relationship`, `status`, `cv_received`, `letter_draft_url`, `key_contributions_mentioned`) VALUES
('rec-1', 'case-101', 'Dr. Arthur Pendelton', 'Chair of Physics & Quantum Technology', 'MIT Research Laboratory', 'Academic Advisor', 'Letter Signed', 1, NULL, '[\"Pioneered quantum fault mitigation\",\"Supervised 3 milestone publications\"]'),
('rec-2', 'case-101', 'Dr. Samantha Wu', 'Chief Scientist for Defense Systems', 'Sandia National Laboratories', 'Independent Expert', 'Drafting Letter', 1, NULL, '[\"Validated quantum algorithm resilience on government hardware testbed\"]'),
('rec-3', 'case-101', 'Prof. Henrik Lindqvist', 'Director of Quantum Institute', 'ETH Zurich', 'Independent Expert', 'Outreach Sent', 1, NULL, '[\"Cites Dr. Rostova in 12 independent peer-reviewed papers\"]'),
('rec-4', 'case-102', 'Dr. Gregory Vance', 'VP of Engineering', 'NextEra Energy', 'Industry Collaborator', 'Drafting Letter', 1, NULL, '[\"Tested Mendez firmware in utility scale battery bank\"]'),
('rec-5', 'case-103', 'Dr. Lawrence Sterling', 'Director of Pediatric Oncology', 'Memorial Sloan Kettering', 'Independent Expert', 'Verified', 1, NULL, '[\"Applied Dr. Okafor algorithms in clinical trials\"]'),
('rec-6', 'case-103', 'Dr. Claire Dupont', 'Head of Genomics', 'Institut Curie', 'Independent Expert', 'Verified', 1, NULL, '[\"International reference on SarcomaDB dataset\"]');

-- --------------------------------------------------------

--
-- Table structure for table `system_settings`
--

CREATE TABLE `system_settings` (
  `id` varchar(191) NOT NULL,
  `company_name` varchar(191) NOT NULL DEFAULT 'Babel Global Editorial Services',
  `specialist_id` varchar(191) NOT NULL DEFAULT 'BG-CONSULT-391024',
  `filing_fee` varchar(191) NOT NULL DEFAULT '$715',
  `premium_fee` varchar(191) NOT NULL DEFAULT '$2,965',
  `asylum_fee` varchar(191) NOT NULL DEFAULT '$300',
  `whatsapp_alerts` tinyint(1) NOT NULL DEFAULT 1,
  `email_requests` tinyint(1) NOT NULL DEFAULT 1,
  `appointment_reminders` tinyint(1) NOT NULL DEFAULT 1,
  `quiet_hours` tinyint(1) NOT NULL DEFAULT 1,
  `fee_defaults` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`fee_defaults`)),
  `practice_areas` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`practice_areas`))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `system_settings`
--

INSERT INTO `system_settings` (`id`, `company_name`, `specialist_id`, `filing_fee`, `premium_fee`, `asylum_fee`, `whatsapp_alerts`, `email_requests`, `appointment_reminders`, `quiet_hours`, `fee_defaults`, `practice_areas`) VALUES
('ab621203-3448-4dde-9edd-0e626b1db2c4', 'Babel Global Editorial Services', 'BG-CONSULT-391024', '$715', '$2,965', '$300', 1, 1, 1, 1, '{\"i140FilingFee\":\"$715\",\"i907PremiumFee\":\"$2,965\",\"asylumProgramFeeSmall\":\"$300\",\"aos\":{\"i485\":\"$1,440\",\"i765\":\"$260\",\"i131\":\"$630\",\"i693\":\"$0\",\"g1145\":\"$0\",\"i485SupplementJ\":\"$0\"},\"o1\":{\"i129Standard\":\"$1,055\",\"i129SmallNonprofit\":\"$530\",\"asylumProgramFeeStandard\":\"$600\",\"asylumProgramFeeSmall\":\"$300\",\"asylumProgramFeeNonprofit\":\"$0\",\"i907\":\"$2,965\",\"ds160\":\"$205\",\"i539Paper\":\"$470\",\"i539Online\":\"$420\",\"i539A\":\"$0\"}}', '[{\"id\":\"eb2-niw\",\"title\":\"EB-2 NIW\",\"subtitle\":\"Dhanasar 3-Prong Analysis\"},{\"id\":\"eb1a\",\"title\":\"EB-1A Extraordinary\",\"subtitle\":\"10-Criteria Matrix\"},{\"id\":\"o1\",\"title\":\"O-1 Visa\",\"subtitle\":\"Nonimmigrant Petitions\"},{\"id\":\"profile-building\",\"title\":\"Profile Building\",\"subtitle\":\"Academic & Industry Portfolio\"}]');

-- --------------------------------------------------------

--
-- Table structure for table `tasks`
--

CREATE TABLE `tasks` (
  `id` varchar(191) NOT NULL,
  `case_id` varchar(191) NOT NULL,
  `title` varchar(191) NOT NULL,
  `assigned_role` varchar(191) NOT NULL,
  `assigned_to_name` varchar(191) NOT NULL,
  `stage_id` int(11) NOT NULL,
  `due_date` varchar(191) NOT NULL,
  `priority` varchar(191) NOT NULL DEFAULT 'medium',
  `completed` tinyint(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `tasks`
--

INSERT INTO `tasks` (`id`, `case_id`, `title`, `assigned_role`, `assigned_to_name`, `stage_id`, `due_date`, `priority`, `completed`) VALUES
('6f5fd7ff-d5c6-444a-a041-4761e2ecb9f3', 'case-101', 'xyz', 'writer', 'Sarah Jenkins', 9, '2025-03-15', 'medium', 0),
('t-1', 'case-101', 'Finalize Expert Recommendation Letter #2 (Sandia Labs)', 'writer', 'Sarah Jenkins', 9, '2025-03-03', 'high', 0),
('t-2', 'case-101', 'Run AI Dhanasar Prong 1 National Importance Check', 'writer', 'Sarah Jenkins', 9, '2025-03-04', 'medium', 1),
('t-3', 'case-101', 'Senior Attorney Review of Draft Form I-140 Cover Letter', 'reviewer', 'David Miller, Esq.', 10, '2025-03-08', 'urgent', 0),
('t-4', 'case-102', 'Review Client Proposed Endeavor Questionnaire Answers', 'writer', 'Marcus Vance', 6, '2025-03-02', 'high', 0),
('t-5', 'case-103', 'Print & Index Exhibit Tabs 1-42 for FedEx Package', 'admin', 'Intake Desk', 13, '2025-03-04', 'high', 0);

-- --------------------------------------------------------

--
-- Table structure for table `templates`
--

CREATE TABLE `templates` (
  `id` varchar(191) NOT NULL,
  `industry` varchar(191) NOT NULL,
  `title` varchar(191) NOT NULL,
  `description` text NOT NULL,
  `sample_endeavor` text NOT NULL,
  `suggested_prong_1_points` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`suggested_prong_1_points`)),
  `suggested_prong_2_points` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`suggested_prong_2_points`)),
  `suggested_prong_3_points` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`suggested_prong_3_points`)),
  `recommended_exhibits` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`recommended_exhibits`))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `templates`
--

INSERT INTO `templates` (`id`, `industry`, `title`, `description`, `sample_endeavor`, `suggested_prong_1_points`, `suggested_prong_2_points`, `suggested_prong_3_points`, `recommended_exhibits`) VALUES
('tpl-1', 'Artificial Intelligence & Machine Learning', 'AI/ML Research Scientist & Infrastructure Engineer', 'Tailored for candidates advancing foundation models, computer vision, natural language processing, or AI chip acceleration.', 'Pioneering energy-efficient machine learning architectures for enterprise cybersecurity and real-time medical diagnostics in the United States.', '[\"Aligns with Executive Order on Safe, Secure, and Trustworthy Artificial Intelligence\",\"Addresses critical semiconductor efficiency bottlenecks reducing server grid load\",\"Enhances national economic competitiveness against international state-sponsored AI initiatives\"]', '[\"Top-tier conference publications (NeurIPS, CVPR, ICML) demonstrating field leadership\",\"Open-source repository adoption metrics (GitHub stars, PyTorch core integrations)\",\"Peer review record for IEEE Transactions and ACM digital libraries\"]', '[\"PERM labor certification requires tied employer sponsorship, hindering multi-institutional open AI collaboration\",\"Rapid pace of AI model iteration requires immediate research deployment without 2-year PERM processing latency\"]', '[\"Google Scholar Citation Index & World Percentile Chart\",\"GitHub Repository Impact & Downstream Commercial Usage Log\",\"Executive Order 14110 AI Policy Excerpt\",\"Conference Acceptance Rate Verification Letters\"]'),
('tpl-2', 'Clean Energy & Power Infrastructure', 'Renewable Microgrid & Battery Systems Specialist', 'Designed for engineers developing battery management, hydrogen fuel cells, wind grid integration, or solar forecasting.', 'Engineering resilient microgrid management platforms to integrate high-penetration renewable power into aging US electrical utility networks.', '[\"Fulfills Bipartisan Infrastructure Law mandates for grid modernization\",\"Mitigates catastrophic blackout risks during climate extreme weather events\",\"Accelerates US transition away from fossil-fuel baseline dependency\"]', '[\"Utility-scale pilot deployment certifications and patents\",\"State energy commission research awards (e.g. CEC, NYSERDA grants)\",\"IEEE Power & Energy Society peer-reviewed articles\"]', '[\"Contractual utility deployment model makes standard permanent labor certification unworkable\",\"Urgent grid safety risks demand immediate application of candidate proprietary software algorithms\"]', '[\"US Department of Energy Grid Modernization Index\",\"Utility Deployment Verification Letters from Senior Engineers\",\"Patent Application Index & Claims Specifications\"]'),
('tpl-3', 'Biomedical & Healthcare Innovation', 'Computational Oncologist & Medical Device Pioneer', 'Designed for researchers working in drug discovery, genomics, surgical robotics, medical image AI, or therapeutics.', 'Developing precision genomic algorithms to predict therapeutic efficacy and reduce adverse drug reactions in underserved cancer patient demographics.', '[\"Directly advances the NIH Cancer Moonshot mission to reduce cancer mortality by 50%\",\"Reduces national healthcare expenditure by preventing ineffective drug regimens\",\"Promotes health equity in complex multi-ethnic genetic research datasets\"]', '[\"High-impact medical journal citations (Nature Medicine, Lancet Oncology, Cell)\",\"NIH / NSF grant co-investigator role or SBIR commercialization awards\",\"Clinical trial protocol approvals incorporating candidate algorithms\"]', '[\"Public health urgency of pediatric and rare cancer research demands immediate waiver of labor certification\",\"Academic and hospital mobility essential for cross-institutional patient trial data analysis\"]', '[\"NCI Cancer Moonshot Official Policy Documentation\",\"Clinical Trial Protocol References & Co-Author Verification\",\"Journal Impact Factor & Editorial Commentary Letters\"]');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` varchar(191) NOT NULL,
  `name` varchar(191) NOT NULL,
  `email` varchar(191) NOT NULL,
  `password_hash` varchar(191) NOT NULL,
  `role` varchar(191) NOT NULL DEFAULT 'client',
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `password_hash`, `role`, `created_at`) VALUES
('20ce1f5d-d3a2-42db-a187-d32571a1495e', 'Dr. Alexander Vance', 'client@babelglobal.com', '$2a$10$J7sfKCfgYi/wuMlYBqI6U.tQURFsmRTg3XDeQCJ5outXR5nY0RCA.', 'client', '2026-08-07 07:43:21.883'),
('4105ff65-8e03-4627-8714-0283426000c9', 'Petition Drafter 1', 'writer@babelglobal.com', '$2a$10$f1F7JJsHA59glwbE3wTx1OQAy/2Bax5qwiNF7hRH1uazrhStbSgl6', 'writer', '2026-08-07 07:43:21.717'),
('774f0471-2136-4d3e-b88d-9829b03dec81', 'Super Administrator', 'superadmin@babelglobal.com', '$2a$10$5QkT4hJZqOze31BJzzGszO.xvkM8W9CqCH3ILTt.ozo..vT8MJ34C', 'superadmin', '2026-08-07 07:43:21.544'),
('81fc2a2d-dbd6-49ac-b974-4fc98a808e4f', 'Senior Reviewer', 'reviewer@babelglobal.com', '$2a$10$3LfqGric1aEteI0eljgpEuI7.4vpT.5HF0BiVl3CN7DqDmkw5INAG', 'reviewer', '2026-08-07 07:43:21.801'),
('b97951d5-7ada-4f81-8c1f-4833b0315d86', 'Case Administrator', 'admin@babelglobal.com', '$2a$10$/8dxxi8uTX27DKLLqHMrxuwDff78jnA0mDGkwrJ3vvKS1QmsWsKVi', 'admin', '2026-08-07 07:43:21.630');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `appointments`
--
ALTER TABLE `appointments`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `audit_logs`
--
ALTER TABLE `audit_logs`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `cases`
--
ALTER TABLE `cases`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `cases_case_number_key` (`case_number`),
  ADD KEY `cases_client_id_fkey` (`client_id`);

--
-- Indexes for table `clients`
--
ALTER TABLE `clients`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `clients_email_key` (`email`);

--
-- Indexes for table `documents`
--
ALTER TABLE `documents`
  ADD PRIMARY KEY (`id`),
  ADD KEY `documents_case_id_fkey` (`case_id`);

--
-- Indexes for table `messages`
--
ALTER TABLE `messages`
  ADD PRIMARY KEY (`id`),
  ADD KEY `messages_case_id_fkey` (`case_id`);

--
-- Indexes for table `payments`
--
ALTER TABLE `payments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `payments_case_id_fkey` (`case_id`);

--
-- Indexes for table `recommenders`
--
ALTER TABLE `recommenders`
  ADD PRIMARY KEY (`id`),
  ADD KEY `recommenders_case_id_fkey` (`case_id`);

--
-- Indexes for table `system_settings`
--
ALTER TABLE `system_settings`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `tasks`
--
ALTER TABLE `tasks`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `templates`
--
ALTER TABLE `templates`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `users_email_key` (`email`);

--
-- Constraints for dumped tables
--

--
-- Constraints for table `cases`
--
ALTER TABLE `cases`
  ADD CONSTRAINT `cases_client_id_fkey` FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `documents`
--
ALTER TABLE `documents`
  ADD CONSTRAINT `documents_case_id_fkey` FOREIGN KEY (`case_id`) REFERENCES `cases` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `messages`
--
ALTER TABLE `messages`
  ADD CONSTRAINT `messages_case_id_fkey` FOREIGN KEY (`case_id`) REFERENCES `cases` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `payments`
--
ALTER TABLE `payments`
  ADD CONSTRAINT `payments_case_id_fkey` FOREIGN KEY (`case_id`) REFERENCES `cases` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `recommenders`
--
ALTER TABLE `recommenders`
  ADD CONSTRAINT `recommenders_case_id_fkey` FOREIGN KEY (`case_id`) REFERENCES `cases` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
