# EB-2 NIW Immigration Case Management System - Wireframe Specification

This wireframe document strictly maps the layout, visual structure, components, fields, and action elements of the EB-2 NIW Immigration Case Management System MVP.

---

## 1. Global Navigation & Layout Architecture

```
+-----------------------------------------------------------------------------------+
| LOGO / APP TITLE                   [Search Bar]                   [User Profile]  |
+-------------------+---------------------------------------------------------------+
| NAVIGATION MENU   | MAIN CONTENT AREA                                             |
| - Dashboard       |                                                               |
| - Clients         |                                                               |
| - Cases           |                                                               |
| - Tasks           |                                                               |
| - Documents       |                                                               |
| - Reviews         |                                                               |
| - Communication   |                                                               |
| - Payments        |                                                               |
| - Templates       |                                                               |
| - Reports         |                                                               |
| - Settings        |                                                               |
+-------------------+---------------------------------------------------------------+
```

---

## 2. Login Screen Wireframe

```
+-------------------------------------------------------------+
|                       LOGIN PORTAL                          |
|                                                             |
|   Email Address:                                            |
|   [ input: email                                        ]   |
|                                                             |
|   Password:                                                 |
|   [ input: password                                     ]   |
|                                                             |
|   [ BUTTON: Login ]            [ BUTTON: Forgot Password ]  |
+-------------------------------------------------------------+
```

---

## 3. Main Dashboard Wireframe

```
+-----------------------------------------------------------------------------------+
| DASHBOARD METRICS CARDS                                                           |
| [ Total Clients: 0 ]    [ Total Cases: 0 ]     [ Active Cases: 0 ]                |
| [ Completed Cases: 0 ]  [ Pending Reviews: 0 ] [ Pending Client Docs: 0 ]         |
| [ Upcoming Deadlines ]  [ Assigned Tasks ]     [ Recent Activity ]                |
+-----------------------------------------------------------------------------------+
| MAIN NAVIGATION BAR                                                               |
| Dashboard | Clients | Cases | Tasks | Documents | Reviews & Approvals |            |
| Communication | Payments | Case Templates | Reports | Settings                    |
+-----------------------------------------------------------------------------------+
```

---

## 4. Clients Module Wireframe

### 4.1 Client List View
```
+-----------------------------------------------------------------------------------+
| CLIENT MANAGEMENT                                                                 |
| [ BUTTON: Add Client ]                 [ Search Input ]   [ BUTTON: Filter ]      |
+-----------------------------------------------------------------------------------+
| Columns: Client ID | Client Name | Email | Phone | Current Stage | Staff | Status |
|-----------------------------------------------------------------------------------|
| Data Rows...                                                                      |
| Actions per Row: [ BUTTON: View ] [ BUTTON: Edit ]                                |
+-----------------------------------------------------------------------------------+
```

### 4.2 Add Client Form Modal
```
+-------------------------------------------------------------+
| ADD NEW CLIENT                                              |
| First Name:   [ input text                             ]    |
| Last Name:    [ input text                             ]    |
| Email:        [ input email                            ]    |
| Phone Number: [ input tel                              ]    |
|                                                             |
| [ BUTTON: Save ]                       [ BUTTON: Cancel ]   |
+-------------------------------------------------------------+
```

### 4.3 Client Profile View
```
+-----------------------------------------------------------------------------------+
| CLIENT PROFILE                                                                    |
| [ BUTTON: Edit ] [ BUTTON: Upload Document ] [ BUTTON: Add Note ] [ Create Case ] |
+-----------------------------------------------------------------------------------+
| SECTION 1: Personal Information                                                   |
| Name: [ Value ]   Email: [ Value ]   Phone: [ Value ]                             |
+-----------------------------------------------------------------------------------+
| SECTION 2: Case Information                                                       |
| Case Number | Case Type | Current Stage | Status | Assigned Staff                 |
+-----------------------------------------------------------------------------------+
| SECTION 3: Documents | SECTION 4: Tasks | SECTION 5: Notes | SECTION 6: Activity    |
+-----------------------------------------------------------------------------------+
```

