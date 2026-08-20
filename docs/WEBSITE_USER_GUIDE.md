# Case Management Website – User Guide

## 1. Introduction

Welcome to the **Case Management Website**! This platform is an all-in-one digital system designed to manage high-value immigration cases (such as EB-2 NIW, EB-1A, and O-1 visas). It connects applicants, legal case managers, petition writers, and quality control reviewers into one clear, step-by-step workflow.

Rather than managing immigration cases through scattered emails and paper files, the website provides a transparent process where every user knows exactly what to do next.

### Simple Overall Workflow Concept

```
  ┌──────────┐     ┌──────────────┐     ┌──────────┐     ┌──────────────┐     ┌──────────┐
  │  CLIENT  │ ──► │ ADMINISTRA-  │ ──► │ DRAFTER  │ ──► │  REVIEW &    │ ──► │  FINAL   │
  │ (Uploads │     │ TOR (Creates │     │ (Drafts  │     │  APPROVAL    │     │ FILING & │
  │  Docs)   │     │ Case/Team)   │     │ Petition)│     │ (QA Audit)   │     │ COMPLETION│
  └──────────┘     └──────────────┘     └──────────┘     └──────────────┘     └──────────┘
```

1. **Client** uploads personal records, fills questionnaires, and reviews drafts.
2. **Administrator** creates the case, assigns the team, sets deadlines, and manages payments.
3. **Drafter** analyzes the evidence, drafts recommendation letters, and writes the main petition memo.
4. **Reviewer** performs quality control and grants legal approval.
5. **Final Case Completion** takes place when the package is printed, signed, and shipped to USCIS.

---

## 2. Login & Getting Started

### Accessing the Login Page
Users open the website address in any standard browser to reach the **Login Page**.

### How Users Log In
1. Enter your registered **Email Address**.
2. Enter your **Password**.
3. Click the **Sign In** button.

### What Happens After Login
Once logged in, the system verifies your credentials and automatically opens your role-specific workspace dashboard:
* **Super Admin** → Redirected to **Super Administrator Control**
* **Administrator** → Redirected to **Administrator Control Dashboard**
* **Drafter** → Redirected to **Drafter Workspace**
* **Client** → Redirected to **Client Workspace / Case Overview**

Each role sees a customized navigation menu on the left sidebar containing only the tabs and tools relevant to their responsibilities.

---

## 3. COMPLETE BUTTON DIRECTORY (WHICH BUTTON OPENS WHAT?)

Here is the exact guide explaining every button available across the website, where it is located, and what opens when clicked:

### Global Header & Navigation Buttons

| Button Name | Where Located | What Happens / What Opens |
| :--- | :--- | :--- |
| **✨ Babel AI Petition Drafter** | Top Header & Left Sidebar | Opens the **AI Assistant Modal** for legal petition drafting, document summarization, and recommendation letter generation. |
| **🔔 Notifications Bell** | Top Right Header | Opens the **Notifications Drawer**, showing recent case alerts, uploaded file notices, and audit updates. |
| **👤 Role Switcher Dropdown** | Top Right Header | Switches between user roles (*Super Admin*, *Admin*, *Writer*, *Reviewer*, *Client*) for demonstration and role management. |
| **🍔 Mobile Menu Icon** | Top Left Header (Mobile view) | Opens/closes the mobile navigation drawer. |
| **🚪 Logout Button** | Bottom Left Sidebar | Logs out the current user session and returns to the Login Page. |

---

### Dashboard & Action Buttons

