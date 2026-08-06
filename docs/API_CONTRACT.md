# API Contract Specification

This contract details all REST endpoints required to fully connect the frontend Case Management System to the database.

---

## 1. Global Specifications
* **Base URL**: `http://localhost:5000/api` (or environment-configured)
* **Headers Required (Protected Routes)**:
  ```http
  Authorization: Bearer <jwt_token>
  Content-Type: application/json
  ```
* **Common Error Format**:
  ```json
  {
    "success": false,
    "error": "Error description or validation message"
  }
  ```

---

## 2. Authentication Router (`/api/auth`)

### POST `/api/auth/login`
Authenticates a user and returns a token along with user details.

* **Payload**:
  ```json
  {
    "email": "admin@babelglobal.com",
    "password": "secure_password"
  }
  ```
* **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "token": "eyJhbGciOi...",
    "user": {
      "id": "u-admin",
      "name": "Case Administrator",
      "email": "admin@babelglobal.com",
      "role": "admin"
    }
  }
  ```

---

## 3. Clients Router (`/api/clients`)

### GET `/api/clients`
Fetches a list of all clients.

* **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "c-101",
        "name": "Dr. Elena Rostova",
        "email": "elena.rostova@quantum-labs.io",
        "phone": "+1 (555) 382-9102",
        "countryOfBirth": "Ukraine",
        "currentField": "Quantum Machine Learning",
        "highestDegree": "Ph.D.",
        "university": "MIT",
        "citationsCount": 418,
        "publicationsCount": 14,
        "patentsCount": 3,
        "status": "Active",
        "createdAt": "2025-01-10T12:00:00.000Z"
      }
    ]
  }
  ```

### POST `/api/clients`
Registers a new client.

* **Payload**:
  ```json
  {
    "name": "Carlos Mendez",
    "email": "carlos@cleanenergy.com",
    "phone": "+1 (555) 714-2289",
    "countryOfBirth": "Mexico",
    "currentField": "Smart Grid Energy Storage Integration",
    "highestDegree": "Master's",
    "university": "Stanford University",
    "citationsCount": 195,
    "publicationsCount": 8,
    "patentsCount": 2
  }
  ```
* **Success Response (201 Created)**:
  ```json
  {
    "success": true,
    "data": {
      "id": "c-102",
      "name": "Carlos Mendez",
      "email": "carlos@cleanenergy.com",
      "phone": "+1 (555) 714-2289",
      "countryOfBirth": "Mexico",
      "currentField": "Smart Grid Energy Storage Integration",
      "highestDegree": "Master's",
      "university": "Stanford University",
      "status": "Active",
      "createdAt": "2026-08-06T12:00:00.000Z"
    }
  }
  ```

---

## 4. Cases Router (`/api/cases`)

### GET `/api/cases`
Retrieves all cases under management (includes recommenders).

* **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "case-101",
        "caseNumber": "NIW-2025-089",
        "clientId": "c-101",
        "clientName": "Dr. Elena Rostova",
        "clientEmail": "elena.rostova@quantum-labs.io",
        "petitionCategory": "EB-2 NIW",
        "fieldCategory": "Quantum Machine Learning",
        "currentStage": 9,
        "assignedWriter": "Petition Drafter 1",
        "assignedReviewer": "Senior Reviewer",
        "riskLevel": "low",
        "targetFilingDate": "2025-03-20",
        "uscisServiceCenter": "Nebraska (NSC)",
        "premiumProcessing": true,
        "dhanasar": {
          "prong1": {
            "title": "Substantial Merit & National Importance",
            "endeavorSummary": "...",
            "usImpactAreas": ["..."],
            "nationalImportanceScore": 94
          },
          "prong2": { ... },
          "prong3": { ... }
        },
        "recommenders": []
      }
    ]
  }
  ```

### POST `/api/cases`
Initializes a new case folder for a client.

* **Payload**:
  ```json
  {
    "clientId": "c-101",
    "petitionCategory": "EB-2 NIW",
    "fieldCategory": "Computational Oncology",
    "assignedWriter": "Petition Drafter 1",
    "assignedReviewer": "Senior Reviewer",
    "riskLevel": "low",
    "targetFilingDate": "2026-10-15",
    "uscisServiceCenter": "Texas (TSC)",
    "premiumProcessing": true
  }
  ```
* **Success Response (201 Created)**:
  ```json
  {
    "success": true,
    "data": {
      "id": "case-102",
      "caseNumber": "NIW-2026-002",
      "clientId": "c-101",
      "currentStage": 1,
      "status": "Active"
    }
  }
  ```

### PATCH `/api/cases/:caseNumber/stage`
Updates the current stage of a case.

* **Payload**:
  ```json
  {
    "stageId": 10
  }
  ```
* **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "caseNumber": "NIW-2025-089",
      "currentStage": 10,
      "lastUpdated": "2026-08-06T12:00:00.000Z"
    }
  }
  ```

---

## 5. Documents Router (`/api/documents`)

### GET `/api/documents?caseId=<caseId>`
Fetches all documents associated with a specific case folder.

### POST `/api/documents` (Multipart Upload)
Uploads document records. File binary goes directly to Cloudinary, and metadata to MySQL.

* **Payload (Multipart Form-Data)**:
  * `caseId`: "case-101"
  * `category`: "CV" | "Degree" | "Transcript" | ...
  * `file`: [File binary]
* **Success Response (201 Created)**:
  ```json
  {
    "success": true,
    "data": {
      "id": "DOC-003",
      "caseId": "case-101",
      "name": "resume_updated.pdf",
      "category": "CV",
      "fileSize": "1.4 MB",
      "uploadedBy": "Client User",
      "uploadedAt": "2026-08-06T12:00:00.000Z",
      "status": "Pending Review",
      "fileUrl": "https://res.cloudinary.com/..."
    }
  }
  ```

---

## 6. Tasks Router (`/api/tasks`)

### GET `/api/tasks`
Gets all tasks.

### POST `/api/tasks`
Creates a new task.

* **Payload**:
  ```json
  {
    "caseId": "case-101",
    "title": "Complete Prong 1 drafting",
    "assignedRole": "writer",
    "assignedToName": "Petition Drafter 1",
    "stageId": 9,
    "dueDate": "2026-08-15",
    "priority": "high"
  }
  ```

---

## 7. AI Operations Router (`/api/ai`)

### POST `/api/ai/draft`
Connects frontend AI modal to internal assistant engines.

* **Payload**:
  ```json
  {
    "prompt": "Draft an endeavor statement for a quantum engineer.",
    "context": {
      "field": "Quantum Engineering",
      "degree": "Ph.D."
    }
  }
  ```
* **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "draft": "Dr. Rostova proposes to focus her endeavor on developing error-mitigated quantum computing algorithms..."
  }
  ```