---

## 5. Cases Module & 14-Stage Workflow Wireframe

### 5.1 Case List View
```
+-----------------------------------------------------------------------------------+
| CASE DIRECTORY                                                                    |
| [ BUTTON: New Case ]                  [ Search Input ]   [ BUTTON: Filter ]       |
+-----------------------------------------------------------------------------------+
| Columns: Case Number | Client Name | Case Type | Stage | Staff | Priority | Status |
| Actions per Row: [ BUTTON: View ]                                                 |
+-----------------------------------------------------------------------------------+
```

### 5.2 Create Case Form Modal
```
+-------------------------------------------------------------+
| CREATE NEW CASE                                             |
| Client:         [ Select Client dropdown               ]    |
| Case Name:      [ input text                           ]    |
| Case Type:      [ EB-2 NIW (fixed/select)              ]    |
| Assigned Staff: [ Select Staff dropdown                ]    |
| Priority:       [ Low / Medium / High / Urgent dropdown ]   |
| Start Date:     [ Date picker                          ]    |
|                                                             |
| [ BUTTON: Create ]                     [ BUTTON: Cancel ]   |
+-------------------------------------------------------------+
```

### 5.3 Case Details Layout (Tabbed View)
```
+-----------------------------------------------------------------------------------+
| CASE DETAILS: Case # [ Number ] - Client Name                                     |
| TABS: [ Workflow ] [ Documents ] [ Tasks ] [ Notes ] [ Reviews ] [ Activity ]    |
+-----------------------------------------------------------------------------------+
```

### 5.4 Comprehensive 14-Stage Workflow Wireframes

#### Stage 1: Client Registration & Intake
```
+-----------------------------------------------------------------------------------+
| STAGE 1: Client Registration & Intake                                             |
| Fields: Intake Questionnaire [ Status badge ] | Registration Status [ Status ]    |
| Actions: [ BUTTON: Send Questionnaire ]       [ BUTTON: Mark Complete ]           |
+-----------------------------------------------------------------------------------+
```

#### Stage 2: CV & Supporting Documents
```
+-----------------------------------------------------------------------------------+
| STAGE 2: CV & Supporting Documents                                                |
| Document Checklist: [ ] CV   [ ] Supporting Documents                             |
| Actions: [ BUTTON: Upload ]   [ BUTTON: Review ]   [ BUTTON: Approve ]            |
+-----------------------------------------------------------------------------------+
```

#### Stage 3: Qualification Evaluation
```
+-----------------------------------------------------------------------------------+
| STAGE 3: Qualification Evaluation                                                 |
| Fields:                                                                           |
| Qualification Review:       [ textarea                                        ]   |
| Experience Review:          [ textarea                                        ]   |
| Achievement Review:         [ textarea                                        ]   |
| Proposed Endeavor Review:   [ textarea                                        ]   |
| Actions: [ BUTTON: Save Review ]             [ BUTTON: Approve ]                  |
+-----------------------------------------------------------------------------------+
```

#### Stage 4: Terms & Conditions
```
+-----------------------------------------------------------------------------------+
| STAGE 4: Terms & Conditions                                                       |
| Fields: Engagement Acceptance Status: [ Pending / Accepted ]                     |
| Actions: [ BUTTON: Send Terms ]              [ BUTTON: Mark Accepted ]            |
+-----------------------------------------------------------------------------------+
```

#### Stage 5: Payment
```
+-----------------------------------------------------------------------------------+
| STAGE 5: Payment                                                                  |
| Fields: Payment Status: [ Pending / Partial / Paid ]                              |
| Actions: [ BUTTON: Update Status ]                                                |
+-----------------------------------------------------------------------------------+
```

#### Stage 6: Proposed Endeavor & Recommenders
```
+-----------------------------------------------------------------------------------+
| STAGE 6: Proposed Endeavor & Recommenders                                         |
| Fields: Proposed Endeavor: [ textarea ]                                           |
| Recommender List: [ Table of Recommenders ]                                       |
| Actions: [ BUTTON: Add Recommender ]         [ BUTTON: Save ]                     |
+-----------------------------------------------------------------------------------+
```