| Button Name | Where Located | What Happens / What Opens |
| :--- | :--- | :--- |
| **➕ Create New Case** | Dashboard & Cases Page | Opens the **New Case Creation Modal** to enter Case Number, Client, Petition Category (EB-2 NIW/EB-1A), assign Writer & Reviewer, select Service Center, and set Risk Level. |
| **➕ Add New Client** | Clients Page & Dashboard | Opens the **New Client Onboarding Form** to enter Client Name, Email, Phone, Field, Degree, and Citation metrics. |
| **➕ Upload Document** | Documents Page & Case Detail | Opens the **Document Upload Modal** to select Category (CV, Degree, Letter, Form), exhibit number, and upload PDF/image files. |
| **➕ Add Recommender** | Case Detail Page (`Recommenders` tab) | Opens the **New Recommender Modal** to enter Recommender Name, Title, Organization, Relationship, and CV status. |
| **📅 Book Consultation / Schedule Call** | Appointments Page & Dashboard | Opens the **Appointment Booking Modal** to select a calendar date, time slot, and consultation type for video call meetings. |
| **📝 Fill Questionnaire** | Forms Page & Client Portal | Opens the **USCIS Intake Questionnaire Modal** for clients to enter personal, address, and employment history data. |
| **✍️ Sign Agreement / Sign Form** | Forms Page & Client Portal | Opens the **Electronic Signature Modal** with a digital signature pad for signing agreements and petition forms. |
| **🎓 Resume & Profile Builder** | Cases Page (Action Button) | Opens the **Resume Building Modal** to optimize client CVs, highlight key achievements, and calculate citation percentiles. |
| **💬 WhatsApp Live Chat** | Sidebar (`Communication` tab) | Opens the **WhatsApp Live Chat Modal** for instant direct messaging with clients or legal team. |
| **👁️ View Case Details / Open Case** | Cases List (Row / Card) | Opens the full **Case Detail View** showing Dhanasar 3-Prong specs, recommenders, tasks, documents, and timeline. |
| **✅ Mark as Completed** | Tasks Page & Client Portal | Toggles task status to **Completed** and updates overall case progress percentage. |
| **📥 Download File / Receipt** | Documents Page & Payments | Downloads the selected document PDF or official payment receipt to your device. |

---

## 4. SUPER ADMIN WORKFLOW

The **Super Admin** is the system administrator who oversees firm-wide performance, manages administrative access, and monitors all case operations.

### Super Admin Navigation Flow
```
Login ──► Dashboard ──► Admin Management ──► All Cases ──► Clients ──► Reviews ──► Reports & Settings
```

### 1. Dashboard (`Dashboard` Tab)
* **What it is for**: Provides a high-level overview of firm-wide performance.
* **What Super Admin sees**: Total active cases, total clients, pending reviews, active tasks, and recent audit activity logs.
* **Actions performed**: Monitors firm performance metrics and checks system activity.

### 2. Admin Management (`Admin Management` Tab)
* **What it is for**: Managing administrative personnel and reviewing security activity logs.
* **What Super Admin sees**: List of system users, assigned roles (Admin, Writer, Reviewer), and real-time audit log entries.
* **Actions performed**: Grants or modifies user access levels, reviews session activity, and audits administrative actions.

### 3. All Cases (`All Cases` Tab)
* **What it is for**: Monitoring all immigration cases active across the entire firm.
* **What Super Admin sees**: Complete list of cases, case numbers, petition categories (EB-2 NIW, EB-1A, O-1), assigned legal teams, current workflow stages, and risk levels.
* **Actions performed**: Searches, filters, and inspects any case file across the firm.

### 4. Clients (`Clients` Tab)
* **What it is for**: Managing the global database of petitioners and clients.
* **What Super Admin sees**: Client names, emails, field of expertise, highest degree, publication counts, and account statuses.
* **Actions performed**: Views client profiles, edits client details, and checks client onboarding progress.

### 5. Reviews & Approvals (`Reviews & Approvals` Tab)
* **What it is for**: Overseeing quality control signoffs across all legal petitions.
* **What Super Admin sees**: Pending reviews, submitted petition memos, and reviewer approval statuses.
* **Actions performed**: Inspects final petition packages and ensures firm standards are maintained.

### 6. Communication (`Communication` Tab)
* **What it is for**: Centralized messaging hub and WhatsApp live chat integration.
* **What Super Admin sees**: All active message threads between clients and legal teams.
* **Actions performed**: Oversees client communications and launches WhatsApp live chat when needed.

### 7. Payments (`Payments` Tab)
* **What it is for**: Tracking financial transactions and milestone billing.
* **What Super Admin sees**: Total revenue, paid milestones, pending invoices, and overdue payments.
* **Actions performed**: Reviews firm financial health and tracks fee completion.

