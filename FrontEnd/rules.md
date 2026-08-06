# EB-2 NIW System Business Rules & Workflow Guardrails

This document establishes the system rules, workflow constraints, permissions, and automated triggers governing the EB-2 NIW Case Management System MVP.

---

## 1. Role-Based Access Control (RBAC) Rules

1. **Administrator / Case Manager**
   - Can create, edit, disable, or delete any user account.
   - Can override any stage in the 14-stage workflow.
   - Can create, modify, or delete Case Templates.
   - Can update system settings and configure 3rd-party integrations (Google Drive/Zoho, WhatsApp, Email, e-Sign).

2. **Researcher / Petition Writer**
   - Can view and edit assigned cases only.
   - Can upload drafts for Stages 6, 8, 9, and 11.
   - Cannot mark Stage 4 (Terms) or Stage 5 (Payment) complete without Admin/System verification.
   - Cannot bypass Stage 11 (Petition Draft) without uploading documents for all 3 NIW prongs.

3. **Reviewer**
   - Can approve or request changes on submitted drafts in Stages 3, 9, 11, and 12.
   - Cannot alter client personal information or administrative billing status.

4. **Client**
   - Read-only access to case progress, approved drafts, and assigned task checklists.
   - Write access limited to uploading requested documents, submitting feedback, and making payments.
   - Cannot view internal staff notes or internal research notes marked as private.

---

## 2. 14-Stage Workflow Progression Rules

1. **Sequential Stage Progression:**
   - A case cannot advance to the next stage unless all mandatory fields and document upload prerequisites for the current stage are met, OR an Administrator executes a manual override.

2. **Stage Prerequisite Validation Checklist:**
   - **Stage 1 (Intake):** Questionnaire status must be marked "Submitted" or "Completed".
   - **Stage 2 (CV & Docs):** CV document must be uploaded.
   - **Stage 3 (Evaluation):** All 4 review fields (Qualification, Experience, Achievement, Proposed Endeavor) must be saved and approved.
   - **Stage 4 (Terms):** Engagement Acceptance Status must equal "Accepted".
   - **Stage 5 (Payment):** Payment Status must be updated to "Paid" or "Approved Partial".
   - **Stage 6 (Endeavor & Recommenders):** Proposed endeavor text saved + at least 1 recommender added.
   - **Stage 7 (Client Feedback):** Client feedback submitted.
   - **Stage 8 (Research & Evidence):** Research notes saved + evidence uploaded.
   - **Stage 9 (Draft Prep):** Proposed Endeavor draft + recommendation letter drafts uploaded.
   - **Stage 10 (Client Review):** Client approval status equals "Approved".
   - **Stage 11 (Petition Draft):** Documents must be uploaded for **Section 1 (Substantial Merit)**, **Section 2 (Well Positioned)**, and **Section 3 (Waiver Benefits US)**.
   - **Stage 12 (Final Client Review):** Final approval status equals "Approved".
   - **Stage 13 (Petition Package):** Final petition package organized and verified.
   - **Stage 14 (Case Completion):** Completion date recorded and storage status updated to "Archived".

---

## 3. Document Management & Versioning Rules

1. **Mandatory Categorization:**
   - Every uploaded file must be tagged with exactly one of the 11 recognized categories: `CV`, `Intake Questionnaire`, `Academic Records`, `Employment Records`, `Publications`, `Awards`, `Memberships`, `Recommendation Letters`, `Petition Drafts`, `Supporting Evidence`, `Other Evidence`.

2. **Immutability & Version Control:**
   - Files uploaded to the system cannot be silently overwritten. Updating a document creates a new version (`v1`, `v2`, `v3`), retaining previous files in the Document Version History.
   - Only Administrators have deletion rights for uploaded documents.

---

## 4. Automated Reminders & Notifications Rules

1. **Missing Document Triggers:**
   - If a client document remains pending > 3 calendar days after stage initiation, an automated reminder is sent via Email/WhatsApp.

2. **Pending Review Triggers:**
   - If a draft is submitted for review and remains unreviewed for > 48 hours, the assigned Reviewer receives an urgent task reminder.

3. **Deadline Triggers:**
   - Tasks due within 24 hours trigger notifications to assigned staff and display on the Dashboard's "Upcoming Deadlines" widget.

---

## 5. Audit Logging Rules

1. **System Log Entry:**
   - Any action performed in the system (Stage status change, document upload, review submission, user login, payment update) MUST automatically append an entry to the Activity History with: `Date & Time`, `User`, `Action Performed`, `Document (if applicable)`, and `Notes`.
