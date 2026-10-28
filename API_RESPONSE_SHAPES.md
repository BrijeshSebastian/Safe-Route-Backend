# SafeRoute Backend — Definitive API Response Shapes & Client Integration Reference

> **Document Status:** Complete & Verified against Live Code and Runtime Execution  
> **Target Audience:** React Frontend Engineering Team  
> **Execution Scope:** 62 of 62 endpoints live-executed against running server (`Node.js v20+`, `Express 4.21`, `Sequelize 6.37`, `MySQL 8.4`).  
> **Source of Truth:** Route definitions, controllers, services, repositories, and Sequelize models under `src/`.

---

## Table of Contents

1. [Global Response & Pagination Architecture](#1-global-response--pagination-architecture)
   - [Envelope Design Principles](#envelope-design-principles)
   - [Paginated Responses: Root `meta` & Direct Array `data`](#paginated-responses-root-meta--direct-array-data)
   - [Non-Paginated List Responses](#non-paginated-list-responses)
   - [Single Resource Responses](#single-resource-responses)
   - [Action / Mutation Responses Without Data](#action--mutation-responses-without-data)
2. [Data Formats, Serialization Nuances & Type Quirks](#2-data-formats-serialization-nuances--type-quirks)
   - [Timestamps (`createdAt` vs `updatedAt`)](#timestamps-createdat-vs-updatedat)
   - [Numbers vs Strings (DECIMAL Coordinates & SQL Aggregate Counts)](#numbers-vs-strings-decimal-coordinates--sql-aggregate-counts)
   - [Boolean Query Parsing (`is_active`, `is_read`)](#boolean-query-parsing-is_active-is_read)
   - [Canonical Enums Reference](#canonical-enums-reference)
   - [Privacy Redaction & Contact Information Rules](#privacy-redaction--contact-information-rules)
3. [Complete Error Response Catalog](#3-complete-error-response-catalog)
   - [400 Bad Request](#400-bad-request)
   - [401 Unauthorized (Missing, Invalid, Expired, Revoked, Reused Tokens)](#401-unauthorized)
   - [403 Forbidden (Role Restrictions & Unauthorized Incident Access)](#403-forbidden)
   - [404 Not Found (Missing Routes & Unmatched Entities)](#404-not-found)
   - [409 Conflict (Duplicate Email / Phone)](#409-conflict)
   - [422 Unprocessable Entity (Zod Validation Failure)](#422-unprocessable-entity)
   - [429 Too Many Requests (Rate Limiter Hit)](#429-too-many-requests)
   - [500 Internal Server Error](#500-internal-server-error)
4. [Module 1: System & Health (`HLTH`)](#module-1-system--health)
   - [GET /api/v1/health](#get-apiv1health)
5. [Module 2: Authentication & Password Recovery (`AUTH`)](#module-2-authentication--password-recovery)
   - [POST /api/v1/auth/register](#post-apiv1authregister)
   - [POST /api/v1/auth/login](#post-apiv1authlogin)
   - [POST /api/v1/auth/refresh-token](#post-apiv1authrefresh-token)
   - [POST /api/v1/auth/logout](#post-apiv1authlogout)
   - [POST /api/v1/auth/forgot-password](#post-apiv1authforgot-password)
   - [POST /api/v1/auth/reset-password](#post-apiv1authreset-password)
   - [POST /api/v1/auth/change-password](#post-apiv1authchange-password)
6. [Module 3: Incident Management (`INC`)](#module-3-incident-management)
   - [POST /api/v1/incidents](#post-apiv1incidents)
   - [POST /api/v1/incidents/:id/images](#post-apiv1incidentsidimages)
   - [GET /api/v1/incidents/my](#get-apiv1incidentsmy)
   - [PATCH /api/v1/incidents/:id/cancel](#patch-apiv1incidentsidcancel)
   - [PUT /api/v1/incidents/:id](#put-apiv1incidentsid)
   - [DELETE /api/v1/incidents/:id](#delete-apiv1incidentsid)
   - [GET /api/v1/incidents/search](#get-apiv1incidentssearch)
   - [GET /api/v1/incidents/nearby](#get-apiv1incidentsnearby)
   - [GET /api/v1/incidents/:id/responder-location](#get-apiv1incidentsidresponder-location)
   - [GET /api/v1/incidents/:id/status-history](#get-apiv1incidentsidstatus-history)
   - [GET /api/v1/incidents/:id](#get-apiv1incidentsid)
7. [Module 4: Responder Dispatch & Operations (`RESP`)](#module-4-responder-dispatch--operations)
   - [GET /api/v1/responders/dashboard](#get-apiv1respondersdashboard)
   - [GET /api/v1/responders/incidents](#get-apiv1respondersincidents)
   - [GET /api/v1/responders/incidents/completed](#get-apiv1respondersincidentscompleted)
   - [GET /api/v1/responders/incidents/:id](#get-apiv1respondersincidentsid)
   - [PATCH /api/v1/responders/incidents/:id/accept](#patch-apiv1respondersincidentsidaccept)
   - [PATCH /api/v1/responders/incidents/:id/reject](#patch-apiv1respondersincidentsidreject)
   - [PATCH /api/v1/responders/incidents/:id/start-travel](#patch-apiv1respondersincidentsidstart-travel)
   - [PATCH /api/v1/responders/incidents/:id/arrived](#patch-apiv1respondersincidentsidarrived)
   - [PATCH /api/v1/responders/incidents/:id/resolve](#patch-apiv1respondersincidentsidresolve)
   - [POST /api/v1/responders/location](#post-apiv1responderslocation)
   - [GET /api/v1/responders/notifications](#get-apiv1respondersnotifications)
   - [PATCH /api/v1/responders/notifications/:notificationId/read](#patch-apiv1respondersnotificationsnotificationidread)
8. [Module 5: Administration & Analytics (`ADM`)](#module-5-administration--analytics)
   - [GET /api/v1/admin/dashboard](#get-apiv1admindashboard)
   - [GET /api/v1/admin/analytics](#get-apiv1adminanalytics)
   - [GET /api/v1/admin/reports/monthly](#get-apiv1adminreportsmonthly)
   - [GET /api/v1/admin/incidents](#get-apiv1adminincidents)
   - [GET /api/v1/admin/incidents/:id](#get-apiv1adminincidentsid)
   - [PATCH /api/v1/admin/incidents/:id/verify](#patch-apiv1adminincidentsidverify)
   - [PATCH /api/v1/admin/incidents/:id/reject](#patch-apiv1adminincidentsidreject)
   - [POST /api/v1/admin/incidents/:id/assign](#post-apiv1adminincidentsidassign)
   - [POST /api/v1/admin/incidents/:id/reassign](#post-apiv1adminincidentsidreassign)
   - [DELETE /api/v1/admin/assignments/:id](#delete-apiv1adminassignmentsid)
   - [GET /api/v1/admin/responders/available](#get-apiv1adminrespondersavailable)
   - [POST /api/v1/admin/responders](#post-apiv1adminresponders)
   - [GET /api/v1/admin/users](#get-apiv1adminusers)
   - [GET /api/v1/admin/users/:id](#get-apiv1adminusersid)
   - [PUT /api/v1/admin/users/:id](#put-apiv1adminusersid)
   - [PATCH /api/v1/admin/users/:id/disable](#patch-apiv1adminusersiddisable)
   - [GET /api/v1/admin/notifications](#get-apiv1adminnotifications)
   - [PATCH /api/v1/admin/notifications/:notificationId/read](#patch-apiv1adminnotificationsnotificationidread)
9. [Module 6: User Profile & Account Management (`USR`)](#module-6-user-profile--account-management)
   - [GET /api/v1/users/profile](#get-apiv1usersprofile)
   - [PUT /api/v1/users/profile](#put-apiv1usersprofile)
   - [POST /api/v1/users/profile/image](#post-apiv1usersprofileimage)
   - [DELETE /api/v1/users/profile/image](#delete-apiv1usersprofileimage)
   - [POST /api/v1/users/change-password](#post-apiv1userschange-password)
   - [DELETE /api/v1/users/account](#delete-apiv1usersaccount)
   - [POST /api/v1/users/logout-all](#post-apiv1userslogout-all)
10. [Module 7: Notifications (`NOTIF`)](#module-7-notifications)
    - [GET /api/v1/notifications](#get-apiv1notifications)
    - [GET /api/v1/notifications/:id](#get-apiv1notificationsid)
    - [PATCH /api/v1/notifications/:id/read](#patch-apiv1notificationsidread)
    - [PATCH /api/v1/notifications/read-all](#patch-apiv1notificationsread-all)
    - [DELETE /api/v1/notifications/:id](#delete-apiv1notificationsid)
11. [Module 8: Secured File Delivery (`FILE`)](#module-8-secured-file-delivery)
    - [GET /api/v1/files/:filename](#get-apiv1filesfilename)
12. [Doc Mismatches Found](#12-doc-mismatches-found)

---

## 1. Global Response & Pagination Architecture

Every JSON response from the SafeRoute backend originates from helper functions defined in `src/utils/response.js`:
- `sendSuccess(res, statusCode, message, data, meta)`
- `sendError(res, statusCode, message, errors, errorCode)`

### Envelope Design Principles

1. All responses include top-level boolean `"success"`: `true` for 2xx responses, `false` for 4xx/5xx responses.
2. All responses include a descriptive top-level string `"message"`.
3. When `data === null`, the `"data"` field is **omitted entirely** (not returned as `null`).
4. When `meta === null`, the `"meta"` field is **omitted entirely**.
5. When `errors === null`, the `"errors"` field is **omitted entirely**.
6. When `errorCode === null`, the `"errorCode"` field is **omitted entirely**.

---

### Paginated Responses: Root `meta` & Direct Array `data`

In **all** paginated endpoints:
- `data` is a **direct JSON Array** (`[...]`) of items. It is **never** wrapped in an object like `{ items: [...] }`.
- `meta` is placed at the **root level** of the response (a sibling to `success`, `message`, and `data`). It is **never** nested under `meta.pagination`.
- Inside `meta`, pagination attributes are flattened directly:

```json
{
  "success": true,
  "message": "Incidents retrieved",
  "data": [
    { "id": 1, "title": "Example Incident" }
  ],
  "meta": {
    "totalItems": 45,
    "totalPages": 5,
    "currentPage": 1,
    "itemsPerPage": 10
  }
}
```

#### Affected Paginated Endpoints (Exact Match):
1. `GET /api/v1/incidents/my` (`data: Incident[]`)
2. `GET /api/v1/incidents/search` (`data: Incident[]`)
3. `GET /api/v1/admin/incidents` (`data: Incident[]`)
4. `GET /api/v1/admin/users` (`data: User[]`)
5. `GET /api/v1/responders/incidents` (`data: Assignment[]`)
6. `GET /api/v1/responders/incidents/completed` (`data: Assignment[]`)
7. `GET /api/v1/notifications` (`data: Notification[]`)
8. `GET /api/v1/admin/notifications` (`data: Notification[]`)
9. `GET /api/v1/responders/notifications` (`data: Notification[]`)

---

### Non-Paginated List Responses

Endpoints returning complete unpaginated lists wrap the array inside `data` under a named plural key:

| Endpoint Path | Method | `data` Wrapper Key | Array Item Type |
|---|---|---|---|
| `/api/v1/incidents/nearby` | `GET` | `data: { incidents: [...] }` | Raw incident row + `distance` (float) |
| `/api/v1/incidents/:id/status-history` | `GET` | `data: { history: [...] }` | `IncidentStatusHistory` object |
| `/api/v1/admin/responders/available` | `GET` | `data: { responders: [...] }` | Sanitized `User` object (`responder_type`, coordinates, `last_location_at`) |

---

### Single Resource Responses

Endpoints returning an individual record wrap the object inside `data` under a named singular key:

| Domain | Endpoint Pattern | `data` Wrapping Key | Key Schema |
|---|---|---|---|
| Incidents | `POST /incidents`, `PUT /incidents/:id`, `GET /incidents/:id`, `PATCH /incidents/:id/cancel`, `POST /incidents/:id/images`, `PATCH /admin/incidents/:id/verify`, `PATCH /admin/incidents/:id/reject`, `PATCH /responders/incidents/:id/start-travel`, `PATCH /responders/incidents/:id/arrived`, `PATCH /responders/incidents/:id/resolve` | `data: { incident: {...} }` | `Incident` object |
| Assignments | `POST /admin/incidents/:id/assign`, `POST /admin/incidents/:id/reassign`, `DELETE /admin/assignments/:id`, `GET /responders/incidents/:id`, `PATCH /responders/incidents/:id/accept`, `PATCH /responders/incidents/:id/reject` | `data: { assignment: {...} }` | `IncidentAssignment` object |
| Users | `GET /users/profile`, `PUT /users/profile`, `POST /users/profile/image`, `DELETE /users/profile/image`, `GET /admin/users/:id`, `PUT /admin/users/:id`, `PATCH /admin/users/:id/disable` | `data: { user: {...} }` | `User` object (passwords excluded) |
| Admin Responder | `POST /admin/responders` | `data: { responder: {...} }` | `User` object (passwords excluded) |
| Notifications | `GET /notifications/:id`, `PATCH /notifications/:id/read`, `PATCH /admin/notifications/:id/read`, `PATCH /responders/notifications/:id/read` | `data: { notification: {...} }` | `Notification` object |
| Dashboard | `GET /admin/dashboard`, `GET /responders/dashboard` | `data: { dashboard: {...} }` | Custom dashboard summary object |
| Analytics | `GET /admin/analytics` | `data: { analytics: {...} }` | Grouped breakdown metrics |
| Reports | `GET /admin/reports/monthly` | `data: { report: {...} }` | Monthly incident count summary |
| Location | `GET /incidents/:id/responder-location` | `data: { location: {...} \| null }` | Coordinates & metadata, or `null` |

---

### Action / Mutation Responses Without Data

State transitions or commands that return only a success confirmation produce an envelope where `"data"` is omitted:

```json
{
  "success": true,
  "message": "Operation confirmation message"
}
```

#### Endpoints with No `data` Field in 200 Response:
1. `GET /api/v1/health`
2. `POST /api/v1/auth/logout`
3. `POST /api/v1/auth/forgot-password`
4. `POST /api/v1/auth/reset-password`
5. `POST /api/v1/auth/change-password`
6. `DELETE /api/v1/incidents/:id`
7. `POST /api/v1/responders/location`
8. `POST /api/v1/users/change-password`
9. `DELETE /api/v1/users/account`
10. `POST /api/v1/users/logout-all`
11. `PATCH /api/v1/notifications/read-all`
12. `DELETE /api/v1/notifications/:id`

---

## 2. Data Formats, Serialization Nuances & Type Quirks

### Timestamps (`createdAt` vs `updatedAt`)

> [!IMPORTANT]
> **Sequelize Default Timestamp Casing is `createdAt` and `updatedAt` (camelCase).**  
> Even though database columns are defined or created by Sequelize, JSON responses return `createdAt` and `updatedAt`. Frontend components must NOT look for `created_at` or `updated_at` on model instances.
> 
> *Exceptions:*
> - Telemetry timestamp `last_location_at` is an explicit model column: it returns as snake_case `"last_location_at"`.
> - Haversine query (`GET /incidents/nearby`) runs raw SQL against `incidents`: it returns snake_case `"created_at"` and `"updated_at"`.
> - In `GET /incidents/:id/responder-location`, the location update time is returned as `"updated_at"`.

---

### Numbers vs Strings (DECIMAL Coordinates & SQL Aggregate Counts)

Because MySQL driver (`mysql2`) and Sequelize treat `DECIMAL` and SQL aggregation expressions as high-precision types, several numeric fields are serialized as **strings**:

1. **Latitude and Longitude on Incidents and Users:**
   - On `Incident` instances (`incident.latitude`, `incident.longitude`): Returned as **strings** (e.g., `"12.97159800"`, `"77.59456200"`).
   - On `User` instances (`user.last_known_latitude`, `user.last_known_longitude`): Returned as **strings** (e.g., `"12.97160000"`).
   - **Exception:** `GET /api/v1/incidents/:id/responder-location` explicitly wraps coordinates with `Number()` in `src/services/incident.service.js:184-185`, returning pure JSON numbers (`12.9716`, `77.5946`).
2. **Monthly Report SQL Aggregates (`GET /admin/reports/monthly`):**
   - `total_incidents`: Returned as a **number** (`24`) because `COUNT(*)` yields integer.
   - `resolved`, `pending`, `critical_count`: Returned as **strings** (`"7"`, `"3"`, `"6"`) because `SUM(CASE WHEN ...)` yields MySQL DECIMAL.
3. **Platform Analytics (`GET /admin/analytics`):**
   - All `count` fields inside `incidentsByType`, `incidentsBySeverity`, `incidentsByStatus`, and `monthlyTrend` are returned as **numbers** (e.g., `16`, `9`).
4. **Nearby Incident Distance (`GET /incidents/nearby`):**
   - `distance` is computed in kilometers by Haversine formula and returned as a **number** (float, e.g., `0` or `1.42589`).

---

### Boolean Query Parsing (`is_active`, `is_read`)

Filter query parameters are evaluated using strict string equality in service layers:
- `adminService.getAllUsers`: `isActive: is_active !== undefined ? is_active === 'true' : undefined`
- `notificationService.getNotifications`: `isRead: is_read !== undefined ? is_read === 'true' : undefined`

> [!WARNING]
> Use `?is_active=true` and `?is_active=false`. Passing integer values `?is_active=1` or `?is_active=0` will evaluate `1 === 'true'` as **false**, corrupting the filter.
> The same applies to `?is_read=true` and `?is_read=false`.

---

### Canonical Enums Reference

The values below are the exact runtime values exported from `src/constants/*.js`:

#### User Roles (`src/constants/roles.js`)
- `"reporter"`
- `"responder"`
- `"admin"`

#### Responder Types (`src/constants/responderTypes.js`)
- `"ambulance"`
- `"police"`
- `"fire"`

#### Incident Types (`src/constants/incidentTypes.js`)
- `"road_accident"`
- `"fire"`
- `"medical_emergency"` *(Note: NOT `"medical"`)*
- `"flood"`
- `"earthquake"`
- `"crime"`
- `"gas_leak"`
- `"electrical_hazard"`
- `"other"`

#### Incident Severity (`src/models/incident.model.js`)
- `"low"`
- `"medium"` (Default)
- `"high"`
- `"critical"`

#### Incident Status Lifecycle (`src/constants/incidentStatus.js`)
- `"pending"` — Initially reported by citizen
- `"verified"` — Verified by dispatcher
- `"assigned"` — Dispatched to a responder
- `"accepted"` — Responder accepted the call
- `"on_the_way"` — Responder en route to scene
- `"reached"` — Responder arrived on scene
- `"resolved"` — Responder completed emergency service
- `"rejected"` — Admin rejected bogus/duplicate report
- `"cancelled"` — Citizen cancelled before assignment

#### Assignment Status Lifecycle (`src/constants/assignmentStatus.js`)
- `"assigned"` — Offered to responder, awaiting action
- `"accepted"` — Responder agreed to handle
- `"rejected"` — Responder declined or admin cancelled/reassigned
- `"completed"` — Successfully handled and resolved

#### Notification Types (`src/constants/notificationTypes.js`)
- `"new_incident_reported"` — Sent to active admins when reporter submits an incident (`reference_id = incident.id`)
- `"incident_verified"` — Sent to reporter when admin verifies incident (`reference_id = incident.id`)
- `"incident_rejected"` — Sent to reporter when admin rejects incident (`reference_id = incident.id`)
- `"incident_assigned"` — Sent to responder and reporter when assigned (`reference_id = incident.id`)
- `"incident_accepted"` — Sent to reporter when responder accepts (`reference_id = incident.id`)
- `"incident_on_the_way"` — Sent to reporter when responder begins travel (`reference_id = incident.id`)
- `"incident_reached"` — Sent to reporter when responder arrives (`reference_id = incident.id`)
- `"incident_resolved"` — Sent to reporter when responder resolves incident (`reference_id = incident.id`)
- `"assignment_rejected"` — Sent to admins when responder declines assignment (`reference_id = incident.id`)
*(Unused types in constant: `incident_created`, `incident_cancelled`, `responder_reassigned`)*

> [!NOTE]
> For **every single notification** generated in the SafeRoute platform, `reference_id` is the **incident ID**. It is never an assignment ID.

---

### Privacy Redaction & Contact Information Rules

Redaction is strictly applied by `IncidentService.serializeIncident()` and `ResponderService.serializeAssignment()`:

1. **Reporter Contact Info:**
   - **For Admins:** Both `email` and `phone` are **always visible**.
   - **For Other Reporters:** Never visible.
   - **For Assigned Responders:**
     - `email`: **Always redacted** (deleted from payload).
     - `phone`: **Included ONLY IF** the requesting user is the assigned responder AND the assignment is in `"accepted"` status. If status is merely `"assigned"`, `"rejected"`, or `"completed"`, `phone` is deleted.
2. **Responder Contact Info:**
   - **For Admins:** Both `email` and `phone` are **always visible**.
   - **For Reporters:** `email` and `phone` are **always redacted**. Reporters see only `id`, `full_name`, and `responder_type`.
3. **Responder Location Privacy:**
   - `GET /incidents/:id/responder-location` returns only `{ id, full_name, responder_type }` of the responder alongside coordinates. It **never** returns email or phone.
   - A reporter from another incident receives HTTP 403 (`INCIDENT_003`).

---

## 3. Complete Error Response Catalog

All error responses share the envelope:
```json
{
  "success": false,
  "message": "<Descriptive Error Message>",
  "errors": "<Optional validation details array>",
  "errorCode": "<Optional system error code>"
}
```

### 400 Bad Request
Occurs when an action violates business rules (e.g. invalid state transition, updating a non-pending incident) or multer file limits.
```json
{
  "success": false,
  "message": "Only pending incidents can be verified",
  "errorCode": "INCIDENT_002"
}
```
*Multer file limit example:*
```json
{
  "success": false,
  "message": "File size exceeds the limit"
}
```

---

### 401 Unauthorized

#### A. Missing Token
Request made to protected route without `Authorization: Bearer <token>` header:
```json
{
  "success": false,
  "message": "Access token is required"
}
```
*(No `errorCode`).*

#### B. Invalid Token Signature or Malformed JWT
```json
{
  "success": false,
  "message": "Invalid access token"
}
```
*(No `errorCode`).*

#### C. Expired Access Token
JWT expiry timestamp (`exp`) has passed:
```json
{
  "success": false,
  "message": "Access token expired"
}
```
*(No `errorCode`).*

#### D. Revoked Access Token
Occurs when `user.updated_at > decoded.iat * 1000` (e.g., user updated profile or password):
```json
{
  "success": false,
  "message": "Access token has been revoked"
}
```
*(No `errorCode`).*

#### E. Invalid or Reused Refresh Token (`POST /auth/refresh-token`)
Occurs when an already-rotated or bogus refresh token is submitted:
```json
{
  "success": false,
  "message": "Invalid refresh token",
  "errorCode": "AUTH_002"
}
```

#### F. Invalid Login Credentials (`POST /auth/login`)
```json
{
  "success": false,
  "message": "Invalid credentials",
  "errorCode": "AUTH_001"
}
```

---

### 403 Forbidden

#### A. Role Authorization Failure (Role Middleware)
User does not possess the required role (e.g. `reporter` accessing an `/admin` endpoint):
```json
{
  "success": false,
  "message": "You do not have permission to access this resource"
}
```
*(No `errorCode`).*

#### B. Deactivated Account
```json
{
  "success": false,
  "message": "Account is deactivated"
}
```
*(No `errorCode`).*

#### C. Incident Ownership Scoping Failure
Reporter attempting to access or modify another reporter's incident:
```json
{
  "success": false,
  "message": "Unauthorized",
  "errorCode": "INCIDENT_003"
}
```

---

### 404 Not Found

#### A. Unmapped Route
Path does not match any registered endpoint:
```json
{
  "success": false,
  "message": "Route /api/v1/unknown-path not found"
}
```
*(No `errorCode`).*

#### B. Entity Not Found in Database
```json
{
  "success": false,
  "message": "Incident not found",
  "errorCode": "INCIDENT_001"
}
```
*User not found:*
```json
{
  "success": false,
  "message": "User not found",
  "errorCode": "USER_001"
}
```
*Assignment not found:*
```json
{
  "success": false,
  "message": "Assignment not found",
  "errorCode": "ASSIGNMENT_001"
}
```

---

### 409 Conflict
Occurs when trying to register or update with an email or phone that already exists:
```json
{
  "success": false,
  "message": "Email already registered",
  "errorCode": "USER_002"
}
```
*Duplicate phone:*
```json
{
  "success": false,
  "message": "Phone number already registered",
  "errorCode": "USER_002"
}
```

---

### 422 Unprocessable Entity
Occurs when Zod request validation fails on body, query string, or params:
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "full_name",
      "message": "String must contain at least 2 character(s)"
    },
    {
      "field": "email",
      "message": "Required"
    }
  ],
  "errorCode": "VALIDATION_001"
}
```

---

### 429 Too Many Requests
Returned when client IP exceeds rate limit threshold (`RATE_LIMIT_MAX` on global limiter or `AUTH_RATE_LIMIT_MAX` on auth limiter):
```json
{
  "success": false,
  "message": "Too many requests, please try again later."
}
```
*(No `errorCode` or `errors`).*

---

### 500 Internal Server Error
Unhandled server exception:
```json
{
  "success": false,
  "message": "Internal Server Error"
}
```

---

## Module 1: System & Health

### GET `/api/v1/health`
- **Execution Status:** Live Executed
- **Role Needed:** Public (No authentication)
- **Request Parameters:** None
- **Response Shape (HTTP 200):**
```json
{
  "success": true,
  "message": "SafeRoute API is running",
  "timestamp": "2026-10-22T06:59:38.257Z"
}
```

---

## Module 2: Authentication & Password Recovery

### POST `/api/v1/auth/register`
- **Execution Status:** Live Executed
- **Role Needed:** Public (Rate limited)
- **Request Body (Strict Mode):**
  - `full_name`: string (min 2, max 100)
  - `email`: string (valid email format)
  - `phone`: string (min 10, max 20)
  - `password`: string (min 12, max 128)
- **Response Shape (HTTP 201):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": 29,
      "full_name": "Test Auto Reporter",
      "email": "test_reporter_1792652378624@example.com",
      "phone": "9852378624",
      "role": "reporter",
      "is_active": true,
      "updatedAt": "2026-10-22T06:59:38.644Z",
      "createdAt": "2026-10-22T06:59:38.644Z"
    }
  }
}
```

---

### POST `/api/v1/auth/login`
- **Execution Status:** Live Executed
- **Role Needed:** Public (Rate limited)
- **Request Body (Strict Mode):**
  - `email`: string (valid email)
  - `password`: string (min 1, max 128)
- **Response Shape (HTTP 200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": 29,
      "full_name": "Test Auto Reporter",
      "email": "test_reporter_1792652378624@example.com",
      "phone": "9852378624",
      "role": "reporter",
      "responder_type": null,
      "profile_image": null,
      "is_active": true,
      "last_known_latitude": null,
      "last_known_longitude": null,
      "last_location_at": null,
      "createdAt": "2026-10-22T06:59:38.000Z",
      "updatedAt": "2026-10-22T06:59:38.000Z"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

### POST `/api/v1/auth/refresh-token`
- **Execution Status:** Live Executed
- **Role Needed:** Public
- **Request Body (Strict Mode):**
  - `refreshToken`: string (min 1)
- **Response Shape (HTTP 200):**
```json
{
  "success": true,
  "message": "Tokens refreshed",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```
*Replay Attack / Already Used Refresh Token:* Re-submitting a rotated refresh token after >1 second results in **HTTP 401** `{"success": false, "message": "Invalid refresh token", "errorCode": "AUTH_002"}`.

---

### POST `/api/v1/auth/logout`
- **Execution Status:** Live Executed
- **Role Needed:** Public
- **Request Body:**
  - `refreshToken`: string (optional)
- **Response Shape (HTTP 200):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

### POST `/api/v1/auth/forgot-password`
- **Execution Status:** Live Executed
- **Role Needed:** Public (Rate limited)
- **Request Body (Strict Mode):**
  - `email`: string (valid email)
- **Response Shape (HTTP 200):**
```json
{
  "success": true,
  "message": "If the email exists, a reset link has been sent."
}
```

---

### POST `/api/v1/auth/reset-password`
- **Execution Status:** Live Executed
- **Role Needed:** Public (Rate limited)
- **Request Body (Strict Mode):**
  - `token`: string (min 1)
  - `newPassword`: string (min 12, max 128)
- **Response Shape (HTTP 200):**
```json
{
  "success": true,
  "message": "Password reset successfully"
}
```

---

### POST `/api/v1/auth/change-password`
- **Execution Status:** Live Executed
- **Role Needed:** Any Authenticated User
- **Request Body (Strict Mode):**
  - `currentPassword`: string (min 1)
  - `newPassword`: string (min 12, max 128)
- **Response Shape (HTTP 200):**
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

---

## Module 3: Incident Management

### POST `/api/v1/incidents`
- **Execution Status:** Live Executed
- **Role Needed:** `reporter`
- **Request Body:**
  - `title`: string (min 5, max 200)
  - `description`: string (min 10)
  - `incident_type`: enum (`road_accident`, `fire`, `medical_emergency`, `flood`, `earthquake`, `crime`, `gas_leak`, `electrical_hazard`, `other`)
  - `severity`: enum optional (`low`, `medium`, `high`, `critical`)
  - `latitude`: number (-90 to 90)
  - `longitude`: number (-180 to 180)
  - `address`: string optional (max 500)
- **Response Shape (HTTP 201):**
```json
{
  "success": true,
  "message": "Incident created successfully",
  "data": {
    "incident": {
      "id": 32,
      "title": "Traffic Collision on 8th Cross",
      "description": "Two cars collided near the traffic junction, blocking lane 2.",
      "incident_type": "road_accident",
      "severity": "high",
      "status": "pending",
      "latitude": "12.97159800",
      "longitude": "77.59456200",
      "address": "8th Cross, MG Road, Bangalore",
      "reporter_id": 29,
      "createdAt": "2026-10-22T06:59:43.000Z",
      "updatedAt": "2026-10-22T06:59:43.000Z",
      "reporter": {
        "id": 29,
        "full_name": "Test Auto Reporter",
        "email": "test_reporter_1792652378624@example.com",
        "phone": "9852378624"
      },
      "images": [],
      "assignments": []
    }
  }
}
```

---

### POST `/api/v1/incidents/:id/images`
- **Execution Status:** Live Executed
- **Role Needed:** `reporter` (Incident Owner)
- **Request Headers:** `Content-Type: multipart/form-data`
- **Form Fields:** `images` (Up to 5 files, &le; 5 MB each, JPG/PNG/WEBP only)
- **Response Shape (HTTP 200):**
```json
{
  "success": true,
  "message": "Images uploaded successfully",
  "data": {
    "incident": {
      "id": 32,
      "title": "Traffic Collision on 8th Cross",
      "description": "Two cars collided near the traffic junction, blocking lane 2.",
      "incident_type": "road_accident",
      "severity": "high",
      "status": "pending",
      "latitude": "12.97159800",
      "longitude": "77.59456200",
      "address": "8th Cross, MG Road, Bangalore",
      "reporter_id": 29,
      "createdAt": "2026-10-22T06:59:43.000Z",
      "updatedAt": "2026-10-22T06:59:43.000Z",
      "reporter": {
        "id": 29,
        "full_name": "Test Auto Reporter",
        "email": "test_reporter_1792652378624@example.com",
        "phone": "9852378624"
      },
      "images": [
        {
          "id": 13,
          "incident_id": 32,
          "image_url": "/api/v1/files/54ea4da1-71fb-449a-867c-17e92618ba6a.png",
          "createdAt": "2026-10-22T06:59:43.000Z",
          "updatedAt": "2026-10-22T06:59:43.000Z"
        }
      ],
      "assignments": []
    }
  }
}
```

---

### GET `/api/v1/incidents/my`
- **Execution Status:** Live Executed
- **Role Needed:** `reporter`
- **Query Parameters (Strict Mode):**
  - `page`: integer optional (default: 1, max: 100000)
  - `size`: integer optional (default: 10, max: 100)
  - `status`: enum optional (`pending`, `verified`, `assigned`, `accepted`, `on_the_way`, `reached`, `resolved`, `rejected`, `cancelled`)
  - `incident_type`: enum optional
  - `severity`: enum optional (`low`, `medium`, `high`, `critical`)
  - `search`: string optional
- **Response Shape (HTTP 200, Paginated):**
```json
{
  "success": true,
  "message": "Incidents retrieved",
  "data": [
    {
      "id": 32,
      "title": "Traffic Collision on 8th Cross",
      "description": "Two cars collided near the traffic junction, blocking lane 2.",
      "incident_type": "road_accident",
      "severity": "high",
      "status": "pending",
      "latitude": "12.97159800",
      "longitude": "77.59456200",
      "address": "8th Cross, MG Road, Bangalore",
      "reporter_id": 29,
      "createdAt": "2026-10-22T06:59:43.000Z",
      "updatedAt": "2026-10-22T06:59:43.000Z",
      "images": [
        {
          "id": 13,
          "incident_id": 32,
          "image_url": "/api/v1/files/54ea4da1-71fb-449a-867c-17e92618ba6a.png",
          "createdAt": "2026-10-22T06:59:43.000Z",
          "updatedAt": "2026-10-22T06:59:43.000Z"
        }
      ]
    }
  ],
  "meta": {
    "totalItems": 1,
    "totalPages": 1,
    "currentPage": 1,
    "itemsPerPage": 10
  }
}
```
*(Notice: `reporter` and `assignments` are omitted from items in the `/my` list).*

---

### PATCH `/api/v1/incidents/:id/cancel`
- **Execution Status:** Live Executed
- **Role Needed:** `reporter` (Incident Owner)
- **Path Parameters:** `id` (positive integer)
- **Precondition:** Incident status must be `pending` or `verified`.
- **Response Shape (HTTP 200):**
```json
{
  "success": true,
  "message": "Incident cancelled",
  "data": {
    "incident": {
      "id": 33,
      "title": "Minor Water Leak in Street",
      "description": "Water pipe leaking slightly on the sidewalk curb.",
      "incident_type": "other",
      "severity": "low",
      "status": "cancelled",
      "latitude": "12.97200000",
      "longitude": "77.59500000",
      "address": null,
      "reporter_id": 29,
      "createdAt": "2026-10-22T06:59:44.000Z",
      "updatedAt": "2026-10-22T06:59:44.000Z",
      "reporter": {
        "id": 29,
        "full_name": "Test Auto Reporter",
        "email": "test_reporter_1792652378624@example.com",
        "phone": "9852378624"
      },
      "images": [],
      "assignments": []
    }
  }
}
```

---

### PUT `/api/v1/incidents/:id`
- **Execution Status:** Live Executed
- **Role Needed:** `reporter` (Incident Owner)
- **Path Parameters:** `id` (positive integer)
- **Precondition:** Incident status must be `pending`.
- **Request Body:** Fields from `POST /incidents` (all optional)
- **Response Shape (HTTP 200):**
```json
{
  "success": true,
  "message": "Incident updated",
  "data": {
    "incident": {
      "id": 32,
      "title": "Severe Traffic Collision on 8th Cross",
      "description": "Updated: Two cars collided near junction, traffic clearing slowly.",
      "incident_type": "road_accident",
      "severity": "high",
      "status": "pending",
      "latitude": "12.97159800",
      "longitude": "77.59456200",
      "address": "8th Cross, MG Road, Bangalore",
      "reporter_id": 29,
      "createdAt": "2026-10-22T06:59:43.000Z",
      "updatedAt": "2026-10-22T06:59:44.000Z",
      "reporter": {
        "id": 29,
        "full_name": "Test Auto Reporter",
        "email": "test_reporter_1792652378624@example.com",
        "phone": "9852378624"
      },
      "images": [
        {
          "id": 13,
          "incident_id": 32,
          "image_url": "/api/v1/files/54ea4da1-71fb-449a-867c-17e92618ba6a.png",
          "createdAt": "2026-10-22T06:59:43.000Z",
          "updatedAt": "2026-10-22T06:59:43.000Z"
        }
      ],
      "assignments": []
    }
  }
}
```

---

### DELETE `/api/v1/incidents/:id`
- **Execution Status:** Live Executed
- **Role Needed:** `reporter` (Incident Owner)
- **Path Parameters:** `id` (positive integer)
- **Precondition:** Incident status must be `pending`.
- **Response Shape (HTTP 200):**
```json
{
  "success": true,
  "message": "Incident deleted"
}
```

---

### GET `/api/v1/incidents/search`
- **Execution Status:** Live Executed
- **Role Needed:** `admin`
- **Query Parameters (Strict Mode):**
  - `page`: integer optional (default: 1)
  - `size`: integer optional (default: 10)
  - `status`: enum optional
  - `incident_type`: enum optional
  - `severity`: enum optional
  - `search`: string optional (searches `title`, `description`, `address`)
- **Response Shape (HTTP 200, Paginated):**
```json
{
  "success": true,
  "message": "Incidents retrieved",
  "data": [
    {
      "id": 32,
      "title": "Severe Traffic Collision on 8th Cross",
      "description": "Updated: Two cars collided near junction, traffic clearing slowly.",
      "incident_type": "road_accident",
      "severity": "high",
      "status": "pending",
      "latitude": "12.97159800",
      "longitude": "77.59456200",
      "address": "8th Cross, MG Road, Bangalore",
      "reporter_id": 29,
      "createdAt": "2026-10-22T06:59:43.000Z",
      "updatedAt": "2026-10-22T06:59:44.000Z",
      "reporter": {
        "id": 29,
        "full_name": "Test Auto Reporter",
        "email": "test_reporter_1792652378624@example.com"
      },
      "images": [
        {
          "id": 13,
          "incident_id": 32,
          "image_url": "/api/v1/files/54ea4da1-71fb-449a-867c-17e92618ba6a.png",
          "createdAt": "2026-10-22T06:59:43.000Z",
          "updatedAt": "2026-10-22T06:59:43.000Z"
        }
      ]
    }
  ],
  "meta": {
    "totalItems": 4,
    "totalPages": 1,
    "currentPage": 1,
    "itemsPerPage": 10
  }
}
```
*(Notice: `reporter.phone` is omitted from search results; `assignments` are not loaded).*

---

### GET `/api/v1/incidents/nearby`
- **Execution Status:** Live Executed
- **Role Needed:** `admin`
- **Query Parameters (Strict Mode):**
  - `latitude`: number (-90 to 90, required)
  - `longitude`: number (-180 to 180, required)
  - `radius`: number optional (positive float &le; 100, default: 5 km)
- **Response Shape (HTTP 200, Wrapped Array):**
```json
{
  "success": true,
  "message": "Nearby incidents retrieved",
  "data": {
    "incidents": [
      {
        "id": 32,
        "title": "Severe Traffic Collision on 8th Cross",
        "description": "Updated: Two cars collided near junction, traffic clearing slowly.",
        "incident_type": "road_accident",
        "severity": "high",
        "status": "pending",
        "latitude": "12.97159800",
        "longitude": "77.59456200",
        "address": "8th Cross, MG Road, Bangalore",
        "reporter_id": 29,
        "created_at": "2026-10-22T06:59:43.000Z",
        "updated_at": "2026-10-22T06:59:44.000Z",
        "distance": 0.00024
      }
    ]
  }
}
```
*(Notice: `distance` is a JSON float; timestamps are raw SQL snake_case `created_at`/`updated_at`).*

---

### GET `/api/v1/incidents/:id/responder-location`
- **Execution Status:** Live Executed
- **Role Needed:** `reporter` (Incident Owner) or `admin`
- **Path Parameters:** `id` (positive integer)
- **Behavior:**
  - Returns `location: null` when incident status is not one of `accepted`, `on_the_way`, `reached`, or when assignment is missing, or coordinates are not yet recorded.
  - When active and reported, returns numbers for coordinates and ISO string for `updated_at`.
- **Response Shape when Active (HTTP 200):**
```json
{
  "success": true,
  "message": "Responder location retrieved",
  "data": {
    "location": {
      "responder": {
        "id": 14,
        "full_name": "Demo Ambulance",
        "responder_type": "ambulance"
      },
      "latitude": 12.9716,
      "longitude": 77.5946,
      "updated_at": "2026-10-22T06:59:45.000Z"
    }
  }
}
```
- **Response Shape when Inactive or Unassigned (HTTP 200):**
```json
{
  "success": true,
  "message": "Responder location retrieved",
  "data": {
    "location": null
  }
}
```

---

### GET `/api/v1/incidents/:id/status-history`
- **Execution Status:** Live Executed
- **Role Needed:** Admin, Owner Reporter, or Assigned Responder
- **Path Parameters:** `id` (positive integer)
- **Response Shape (HTTP 200):**
```json
{
  "success": true,
  "message": "Status history retrieved",
  "data": {
    "history": [
      {
        "id": 111,
        "incident_id": 32,
        "previous_status": null,
        "new_status": "pending",
        "changed_by": 29,
        "notes": "Incident reported",
        "createdAt": "2026-10-22T06:59:43.000Z",
        "updatedAt": "2026-10-22T06:59:43.000Z"
      },
      {
        "id": 112,
        "incident_id": 32,
        "previous_status": "pending",
        "new_status": "verified",
        "changed_by": 1,
        "notes": "Incident verified by admin",
        "createdAt": "2026-10-22T06:59:44.000Z",
        "updatedAt": "2026-10-22T06:59:44.000Z"
      }
    ]
  }
}
```

---

### GET `/api/v1/incidents/:id`
- **Execution Status:** Live Executed
- **Role Needed:** Admin, Owner Reporter, or Assigned Responder
- **Path Parameters:** `id` (positive integer)
- **Response Shape as viewed by Reporter (HTTP 200):**
```json
{
  "success": true,
  "message": "Incident details retrieved",
  "data": {
    "incident": {
      "id": 32,
      "title": "Severe Traffic Collision on 8th Cross",
      "description": "Updated: Two cars collided near junction, traffic clearing slowly.",
      "incident_type": "road_accident",
      "severity": "high",
      "status": "accepted",
      "latitude": "12.97159800",
      "longitude": "77.59456200",
      "address": "8th Cross, MG Road, Bangalore",
      "reporter_id": 29,
      "createdAt": "2026-10-22T06:59:43.000Z",
      "updatedAt": "2026-10-22T06:59:45.000Z",
      "reporter": {
        "id": 29,
        "full_name": "Test Auto Reporter"
      },
      "images": [
        {
          "id": 13,
          "incident_id": 32,
          "image_url": "/api/v1/files/54ea4da1-71fb-449a-867c-17e92618ba6a.png",
          "createdAt": "2026-10-22T06:59:43.000Z",
          "updatedAt": "2026-10-22T06:59:43.000Z"
        }
      ],
      "assignments": [
        {
          "id": 17,
          "incident_id": 32,
          "responder_id": 14,
          "assigned_by": 1,
          "assignment_status": "accepted",
          "notes": null,
          "responded_at": "2026-10-22T06:59:45.000Z",
          "completed_at": null,
          "createdAt": "2026-10-22T06:59:45.000Z",
          "updatedAt": "2026-10-22T06:59:45.000Z",
          "responder": {
            "id": 14,
            "full_name": "Demo Ambulance",
            "responder_type": "ambulance"
          }
        }
      ]
    }
  }
}
```
*(Notice: In reporter view, `reporter.email` and `reporter.phone` are removed; `responder.email` and `responder.phone` are removed).*

---

## Module 4: Responder Dispatch & Operations

### GET `/api/v1/responders/dashboard`
- **Execution Status:** Live Executed
- **Role Needed:** `responder`
- **Request Parameters:** None
- **Response Shape (HTTP 200):**
```json
{
  "success": true,
  "message": "Dashboard retrieved",
  "data": {
    "dashboard": {
      "activeIncidents": 1,
      "completedIncidents": 4,
      "unreadNotifications": 9,
      "currentAssignments": [
        {
          "id": 17,
          "incident_id": 32,
          "responder_id": 14,
          "assigned_by": 1,
          "assignment_status": "accepted",
          "notes": null,
          "responded_at": "2026-10-22T06:59:45.000Z",
          "completed_at": null,
          "createdAt": "2026-10-22T06:59:45.000Z",
          "updatedAt": "2026-10-22T06:59:45.000Z",
          "incident": {
            "id": 32,
            "title": "Severe Traffic Collision on 8th Cross",
            "description": "Updated: Two cars collided near junction, traffic clearing slowly.",
            "incident_type": "road_accident",
            "severity": "high",
            "status": "accepted",
            "latitude": "12.97159800",
            "longitude": "77.59456200",
            "address": "8th Cross, MG Road, Bangalore",
            "reporter_id": 29,
            "createdAt": "2026-10-22T06:59:43.000Z",
            "updatedAt": "2026-10-22T06:59:45.000Z"
          }
        }
      ]
    }
  }
}
```

---

### GET `/api/v1/responders/incidents`
- **Execution Status:** Live Executed
- **Role Needed:** `responder`
- **Query Parameters:** `page`, `size`, `status`
- **Response Shape (HTTP 200, Paginated):**
```json
{
  "success": true,
  "message": "Assigned incidents retrieved",
  "data": [
    {
      "id": 17,
      "incident_id": 32,
      "responder_id": 14,
      "assigned_by": 1,
      "assignment_status": "accepted",
      "notes": null,
      "responded_at": "2026-10-22T06:59:45.000Z",
      "completed_at": null,
      "createdAt": "2026-10-22T06:59:45.000Z",
      "updatedAt": "2026-10-22T06:59:45.000Z",
      "incident": {
        "id": 32,
        "title": "Severe Traffic Collision on 8th Cross",
        "description": "Updated: Two cars collided near junction, traffic clearing slowly.",
        "incident_type": "road_accident",
        "severity": "high",
        "status": "accepted",
        "latitude": "12.97159800",
        "longitude": "77.59456200",
        "address": "8th Cross, MG Road, Bangalore",
        "reporter_id": 29,
        "createdAt": "2026-10-22T06:59:43.000Z",
        "updatedAt": "2026-10-22T06:59:45.000Z",
        "reporter": {
          "id": 29,
          "full_name": "Test Auto Reporter",
          "phone": "9852378624"
        },
        "images": [
          {
            "id": 13,
            "incident_id": 32,
            "image_url": "/api/v1/files/54ea4da1-71fb-449a-867c-17e92618ba6a.png",
            "createdAt": "2026-10-22T06:59:43.000Z",
            "updatedAt": "2026-10-22T06:59:43.000Z"
          }
        ]
      }
    }
  ],
  "meta": {
    "totalItems": 10,
    "totalPages": 1,
    "currentPage": 1,
    "itemsPerPage": 10
  }
}
```
*(Notice: Because `assignment_status === 'accepted'`, `reporter.phone` IS visible to the responder; `reporter.email` remains deleted).*

---

### GET `/api/v1/responders/incidents/completed`
- **Execution Status:** Live Executed
- **Role Needed:** `responder`
- **Query Parameters:** `page`, `size`
- **Response Shape (HTTP 200, Paginated):**
```json
{
  "success": true,
  "message": "Completed history retrieved",
  "data": [
    {
      "id": 17,
      "incident_id": 32,
      "responder_id": 14,
      "assigned_by": 1,
      "assignment_status": "completed",
      "notes": "Collision cleared from road and casualties transported to hospital.",
      "responded_at": "2026-10-22T06:59:45.000Z",
      "completed_at": "2026-10-22T06:59:46.000Z",
      "createdAt": "2026-10-22T06:59:45.000Z",
      "updatedAt": "2026-10-22T06:59:46.000Z",
      "incident": {
        "id": 32,
        "title": "Severe Traffic Collision on 8th Cross",
        "description": "Updated: Two cars collided near junction, traffic clearing slowly.",
        "incident_type": "road_accident",
        "severity": "high",
        "status": "resolved",
        "latitude": "12.97159800",
        "longitude": "77.59456200",
        "address": "8th Cross, MG Road, Bangalore",
        "reporter_id": 29,
        "createdAt": "2026-10-22T06:59:43.000Z",
        "updatedAt": "2026-10-22T06:59:46.000Z",
        "reporter": {
          "id": 29,
          "full_name": "Test Auto Reporter"
        },
        "images": []
      }
    }
  ],
  "meta": {
    "totalItems": 4,
    "totalPages": 1,
    "currentPage": 1,
    "itemsPerPage": 10
  }
}
```
*(Notice: After completion, `assignment_status` is no longer `'accepted'`, so `reporter.phone` is redacted).*

---

### GET `/api/v1/responders/incidents/:id`
- **Execution Status:** Live Executed
- **Role Needed:** `responder` (Assignment Owner)
- **Path Parameters:** `id` (Assignment ID, positive integer)
- **Response Shape (HTTP 200):**
```json
{
  "success": true,
  "message": "Assignment details retrieved",
  "data": {
    "assignment": {
      "id": 17,
      "incident_id": 32,
      "responder_id": 14,
      "assigned_by": 1,
      "assignment_status": "accepted",
      "notes": null,
      "responded_at": "2026-10-22T06:59:45.000Z",
      "completed_at": null,
      "createdAt": "2026-10-22T06:59:45.000Z",
      "updatedAt": "2026-10-22T06:59:45.000Z",
      "incident": {
        "id": 32,
        "title": "Severe Traffic Collision on 8th Cross",
        "description": "Updated: Two cars collided near junction, traffic clearing slowly.",
        "incident_type": "road_accident",
        "severity": "high",
        "status": "accepted",
        "latitude": "12.97159800",
        "longitude": "77.59456200",
        "address": "8th Cross, MG Road, Bangalore",
        "reporter_id": 29,
        "createdAt": "2026-10-22T06:59:43.000Z",
        "updatedAt": "2026-10-22T06:59:45.000Z",
        "reporter": {
          "id": 29,
          "full_name": "Test Auto Reporter",
          "phone": "9852378624"
        },
        "images": [
          {
            "id": 13,
            "incident_id": 32,
            "image_url": "/api/v1/files/54ea4da1-71fb-449a-867c-17e92618ba6a.png",
            "createdAt": "2026-10-22T06:59:43.000Z",
            "updatedAt": "2026-10-22T06:59:43.000Z"
          }
        ]
      },
      "responder": {
        "id": 14,
        "full_name": "Demo Ambulance",
        "email": "ambulance@example.com",
        "phone": "9000000002",
        "responder_type": "ambulance"
      }
    }
  }
}
```

---

### PATCH `/api/v1/responders/incidents/:id/accept`
- **Execution Status:** Live Executed
- **Role Needed:** `responder` (Assignment Owner)
- **Path Parameters:** `id` (Assignment ID)
- **Precondition:** Assignment status must be `assigned`.
- **Response Shape (HTTP 200):**
```json
{
  "success": true,
  "message": "Assignment accepted",
  "data": {
    "assignment": {
      "id": 17,
      "incident_id": 32,
      "responder_id": 14,
      "assigned_by": 1,
      "assignment_status": "accepted",
      "notes": null,
      "responded_at": "2026-10-22T06:59:45.000Z",
      "completed_at": null,
      "createdAt": "2026-10-22T06:59:45.000Z",
      "updatedAt": "2026-10-22T06:59:45.000Z",
      "incident": {
        "id": 32,
        "title": "Severe Traffic Collision on 8th Cross",
        "status": "accepted",
        "reporter": {
          "id": 29,
          "full_name": "Test Auto Reporter",
          "phone": "9852378624"
        }
      }
    }
  }
}
```

---

### PATCH `/api/v1/responders/incidents/:id/reject`
- **Execution Status:** Live Executed
- **Role Needed:** `responder` (Assignment Owner)
- **Path Parameters:** `id` (Assignment ID)
- **Request Body (Strict Mode):**
  - `notes`: string optional (min 1, max 5000)
- **Precondition:** Assignment status must be `assigned`.
- **Response Shape (HTTP 200):**
```json
{
  "success": true,
  "message": "Assignment rejected",
  "data": {
    "assignment": {
      "id": 18,
      "incident_id": 34,
      "responder_id": 14,
      "assigned_by": 1,
      "assignment_status": "rejected",
      "notes": "Unit currently out of service.",
      "responded_at": "2026-10-22T06:59:46.000Z",
      "completed_at": null,
      "createdAt": "2026-10-22T06:59:46.000Z",
      "updatedAt": "2026-10-22T06:59:46.000Z"
    }
  }
}
```

---

### PATCH `/api/v1/responders/incidents/:id/start-travel`
- **Execution Status:** Live Executed
- **Role Needed:** `responder` (Assignment Owner)
- **Path Parameters:** `id` (Assignment ID)
- **Precondition:** Assignment status must be `accepted` and incident status must be `accepted`.
- **Response Shape (HTTP 200):**
> [!NOTE]
> Returns `data: { incident: {...} }`, NOT `{ assignment: {...} }`.
```json
{
  "success": true,
  "message": "Travel started",
  "data": {
    "incident": {
      "id": 32,
      "title": "Severe Traffic Collision on 8th Cross",
      "description": "Updated: Two cars collided near junction, traffic clearing slowly.",
      "incident_type": "road_accident",
      "severity": "high",
      "status": "on_the_way",
      "latitude": "12.97159800",
      "longitude": "77.59456200",
      "address": "8th Cross, MG Road, Bangalore",
      "reporter_id": 29,
      "createdAt": "2026-10-22T06:59:43.000Z",
      "updatedAt": "2026-10-22T06:59:45.000Z",
      "reporter": {
        "id": 29,
        "full_name": "Test Auto Reporter",
        "phone": "9852378624"
      },
      "images": [],
      "assignments": []
    }
  }
}
```

---

### PATCH `/api/v1/responders/incidents/:id/arrived`
- **Execution Status:** Live Executed
- **Role Needed:** `responder` (Assignment Owner)
- **Path Parameters:** `id` (Assignment ID)
- **Precondition:** Incident status must be `on_the_way`.
- **Response Shape (HTTP 200):**
> [!NOTE]
> Returns `data: { incident: {...} }`, NOT `{ assignment: {...} }`.
```json
{
  "success": true,
  "message": "Arrived at location",
  "data": {
    "incident": {
      "id": 32,
      "title": "Severe Traffic Collision on 8th Cross",
      "description": "Updated: Two cars collided near junction, traffic clearing slowly.",
      "incident_type": "road_accident",
      "severity": "high",
      "status": "reached",
      "latitude": "12.97159800",
      "longitude": "77.59456200",
      "address": "8th Cross, MG Road, Bangalore",
      "reporter_id": 29,
      "createdAt": "2026-10-22T06:59:43.000Z",
      "updatedAt": "2026-10-22T06:59:45.000Z",
      "reporter": {
        "id": 29,
        "full_name": "Test Auto Reporter",
        "phone": "9852378624"
      },
      "images": [],
      "assignments": []
    }
  }
}
```

---

### PATCH `/api/v1/responders/incidents/:id/resolve`
- **Execution Status:** Live Executed
- **Role Needed:** `responder` (Assignment Owner)
- **Path Parameters:** `id` (Assignment ID)
- **Request Body (Strict Mode):**
  - `notes`: string optional (min 1, max 5000)
- **Precondition:** Incident status must be `reached`.
- **Response Shape (HTTP 200):**
> [!NOTE]
> Returns `data: { incident: {...} }`, NOT `{ assignment: {...} }`.
```json
{
  "success": true,
  "message": "Incident resolved",
  "data": {
    "incident": {
      "id": 32,
      "title": "Severe Traffic Collision on 8th Cross",
      "description": "Updated: Two cars collided near junction, traffic clearing slowly.",
      "incident_type": "road_accident",
      "severity": "high",
      "status": "resolved",
      "latitude": "12.97159800",
      "longitude": "77.59456200",
      "address": "8th Cross, MG Road, Bangalore",
      "reporter_id": 29,
      "createdAt": "2026-10-22T06:59:43.000Z",
      "updatedAt": "2026-10-22T06:59:46.000Z",
      "reporter": {
        "id": 29,
        "full_name": "Test Auto Reporter"
      },
      "images": [],
      "assignments": []
    }
  }
}
```

---

### POST `/api/v1/responders/location`
- **Execution Status:** Live Executed
- **Role Needed:** `responder`
- **Request Body (Strict Mode):**
  - `latitude`: number (-90 to 90)
  - `longitude`: number (-180 to 180)
- **Response Shape (HTTP 200):**
```json
{
  "success": true,
  "message": "Location updated"
}
```
*(Notice: Performed silently with `{ silent: true }`, setting `last_location_at = new Date()`, without bumping `updated_at` or invalidating JWT).*

---

### GET `/api/v1/responders/notifications`
- **Execution Status:** Live Executed
- **Role Needed:** `responder`
- **Query Parameters:** `page`, `size`, `is_read` (`"true"` | `"false"`)
- **Response Shape (HTTP 200, Paginated):**
```json
{
  "success": true,
  "message": "Notifications retrieved",
  "data": [
    {
      "id": 85,
      "user_id": 14,
      "title": "New Assignment",
      "message": "You have been assigned to incident #34",
      "type": "incident_assigned",
      "reference_id": 34,
      "is_read": false,
      "createdAt": "2026-10-22T06:59:46.000Z",
      "updatedAt": "2026-10-22T06:59:46.000Z"
    }
  ],
  "meta": {
    "totalItems": 10,
    "totalPages": 1,
    "currentPage": 1,
    "itemsPerPage": 10
  }
}
```

---

### PATCH `/api/v1/responders/notifications/:notificationId/read`
- **Execution Status:** Live Executed
- **Role Needed:** `responder` (Notification Owner)
- **Path Parameters:** `notificationId` (integer)
- **Response Shape (HTTP 200):**
```json
{
  "success": true,
  "message": "Notification marked as read",
  "data": {
    "notification": {
      "id": 85,
      "user_id": 14,
      "title": "New Assignment",
      "message": "You have been assigned to incident #34",
      "type": "incident_assigned",
      "reference_id": 34,
      "is_read": true,
      "createdAt": "2026-10-22T06:59:46.000Z",
      "updatedAt": "2026-10-22T06:59:46.000Z"
    }
  }
}
```

---

## Module 5: Administration & Analytics

### GET `/api/v1/admin/dashboard`
- **Execution Status:** Live Executed
- **Role Needed:** `admin`
- **Request Parameters:** None
- **Response Shape (HTTP 200):**
```json
{
  "success": true,
  "message": "Dashboard retrieved",
  "data": {
    "dashboard": {
      "totalIncidents": 33,
      "pendingIncidents": 9,
      "verifiedIncidents": 5,
      "assignedIncidents": 3,
      "resolvedIncidents": 7,
      "totalReporters": 19,
      "totalResponders": 8
    }
  }
}
```

---

### GET `/api/v1/admin/analytics`
- **Execution Status:** Live Executed
- **Role Needed:** `admin`
- **Request Parameters:** None
- **Response Shape (HTTP 200):**
```json
{
  "success": true,
  "message": "Analytics retrieved",
  "data": {
    "analytics": {
      "incidentsByType": [
        {
          "incident_type": "fire",
          "count": 16
        },
        {
          "incident_type": "road_accident",
          "count": 9
        },
        {
          "incident_type": "other",
          "count": 7
        },
        {
          "incident_type": "medical_emergency",
          "count": 1
        }
      ],
      "incidentsBySeverity": [
        {
          "severity": "high",
          "count": 12
        },
        {
          "severity": "critical",
          "count": 9
        },
        {
          "severity": "medium",
          "count": 9
        },
        {
          "severity": "low",
          "count": 3
        }
      ],
      "incidentsByStatus": [
        {
          "status": "pending",
          "count": 9
        },
        {
          "status": "resolved",
          "count": 7
        },
        {
          "status": "verified",
          "count": 5
        },
        {
          "status": "assigned",
          "count": 3
        },
        {
          "status": "accepted",
          "count": 3
        },
        {
          "status": "cancelled",
          "count": 3
        },
        {
          "status": "rejected",
          "count": 3
        }
      ],
      "monthlyTrend": [
        {
          "month": "2026-10",
          "count": 24
        },
        {
          "month": "2026-09",
          "count": 5
        },
        {
          "month": "2026-08",
          "count": 4
        }
      ]
    }
  }
}
```

---

### GET `/api/v1/admin/reports/monthly`
- **Execution Status:** Live Executed
- **Role Needed:** `admin`
- **Query Parameters:**
  - `year`: integer optional (default: current year)
  - `month`: integer optional (1-12, default: current month)
- **Response Shape (HTTP 200):**
```json
{
  "success": true,
  "message": "Monthly report retrieved",
  "data": {
    "report": {
      "total_incidents": 24,
      "resolved": "7",
      "pending": "3",
      "critical_count": "6"
    }
  }
}
```
*(Notice: `total_incidents` is a number; `resolved`, `pending`, and `critical_count` are numeric strings).*

---

### GET `/api/v1/admin/incidents`
- **Execution Status:** Live Executed
- **Role Needed:** `admin`
- **Query Parameters:** `page`, `size`, `status`, `incident_type`, `severity`, `search`
- **Response Shape (HTTP 200, Paginated):**
```json
{
  "success": true,
  "message": "Incidents retrieved",
  "data": [
    {
      "id": 34,
      "title": "Oil Spill on Highway",
      "description": "Vehicle oil spilled on lane 1.",
      "incident_type": "other",
      "severity": "medium",
      "status": "verified",
      "latitude": "12.97100000",
      "longitude": "77.59400000",
      "address": null,
      "reporter_id": 29,
      "createdAt": "2026-10-22T06:59:46.000Z",
      "updatedAt": "2026-10-22T06:59:46.000Z",
      "reporter": {
        "id": 29,
        "full_name": "Test Auto Reporter",
        "email": "test_reporter_1792652378624@example.com"
      },
      "images": []
    }
  ],
  "meta": {
    "totalItems": 34,
    "totalPages": 4,
    "currentPage": 1,
    "itemsPerPage": 10
  }
}
```

---

### GET `/api/v1/admin/incidents/:id`
- **Execution Status:** Live Executed
- **Role Needed:** `admin`
- **Path Parameters:** `id` (positive integer)
- **Response Shape (HTTP 200, Full Unredacted Detail):**
```json
{
  "success": true,
  "message": "Incident details retrieved",
  "data": {
    "incident": {
      "id": 32,
      "title": "Severe Traffic Collision on 8th Cross",
      "description": "Updated: Two cars collided near junction, traffic clearing slowly.",
      "incident_type": "road_accident",
      "severity": "high",
      "status": "resolved",
      "latitude": "12.97159800",
      "longitude": "77.59456200",
      "address": "8th Cross, MG Road, Bangalore",
      "reporter_id": 29,
      "createdAt": "2026-10-22T06:59:43.000Z",
      "updatedAt": "2026-10-22T06:59:46.000Z",
      "reporter": {
        "id": 29,
        "full_name": "Test Auto Reporter",
        "email": "test_reporter_1792652378624@example.com",
        "phone": "9852378624"
      },
      "images": [
        {
          "id": 13,
          "incident_id": 32,
          "image_url": "/api/v1/files/54ea4da1-71fb-449a-867c-17e92618ba6a.png",
          "createdAt": "2026-10-22T06:59:43.000Z",
          "updatedAt": "2026-10-22T06:59:43.000Z"
        }
      ],
      "assignments": [
        {
          "id": 17,
          "incident_id": 32,
          "responder_id": 14,
          "assigned_by": 1,
          "assignment_status": "completed",
          "notes": "Collision cleared from road and casualties transported to hospital.",
          "responded_at": "2026-10-22T06:59:45.000Z",
          "completed_at": "2026-10-22T06:59:46.000Z",
          "createdAt": "2026-10-22T06:59:45.000Z",
          "updatedAt": "2026-10-22T06:59:46.000Z",
          "responder": {
            "id": 14,
            "full_name": "Demo Ambulance",
            "email": "ambulance@example.com",
            "phone": "9000000002",
            "responder_type": "ambulance"
          }
        }
      ]
    }
  }
}
```

---

### PATCH `/api/v1/admin/incidents/:id/verify`
- **Execution Status:** Live Executed
- **Role Needed:** `admin`
- **Path Parameters:** `id` (positive integer)
- **Precondition:** Incident status must be `pending`.
- **Response Shape (HTTP 200):**
```json
{
  "success": true,
  "message": "Incident verified",
  "data": {
    "incident": {
      "id": 32,
      "title": "Severe Traffic Collision on 8th Cross",
      "status": "verified",
      "reporter": {
        "id": 29,
        "full_name": "Test Auto Reporter",
        "email": "test_reporter_1792652378624@example.com",
        "phone": "9852378624"
      },
      "images": [],
      "assignments": []
    }
  }
}
```

---

### PATCH `/api/v1/admin/incidents/:id/reject`
- **Execution Status:** Live Executed
- **Role Needed:** `admin`
- **Path Parameters:** `id` (positive integer)
- **Request Body:**
  - `reason`: string optional (min 5)
- **Precondition:** Incident status must be `pending`.
- **Response Shape (HTTP 200):**
```json
{
  "success": true,
  "message": "Incident rejected",
  "data": {
    "incident": {
      "id": 33,
      "title": "Duplicate Incident Report",
      "status": "rejected",
      "reporter": {
        "id": 29,
        "full_name": "Test Auto Reporter",
        "email": "test_reporter_1792652378624@example.com",
        "phone": "9852378624"
      },
      "images": [],
      "assignments": []
    }
  }
}
```

---

### POST `/api/v1/admin/incidents/:id/assign`
- **Execution Status:** Live Executed
- **Role Needed:** `admin`
- **Path Parameters:** `id` (Incident ID)
- **Request Body:**
  - `responder_id`: integer positive
- **Precondition:** Incident status must be `verified`.
- **Response Shape (HTTP 200):**
```json
{
  "success": true,
  "message": "Responder assigned",
  "data": {
    "assignment": {
      "id": 15,
      "incident_id": 32,
      "responder_id": 14,
      "assigned_by": 1,
      "assignment_status": "assigned",
      "notes": null,
      "responded_at": null,
      "completed_at": null,
      "createdAt": "2026-10-22T06:59:44.000Z",
      "updatedAt": "2026-10-22T06:59:44.000Z",
      "incident": {
        "id": 32,
        "title": "Severe Traffic Collision on 8th Cross",
        "status": "assigned",
        "reporter": {
          "id": 29,
          "full_name": "Test Auto Reporter",
          "email": "test_reporter_1792652378624@example.com",
          "phone": "9852378624"
        },
        "images": []
      },
      "responder": {
        "id": 14,
        "full_name": "Demo Ambulance",
        "email": "ambulance@example.com",
        "phone": "9000000002",
        "responder_type": "ambulance"
      }
    }
  }
}
```

---

### POST `/api/v1/admin/incidents/:id/reassign`
- **Execution Status:** Live Executed
- **Role Needed:** `admin`
- **Path Parameters:** `id` (Incident ID)
- **Request Body:**
  - `responder_id`: integer positive (new responder ID)
- **Precondition:** Incident status must be `assigned` or `accepted`.
- **Response Shape (HTTP 200):**
```json
{
  "success": true,
  "message": "Responder reassigned",
  "data": {
    "assignment": {
      "id": 16,
      "incident_id": 32,
      "responder_id": 15,
      "assigned_by": 1,
      "assignment_status": "assigned",
      "notes": null,
      "responded_at": null,
      "completed_at": null,
      "createdAt": "2026-10-22T06:59:45.000Z",
      "updatedAt": "2026-10-22T06:59:45.000Z",
      "incident": {
        "id": 32,
        "title": "Severe Traffic Collision on 8th Cross",
        "status": "assigned"
      },
      "responder": {
        "id": 15,
        "full_name": "Demo Police",
        "email": "police@example.com",
        "phone": "9000000003",
        "responder_type": "police"
      }
    }
  }
}
```

---

### DELETE `/api/v1/admin/assignments/:id`
- **Execution Status:** Live Executed
- **Role Needed:** `admin`
- **Path Parameters:** `id` (Assignment ID)
- **Precondition:** Assignment status must be `assigned` or `accepted`.
- **Response Shape (HTTP 200):**
```json
{
  "success": true,
  "message": "Assignment cancelled",
  "data": {
    "assignment": {
      "id": 16,
      "incident_id": 32,
      "responder_id": 15,
      "assigned_by": 1,
      "assignment_status": "rejected",
      "notes": "Cancelled by admin",
      "responded_at": null,
      "completed_at": null,
      "createdAt": "2026-10-22T06:59:45.000Z",
      "updatedAt": "2026-10-22T06:59:45.000Z"
    }
  }
}
```

---

### GET `/api/v1/admin/responders/available`
- **Execution Status:** Live Executed
- **Role Needed:** `admin`
- **Query Parameters:** `responder_type` optional (`ambulance`, `police`, `fire`)
- **Response Shape (HTTP 200, Wrapped Array):**
```json
{
  "success": true,
  "message": "Available responders retrieved",
  "data": {
    "responders": [
      {
        "id": 14,
        "full_name": "Demo Ambulance",
        "email": "ambulance@example.com",
        "phone": "9000000002",
        "role": "responder",
        "responder_type": "ambulance",
        "profile_image": null,
        "is_active": true,
        "last_known_latitude": "12.97160000",
        "last_known_longitude": "77.59460000",
        "last_location_at": "2026-10-22T06:59:45.000Z",
        "createdAt": "2026-10-22T05:48:25.000Z",
        "updatedAt": "2026-10-22T05:48:25.000Z"
      }
    ]
  }
}
```
*(Notice: Coordinates are strings; `last_location_at` ISO timestamp is present).*

---

### POST `/api/v1/admin/responders`
- **Execution Status:** Live Executed
- **Role Needed:** `admin`
- **Request Body:**
  - `full_name`: string (min 2, max 100)
  - `email`: string (valid email format)
  - `phone`: string (min 10, max 20)
  - `password`: string (min 6, max 128 — *note: min 6 chars for admin creation*)
  - `responder_type`: enum (`ambulance`, `police`, `fire`)
- **Response Shape (HTTP 201):**
> [!NOTE]
> Returns `data: { responder: {...} }`, NOT `{ user: {...} }`.
```json
{
  "success": true,
  "message": "Responder created",
  "data": {
    "responder": {
      "id": 30,
      "full_name": "Engine 42 Firefighter",
      "email": "fire_1792652386161@example.com",
      "phone": "9752386161",
      "role": "responder",
      "responder_type": "fire",
      "is_active": true,
      "updatedAt": "2026-10-22T06:59:46.166Z",
      "createdAt": "2026-10-22T06:59:46.166Z"
    }
  }
}
```

---

### GET `/api/v1/admin/users`
- **Execution Status:** Live Executed
- **Role Needed:** `admin`
- **Query Parameters:**
  - `page`: integer optional (default: 1)
  - `size`: integer optional (default: 10)
  - `role`: enum optional (`reporter`, `responder`, `admin`)
  - `search`: string optional (searches `full_name`, `email`, `phone`)
  - `is_active`: string optional (`"true"` | `"false"`)
- **Response Shape (HTTP 200, Paginated):**
```json
{
  "success": true,
  "message": "Users retrieved",
  "data": [
    {
      "id": 30,
      "full_name": "Engine 42 Firefighter",
      "email": "fire_1792652386161@example.com",
      "phone": "9752386161",
      "role": "responder",
      "responder_type": "fire",
      "profile_image": null,
      "is_active": true,
      "last_known_latitude": null,
      "last_known_longitude": null,
      "last_location_at": null,
      "createdAt": "2026-10-22T06:59:46.000Z",
      "updatedAt": "2026-10-22T06:59:46.000Z"
    }
  ],
  "meta": {
    "totalItems": 30,
    "totalPages": 3,
    "currentPage": 1,
    "itemsPerPage": 10
  }
}
```

---

### GET `/api/v1/admin/users/:id`
- **Execution Status:** Live Executed
- **Role Needed:** `admin`
- **Path Parameters:** `id` (positive integer)
- **Response Shape (HTTP 200):**
```json
{
  "success": true,
  "message": "User details retrieved",
  "data": {
    "user": {
      "id": 30,
      "full_name": "Engine 42 Firefighter",
      "email": "fire_1792652386161@example.com",
      "phone": "9752386161",
      "role": "responder",
      "responder_type": "fire",
      "profile_image": null,
      "is_active": true,
      "last_known_latitude": null,
      "last_known_longitude": null,
      "last_location_at": null,
      "createdAt": "2026-10-22T06:59:46.000Z",
      "updatedAt": "2026-10-22T06:59:46.000Z"
    }
  }
}
```

---

### PUT `/api/v1/admin/users/:id`
- **Execution Status:** Live Executed
- **Role Needed:** `admin`
- **Path Parameters:** `id` (positive integer)
- **Request Body:**
  - `full_name`: string optional (min 2, max 100)
  - `email`: string optional (valid email)
  - `phone`: string optional (min 10, max 20)
  - `is_active`: boolean optional (`true` | `false`)
  - `responder_type`: enum optional (`ambulance`, `police`, `fire`)
- **Response Shape (HTTP 200):**
```json
{
  "success": true,
  "message": "User updated",
  "data": {
    "user": {
      "id": 30,
      "full_name": "Engine 42 Lead Firefighter",
      "email": "fire_1792652386161@example.com",
      "phone": "9752386161",
      "role": "responder",
      "responder_type": "fire",
      "profile_image": null,
      "is_active": true,
      "last_known_latitude": null,
      "last_known_longitude": null,
      "last_location_at": null,
      "createdAt": "2026-10-22T06:59:46.000Z",
      "updatedAt": "2026-10-22T06:59:46.000Z"
    }
  }
}
```

---

### PATCH `/api/v1/admin/users/:id/disable`
- **Execution Status:** Live Executed
- **Role Needed:** `admin`
- **Path Parameters:** `id` (positive integer)
- **Response Shape (HTTP 200):**
```json
{
  "success": true,
  "message": "User disabled",
  "data": {
    "user": {
      "id": 30,
      "full_name": "Engine 42 Lead Firefighter",
      "email": "fire_1792652386161@example.com",
      "phone": "9752386161",
      "role": "responder",
      "responder_type": "fire",
      "profile_image": null,
      "is_active": false,
      "last_known_latitude": null,
      "last_known_longitude": null,
      "last_location_at": null,
      "createdAt": "2026-10-22T06:59:46.000Z",
      "updatedAt": "2026-10-22T06:59:46.000Z"
    }
  }
}
```

---

### GET `/api/v1/admin/notifications`
- **Execution Status:** Live Executed
- **Role Needed:** `admin`
- **Query Parameters:** `page`, `size`, `is_read` (`"true"` | `"false"`)
- **Response Shape (HTTP 200, Paginated):**
```json
{
  "success": true,
  "message": "Notifications retrieved",
  "data": [
    {
      "id": 86,
      "user_id": 1,
      "title": "Assignment Rejected",
      "message": "Responder rejected assignment for incident #34",
      "type": "assignment_rejected",
      "reference_id": 34,
      "is_read": false,
      "createdAt": "2026-10-22T06:59:46.000Z",
      "updatedAt": "2026-10-22T06:59:46.000Z"
    }
  ],
  "meta": {
    "totalItems": 21,
    "totalPages": 3,
    "currentPage": 1,
    "itemsPerPage": 10
  }
}
```

---

### PATCH `/api/v1/admin/notifications/:notificationId/read`
- **Execution Status:** Live Executed
- **Role Needed:** `admin`
- **Path Parameters:** `notificationId` (integer)
- **Response Shape (HTTP 200):**
```json
{
  "success": true,
  "message": "Notification marked as read",
  "data": {
    "notification": {
      "id": 86,
      "user_id": 1,
      "title": "Assignment Rejected",
      "message": "Responder rejected assignment for incident #34",
      "type": "assignment_rejected",
      "reference_id": 34,
      "is_read": true,
      "createdAt": "2026-10-22T06:59:46.000Z",
      "updatedAt": "2026-10-22T06:59:46.000Z"
    }
  }
}
```

---

## Module 6: User Profile & Account Management

### GET `/api/v1/users/profile`
- **Execution Status:** Live Executed
- **Role Needed:** Any Authenticated User
- **Request Parameters:** None
- **Response Shape (HTTP 200):**
```json
{
  "success": true,
  "message": "Profile retrieved",
  "data": {
    "user": {
      "id": 29,
      "full_name": "Test Auto Reporter",
      "email": "test_reporter_1792652378624@example.com",
      "phone": "9852378624",
      "role": "reporter",
      "responder_type": null,
      "profile_image": null,
      "is_active": true,
      "last_known_latitude": null,
      "last_known_longitude": null,
      "last_location_at": null,
      "createdAt": "2026-10-22T06:59:38.000Z",
      "updatedAt": "2026-10-22T06:59:38.000Z"
    }
  }
}
```

---

### PUT `/api/v1/users/profile`
- **Execution Status:** Live Executed
- **Role Needed:** Any Authenticated User
- **Request Body:**
  - `full_name`: string optional (min 2, max 100)
  - `email`: string optional (valid email format)
  - `phone`: string optional (min 10, max 20)
- **Response Shape (HTTP 200):**
```json
{
  "success": true,
  "message": "Profile updated",
  "data": {
    "user": {
      "id": 29,
      "full_name": "Updated Auto Reporter Name",
      "email": "test_reporter_1792652378624@example.com",
      "phone": "9852378624",
      "role": "reporter",
      "responder_type": null,
      "profile_image": null,
      "is_active": true,
      "last_known_latitude": null,
      "last_known_longitude": null,
      "last_location_at": null,
      "createdAt": "2026-10-22T06:59:38.000Z",
      "updatedAt": "2026-10-22T06:59:46.000Z"
    }
  }
}
```
*(Notice: Bumps `updated_at`. The existing access token is immediately revoked by `auth.middleware.js`).*

---

### POST `/api/v1/users/profile/image`
- **Execution Status:** Live Executed
- **Role Needed:** Any Authenticated User
- **Request Headers:** `Content-Type: multipart/form-data`
- **Form Fields:** `profile_image` (Single image file, &le; 2 MB, JPG/PNG/WEBP only)
- **Response Shape (HTTP 200):**
```json
{
  "success": true,
  "message": "Profile image uploaded",
  "data": {
    "user": {
      "id": 29,
      "full_name": "Updated Auto Reporter Name",
      "email": "test_reporter_1792652378624@example.com",
      "phone": "9852378624",
      "role": "reporter",
      "responder_type": null,
      "profile_image": "/api/v1/files/b49dca04-f5aa-43d9-9599-23136208aa0f.png",
      "is_active": true,
      "last_known_latitude": null,
      "last_known_longitude": null,
      "last_location_at": null,
      "createdAt": "2026-10-22T06:59:38.000Z",
      "updatedAt": "2026-10-22T06:59:46.000Z"
    }
  }
}
```

---

### DELETE `/api/v1/users/profile/image`
- **Execution Status:** Live Executed
- **Role Needed:** Any Authenticated User
- **Request Parameters:** None
- **Response Shape (HTTP 200):**
```json
{
  "success": true,
  "message": "Profile image removed",
  "data": {
    "user": {
      "id": 29,
      "full_name": "Updated Auto Reporter Name",
      "email": "test_reporter_1792652378624@example.com",
      "phone": "9852378624",
      "role": "reporter",
      "responder_type": null,
      "profile_image": null,
      "is_active": true,
      "last_known_latitude": null,
      "last_known_longitude": null,
      "last_location_at": null,
      "createdAt": "2026-10-22T06:59:38.000Z",
      "updatedAt": "2026-10-22T06:59:46.000Z"
    }
  }
}
```

---

### POST `/api/v1/users/change-password`
- **Execution Status:** Live Executed
- **Role Needed:** Any Authenticated User
- **Request Body:**
  - `currentPassword`: string (min 1)
  - `newPassword`: string (min 6, max 128)
- **Response Shape (HTTP 200):**
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

---

### DELETE `/api/v1/users/account`
- **Execution Status:** Live Executed
- **Role Needed:** Any Authenticated User
- **Request Parameters:** None
- **Response Shape (HTTP 200):**
```json
{
  "success": true,
  "message": "Account deactivated"
}
```

---

### POST `/api/v1/users/logout-all`
- **Execution Status:** Live Executed
- **Role Needed:** Any Authenticated User
- **Request Parameters:** None
- **Response Shape (HTTP 200):**
```json
{
  "success": true,
  "message": "All sessions logged out"
}
```

---

## Module 7: Notifications

### GET `/api/v1/notifications`
- **Execution Status:** Live Executed
- **Role Needed:** Any Authenticated User
- **Query Parameters:** `page`, `size`, `is_read` (`"true"` | `"false"`)
- **Response Shape (HTTP 200, Paginated):**
```json
{
  "success": true,
  "message": "Notifications retrieved",
  "data": [
    {
      "id": 84,
      "user_id": 29,
      "title": "Incident Resolved",
      "message": "Your reported incident has been resolved.",
      "type": "incident_resolved",
      "reference_id": 32,
      "is_read": false,
      "createdAt": "2026-10-22T06:59:46.000Z",
      "updatedAt": "2026-10-22T06:59:46.000Z"
    }
  ],
  "meta": {
    "totalItems": 14,
    "totalPages": 2,
    "currentPage": 1,
    "itemsPerPage": 10
  }
}
```

---

### GET `/api/v1/notifications/:id`
- **Execution Status:** Live Executed
- **Role Needed:** Notification Owner
- **Path Parameters:** `id` (integer)
- **Response Shape (HTTP 200):**
```json
{
  "success": true,
  "message": "Notification details retrieved",
  "data": {
    "notification": {
      "id": 84,
      "user_id": 29,
      "title": "Incident Resolved",
      "message": "Your reported incident has been resolved.",
      "type": "incident_resolved",
      "reference_id": 32,
      "is_read": false,
      "createdAt": "2026-10-22T06:59:46.000Z",
      "updatedAt": "2026-10-22T06:59:46.000Z"
    }
  }
}
```

---

### PATCH `/api/v1/notifications/:id/read`
- **Execution Status:** Live Executed
- **Role Needed:** Notification Owner
- **Path Parameters:** `id` (integer)
- **Response Shape (HTTP 200):**
```json
{
  "success": true,
  "message": "Notification marked as read",
  "data": {
    "notification": {
      "id": 84,
      "user_id": 29,
      "title": "Incident Resolved",
      "message": "Your reported incident has been resolved.",
      "type": "incident_resolved",
      "reference_id": 32,
      "is_read": true,
      "createdAt": "2026-10-22T06:59:46.000Z",
      "updatedAt": "2026-10-22T06:59:47.000Z"
    }
  }
}
```

---

### PATCH `/api/v1/notifications/read-all`
- **Execution Status:** Live Executed
- **Role Needed:** Any Authenticated User
- **Request Parameters:** None
- **Response Shape (HTTP 200):**
```json
{
  "success": true,
  "message": "All notifications marked as read"
}
```

---

### DELETE `/api/v1/notifications/:id`
- **Execution Status:** Live Executed
- **Role Needed:** Notification Owner
- **Path Parameters:** `id` (integer)
- **Response Shape (HTTP 200):**
```json
{
  "success": true,
  "message": "Notification deleted"
}
```

---

## Module 8: Secured File Delivery

### GET `/api/v1/files/:filename`
- **Execution Status:** Live Executed
- **Role Needed:** Authenticated and Authorized (Incident owner, assigned responder, or admin for incident photos; profile owner or admin for profile photos).
- **Path Parameters:** `filename` (UUIDv4 + `.jpg`/`.png`/`.webp`)
- **Headers Returned:**
  - `Content-Type`: `image/png` (or `image/jpeg`, `image/webp`)
  - `X-Content-Type-Options`: `nosniff`
- **Response Body:** Binary stream of image bytes.

---

## 12. Doc Mismatches Found

The following table and itemized list document every discrepancy where existing documentation files (`API_REFERENCE.md` or `PROJECT_DOCUMENTATION.md`) diverge from the actual source code and runtime behavior:

| # | Topic / Endpoint | Existing Documentation Statement | Actual Code & Runtime Truth | Proof (File & Line) |
|---|---|---|---|---|
| 1 | **Timestamp Casing** | Documented as snake_case `created_at` and `updated_at` across response bodies | Sequelize instances serialize default timestamps as camelCase `createdAt` and `updatedAt` | [`src/models/incident.model.js`](file:///d:/SafeRout-2/SafeRouteBackend/src/models/incident.model.js) (Sequelize model definition without `underscored: true`) |
| 2 | **Pagination Response Envelope** | Documented or implied as `meta.pagination` or `data.pagination` | `data` is a direct Array `[...]`; `meta` is flattened at root: `meta: { totalItems, totalPages, currentPage, itemsPerPage }` | [`src/utils/response.js#L4-L12`](file:///d:/SafeRout-2/SafeRouteBackend/src/utils/response.js#L4-L12), [`src/utils/pagination.js#L13-L26`](file:///d:/SafeRout-2/SafeRouteBackend/src/utils/pagination.js#L13-L26), [`src/controllers/incident.controller.js#L30`](file:///d:/SafeRout-2/SafeRouteBackend/src/controllers/incident.controller.js#L30) |
| 3 | **Missing Response Shape: Admin Analytics** | Section `[ADM-02]` in `API_REFERENCE.md` (lines 1470-1485) had no response schema | Returns `data: { analytics: { incidentsByType: [...], incidentsBySeverity: [...], incidentsByStatus: [...], monthlyTrend: [...] } }` | [`src/controllers/admin.controller.js#L144-L151`](file:///d:/SafeRout-2/SafeRouteBackend/src/controllers/admin.controller.js#L144-L151), [`src/services/admin.service.js#L260-L280`](file:///d:/SafeRout-2/SafeRouteBackend/src/services/admin.service.js#L260-L280) |
| 4 | **Missing Response Shape: Monthly Report** | Section `[ADM-03]` in `API_REFERENCE.md` (lines 1487-1504) had no response schema | Returns `data: { report: { total_incidents: number, resolved: string, pending: string, critical_count: string } }` | [`src/controllers/admin.controller.js#L153-L164`](file:///d:/SafeRout-2/SafeRouteBackend/src/controllers/admin.controller.js#L153-L164), [`src/services/admin.service.js#L282-L299`](file:///d:/SafeRout-2/SafeRouteBackend/src/services/admin.service.js#L282-L299) |
| 5 | **Missing Response Shape: User Profile Image** | Section `[USR-03]` in `API_REFERENCE.md` (lines 1806-1821) had no response schema | Returns `data: { user: {...} }` with updated `profile_image` path | [`src/controllers/user.controller.js#L23-L30`](file:///d:/SafeRout-2/SafeRouteBackend/src/controllers/user.controller.js#L23-L30), [`src/services/user.service.js#L40-L53`](file:///d:/SafeRout-2/SafeRouteBackend/src/services/user.service.js#L40-L53) |
| 6 | **Responder Travel/Arrival/Resolve Return Shapes** | Documented or expected to return `data: { assignment: {...} }` | `startTravel`, `arrived`, and `resolveIncident` return `data: { incident: {...} }` (the serialized Incident, NOT the assignment) | [`src/controllers/responder.controller.js#L52-L87`](file:///d:/SafeRout-2/SafeRouteBackend/src/controllers/responder.controller.js#L52-L87), [`src/services/responder.service.js#L144-L242`](file:///d:/SafeRout-2/SafeRouteBackend/src/services/responder.service.js#L144-L242) |
| 7 | **Responder Dashboard `currentAssignments`** | Documented as empty array `currentAssignments: []` in `API_REFERENCE.md:1160` | Returns array of assignments each containing nested `incident: Incident` (no `reporter` or `images` included) | [`src/repositories/assignment.repository.js#L56-L64`](file:///d:/SafeRout-2/SafeRouteBackend/src/repositories/assignment.repository.js#L56-L64), [`src/services/responder.service.js#L262-L278`](file:///d:/SafeRout-2/SafeRouteBackend/src/services/responder.service.js#L262-L278) |
| 8 | **Monthly Report Aggregate Types** | Documented or assumed all numeric counts | `resolved`, `pending`, and `critical_count` are returned as **strings** (e.g. `"7"`, `"3"`), while `total_incidents` is a **number** (`24`) | [`src/services/admin.service.js#L288-L298`](file:///d:/SafeRout-2/SafeRouteBackend/src/services/admin.service.js#L288-L298) |
| 9 | **Incident Types Enum** | Often cited as `"medical"` in conversational descriptions | Canonical enum string in backend is strictly `"medical_emergency"`; passing `"medical"` causes HTTP 422 | [`src/constants/incidentTypes.js#L4`](file:///d:/SafeRout-2/SafeRouteBackend/src/constants/incidentTypes.js#L4), [`src/validators/incident.validator.js#L7`](file:///d:/SafeRout-2/SafeRouteBackend/src/validators/incident.validator.js#L7) |
| 10 | **Password Minimum Lengths** | Implied uniform password rules | Public user registration requires min 12 characters (`password.min(12)`), but admin creating a responder requires min 6 (`password.min(6)`), and change password in `user.validator.js` requires min 6 | [`src/validators/auth.validator.js#L7`](file:///d:/SafeRout-2/SafeRouteBackend/src/validators/auth.validator.js#L7) vs [`src/validators/admin.validator.js#L18`](file:///d:/SafeRout-2/SafeRouteBackend/src/validators/admin.validator.js#L18) vs [`src/validators/user.validator.js#L11`](file:///d:/SafeRout-2/SafeRouteBackend/src/validators/user.validator.js#L11) |
| 11 | **Unused Notification Enums** | `notificationTypes.js` defines 12 notification types | Only 9 types are actually instantiated in services. Types `incident_created`, `incident_cancelled`, and `responder_reassigned` are never emitted | [`src/constants/notificationTypes.js#L2,L10,L12`](file:///d:/SafeRout-2/SafeRouteBackend/src/constants/notificationTypes.js#L2) |
| 12 | **Reporter Phone Visibility to Responder** | Documented in early specs as always redacted for non-admins | Redacted by default, BUT revealed to an assigned responder once assignment is in `"accepted"` status | [`src/services/incident.service.js#L104-L116`](file:///d:/SafeRout-2/SafeRouteBackend/src/services/incident.service.js#L104-L116), [`src/services/responder.service.js#L21-L29`](file:///d:/SafeRout-2/SafeRouteBackend/src/services/responder.service.js#L21-L29) |
| 13 | **Responder Creation Response Key** | Documented or expected as `data: { user: {...} }` | `POST /admin/responders` returns `data: { responder: {...} }` | [`src/controllers/admin.controller.js#L120`](file:///d:/SafeRout-2/SafeRouteBackend/src/controllers/admin.controller.js#L120) |
| 14 | **Profile Image Field Name** | Generic descriptions occasionally cite form field as `image` | Multer expects exact multipart field name `profile_image`. Submitting `image` returns 400 `'Unexpected file field'` | [`src/middlewares/upload.middleware.js#L40`](file:///d:/SafeRout-2/SafeRouteBackend/src/middlewares/upload.middleware.js#L40) |
| 15 | **Refresh Token Idempotency Within Same Second** | Token rotation implies single-use instant expiration | `generateRefreshToken` does not incorporate a random nonce (jti). Reusing a refresh token within the same whole second generates an identical token and succeeds (reusing after 1 second properly returns 401 `AUTH_002`) | [`src/services/auth.service.js#L106-L114`](file:///d:/SafeRout-2/SafeRouteBackend/src/services/auth.service.js#L106-L114), [`src/utils/jwt.js#L9-L11`](file:///d:/SafeRout-2/SafeRouteBackend/src/utils/jwt.js#L9-L11) |