### 8. Reports & Settings (`Reports` & `Settings` Tabs)
* **What it is for**: System analytics and global firm configuration.
* **What Super Admin sees**: Approval rate statistics, stage velocity charts, global templates, and system settings.
* **Actions performed**: Exports performance reports and configures global settings.

---

## 5. ADMINISTRATOR WORKFLOW

The **Administrator (Case Manager)** manages daily case operations, onboards clients, creates cases, assigns legal teams, sets deadlines, and coordinates overall case progress.

### Administrator Navigation Flow
```
Login ──► Dashboard ──► Onboard Client ──► Create Case ──► Assign Team ──► Manage Tasks/Payments ──► Review & Ship
```

### Step-by-Step Administrator Process

#### Step 1: Start at the Dashboard (`Dashboard` Tab)
* Reviews key operational metrics: **Active Cases**, **Pending Reviews**, **Overdue Tasks**, and **Recent Client Updates**.
* Uses quick action buttons to **Create Case**, **Add Client**, or **Schedule Call**.

#### Step 2: Onboard a New Client (`Clients` Tab)
* Clicks **Add New Client**.
* Enters client details: Name, Email, Phone, Country of Birth, Current Field, Highest Degree, University, and Citation/Publication metrics.
* Clicks **Save Client**. The client receives account access.

#### Step 3: Create and Setup a Case (`Cases` Tab)
* Clicks **Create New Case**.
* Selects the **Client**, **Petition Category** (e.g. *EB-2 NIW* or *EB-1A*), **Field Category** (e.g. *Artificial Intelligence*), **Target Filing Date**, and **USCIS Service Center** (*Nebraska* or *Texas*).
* Assigns the dedicated **Petition Drafter** and **Senior Reviewer**.
* Evaluates initial **Risk Level** (*Low*, *Medium*, or *High*).
* Clicks **Initialize Case**.

#### Step 4: Assign Tasks & Manage Timeline (`Tasks` Tab)
* Creates specific tasks for the Drafter, Reviewer, or Client (e.g. *"Draft Proposed Endeavor"*, *"Upload Degree Certificate"*).
* Sets due dates and priority levels (*Low*, *Medium*, *High*, *Urgent*).

#### Step 5: Coordinate Strategy & Appointments (`Appointments` Tab)
* Schedules strategy calls or legal consultations with the client.
* Selects date and time slots to generate video meeting invites.

#### Step 6: Track Payments & Milestones (`Payments` Tab)
* Sets up payment milestones for the client.
* Records payments as they are received and updates milestone status from **Pending** to **Paid**.

#### Step 7: Monitor Communication & Progress (`Communication` Tab)
* Monitors message exchanges between the client and the legal team.
* Uses the **WhatsApp Live Chat** shortcut to communicate directly with clients.

#### Step 8: Final Review & Package Dispatch (`Reviews` Tab)
* Once the Drafter and Reviewer complete the petition memo, the Administrator performs final checks.
* Confirms physical shipping address with the client.
* Updates the case status to **Stage 13 (Package Assembly)** and **Stage 14 (Case Completion / Filed)**.

---

## 6. DRAFTER WORKFLOW

The **Drafter (Petition Writer / Researcher)** is responsible for analyzing client evidence, drafting expert recommendation letters, defining the proposed endeavor, and writing the legal petition memorandum.

### Drafter Navigation Flow
```
Login ──► Dashboard ──► My Assigned Cases ──► Review Evidence ──► Draft Letters ──► Write Petition Memo ──► Submit for QA Review
```

### Step-by-Step Drafter Process

#### Step 1: Login & Identify Assigned Work (`Dashboard` & `My Assigned Cases` Tabs)
* Opens the **Drafter Workspace**.
* Checks **My Assigned Cases** to see all active cases assigned to them.
* Checks **My Tasks** to view upcoming drafting deadlines and priority assignments.

#### Step 2: Open a Case & Review Client Evidence (`Research & Evidence` Tab)
* Selects a case to view complete client details.
* Reviews uploaded documents: CV, academic degrees, publication records, and citation reports.
* Analyzes legal criteria:
  * For **EB-2 NIW**: Evaluates the **Dhanasar 3-Prong Framework**:
    * *Prong 1*: Substantial Merit & National Importance.
    * *Prong 2*: Well Positioned to Advance the Endeavor.
    * *Prong 3*: On Balance Beneficial to Waive Job Offer & PERM.
  * For **EB-1A**: Checks criteria checklists (Prizes, Membership, Media, Judging, Scholarly Articles, High Salary, etc.).

