# Developer Memory Context

This file serves as the memory map for developers extending or deploying the Case Management System.

---

## 1. System Technology Stack
* **Runtime**: Node.js & Express (TypeScript / ES Modules)
* **ORM & Database**: Prisma ORM with MySQL (hosted on Railway or local container)
* **Security**: `bcrypt` (10 rounds) + JWT Auth (`Authorization: Bearer <token>`)
* **Storage**: Cloudinary SDK for file upload streaming

---

## 2. Prisma Database Schema & Mappings
To ensure Railway MySQL compatibility, table and column maps MUST use snake_case database names to prevent Linux file system casing errors:

```prisma
datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model User {
  id        String   @id @default(uuid())
  name      String
  email     String   @unique
  password  String   @map("password_hash")
  role      String   @default("client") // superadmin, admin, writer, reviewer, client
  createdAt DateTime @default(now()) @map("created_at")

  @@map("users")
}

model Client {
  id               String   @id @default(uuid())
  name             String
  email            String   @unique
  phone            String
  countryOfBirth   String   @map("country_of_birth")
  currentField     String   @map("current_field")
  highestDegree    String   @map("highest_degree")
  university       String
  citationsCount   Int      @default(0) @map("citations_count")
  publicationsCount Int     @default(0) @map("publications_count")
  patentsCount     Int      @default(0) @map("patents_count")
  status           String   @default("Active")
  createdAt        DateTime @default(now()) @map("created_at")

  cases            Case[]

  @@map("clients")
}

model Case {
  id                 String   @id @default(uuid())
  caseNumber         String   @unique @map("case_number")
  clientId           String   @map("client_id")
  petitionCategory   String   @map("petition_category")
  fieldCategory      String   @map("field_category")
  currentStage       Int      @default(1) @map("current_stage")
  assignedWriter     String?  @map("assigned_writer")
  assignedReviewer   String?  @map("assigned_reviewer")
  riskLevel          String   @default("medium") @map("risk_level")
  targetFilingDate   String   @map("target_filing_date")
  uscisServiceCenter String   @map("uscis_service_center")
  premiumProcessing  Boolean  @default(false) @map("premium_processing")
  dhanasarProngs     Json?    @map("dhanasar_prongs")
  eb1aCriteria       Json?    @map("eb1a_criteria")
  notes              String?  @db.Text
  lastUpdated        DateTime @updatedAt @map("last_updated")

  client             Client   @relation(fields: [clientId], references: [id], onDelete: Cascade)
  documents          Document[]
  recommenders       Recommender[]

  @@map("cases")
}

model Recommender {
  id                        String   @id @default(uuid())
  caseId                    String   @map("case_id")
  name                      String
  title                     String
  organization              String
  relationship              String   // Independent Expert, Academic Advisor, etc.
  status                    String   // Identified, Outreach Sent, Letter Signed, etc.
  cvReceived                Boolean  @default(false) @map("cv_received")
  letterDraftUrl            String?  @map("letter_draft_url")
  keyContributionsMentioned Json     @map("key_contributions_mentioned")

  case                      Case     @relation(fields: [caseId], references: [id], onDelete: Cascade)

  @@map("recommenders")
}

model Document {
  id             String   @id @default(uuid())
  caseId         String   @map("case_id")
  name           String
  category       String   // CV, Degree, Transcript, etc.
  fileSize       String   @map("file_size")
  uploadedBy     String   @map("uploaded_by")
  uploadedAt     DateTime @default(now()) @map("uploaded_at")
  status         String   @default("Pending Review") // Pending Review, Verified, Needs Revision, Approved
  fileUrl        String   @map("file_url")
  cloudinaryId   String?  @map("cloudinary_id")
  aiSummary      String?  @db.Text @map("ai_summary")

  case           Case     @relation(fields: [caseId], references: [id], onDelete: Cascade)

  @@map("documents")
}

model Task {
  id             String   @id @default(uuid())
  caseId         String   @map("case_id")
  title          String
  assignedRole   String   @map("assigned_role")
  assignedToName String   @map("assigned_to_name")
  stageId        Int      @map("stage_id")
  dueDate        String   @map("due_date")
  priority       String   @default("medium") // low, medium, high, urgent
  completed      Boolean  @default(false)

  @@map("tasks")
}
```

---

## 3. Frontend to Backend Context Integration Points
When shifting the frontend from mock states to real endpoints, replace the local state variables in `AuthContext.jsx` and `CaseContext.jsx` with Axios requests following the structures defined in [API_CONTRACT.md](file:///c:/Users/Admin/Desktop/New%20folder%20(2)/caseManagement/docs/API_CONTRACT.md).