#### Stage 7: Client Feedback
```
+-----------------------------------------------------------------------------------+
| STAGE 7: Client Feedback                                                          |
| Fields: Feedback [ textarea ] | Recommender CVs [ Files ] | Evidence [ Files ]    |
| Actions: [ BUTTON: Upload ]                  [ BUTTON: Review ]                   |
+-----------------------------------------------------------------------------------+
```

#### Stage 8: Research & Evidence
```
+-----------------------------------------------------------------------------------+
| STAGE 8: Research & Evidence                                                      |
| Fields: Research Notes [ textarea ] | National Importance Evidence [ Files ]      |
| Actions: [ BUTTON: Upload Evidence ]         [ BUTTON: Save ]                     |
+-----------------------------------------------------------------------------------+
```

#### Stage 9: Draft Preparation
```
+-----------------------------------------------------------------------------------+
| STAGE 9: Draft Preparation                                                        |
| Fields: Proposed Endeavor Draft [ File ] | Recommendation Letter Drafts [ Files ] |
| Actions: [ BUTTON: Upload Draft ]            [ BUTTON: Save Draft ]               |
+-----------------------------------------------------------------------------------+
```

#### Stage 10: Client Review
```
+-----------------------------------------------------------------------------------+
| STAGE 10: Client Review                                                           |
| Fields: Client Comments [ textarea ] | Approval Status [ Status Badge ]           |
| Actions: [ BUTTON: Request Review ]          [ BUTTON: Approve ]                  |
+-----------------------------------------------------------------------------------+
```

#### Stage 11: Petition Draft (3 Sections - Matter of Dhanasar)
```
+-----------------------------------------------------------------------------------+
| STAGE 11: Petition Draft                                                          |
| Section 1: Substantial Merit & National Importance -> [ Document Upload ]         |
| Section 2: Well Positioned to Advance Proposed Endeavor -> [ Document Upload ]    |
| Section 3: Waiver Benefits the United States -> [ Document Upload ]               |
| Actions: [ BUTTON: Save Draft ]              [ BUTTON: Submit Review ]            |
+-----------------------------------------------------------------------------------+
```

#### Stage 12: Final Client Review
```
+-----------------------------------------------------------------------------------+
| STAGE 12: Final Client Review                                                     |
| Fields: Review Comments [ textarea ] | Approval Status [ Status Badge ]           |
| Actions: [ BUTTON: Send Review ]             [ BUTTON: Approve ]                  |
+-----------------------------------------------------------------------------------+
```

#### Stage 13: Petition Package
```
+-----------------------------------------------------------------------------------+
| STAGE 13: Petition Package                                                        |
| Checklist: [ ] Final Petition Package   [ ] Supporting Exhibits & Documents       |
| Actions: [ BUTTON: Organize Documents ]      [ BUTTON: Mark Complete ]            |
+-----------------------------------------------------------------------------------+
```

#### Stage 14: Case Completion
```
+-----------------------------------------------------------------------------------+
| STAGE 14: Case Completion                                                         |
| Fields: Completion Date [ Date picker ] | Record Storage Status [ Archived/Active ] |
| Actions: [ BUTTON: Complete Case ]                                                |
+-----------------------------------------------------------------------------------+
```

---

## 6. Documents Module Wireframe

```
+-----------------------------------------------------------------------------------+
| DOCUMENT MANAGEMENT                                                               |
| Categories: CV | Intake Questionnaire | Academic Records | Employment Records |   |
| Publications | Awards | Memberships | Recommendation Letters | Petition Drafts |   |
| Supporting Evidence | Other Evidence                                              |
|                                                                                   |
| Document List Table:                                                              |
| Name | Category | Upload Date | Uploaded By | Version | Status                    |
| Actions: [ BUTTON: Upload ] [ Download ] [ View ] [ Replace ] [ Delete ]          |
+-----------------------------------------------------------------------------------+
| DOCUMENT VERSION HISTORY MODAL                                                    |
| Columns: Version Number | Uploaded By | Upload Date | Notes                       |
| Actions: [ BUTTON: View Version ]                                                 |
+-----------------------------------------------------------------------------------+
```

