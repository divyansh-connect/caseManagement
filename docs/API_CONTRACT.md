# API Contract & Validation Specification

This contract details all REST endpoints and input validations required to connect the frontend Case Management System to the database.

---

## 1. Global Specifications
* **Base URL**: `http://localhost:5000/api`
* **Headers Required (Protected Routes)**:
  ```http
  Authorization: Bearer <jwt_token>
  Content-Type: application/json
  ```
* **Validation Error Format (400 Bad Request)**:
  ```json
  {
    "success": false,
    "error": "Validation Failed",
    "details": [
      {
        "field": "email",
        "message": "Invalid email address format"
      }
    ]
  }
  ```

---

## 2. Authentication Router (`/api/auth`)

### POST `/api/auth/login`
Authenticates a user and returns a token.

* **Payload & Validation Rules**:
  | Field | Type | Rules | Example |
  | :--- | :--- | :--- | :--- |
  | `email` | String | Required, valid email format, trim, lowercase | `"admin@babelglobal.com"` |
  | `password` | String | Required, minimum 6 characters | `"secure_password"` |

* **Zod Validation Schema**:
  ```typescript
  const loginSchema = z.object({
    email: z.string().trim().toLowerCase().email("Invalid email format"),
    password: z.string().min(6, "Password must be at least 6 characters")
  });
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

---

### POST `/api/clients`
Registers a new client.

* **Payload & Validation Rules**:
  | Field | Type | Rules | Example |
  | :--- | :--- | :--- | :--- |
  | `name` | String | Required, min 2 chars, max 100 | `"Carlos Mendez"` |
  | `email` | String | Required, valid email format, unique | `"carlos@cleanenergy.com"` |
  | `phone` | String | Required, valid phone pattern | `"+1 (555) 714-2289"` |
  | `countryOfBirth`| String | Required, min 2 chars | `"Mexico"` |
  | `currentField` | String | Required, min 2 chars | `"Smart Grid Energy Storage Integration"` |
  | `highestDegree` | String | Required, Enum: `Ph.D.`, `Master's`, `Bachelor's + 5 yrs`, `Exceptional Ability` | `"Master's"` |
  | `university` | String | Required, min 2 chars | `"Stanford University"` |
  | `citationsCount`| Number | Optional, integer, minimum 0 | `195` |
  | `publicationsCount`| Number | Optional, integer, minimum 0 | `8` |
  | `patentsCount` | Number | Optional, integer, minimum 0 | `2` |

* **Zod Validation Schema**:
  ```typescript
  const createClientSchema = z.object({
    name: z.string().min(2).max(100),
    email: z.string().email(),
    phone: z.string().min(5),
    countryOfBirth: z.string().min(2),
    currentField: z.string().min(2),
    highestDegree: z.enum(["Ph.D.", "Master's", "Bachelor's + 5 yrs", "Exceptional Ability"]),
    university: z.string().min(2),
    citationsCount: z.number().int().nonnegative().optional(),
    publicationsCount: z.number().int().nonnegative().optional(),
    patentsCount: z.number().int().nonnegative().optional()
  });
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
Retrieves all cases.

---

### POST `/api/cases`
Initializes a new case folder for a client.

* **Payload & Validation Rules**:
  | Field | Type | Rules | Example |
  | :--- | :--- | :--- | :--- |
  | `clientId` | String | Required, valid client UUID | `"c-101"` |
  | `petitionCategory` | String | Required, Enum: `EB-2 NIW`, `EB-1A`, `O-1`, `Resume Building`, `Mexico TR Visa` | `"EB-2 NIW"` |
  | `fieldCategory` | String | Required, min 2 chars | `"Computational Oncology"` |
  | `assignedWriter` | String | Optional, string | `"Petition Drafter 1"` |
  | `assignedReviewer`| String | Optional, string | `"Senior Reviewer"` |
  | `riskLevel` | String | Required, Enum: `low`, `medium`, `high` | `"low"` |
  | `targetFilingDate`| String | Required, ISO date string format `YYYY-MM-DD` | `"2026-10-15"` |
  | `uscisServiceCenter`| String | Required, Enum: `Nebraska (NSC)`, `Texas (TSC)` | `"Texas (TSC)"` |
  | `premiumProcessing`| Boolean| Required | `true` |

