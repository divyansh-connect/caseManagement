# Business Rules & Workflow Logic

This document specifies the core legal frameworks, permission configurations, and algorithmic calculations that govern the Case Management System.

---

## 1. EB-2 NIW Dhanasar Framework
All cases categorized as **EB-2 NIW** must satisfy and document the three prongs established in the Matter of Dhanasar (26 I&N Dec. 884):

* **Prong 1**: The client's proposed endeavor must have both **Substantial Merit** and **National Importance**.
  * *Constraint*: The system tracks a `nationalImportanceScore` (1-100). If this falls below `70`, the system triggers a warning indicating a lack of strong evidence for federal priorities.
* **Prong 2**: The client must be **Well Positioned to Advance** the proposed endeavor.
  * *Constraint*: Tracked using indicators such as degree qualifications, citation counts, and funding.
* **Prong 3**: On balance, it would be **Beneficial to the United States to Waive** the requirements of a job offer and thus of a labor certification (PERM).

---

## 2. Workflow Stage Flow (Stages 1 - 14)
Cases progress through exactly 14 stages:

| Stage ID | Stage Name | Category | Primary Owner |
| :--- | :--- | :--- | :--- |
| **1** | Client Registration & Intake | Intake | Admin / Client |
| **2** | CV & Supporting Documents | Intake | Client |
| **3** | Qualification Evaluation | Evaluation | Admin |
| **4** | Terms & Conditions | Evaluation | Admin / Client |
| **5** | Payment | Evaluation | Client |
| **6** | Proposed Endeavor & Recommenders | Endeavor & Evidence | Writer |
| **7** | Client Feedback | Endeavor & Evidence | Client |
| **8** | Research & Evidence | Endeavor & Evidence | Writer |
| **9** | Draft Preparation | Drafting & Review | Writer |
| **10** | Client Review | Drafting & Review | Client |
| **11** | Petition Draft | Drafting & Review | Writer |
| **12** | Final Client Review | Drafting & Review | Reviewer / Client |
| **13** | Petition Package Assembly | Final Filing | Reviewer |
| **14** | Case Completion | Final Filing | Admin |

---

## 3. User Roles & Permission Matrix

| Action | Client | Writer | Reviewer | Admin | Super Admin |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Onboard Client / Create Case** | ❌ | ❌ | ❌ |  |  |
| **Write/Modify Petition Memo** | ❌ |  | ❌ |  |  |
| **Approve Petition / Stage 12 Signoff**| ❌ | ❌ |  |  |  |
| **Upload Personal Documents** |  |  |  |  |  |
| **View Audit Logs / Activity** | ❌ | ❌ | ❌ |  |  |
| **Modify Global Settings & Templates** | ❌ | ❌ | ❌ | ❌ |  |

---

## 4. Case Risk Level Evaluation Logic
The `riskLevel` of a case is initially input by the Admin but dynamically flagged based on indicators:

* **High Risk**:
  * Citation count is under `50` for research fields.
  * No advanced degree holds (no Ph.D. or Master's, and under 5 years experience).
  * Recommenders list has less than 3 confirmed expert letters.
* **Medium Risk**:
  * Citations are between `50` and `150`.
  * Minor gap in the evidence list.
* **Low Risk**:
  * Citation count exceeds `150`.
  * Holds Ph.D. from a major research university.
  * Multiple independent recommenders from national laboratories or agencies.

---

## 5. Audit Logging Triggers
An audit entry must be created immediately upon:
1. Creating a new client profile.
2. Initializing a case.
3. Advancing or reverting a case stage.
4. Uploading or status-changing a document (e.g., from `Pending Review` to `Verified`).
5. Assigning or completing tasks.
