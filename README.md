# Attendance Management System

Last Updated: 2026-06-13
Version: 0.6

## Overview

Attendance Management System is a GPS-based employee attendance solution.

The system consists of:

- ASP.NET Core MVC Manager Dashboard
- ASP.NET Core Web API
- SQL Server Database
- React Native Mobile Application

Managers can manage employees, locations, permissions and attendance records.

Employees use the mobile application to perform Check-In and Check-Out operations.

---

## Technologies

### Backend

- ASP.NET Core
- Entity Framework Core
- SQL Server
- JWT Authentication
- Cookie Authentication

### Mobile

- React Native
- Expo
- GPS / Location Services

### External Services

- Google Maps Geocoding API
- Google Maps Geocoding API
- Google Maps JavaScript API
- Bootstrap 5

---

## Features

- Mobile offline attendance queue
- Pending attendance records saved locally when server is unavailable
- Attendance time is captured on the mobile device and sent to the server
- Mobile UI improvements for login, check-in/check-out and attendance history

## Mobile Features

- Offline attendance queue using AsyncStorage
- Automatic synchronization when the app regains connectivity
- Retry of pending attendance records when returning to the main screen
- Duplicate prevention using ClientRecordId
- Business validation for duplicate check-in/check-out actions
- Attendance time is preserved from the mobile device

### Offline Attendance

If the API is unavailable, the mobile app stores the attendance record locally.

Each pending record includes:

- ClientRecordId
- UserId
- Type
- Latitude
- Longitude
- AttendanceTime

Pending records are sent automatically when:

- The app returns to the main screen
- Network connectivity is restored

The original attendance time is preserved.

### Employee Management

- Create Employee
- Edit Employee
- View Employee Details
- Activate / Deactivate Employee

### Location Management

- Create Location
- Edit Location
- Activate / Deactivate Location

### Attendance Management

- Check-In
- Check-Out
- GPS Validation
- Address Validation
- Attendance History
- Monthly Attendance View

* Bootstrap-based Manager Dashboard UI
* Location creation from the dashboard
* Google Maps preview before saving a location
* Address geocoding using Google Maps API

### Permissions

- Allow attendance from anywhere
- Restrict attendance to assigned locations

---

## Database Tables

### Users

Stores employee information.

### WorkLocations

Stores work locations and allowed GPS areas.

### UserWorkLocations

Links employees to work locations.

### AttendanceRecords

Stores attendance transactions.

---

## Authentication

### Mobile Application

Uses JWT Authentication.

### Manager Dashboard

Uses Cookie Authentication.

---

## Running the Project

1. Update connection string in appsettings.json
2. Run migrations

```bash
dotnet ef database update
```

3. Run project

```bash
dotnet run
```

4. Open dashboard

```text
https://localhost:xxxx
```

---

## Current Status

The system currently supports:

- User Management
- Location Management
- GPS Attendance
- Location Assignment
- Attendance History

Future development will include reporting, role management and advanced dashboard features.
