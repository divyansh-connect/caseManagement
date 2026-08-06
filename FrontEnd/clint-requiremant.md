# EB-2 NIW Immigration Case Management System (MVP) - Client Requirements

## 1. Overview & Objective
The client requires an Immigration Case Management System MVP tailored specifically for **EB-2 National Interest Waiver (NIW)** cases, featuring a configurable **14-stage petition workflow**, role-based access control, document management, client portal, and multi-channel communication/integrations.

---

## 2. User Roles
1. **Administrator / Case Manager**: Full administrative access, user management, workflow configuration, case assignment, template management, settings, and final overrides.
2. **Researcher / Petition Writer**: Drafts petition letters, compiles evidence for the 3 NIW prongs, manages research notes, uploads drafts, and reviews client submissions.
3. **Reviewer**: Evaluates drafted petition sections, reviews evidence, approves or requests changes during internal review stages.
4. **Client**: Accesses dedicated Client Portal to upload required documents, complete questionnaires, review drafts, track case progress, and process payments.

---

## 3. Core Functional Modules

### 3.1 Authentication & Login
- **Fields**: Email, Password.
- **Actions/Buttons**: Login, Forgot Password.

### 3.2 Main Dashboard
- **Key Metrics Displayed**:
  - Total Clients
  - Total Cases
  - Active Cases
  - Completed Cases
  - Pending Reviews
  - Pending Client Documents
  - Upcoming Deadlines
  - Assigned Tasks
  - Recent Activity
- **Main Navigation Menu**:
  - Dashboard
  - Clients
  - Cases
  - Tasks
  - Documents
  - Reviews & Approvals
  - Communication
  - Payments
  - Case Templates
  - Reports
  - Settings

---

### 3.3 Clients Module
#### Client List
- **Columns**: Client ID, Client Name, Email, Phone, Current Stage, Assigned Staff, Status, Actions.
- **Controls/Buttons**: Add Client, Search, Filter, View, Edit.

#### Add Client Form
- **Fields**: First Name, Last Name, Email, Phone Number.
- **Controls/Buttons**: Save, Cancel.

#### Client Profile View
- **Sections**:
  - **Personal Information**: Name, Email, Phone.
  - **Case Information**: Case Number, Case Type (EB-2 NIW), Current Stage, Status, Assigned Staff.
  - **Documents**: Tabbed list of documents uploaded for/by client.
  - **Tasks**: Tasks specific to this client.
  - **Notes**: Internal client notes.
  - **Activity History**: Audit log of client-related actions.
- **Controls/Buttons**: Edit, Upload Document, Add Note, Create Case.

---

### 3.4 Cases Module & 14-Stage Workflow Engine
#### Case List
- **Columns**: Case Number, Client Name, Case Type, Current Stage, Assigned Staff, Priority, Status.
- **Controls/Buttons**: New Case, Search, Filter, View.

#### Create Case Form
- **Fields**: Client, Case Name, Case Type, Assigned Staff, Priority, Start Date.
- **Controls/Buttons**: Create, Cancel.

#### Case Details View
- **Tabs/Sections**: Workflow, Documents, Tasks, Notes, Reviews, Activity History.

#### The 14-Stage EB-2 NIW Configurable Workflow
1. **Stage 1: Client Registration & Intake**
   - *Fields*: Intake Questionnaire, Registration Status.
   - *Actions*: Send Questionnaire, Mark Complete.
2. **Stage 2: CV & Supporting Documents**
   - *Checklist*: CV, Supporting Documents.
   - *Actions*: Upload, Review, Approve.
3. **Stage 3: Qualification Evaluation**
   - *Fields*: Qualification Review, Experience Review, Achievement Review, Proposed Endeavor Review.
   - *Actions*: Save Review, Approve.
4. **Stage 4: Terms & Conditions**
   - *Fields*: Engagement Acceptance Status.
   - *Actions*: Send Terms, Mark Accepted.
5. **Stage 5: Payment**
   - *Fields*: Payment Status.
   - *Actions*: Update Status.
6. **Stage 6: Proposed Endeavor & Recommenders**
   - *Fields*: Proposed Endeavor, Recommender List.
   - *Actions*: Add Recommender, Save.
