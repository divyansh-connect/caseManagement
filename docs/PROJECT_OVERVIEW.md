# Project Overview: Case Management System

## Introduction
The Case Management System is an enterprise-grade platform tailored for law firms, legal agents, and petition writers specializing in high-value immigration cases such as **EB-2 NIW (National Interest Waiver)**, **EB-1A (Alien of Extraordinary Ability)**, and **O-1** visas. 

The system guides applicants, case writers, and reviewers step-by-step through the process of compiling petition letters, assembling supporting evidence (such as publications, citations, and patents), managing recommended expert letters, and tracking overall case progress.

---

## Target Audience & Personas
The system features a role-based workflow tailored to five distinct user personas:

1. **Super Admin**: Handles system settings, templates, payment gateways, global roles, and firm-wide auditing.
2. **Admin (Case Manager)**: Creates new clients and cases, assigns writers and reviewers, monitors case velocity, and tracks milestones.
3. **Petition Writer**: Focuses on drafting the petition, drafting recommendation letters, summarizing criteria, and structuring endeavor statements.
4. **Senior Reviewer**: Conducts audits, provides critical reviews, signs off on stages, and ensures the case package meets USCIS standards.
5. **Client (Applicant)**: Uploads core personal and academic documents, answers intake questionnaires, updates citation/publication metrics, and tracks their case status.

---

## Technology Stack
To support scalability, robust database schema constraints, and reliable hosting, the backend stack is composed of:

* **Runtime**: Node.js (TypeScript/JavaScript)
* **Framework**: Express.js
* **Database**: MySQL
* **ORM**: Prisma ORM
* **Authentication**: JSON Web Token (JWT) & bcrypt (for password hashing)
* **Media & Cloud Storage**: Cloudinary (for document and attachment management)
* **Deployment Target**: Railway (configured with MySQL snake_case mapped schema compatibility)

---

## High-Level Capabilities & Features

### 1. Dynamic Workflow Tracking
* Tracks cases through 14 distinct stages—from initial Client Intake & Agreement to Final Filing & Case Completion.
* Restricts transition of stages based on role capabilities and stage requirements.

### 2. Evidence & Criteria Profiling
* **EB-2 NIW Dhanasar Framework**: Handles inputs for Prong 1 (Substantial Merit & National Importance), Prong 2 (Well Positioned), and Prong 3 (On Balance Beneficial).
* **EB-1A Criteria Selection**: Maps criteria checklists (prizes, membership, media, judging, scholarly articles, leading roles, high salary, etc.) to assess petition strength.

### 3. Recommender Management
* Tracks outreach, CV status, drafting status, and signatures for key academic and industry recommenders.

### 4. Interactive AI Document Drafts & Summaries
* Integrates an AI Modal interface allowing writers to draft templates, summarize case information, and audit recommendation letters directly inside the dashboard.