#### Step 3: Formulate Proposed Endeavor & Recommender Strategy
* Drafts a clear **Proposed Endeavor Statement** describing the client's work and U.S. national impact.
* Identifies 3 to 5 expert recommenders (Independent Experts, Academic Advisors, Industry Collaborators).
* Tracks recommender statuses (*Identified*, *Outreach Sent*, *Drafting Letter*, *Letter Signed*, *Verified*).

#### Step 4: Utilize AI Drafting Tools (`Babel AI Petition Drafter`)
* Clicks the **Babel AI Petition Drafter** button in the top header or sidebar.
* Uses AI assistance to summarize technical documents, generate recommendation letter templates, and outline legal arguments.

#### Step 5: Author the Petition Memorandum & Submit for Review
* Writes the comprehensive **Petition Memorandum** (connecting client evidence to legal prongs and exhibit numbers).
* Uploads completed drafts under **Petition Drafts** (`Case Templates` tab).
* Updates task status to **Submitted** and moves the workflow stage to **Review & Approval**.

#### Step 6: Handle Revisions & Status Updates
* Monitors feedback from the **Senior Reviewer** and **Client**.
* If status changes to **Revision Required**, the Drafter opens reviewer notes, updates the draft, and resubmits for approval.
* Once approved, the draft status updates to **Approved**.

---

## 7. CLIENT WORKFLOW

The **Client Portal** is designed for applicants to easily track their petition, complete assigned tasks, upload documents, and communicate with their legal team without needing technical skills.

### Client Navigation Flow
```
Login ──► Case Overview ──► Complete Tasks ──► Upload Documents ──► Fill Questionnaires ──► Review Drafts ──► Track Post-Filing
```

### Step-by-Step Client Process

#### Step 1: Login & View Dashboard (`Case Overview` Tab)
* Log in using your email and password.
* You immediately see your **Case Overview Dashboard** showing:
  * Your current **Case Stage** (e.g. *Stage 2: Case Strategy & Recommendation Letters*).
  * Your **Overall Progress Percentage** (e.g. *35% Completed*).
  * **Urgent Action Items** requiring your attention.

#### Step 2: View and Complete Assigned Tasks (`Tasks` Tab)
* Click **Tasks** in the menu to view your to-do list.
* Open any task labeled **Awaiting Client** (e.g. *"Upload Master's Degree"* or *"Sign Engagement Agreement"*).
* Follow the instructions and mark the task as **Completed**.

#### Step 3: Upload Records to Document Vault (`Documents` Tab)
* Click **Documents** in the menu.
* Click the blue **Upload Document** button.
* Select the file category (e.g. *CV*, *Degree*, *Transcript*, *Publication*, or *Recommendation Letter*).
* Choose your PDF or image file and click **Upload**.
* You can view your document verification status (*Pending Review*, *Verified*, or *Needs Revision*).

#### Step 4: Complete Online Questionnaires (`Forms` Tab)
* Click **Forms** in the menu to complete your intake questionnaire.
* Fill in your personal details, address history, and professional background.
* When forms are generated, download printable copies, sign in **blue ink** where indicated, and re-upload the signed pages.

#### Step 5: Review Drafts & Sign Agreements (`Agreement & Payments` Tab)
* Select your preferred payment plan and view invoice milestones (*Paid*, *Pending*, *Overdue*).
* Download payment receipts for your records.
* Review drafted Proposed Endeavor statements and Petition Memos for factual accuracy.

#### Step 6: Communicate & Book Calls (`Communication` & `Appointments` Tabs)
* Click **Communication** to message your Case Manager or Drafter.
* Click **WhatsApp Live Chat** for instant messaging.
* Click **Appointments** to select an available date and time slot to book a strategy call.

#### Step 7: Track Package Post-Filing (`Post-Filing Updates` Tab)
* After your package is shipped to USCIS, visit **Post-Filing Updates**.
* View your express courier tracking number.
* When USCIS mails your official **Form I-797 (Receipt Notice)**, upload a photo/scan of the notice to enable live USCIS status tracking.