7. **Stage 7: Client Feedback**
   - *Fields*: Feedback, Recommender CVs, Evidence Documents.
   - *Actions*: Upload, Review.
8. **Stage 8: Research & Evidence**
   - *Fields*: Research Notes, National Importance Evidence.
   - *Actions*: Upload Evidence, Save.
9. **Stage 9: Draft Preparation**
   - *Fields*: Proposed Endeavor Draft, Recommendation Letter Drafts.
   - *Actions*: Upload Draft, Save Draft.
10. **Stage 10: Client Review**
    - *Fields*: Client Comments, Approval Status.
    - *Actions*: Request Review, Approve.
11. **Stage 11: Petition Draft (Matter of Dhanasar 3-Prong Structure)**
    - *Section 1*: Substantial Merit & National Importance (Document Upload).
    - *Section 2*: Well Positioned to Advance Proposed Endeavor (Document Upload).
    - *Section 3*: Waiver Benefits the United States (Document Upload).
    - *Actions*: Save Draft, Submit Review.
12. **Stage 12: Final Client Review**
    - *Fields*: Review Comments, Approval Status.
    - *Actions*: Send Review, Approve.
13. **Stage 13: Petition Package**
    - *Checklist*: Final Petition, Supporting Documents.
    - *Actions*: Organize Documents, Mark Complete.
14. **Stage 14: Case Completion**
    - *Fields*: Completion Date, Record Storage Status.
    - *Actions*: Complete Case.

---

### 3.5 Documents Module
- **Categories to Store & Organize**:
  - CV
  - Intake Questionnaire
  - Academic Records
  - Employment Records
  - Publications
  - Awards
  - Memberships
  - Recommendation Letters
  - Petition Drafts
  - Supporting Evidence
  - Other Evidence
- **Document Field Schema**: Document Name, Category, Upload Date, Uploaded By, Version, Status.
- **Document Actions**: Upload, Download, View, Replace, Delete.
- **Document Version History**:
  - *Fields*: Version Number, Uploaded By, Upload Date, Notes.
  - *Actions*: View Version.

---

### 3.6 Tasks & Reminders Module
- **Task List Columns**: Task, Assigned To, Due Date, Status, Priority.
- **Task Form Fields**: Task Name, Description, Assigned Staff, Due Date, Priority.
- **Actions**: Create Task, Edit, Complete, Save.
- **Automated Reminders**:
  - *Triggers*: Missing Documents, Pending Reviews, Revisions, Approvals, Deadlines.
  - *Actions*: Send Reminder.

---

### 3.7 Reviews & Approvals Module
- **Review List Columns**: Document, Reviewer, Status, Date.
- **Actions**: Review, Approve, Request Changes.
- **Notes Panel**: Note field + Save Note action.

---

### 3.8 Communication Module
- **Channels**: Email, WhatsApp.
- **Actions**: Send Email, Send WhatsApp Message.

---

### 3.9 Payments Module
- **Fields**: Payment Status.
- **Actions**: Update Status.

---

### 3.10 Client Portal
- **Dashboard Views**: Case Progress, Pending Tasks, Outstanding Checklist, Documents.
- **Actions**: Upload Document, View Documents, Make Payment.
- **Progress Visualizer**: Current Stage, Completed Stages, Remaining Stages.

---

### 3.11 Case Templates Module
- **Features**: Manage reusable templates containing Workflow structure, Document Checklist, and Standard Tasks.
- **Actions**: Create Template, Edit Template, Delete Template, Apply Template.

---

### 3.12 Reports & Search Module
- **Search Criteria**: Client Name, Case Number, Stage, Assigned Staff, Status.
- **Actions**: Search, Reset.
- **Activity Log Fields**: Date & Time, User, Action Performed, Document, Notes.

---

### 3.13 Settings Module
- **User Management**: Name, Email, Role, Status. Actions: Add User, Edit User, Disable User.
- **Workflow Settings**: Configurable Workflow stages, Document Checklists, Standard Tasks.
- **Integrations Required**:
  - Email (SMTP/Transactional)
  - Cloud Storage (Google Drive or Zoho Cloud Storage)
  - WhatsApp Integration
  - Electronic Signatures (e-Sign)
  - Payment Tracking
  - Automated Client Notifications
