# Complete User Guide & System Flow Specification
## Comprehensive Client-Facing Guide & Data Architecture Flow for the Case Management System

---

## 1. Executive Summary & Purpose

Welcome to the **Immigration Case Management System**! This software is an end-to-end digital platform designed specifically to guide applicants (Clients), legal petition writers, senior QA reviewers, and case managers through high-value US immigration petitions, including:

* **EB-2 NIW (National Interest Waiver)**
* **EB-1A (Alien of Extraordinary Ability)**
* **O-1 (Extraordinary Ability Visa)**
* **Profile & Resume Building Programs**
* **Mexico TR & Concurrent I-485 Filings**

The system bridges the client and the legal team by providing a **transparent, step-by-step workflow**, a **secure document vault**, **automated form preparation**, **interactive messaging**, and **real-time stage tracking**.

---

## 2. High-Level Data Flow & System Architecture

Understanding where your data comes from, where it goes, and how it is processed ensures complete security and peace of mind.

```
       ┌─────────────────────────────────────────────────────────────┐
       │                        CLIENT PORTAL                        │
       │  (Fills Forms, Uploads Documents, Reviews Drafts, Payments)  │
       └──────────────────────────────┬──────────────────────────────┘
                                      │
                                      ▼
                        ┌───────────────────────────┐
                        │   REST API Gateway &      │
                        │ Authenticated Middleware │
                        └─────────────┬─────────────┘
                                      │
              ┌───────────────────────┴───────────────────────┐
              ▼                                               ▼
┌───────────────────────────┐                   ┌───────────────────────────┐
│     Cloudinary Storage    │                   │   MySQL Database (Prisma) │
│  (CVs, Degrees, Letters,  │                   │  (Case Data, Stage Progress,│
│  Exhibits, Signed Forms)  │                   │   Questionnaire Answers)  │
└─────────────┬─────────────┘                   └─────────────┬─────────────┘
              │                                               │
              └───────────────────────┬───────────────────────┘
                                      │
                                      ▼
       ┌─────────────────────────────────────────────────────────────┐
       │                     ADMIN & LEGAL PORTAL                    │
       │  (Writers Draft Petition, QA Audit, AI Analysis, Assembles   │
       │                 Final USCIS Petition Package)               │
       └─────────────────────────────────────────────────────────────┘
```

### Data Journey Highlights:
1. **User Profile & Credentials**: When you log in, an encrypted JSON Web Token (JWT) authenticates your session.
2. **Document Security**: Uploaded files (CVs, degrees, publications, letters) pass through encrypted file processing and are securely stored in cloud storage (Cloudinary). Only unique secure URLs and metadata are recorded in the database.
3. **Information Mapping**: When you complete a simplified online questionnaire, the software maps your entries directly into official USCIS forms (e.g., Form I-140, ETA-9089, G-1145), reducing manual errors and saving weeks of back-and-forth communication.
4. **Audit Logging**: Every major action (uploading a document, submitting a form, updating a stage) generates an automated activity log entry for complete accountability.

---

## 3. The 6-Stage Master Client Workflow

