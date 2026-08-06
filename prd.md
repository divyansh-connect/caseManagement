# Product Requirement Document (PRD)
## Immigration Case Management System MVP (EB-2 NIW)

---

## 1. Document Control & Overview
- **Product Name:** Immigration Case Management System MVP
- **Specialized Module:** EB-2 National Interest Waiver (NIW) Workflow Engine
- **Target Audience:** Law Firms, Immigration Attorneys, Petition Writers, Case Managers, and Foreign Professional Clients
- **Version:** 1.0 (MVP)

---

## 2. Core Value Proposition & Vision
The system streamlines, automates, and structures the complex EB-2 NIW green card petition process. It replaces fragmented emails and loose file folders with a centralized 14-stage petition lifecycle engine, role-based dashboards, collaborative document management, version control, automated reminders, and client portal interaction.

---

## 3. User Roles & RBAC Matrix

| Role | System Access Level | Key Responsibilities |
| :--- | :--- | :--- |
| **Administrator / Case Manager** | Full Access | Assigns cases, creates templates, manages staff users, updates workflow settings, overrides statuses, manages system integrations. |
| **Researcher / Petition Writer** | Read/Write (Assigned Cases) | Conducts research, drafts petition letters (3 prongs), compiles recommendation letters, manages evidence documents. |
| **Reviewer** | Read/Approve (Assigned Cases) | Audits draft petition letters, reviews evidence, approves or requests changes before client/USCIS submission. |
| **Client** | Portal Access Only | Submits intake forms, uploads requested personal/professional documents, tracks stage progress, reviews drafts, makes payments. |

---

## 4. Detailed Module Specifications

### 4.1 Authentication & Security Module
- **Features:** Secure login with email and password, password recovery flow, session persistence, role-based route protection.

### 4.2 Dashboard & Analytics Module
- **Metrics Displayed:** Total Clients, Total Cases, Active Cases, Completed Cases, Pending Reviews, Pending Client Documents, Upcoming Deadlines, Assigned Tasks, Recent Activity Log.

### 4.3 Client Management Module
- **Client List:** View all clients with status, current stage, and assigned case manager.
- **Add Client Modal:** Capture first name, last name, email, phone number.
- **Client Profile:** 360-degree profile aggregating personal details, case info, documents, tasks, notes, and full activity log.

### 4.4 Case Management & 14-Stage Workflow Engine
Every EB-2 NIW case is governed by an explicit 14-stage workflow:
1. **Stage 1 - Client Registration & Intake:** Send & record intake questionnaires.
2. **Stage 2 - CV & Supporting Documents:** Manage CV and initial supporting document checklists.
3. **Stage 3 - Qualification Evaluation:** Evaluate qualifications, experience, achievements, and proposed endeavor.
4. **Stage 4 - Terms & Conditions:** Issue retainer/engagement agreements and track client acceptance.
5. **Stage 5 - Payment:** Verify retainer and milestone payment statuses.
6. **Stage 6 - Proposed Endeavor & Recommenders:** Formulate proposed endeavor statement and compile expert recommender lists.
7. **Stage 7 - Client Feedback:** Receive feedback, expert CVs, and supporting evidence.
8. **Stage 8 - Research & Evidence:** Conduct national importance background research and compile evidence.
9. **Stage 9 - Draft Preparation:** Draft proposed endeavor text and recommendation letters.
10. **Stage 10 - Client Review:** Gather client feedback and initial approvals on drafts.
11. **Stage 11 - Petition Draft (Matter of Dhanasar Framework):**
    - Section 1: Substantial Merit & National Importance document upload.
    - Section 2: Well Positioned to Advance Proposed Endeavor document upload.
    - Section 3: Waiver Benefits the United States document upload.
12. **Stage 12 - Final Client Review:** Execute final review of petition letter and exhibits.
13. **Stage 13 - Petition Package:** Assemble final petition bundle (Form I-140, ETA-750B/9089, petition letter, exhibits).
14. **Stage 14 - Case Completion:** Record completion date, archive records, and mark case complete.

---

### 4.5 Document Management & Versioning Module
- **Supported Categories:** CV, Intake Questionnaire, Academic Records, Employment Records, Publications, Awards, Memberships, Recommendation Letters, Petition Drafts, Supporting Evidence, Other Evidence.
- **Document Metadata:** Document Name, Category, Upload Date, Uploaded By, Version Number, Status.
- **Version Control:** Complete audit trail of past file uploads with download capability.

---

### 4.6 Task Management & Reminder Engine
- **Task Attributes:** Task Name, Description, Assigned Staff, Due Date, Priority (Low, Medium, High, Urgent), Status.
- **Automated Reminders:** Triggered for missing client documents, overdue reviews, pending revisions, approval bottlenecks, and hard deadlines.

---

### 4.7 Reviews & Approvals Module
- **Workflow:** Reviewer receives notification -> reviews document -> adds notes -> chooses: **Approve** or **Request Changes**.

---

### 4.8 Communication & Payments Module
- **Communication Channels:** Direct Email dispatch and WhatsApp messaging capabilities.
- **Payments:** Payment status tracking per case milestone (Pending, Partial, Completed).

---

### 4.9 Client Portal Module
- **Features:** Clean, simplified client interface displaying real-time case progress bar, outstanding document upload tasks, viewable documents, and payment gateway button.

---

### 4.10 Case Templates, Reports & Settings
- **Templates:** Admin can create reusable workflow templates with standard task checklists and document requirements.
- **Reports & Search:** Multi-criteria search (Client Name, Case Number, Stage, Assigned Staff, Status) + complete Activity Audit Log.
- **Settings & Integrations:** User management, workflow customization, and 3rd-party integration support (Email, Google Drive / Zoho Storage, WhatsApp, e-Signatures, Payment Tracking, Automated Notifications).

---

## 5. Non-Functional Requirements
1. **Security & Data Privacy:** Confidentiality of legal and personal documents (PII). Encrypted storage and transmission.
2. **Performance:** Instant page response (< 1s) for case stage updates and document metadata filtering.
3. **Auditability:** Complete logging of user actions (who changed what stage, uploaded which document, and when).