---

## 8. COMPLETE CASE JOURNEY

Here is the exact end-to-end journey of an immigration case moving through the website:

```
                  ┌─────────────────────────────────────────┐
                  │ 1. CLIENT ONBOARDING & DOCUMENT UPLOAD  │
                  │    - Client uploads CV, degrees & info. │
                  └────────────────────┬────────────────────┘
                                       │
                                       ▼
                  ┌─────────────────────────────────────────┐
                  │ 2. ADMIN CREATES CASE & ASSIGNS TEAM   │
                  │    - Admin sets up case, assigns        │
                  │      Drafter & Senior Reviewer.         │
                  └────────────────────┬────────────────────┘
                                       │
                                       ▼
                  ┌─────────────────────────────────────────┐
                  │ 3. DRAFTER DEVELOPS STRATEGY & LETTERS  │
                  │    - Drafter writes proposed endeavor   │
                  │      & recommendation letter drafts.    │
                  └────────────────────┬────────────────────┘
                                       │
                                       ▼
                  ┌─────────────────────────────────────────┐
                  │ 4. CLIENT RECOMMENDER SIGNATURES        │
                  │    - Client obtains recommender         │
                  │      signatures on official letterhead. │
                  └────────────────────┬────────────────────┘
                                       │
                                       ▼
                  ┌─────────────────────────────────────────┐
                  │ 5. FORMS PREPARATION & QUESTIONNAIRE    │
                  │    - Client fills online questionnaire; │
                  │      signs forms in blue ink.           │
                  └────────────────────┬────────────────────┘
                                       │
                                       ▼
                  ┌─────────────────────────────────────────┐
                  │ 6. PETITION MEMORANDUM DRAFTING         │
                  │    - Drafter authors 25-40 page petition│
                  │      memo (Dhanasar / EB-1A framework). │
                  └────────────────────┬────────────────────┘
                                       │
                                       ▼
                  ┌─────────────────────────────────────────┐
                  │ 7. QA REVIEW & FACT CHECKING            │
                  │    - Reviewer conducts legal audit;     │
                  │      Client verifies factual details.   │
                  └────────────────────┬────────────────────┘
                                       │
                                       ▼
                  ┌─────────────────────────────────────────┐
                  │ 8. FINAL PACKAGE ASSEMBLY & SHIPMENT    │
                  │    - Admin compiles physical binder &   │
                  │      ships package to USCIS via courier.│
                  └────────────────────┬────────────────────┘
                                       │
                                       ▼
                  ┌─────────────────────────────────────────┐
                  │ 9. POST-FILING TRACKING & RECEIPT       │
                  │    - Client uploads Form I-797 notice   │
                  │      for live USCIS tracking.           │
                  └─────────────────────────────────────────┘
```

---

## 9. ROLE-WISE RESPONSIBILITY SUMMARY

| Role | Main Responsibility | What They Mainly Use |
| :--- | :--- | :--- |
| **Super Admin** | System oversight, role permissions, firm analytics, and audit logging. | Dashboard, Admin Management, All Cases, Reports, Settings |
| **Administrator** | Client onboarding, case setup, team assignment, task tracking, and package shipping. | Dashboard, Clients, Cases, Tasks, Payments, Appointments |
| **Drafter** | Evidence analysis, recommender drafting, endeavor formulation, and petition memo drafting. | Dashboard, My Assigned Cases, Research & Evidence, AI Drafter, Petition Drafts |
| **Reviewer** | Legal quality control, exhibit audit, petition review, and final approval signoff. | Dashboard, Cases, Forms Review, Assigned Reviews, Reports |
| **Client** | Uploading personal records, completing questionnaires, signing forms/letters, and tracking status. | Case Overview, My Tasks, Documents, Forms, Agreement & Payments, Post-Filing |

---

## 10. DAILY USAGE GUIDE

### Super Admin Daily Routine
1. **Login** → Access Super Administrator Control.
2. **Check Dashboard** → Review active case counts, pending reviews, and system alerts.
3. **Audit Activity Logs** → Check `Admin Management` for user access activity.
4. **Review Performance** → Inspect `Reports` and financial summaries under `Payments`.

