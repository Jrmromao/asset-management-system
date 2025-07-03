# Assignment-Only (Lonee) User Flow

## Overview
"Lonee" users are assignment-only users who cannot log in, but can be assigned assets, licenses, or tasks. They do not count toward active user quota. This feature supports contractors, placeholders, or employees who do not need system access but must be tracked for compliance, reporting, or assignment.

## Database Model
- Use the existing `User` model.
- For lonees:
  - `active: false`
  - `status: "REGISTERED"` (or add a new status, e.g., "LONEE")
  - `oauthId: null` (no Clerk account)
  - `roleId`: required (every user, including lonees, has a role)

## API
### Manual Creation
- Endpoint: `POST /api/users/create-lonee`
- Payload:
  ```json
  {
    "name": "Jane Doe",
    "email": "jane@example.com",
    "roleId": "...",
    "departmentId": "..."
  }
  ```
- Backend logic:
  - Create user with `active: false`, `status: "REGISTERED"`, no `oauthId`, and the given `roleId`.

### CSV Import
- Allow bulk import of lonees via CSV.
- Required columns: Name, Email, Role (maps to `roleId`), Department (optional).
- For each row, create a user as above.

## UI/UX
- **Create Assignment-Only User:**
  - Add a button/form in the user management UI.
  - Fields: Name, Email, Role (dropdown), Department (optional).
- **Import Users:**
  - Add an "Import Assignment-Only Users" tool (CSV upload).
- **Assignment Dropdowns:**
  - Show lonees in asset/license assignment dropdowns, with a badge or label (e.g., "Assignment Only").
- **User List:**
  - Indicate login-enabled vs. assignment-only users.
  - Allow filtering by user type.
- **Role Assignment:**
  - Role is required for all users, including lonees.

## Upgrade Path
- Allow lonees to be "upgraded" to login-enabled users:
  - Admin can send an invite, which sets `active: true`, `status: "INVITED"`, and triggers the normal registration flow.
  - On completion, user is counted toward quota and can log in.

## Quota Logic
- Only users with `active: true` and `status: "ACTIVE"` count toward the active user quota.
- Lonees do not count toward quota.

## Extensibility
- Support syncing lonees from HR systems in the future.
- Allow custom fields for lonees (e.g., badge number, contract dates).

---

**This spec is ready for engineering and design.** 