The petition process is divided into **6 client-friendly stages**. Clients can monitor their progress at any time directly on their portal dashboard.

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   STAGE 1    │ ──► │   STAGE 2    │ ──► │   STAGE 3    │
│ Onboarding & │     │  Strategy &  │     │    Forms     │
│ Document Intake│    │ Recommenders │     │ Preparation  │
└──────────────┘     └──────────────┘     └──────────────┘
                                                 │
                                                 ▼
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   STAGE 6    │ ◄── │   STAGE 5    │ ◄── │   STAGE 4    │
│ Filed with   │     │ Final Package│     │  Drafting &  │
│    USCIS     │     │ Assembly     │     │ Fact Review  │
└──────────────┘     └──────────────┘     └──────────────┘
```

---

### Stage 1: Consultation, Onboarding & Profile Assessment
* **What Happens Here**:
  * You attend your initial consultation and complete the onboarding setup.
  * You upload your current Curriculum Vitae (CV) and personal credentials.
  * You review and electronically sign your **Engagement Agreement**.
  * You choose your preferred **Payment Plan** (Standard Flow or Flexible Evidence-First Flow).
  * You upload core supporting records: academic degrees, transcripts, employment verification letters, publication lists, and award certificates.
* **Where Your Data Goes**: The legal team audits your qualifications against legal benchmarks (e.g., degree requirements, publication counts, citation percentiles) to approve an evidence checklist for drafting.

---

### Stage 2: Case Strategy & Recommendation Letters
* **What Happens Here**:
  * **Proposed Endeavor**: The legal team crafts a custom "Proposed Endeavor" (your specific work and its national impact in the U.S.). You receive this statement to review, clarify, and approve.
  * **Recommender Identification**: The legal team provides criteria for expert recommenders (independent experts, academic advisors, industry leaders, or government officials). You submit details and CVs of 3 to 5 potential recommenders.
  * **Letter Drafting & Signatures**: Legal writers draft tailored recommendation letters addressing legal standards (such as Dhanasar Prongs 1 & 2 for EB-2 NIW). You review the drafts, share them with your recommenders, and upload the final signed letters on official letterhead.
* **Where Your Data Goes**: Signed recommendation letters are stored as high-priority exhibits in your case vault and analyzed using AI summarizing tools for inclusion in your petition letter.

---

### Stage 3: Forms Preparation (USCIS Package)
* **What Happens Here**:
  * You complete a simplified, user-friendly questionnaire in your portal.
  * The software automatically transfers your personal, educational, and professional data into official USCIS petition forms (e.g., Form I-140, ETA-9089, G-1145).
  * The staff verifies all fields, addresses, and dates for compliance.
  * You receive the completed form package to review, download, and sign with blue ink where required.
* **Where Your Data Goes**: Completed and signed forms are compiled directly into the official submission binder.

---

### Stage 4: Petition Drafting & Legal Review
* **What Happens Here**:
  * A Senior Legal Drafter writes your comprehensive **Petition Memorandum** (typically 25–40 pages) detailing your extraordinary ability or national interest endeavor using legal frameworks (e.g., Dhanasar 3-Prong framework or EB-1A criteria).
  * A Senior QA Reviewer conducts a rigorous legal audit to ensure all claims are supported by exhibits.
  * You receive the draft petition for factual review to confirm that all dates, project titles, publication figures, and personal details are 100% accurate.
* **Where Your Data Goes**: Your factual feedback is incorporated into the final master petition document.

---

### Stage 5: Final Package Preparation & Shipment
* **What Happens Here**:
  * You clear any remaining service fee balance.
  * The legal team organizes your entire submission binder: Completed signed forms, cover letter, index of exhibits, petition memorandum, and indexed exhibit documents.
  * A final quality control and fee check is executed.
  * You confirm your physical shipping address.
  * The package is printed, compiled, and dispatched to the designated USCIS Service Center (Nebraska or Texas) via trackable express courier.
* **Where Your Data Goes**: The physical package goes to USCIS; digital copies are archived permanently in your Client Portal vault for your record.

---

### Stage 6: Post-Filing Tracking & Next Steps
* **What Happens Here**:
  * **Courier Tracking**: You receive your courier tracking number to monitor physical delivery to USCIS (2–5 days).
  * **Payment Authorization & Form G-1145**: USCIS charges the filing fee and sends an initial e-notification (SMS/Email) if Form G-1145 was attached.
  * **Form I-797 Receipt Notice**: Within 2 weeks to 2 months, USCIS mails official Form I-797 (Notice of Action) containing your official **Receipt Number** and **Priority Date**. You upload a photo/PDF of this notice to your portal.
  * **Online Status Tracking**: Once your receipt number is generated, live status links inside your portal allow one-click tracking on the official USCIS Online Case Status portal.

---

## 4. Section-by-Section Portal Navigation Guide for Clients

Here is a guide on how to use every tab inside the **Client Portal**:

| Portal Tab | Purpose & Features | Action Required from Client |
| :--- | :--- | :--- |
| 📊 **Overview** | Central dashboard showing current case stage, progress bar, key deadlines, and next recommended steps. | Check daily for overall status and high-level announcements. |
| 📋 **My Tasks** | Displays pending action items assigned to you (e.g., "Upload Master's Degree", "Sign Form I-140"). | Click on incomplete tasks, complete the required action, and mark as completed. |
| 📁 **Documents** | Secure vault for all uploaded files (CV, degrees, letters, exhibits, USCIS notices). | Click **Upload Document**, select category (CV, Degree, Letter, Notice), and upload PDF/images. |
| 📝 **Forms & Questionnaires** | Interactive forms for USCIS intake data and electronic signatures. | Fill out missing questionnaire sections accurately; download printable forms for blue-ink signatures. |
| 💳 **Payments** | View payment plan milestones, paid receipts, and pending invoices. | Select payment method, pay upcoming milestones, and download official payment receipts. |
| 💬 **Messages / WhatsApp** | Direct communication channel with your assigned Case Manager and Legal Writer. | Send instant messages, attach file questions, or launch WhatsApp chat for fast assistance. |
| 📅 **Appointments** | Calendar tool for scheduling strategy calls, legal consultations, or Q&A meetings. | Select an available date/time slot to book a video consultation with your legal team. |
| 📮 **Post-Filing** | Dedicated tab activated after filing to view tracking numbers, receipt notices, and USCIS updates. | Upload official USCIS notices (Form I-797, RFE notices, approval notices) as soon as you receive them. |
| ⚙️ **Settings** | Manage your personal contact details, email address, phone number, and password. | Keep your contact details updated so you never miss important notifications. |

---

## 5. How the Legal & Admin Team Processes Your Case (Behind-the-Scenes)

To ensure high approval rates, your case is handled by a team of specialists working on the **Admin Portal**:

1. **Case Manager (Admin)**: Monitors overall velocity, updates stage milestones, coordinates communication, and manages payment schedules.
2. **Petition Writer**: Synthesizes your academic and professional records, constructs your Dhanasar/EB-1A legal arguments, drafts recommendation letters, and writes the main petition memo.
3. **Senior Reviewer (QA Audit)**: Evaluates petition strength, checks citation percentiles, verifies exhibit numbering, and gives final legal signoff before filing.
4. **AI Assistant Tools**: Utilized by writers for preliminary document summarization, drafting recommender templates, and checking consistency across exhibits.

---

## 6. Frequently Asked Questions (FAQ) & Best Practices

### Q1: What should I do first after logging in for the first time?
> **Answer**: Go to the **Overview** or **My Tasks** tab. Your first steps are uploading your updated CV, signing your Engagement Agreement, and completing your profile questionnaire.

### Q2: What file formats are accepted for document uploads?
> **Answer**: PDF, DOCX, PNG, and JPG files are accepted. PDF is preferred for legal documents and signed letterheads.

### Q3: How do I know when the legal team needs something from me?
> **Answer**: Check the **My Tasks** tab on your portal. Tasks assigned to you will show status **"Awaiting Client"** with specific instructions and deadlines.

### Q4: Why do some forms require blue-ink signatures?
> **Answer**: While many portal actions use electronic signatures, USCIS requires wet (original physical) signatures in blue ink on specific immigration forms (e.g., Form I-140, Form G-28).

### Q5: What happens if USCIS sends a letter or notice to my home address?
> **Answer**: Take a clear scan or photo of every page of the notice and upload it immediately under the **Post-Filing** tab or **Documents** tab in your portal. The legal team will review it right away.

---
*Document Version: 1.0 | Created for Client Onboarding & System Flow Guidance*