### Administrator Daily Routine
1. **Login** → Access Administrator Control Dashboard.
2. **Check Dashboard** → Review urgent tasks, new client registrations, and pending reviews.
3. **Onboard & Setup** → Add new clients and initialize new cases under `Cases`.
4. **Assign & Monitor** → Create tasks, assign Drafters/Reviewers, and check task progress.
5. **Client Communications** → Respond to client messages and check appointments.

### Drafter Daily Routine
1. **Login** → Access Drafter Workspace.
2. **Check Assigned Work** → Open `My Assigned Cases` and `My Tasks`.
3. **Review & Research** → Inspect client uploaded evidence in `Research & Evidence`.
4. **Draft & Assist** → Launch `Babel AI Petition Drafter` to draft letters and petition memos.
5. **Submit for Review** → Submit completed drafts and update task statuses.

### Client Daily Routine
1. **Login** → Access Client Workspace.
2. **Check Progress** → View current stage and progress percentage on `Case Overview`.
3. **Complete Tasks** → Open `My Tasks` and complete any item marked *Awaiting Client*.
4. **Upload Records** → Upload missing degrees, transcripts, or signed letters in `Documents`.
5. **Communicate** → Send messages or book strategy calls when guidance is needed.

---

## 11. IMPORTANT STATUS / ACTION EXPLANATION

### Case Stage Statuses
* **Intake (Stages 1–5)**: Onboarding, initial CV assessment, agreement signing, payment plan selection, and document gathering.
* **Endeavor & Evidence (Stages 6–8)**: Drafting proposed endeavor, identifying recommenders, and writing recommendation letters.
* **Drafting & Review (Stages 9–12)**: Authoring the petition memorandum, QA reviewer audit, and client factual verification.
* **Final Filing (Stages 13–14)**: Assembling final binder, fee verification, shipping to USCIS, and case completion.

### Document Statuses
* **Pending Review**: Document uploaded; awaiting inspection by legal team.
* **Verified**: Document inspected and confirmed compliant with legal standards.
* **Needs Revision**: Document requires corrections (e.g. missing official letterhead or illegible scan).
* **Approved**: Document accepted for inclusion in the final USCIS exhibit binder.

### Task Statuses
* **Not Started**: Task created but work has not begun.
* **Awaiting Client**: Action required specifically from the client (e.g. sign form or upload document).
* **Under Review**: Work submitted and currently being checked by team/reviewer.
* **Approved / Completed**: Task finished and verified.

### Payment Statuses
* **Pending**: Invoice generated; awaiting payment.
* **Paid**: Payment received and recorded.
* **Overdue**: Payment past due date.

---

## 12. SIMPLE USER TIPS

1. **Check Your Dashboard First**: Always start your day by checking the main dashboard for urgent notifications and progress updates.
2. **Select Category Before Uploading**: When uploading files under `Documents`, always pick the correct category (e.g. *CV*, *Degree*, *Recommendation Letter*) so your legal team can find it quickly.
3. **Use PDF Format**: Whenever possible, upload documents in **PDF format** for best legibility and legal compliance.
4. **Watch Task Deadlines**: Keep an eye on task due dates under `My Tasks` to prevent case delays.
5. **Use Blue Ink for Wet Signatures**: When signing official USCIS forms or recommendation letters physically, always use **blue ink** as required by USCIS.
6. **Log Out When Finished**: Always click **Logout** in the bottom sidebar when completing your session to maintain privacy and security.

---

## 13. FINAL QUICK FLOW

```
┌──────────┐     ┌───────────┐     ┌──────────────┐     ┌───────────┐     ┌───────────┐     ┌───────────┐
│  LOGIN   │ ──► │ DASHBOARD │ ──► │ CHECK TASKS  │ ──► │ OPEN CASE │ ──► │ PERFORM   │ ──► │ SUBMIT &  │ ──► CASE COMPLETED!
│          │     │ OVERVIEW  │     │ & DEADLINES  │     │ FILE      │     │ ACTION    │     │ REVIEW    │
└──────────┘     └───────────┘     └──────────────┘     └───────────┘     └───────────┘     └───────────┘
```

---
*Case Management Website User Guide — Authoritative Operating Manual*