---

## 7. Tasks & Reminders Wireframe

```
+-----------------------------------------------------------------------------------+
| TASK & REMINDER CONTROL                                                           |
| [ BUTTON: Create Task ]                                                           |
| Table Columns: Task Name | Assigned To | Due Date | Status | Priority             |
| Actions: [ BUTTON: Edit ] [ BUTTON: Complete ]                                    |
+-----------------------------------------------------------------------------------+
| TASK FORM MODAL                                                                   |
| Task Name: [ input ] Description: [ textarea ] Staff: [ select ] Due: [ date ]    |
| Priority: [ select ] | [ BUTTON: Save ]                                           |
+-----------------------------------------------------------------------------------+
| REMINDERS TRIGGER SECTION                                                         |
| For: Missing Documents | Pending Reviews | Revisions | Approvals | Deadlines     |
| Action: [ BUTTON: Send Reminder ]                                                 |
+-----------------------------------------------------------------------------------+
```

---

## 8. Reviews & Approvals Wireframe

```
+-----------------------------------------------------------------------------------+
| REVIEWS & APPROVALS                                                               |
| Table: Document | Reviewer | Status | Date                                        |
| Row Actions: [ BUTTON: Review ] [ BUTTON: Approve ] [ BUTTON: Request Changes ]   |
|                                                                                   |
| NOTES PANEL:                                                                      |
| Note Text: [ textarea                                                           ] |
| [ BUTTON: Save Note ]                                                             |
+-----------------------------------------------------------------------------------+
```

---

## 9. Communication Wireframe

```
+-----------------------------------------------------------------------------------+
| COMMUNICATION HUB                                                                 |
| Channels: [ Tab: Email ]  [ Tab: WhatsApp ]                                       |
| Actions: [ BUTTON: Send Email ]               [ BUTTON: Send WhatsApp Message ]    |
+-----------------------------------------------------------------------------------+
```

---

## 10. Payments Wireframe

```
+-----------------------------------------------------------------------------------+
| PAYMENTS MANAGEMENT                                                               |
| Fields: Payment Status [ Pending / Partial / Completed ]                          |
| Actions: [ BUTTON: Update Status ]                                                |
+-----------------------------------------------------------------------------------+
```

---

## 11. Client Portal Wireframe

```
+-----------------------------------------------------------------------------------+
| CLIENT PORTAL DASHBOARD                                                           |
| Widget 1: Case Progress Bar (Current Stage, Completed Stages, Remaining Stages)   |
| Widget 2: Pending Tasks List                                                      |
| Widget 3: Outstanding Document Checklist                                          |
| Widget 4: Shared Documents View                                                   |
|                                                                                   |
| Client Actions: [ BUTTON: Upload Document ] [ View Documents ] [ Make Payment ]   |
+-----------------------------------------------------------------------------------+
```

---

## 12. Case Templates, Reports, Settings & Integrations Wireframes

### Case Templates
- Actions: [ BUTTON: Create Template ] [ BUTTON: Edit Template ] [ BUTTON: Delete Template ] [ BUTTON: Apply Template ]
- Template Content: Configurable Workflow, Document Checklist, Standard Tasks.

### Reports & Search
- Search Fields: Client Name, Case Number, Stage, Assigned Staff, Status.
- Actions: [ BUTTON: Search ] [ BUTTON: Reset ].
- Activity History Table: Date & Time, User, Action Performed, Document, Notes.

### Settings
- User Management: Fields (Name, Email, Role, Status) | Actions ([ BUTTON: Add User ] [ Edit User ] [ Disable User ]).
- Workflow Settings: Modify Workflow Stages, Document Checklists, Standard Tasks.
- Integration Switches: Email, Google Drive / Zoho Storage, WhatsApp, e-Signatures, Payment Tracking, Automated Notifications.
