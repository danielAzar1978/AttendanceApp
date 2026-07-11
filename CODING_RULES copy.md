# CODING_RULES.md

Last Updated: 2026-06-13
Version: 0.6

## Development Philosophy

This project is intended to become a production-ready attendance management system.

Code should prioritize:

- Maintainability
- Readability
- Security
- Scalability

Avoid quick fixes that create future technical debt.

---

## Project Structure

### Dashboard

Use ASP.NET Core MVC.

Pattern:

```text
Controller
View
Model
```

Dashboard pages must use MVC Views.

Examples:

- Users
- LocationManagement
- Dashboard

* Dashboard UI uses Bootstrap 5.
* Location creation includes Google Maps preview before saving.
* Geocoding for location creation is handled by the server through GoogleGeocodingService.
* Map preview uses Google Maps JavaScript API on the dashboard.

---

### Mobile API

Use API Controllers only.

Pattern:

```text
Controller
Service
Database
```

Return JSON responses only.

Examples:

- AuthController
- AttendanceController
- LocationsController

---

## Entity Framework Rules

Use Entity Framework Core.

All schema changes must be performed through migrations.

Never manually modify database schema in production.

Migration naming examples:

```text
AddIsActiveToWorkLocation
AddUserWorkLocations
AddAddressToAttendanceRecord
```

---

## Database Rules

### Soft Delete

Never physically delete:

- Users
- WorkLocations

Use:

```csharp
IsActive
```

instead.

---

### Relationships

Use proper relationships.

Example:

```text
Users
↓
UserWorkLocations
↓
WorkLocations
```

Never bypass this relationship.

---

## GPS Validation Rules

Validation must occur on the server.

Never trust mobile client validation.

Current flow:

```text
Mobile App
↓
Send GPS
↓
API
↓
Validate Location
↓
Save Attendance
```

---

## Authentication Rules

### Mobile Application

Uses JWT Authentication.

Never replace JWT with cookies for mobile users.

---

### Manager Dashboard

Uses Cookie Authentication.

Never use JWT for MVC pages unless there is a strong business requirement.

---

## Location Rules

Location coordinates are obtained using Google Maps Geocoding API.

Stored data:

- Name
- Address
- Latitude
- Longitude
- RadiusMeters

Location matching is based on radius calculations.

---

## User Rules

Users contain:

- FirstName
- LastName
- Username
- Password
- Email
- Phone
- Role
- IsActive
- CanCheckInFromAnywhere

---

## Attendance Rules

Attendance records contain:

- UserId
- Type
- AttendanceTime
- Latitude
- Longitude
- Address

Types:

```text
CheckIn
CheckOut
```

Future types may be added.

## Offline Attendance Rules

When attendance cannot be sent to the server, it must be saved locally as pending.

Pending attendance records must include:

- userId
- type
- latitude
- longitude
- attendanceTime

The original attendance time must be preserved.

Pending records should be sent automatically when the app can reach the server again.

---

## UI Rules

Dashboard should always use:

- Shared Layout
- Navigation Menu
- MVC Views

Avoid duplicated UI code.

Use:

```text
Views/Shared/_Layout.cshtml
```

for common navigation.

---

## Future Improvements

Planned:

- Manager Login
- Logout
- Authorization
- Reports
- Monthly Summaries
- Employee Self-Service
- Notifications
- Password Hashing
- Audit Logs

---

## Instructions For AI Agents

Before making changes:

1. Read README.md
2. Read PROJECT_CONTEXT.md
3. Read CODING_RULES.md

Always preserve:

- JWT for mobile
- Cookie Authentication for dashboard
- GPS server validation
- UserWorkLocations relationship
- Soft delete using IsActive

## Offline Attendance Rules

Every attendance request must include:

- ClientRecordId
- UserId
- Type
- Latitude
- Longitude
- AttendanceTime

ClientRecordId must be generated once when the attendance action is created.

The same ClientRecordId must be reused for all retry attempts.

Do not generate a new ClientRecordId during synchronization.

Pending attendance records must be stored in AsyncStorage.

Pending records should be synchronized when:

- The main screen gains focus
- Network connectivity is restored

Response handling rules:

- 2xx response: remove the record from pending storage
- 5xx response or network failure: keep the record for retry
- 4xx business rejection: remove the record and show the rejection message to the user

Business validation must use the attendance date, not the server receive date.

A Check-In from a previous day must not block a new Check-In on the current day.

Ask before making major architectural changes.
