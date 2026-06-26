# Attendance Management System - Project Context

Last Updated: 2026-06-13
Version: 0.6

## Purpose

Build a production-ready attendance management platform for organizations.

The platform allows employees to report attendance using a mobile application while validating their GPS location.

Managers manage employees, locations and attendance through a web dashboard.

---

## System Components

### Mobile Application

Technology:

- React Native
- Expo

Features:

- Login
- JWT Authentication
- Check-In
- Check-Out
- GPS Collection
- Attendance History

### Offline Attendance

The mobile app supports offline attendance handling.

If the server is unavailable, attendance records are saved locally in AsyncStorage as pending records.

When the app opens again, it attempts to send pending records to the API.

Attendance time is captured on the device and sent to the server, so delayed sync does not change the original attendance time.

---

### Backend API

Technology:

- ASP.NET Core Web API
- Entity Framework Core
- SQL Server

Responsibilities:

- Authentication
- GPS Validation
- Attendance Recording
- Employee Permissions

---

### Manager Dashboard

Technology:

- ASP.NET Core MVC

Features:

- Dashboard
- User Management
- Location Management
- Attendance History
- Permissions Management

### Location Management

Managers can create and edit work locations from the dashboard.

When creating a location:

- Manager enters location name
- Manager enters address
- Manager clicks Preview Location
- Google Maps displays the resolved location
- System saves address, latitude, longitude and radius

---

## Database Design

### Users

Stores employee information.

Important fields:

- FirstName
- LastName
- Username
- Password
- Role
- IsActive
- CanCheckInFromAnywhere

---

### WorkLocations

Stores allowed work locations.

Important fields:

- Name
- Address
- Latitude
- Longitude
- RadiusMeters
- IsActive

---

### UserWorkLocations

Many-to-many relationship between Users and WorkLocations.

Purpose:

- Defines which locations a user may use.

---

### AttendanceRecords

Stores attendance transactions.

Important fields:

- UserId
- Type
- AttendanceTime
- Latitude
- Longitude
- Address

---

## Current Business Rules

### User Location Validation

If:

```text
CanCheckInFromAnywhere = true
```

Attendance is always allowed.

Otherwise:

```text
User
↓
UserWorkLocations
↓
WorkLocations
↓
GPS Validation
```

Only assigned locations are accepted.

---

### Location Management

Locations are never deleted.

Use:

```text
IsActive
```

instead of physical deletion.

---

### User Management

Users are never deleted.

Use:

```text
IsActive
```

instead of physical deletion.

---

## Authentication Strategy

### Mobile

JWT Authentication.

### Dashboard

Cookie Authentication.

---

## Architectural Decisions

- MVC for dashboard
- API Controllers for mobile endpoints
- SQL Server database
- Entity Framework Core
- Google Maps Geocoding
- GPS validation on server side
- Soft disable using IsActive
- Dashboard UI uses Bootstrap 5.
- Location creation includes Google Maps preview before saving.
- Geocoding for location creation is handled by the server through GoogleGeocodingService.
- Map preview uses Google Maps JavaScript API on the dashboard.
- Mobile attendance records may be stored locally as pending records when the API is unavailable.
- The server stores the original device attendance time after converting it to local server time.

---

## Future Features

### Authentication

- Complete Manager Login
- Logout
- Role Based Authorization

### Reports

- Monthly Attendance Reports
- Missing Attendance Reports
- Late Arrival Reports

### Dashboard

- Statistics
- Employee Overview
- Location Usage

### Mobile

- Better UI
- Push Notifications
- Manager Approvals

### Security

- Password Hashing
- Password Reset
- Audit Logs

---

## Important Notes For AI Agents

Always preserve:

- UserWorkLocations relationship
- GPS validation logic
- JWT authentication for mobile
- Cookie authentication for dashboard
- Soft delete approach using IsActive

Do not replace these architectural decisions without strong justification.
