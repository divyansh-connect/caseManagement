# AI Assistant Memory & Context Register - EB-2 NIW Case Management System

## 1. System Context & Domain Focus

- **Project:** EB-2 NIW (National Interest Waiver) Immigration Case Management System MVP
- **Primary Domain:** U.S. Immigration Law (EB-2 NIW petitions based on *Matter of Dhanasar* precedent)
- **Primary Objective:** Provide a seamless, automated 14-stage workflow for legal staff (Admins, Petition Writers, Reviewers) and clients.

---

## 2. Technical Stack & Architecture Guidelines

- **Frontend:** HTML5, Modern Vanilla CSS / TailwindCSS v4, JavaScript (ESM) / React 19 + Vite
- **Icons & UI Utilities:** `lucide-react`, standard modal & tab patterns
- **Data Models & State:** Component-driven tabbed views, strict state bindings for 14 stages, role-based conditional rendering.
- **Routing & Views:** Dashboard, Clients, Cases (14-Stage View), Tasks, Documents, Reviews, Communication, Payments, Templates, Reports, Settings.

---

## 3. Domain Knowledge Dictionary: Matter of Dhanasar (Stage 11 3-Prong Framework)

When assisting with Stage 11 petition drafting or data modeling, adhere strictly to the 3 prongs of *Matter of Dhanasar* (26 I&N Dec. 884):
1. **Prong 1 (Substantial Merit & National Importance):** The foreign national's proposed endeavor has both substantial merit and national importance (e.g., tech innovation, healthcare, economic impact).
2. **Prong 2 (Well Positioned to Advance):** The foreign national is well-positioned to advance the proposed endeavor (academic credentials, record of success, skills, plan).
3. **Prong 3 (Waiver Benefits the U.S.):** On balance, it would be beneficial to the United States to waive the requirements of a job offer and labor certification.

---

## 4. Key Component Map & Workflow Stages

| Stage # | Stage Name | Key Actions / Operations |
| :--- | :--- | :--- |
| **Stage 1** | Client Registration & Intake | Send Intake Questionnaire, Mark Complete |
| **Stage 2** | CV & Supporting Documents | Upload & Approve CV / Supporting Docs |
| **Stage 3** | Qualification Evaluation | Record Qual/Exp/Achievement/Endeavor Reviews |
| **Stage 4** | Terms & Conditions | Send Retainer Agreement, Track Acceptance |
| **Stage 5** | Payment | Update & Track Milestone Payments |
| **Stage 6** | Proposed Endeavor & Recommenders | Save Endeavor Statement, Add Recommenders |
| **Stage 7** | Client Feedback | Upload Recommender CVs & Evidence |
| **Stage 8** | Research & Evidence | Save Research Notes & National Importance Evidence |
| **Stage 9** | Draft Preparation | Draft Endeavor Text & Recommendation Letters |
| **Stage 10** | Client Review | Review Drafts with Client, Request Approval |
| **Stage 11** | Petition Draft (3 Prongs) | Compile Section 1 (Merit/Importance), Section 2 (Positioning), Section 3 (Waiver Benefit) |
| **Stage 12** | Final Client Review | Executive Review & Final Client Approval |
| **Stage 13** | Petition Package | Organize Final I-140 Packet & Exhibits |
| **Stage 14** | Case Completion | Set Completion Date & Archive Case Records |

---

## 5. Guidelines for Future AI Operations

- **Strict Adherence to Wireframe Specs:** Maintain all buttons, inputs, fields, and tables exactly as defined in `wireframe.md`.
- **Role Isolation:** Ensure client portal components only expose client-permitted actions (`Upload Document`, `View Documents`, `Make Payment`).
- **Document Versioning:** Never write code that replaces document records without updating the version counter and history log.
- **Stage Progression Integrity:** Ensure UI forms validate stage inputs before allowing state changes to the next stage number.