* **Zod Validation Schema**:
  ```typescript
  const createCaseSchema = z.object({
    clientId: z.string().uuid("Invalid client ID format"),
    petitionCategory: z.enum(['EB-2 NIW', 'EB-1A', 'O-1', 'Resume Building', 'Mexico TR Visa']),
    fieldCategory: z.string().min(2),
    assignedWriter: z.string().optional(),
    assignedReviewer: z.string().optional(),
    riskLevel: z.enum(['low', 'medium', 'high']),
    targetFilingDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Must be YYYY-MM-DD format"),
    uscisServiceCenter: z.enum(['Nebraska (NSC)', 'Texas (TSC)']),
    premiumProcessing: z.boolean()
  });
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

---

### PATCH `/api/cases/:caseNumber/stage`
Updates the current stage of a case.

* **Payload & Validation Rules**:
  | Field | Type | Rules | Example |
  | :--- | :--- | :--- | :--- |
  | `stageId` | Number | Required, Integer, Range: `1` to `14` | `10` |

* **Zod Validation Schema**:
  ```typescript
  const updateStageSchema = z.object({
    stageId: z.number().int().min(1).max(14)
  });
  ```

---

## 5. Documents Router (`/api/documents`)

### POST `/api/documents` (Multipart Upload)
Uploads document records.

* **Multipart Form Fields & Validation Rules**:
  | Field | Type | Rules | Example |
  | :--- | :--- | :--- | :--- |
  | `caseId` | String | Required, valid case UUID | `"case-101"` |
  | `category` | String | Required, Enum: `CV`, `Degree`, `Transcript`, `Publication`, `Citation Report`, `Recommendation Letter`, `Expert Opinion`, `Form I-140`, `ETA-9089`, `Exhibits Index` | `"CV"` |
  | `file` | File | Required, Max size 10MB, allowed types: `.pdf`, `.doc`, `.docx`, `.png`, `.jpg` | `resume.pdf` |

* **Zod Validation Schema**:
  ```typescript
  const uploadDocSchema = z.object({
    caseId: z.string().uuid(),
    category: z.enum(['CV', 'Degree', 'Transcript', 'Publication', 'Citation Report', 'Recommendation Letter', 'Expert Opinion', 'Form I-140', 'ETA-9089', 'Exhibits Index'])
  });
  ```

---

## 6. Tasks Router (`/api/tasks`)

### POST `/api/tasks`
Creates a new task.

* **Payload & Validation Rules**:
  | Field | Type | Rules | Example |
  | :--- | :--- | :--- | :--- |
  | `caseId` | String | Required, UUID | `"case-101"` |
  | `title` | String | Required, min 3 chars, max 200 | `"Complete Prong 1 drafting"` |
  | `assignedRole` | String | Required, Enum: `superadmin`, `admin`, `writer`, `reviewer`, `client` | `"writer"` |
  | `assignedToName`| String | Required, min 2 chars | `"Petition Drafter 1"` |
  | `stageId` | Number | Required, Integer, Range: `1` to `14` | `9` |
  | `dueDate` | String | Required, format `YYYY-MM-DD` | `"2026-08-15"` |
  | `priority` | String | Required, Enum: `low`, `medium`, `high`, `urgent` | `"high"` |

* **Zod Validation Schema**:
  ```typescript
  const createTaskSchema = z.object({
    caseId: z.string().uuid(),
    title: z.string().min(3).max(200),
    assignedRole: z.enum(['superadmin', 'admin', 'writer', 'reviewer', 'client']),
    assignedToName: z.string().min(2),
    stageId: z.number().int().min(1).max(14),
    dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    priority: z.enum(['low', 'medium', 'high', 'urgent'])
  });
  ```

---

## 7. AI Operations Router (`/api/ai`)

### POST `/api/ai/draft`

* **Payload & Validation Rules**:
  | Field | Type | Rules | Example |
  | :--- | :--- | :--- | :--- |
  | `prompt` | String | Required, min 5 characters | `"Draft an endeavor statement..."` |
  | `context` | Object | Required | `{ "field": "Quantum Engineering" }` |

* **Zod Validation Schema**:
  ```typescript
  const aiDraftSchema = z.object({
    prompt: z.string().min(5),
    context: z.record(z.any())
  });
  ```
