# Backend Architecture Specification

This document details the backend architectural design, folder structure, database patterns, and integration guidelines for the Case Management System.

---

## 1. Directory Structure
The backend follows a clean, layered architecture separating routing, controller logic, business service layers, and database access.

```text
Backend/
├── prisma/
│   └── schema.prisma         # Prisma ORM schema (mapped to MySQL snake_case)
├── src/
│   ├── config/
│   │   ├── cloudinary.ts     # Cloudinary configuration
│   │   ├── db.ts             # Prisma client initialization
│   │   └── env.ts            # Environment variables verification
│   ├── controllers/
│   │   ├── authController.ts # Logins, session handling, token validation
│   │   ├── caseController.ts # Case CRUD, stage updates, Dhanasar specs
│   │   ├── docController.ts  # Document upload metadata and Cloudinary URLs
│   │   └── clientController.ts # Client profiles, onboarding info
│   ├── middleware/
│   │   ├── authMiddleware.ts # JWT verification & User extraction
│   │   ├── roleMiddleware.ts # Role-based access control checking (RBAC)
│   │   └── uploadMiddleware.ts # Multer middleware for file parses
│   ├── routes/
│   │   ├── authRoutes.ts
│   │   ├── caseRoutes.ts
│   │   ├── clientRoutes.ts
│   │   └── docRoutes.ts
│   ├── services/
│   │   ├── authService.ts    # Hashing, token signing, session checks
│   │   ├── caseService.ts    # Prong evaluations, status transitions
│   │   ├── cloudinaryService.ts # Direct upload/download streams to Cloudinary
│   │   └── clientService.ts  # Validation and record persistence
│   ├── types/
│   │   └── index.ts          # Express Request modifications & core types
│   └── app.ts                # Express application bootstrap & global handlers
├── .env                      # Database URLs and Cloudinary credentials
├── package.json
└── tsconfig.json
```

---

## 2. Layered Responsibilities

### Routing Layer (`/routes`)
* Defines API endpoints.
* Applies rate limiters, validation schemas (e.g., Zod), and authentication/RBAC middleware.
* Does not contain business logic.

### Controller Layer (`/controllers`)
* Orchestrates incoming HTTP requests.
* Extracts params, headers, and payloads.
* Delegates processing to the Service Layer.
* Returns appropriate standard JSON responses and HTTP status codes.

### Service Layer (`/services`)
* Houses core business logic and computational logic.
* Interacts with Prisma client (Repository Layer) to persist or query data.
* Interacts with external services (Cloudinary API, AI models).

---

## 3. Database Mapping Rules (Railway & MySQL Case Sensitivity)
Railway hosts databases on Linux containers where MySQL table/field naming conventions are case-sensitive by default (`lower_snake_case`). To avoid cross-environment name mismatch errors (Windows/macOS vs. Linux):

1. **Always** map model names to pluralized lower_snake_case tables using `@@map("table_name")`.
2. **Always** map fields to lower_snake_case using `@map("field_name")`.
3. Example Prisma schema definition:

```prisma
model User {
  id        String   @id @default(uuid())
  email     String   @unique
  password  String   @map("password_hash")
  role      String   @default("client")
  createdAt DateTime @default(now()) @map("created_at")

  @@map("users")
}
```

---

## 4. Authentication Flow (JWT & Bcrypt)
1. **Password Hashing**: When registering or updating users, passwords must be hashed using `bcrypt.hash()` with a salt factor of `10`.
2. **Token Generation**: On successful login, the server issues a JWT signed with a high-entropy secret (`JWT_SECRET`).
3. **Payload Structure**:
   ```json
   {
     "id": "user-uuid-123",
     "email": "user@domain.com",
     "role": "writer"
   }
   ```
4. **Token verification**: Handled by `authMiddleware.ts` checking the `Authorization: Bearer <token>` header. It attaches the decoded payload to `req.user`.

---

## 5. File Uploads via Cloudinary
* For supporting documents (CVs, Publications, Recommendation Letters), the backend utilizes `multer` to handle multipart file parsing.
* A dedicated `cloudinaryService` uploads incoming files directly to Cloudinary storage.
* The API stores the generated secure URL (`secure_url`), file size, and Cloudinary public ID (`public_id`) inside the MySQL database mapped to the respective `CaseDocument` record.
