# 📚 User Management API Reference

## 📋 Overview

This document provides comprehensive API reference for the User Management system implemented in Sprint 4.

## 🔐 Authentication

All endpoints require JWT authentication unless otherwise noted.

```typescript
// Example authentication header
Authorization: Bearer {your_access_token}
```

## 👥 Users API

### Create User

```http
POST /api/v1/users
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "password": "securePassword123!",
  "role": "USER",
  "companyId": "comp_123456789",
  "phone": "+1234567890",
  "timezone": "America/Lima",
  "language": "en"
}
```

**Response:**
```json
{
  "id": "user_987654321",
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "role": "USER",
  "status": "ACTIVE",
  "companyId": "comp_123456789",
  "phone": "+1234567890",
  "timezone": "America/Lima",
  "language": "en",
  "createdAt": "2023-12-07T03:27:30.000Z",
  "updatedAt": "2023-12-07T03:27:30.000Z"
}
```

**Status Codes:**
- 201 Created: User created successfully
- 400 Bad Request: Invalid input data
- 409 Conflict: Email already exists

---

### List All Users

```http
GET /api/v1/users
```

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `sort`: Sort field (default: createdAt)
- `order`: Sort order (asc/desc, default: desc)

**Response:**
```json
{
  "data": [
    {
      "id": "user_987654321",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@example.com",
      "role": "USER",
      "status": "ACTIVE",
      "company": {
        "id": "comp_123456789",
        "name": "Acme Corp"
      },
      "createdAt": "2023-12-07T03:27:30.000Z",
      "updatedAt": "2023-12-07T03:27:30.000Z"
    }
  ],
  "total": 1,
  "page": 1,
  "limit": 10,
  "totalPages": 1
}
```

**Status Codes:**
- 200 OK: Success
- 401 Unauthorized: Authentication required

---

### Get User by ID

```http
GET /api/v1/users/user_987654321
```

**Response:**
```json
{
  "id": "user_987654321",
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "role": "USER",
  "status": "ACTIVE",
  "phone": "+1234567890",
  "emailVerified": true,
  "company": {
    "id": "comp_123456789",
    "name": "Acme Corp"
  },
  "teams": [
    {
      "id": "team_111111111",
      "name": "Sales Team",
      "role": "MEMBER"
    }
  ],
  "createdQuotes": [],
  "assignedQuotes": [],
  "createdAt": "2023-12-07T03:27:30.000Z",
  "updatedAt": "2023-12-07T03:27:30.000Z"
}
```

**Status Codes:**
- 200 OK: Success
- 404 Not Found: User not found

---

### Update User

```http
PUT /api/v1/users/user_987654321
Content-Type: application/json

{
  "firstName": "Johnathan",
  "lastName": "Doe",
  "role": "MANAGER",
  "status": "ACTIVE",
  "phone": "+1987654321"
}
```

**Response:**
```json
{
  "id": "user_987654321",
  "firstName": "Johnathan",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "role": "MANAGER",
  "status": "ACTIVE",
  "phone": "+1987654321",
  "companyId": "comp_123456789",
  "updatedAt": "2023-12-07T03:28:00.000Z"
}
```

**Status Codes:**
- 200 OK: User updated successfully
- 400 Bad Request: Invalid input data
- 404 Not Found: User not found

---

### Delete User (Soft Delete)

```http
DELETE /api/v1/users/user_987654321
```

**Response:**
```json
{
  "id": "user_987654321",
  "firstName": "Johnathan",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "deletedAt": "2023-12-07T03:28:05.000Z"
}
```

**Status Codes:**
- 200 OK: User deleted successfully
- 404 Not Found: User not found

---

### Get User by Email

```http
GET /api/v1/users/email/john.doe@example.com
```

**Response:** Same as Get User by ID

**Status Codes:**
- 200 OK: Success
- 404 Not Found: User not found

---

### Get Users by Company

```http
GET /api/v1/users/company/comp_123456789
```

**Response:**
```json
{
  "data": [
    {
      "id": "user_987654321",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@example.com",
      "role": "USER",
      "status": "ACTIVE",
      "teams": [
        {
          "id": "team_111111111",
          "name": "Sales Team"
        }
      ]
    }
  ],
  "total": 1
}
```

**Status Codes:**
- 200 OK: Success
- 404 Not Found: Company not found

---

### Get Users by Role

```http
GET /api/v1/users/role/ADMIN
```

**Response:**
```json
{
  "data": [
    {
      "id": "user_111111111",
      "firstName": "Admin",
      "lastName": "User",
      "email": "admin@example.com",
      "role": "ADMIN",
      "status": "ACTIVE"
    }
  ],
  "total": 1
}
```

**Status Codes:**
- 200 OK: Success

---

### Search Users

```http
GET /api/v1/users/search?q=john
```

**Response:** Same as Get Users by Role

**Status Codes:**
- 200 OK: Success

---

### Update User Profile

```http
PUT /api/v1/users/user_987654321/profile
Content-Type: application/json

{
  "firstName": "Johnny",
  "lastName": "Doe",
  "phone": "+1123456789",
  "timezone": "America/New_York",
  "language": "es"
}
```

**Response:**
```json
{
  "id": "user_987654321",
  "firstName": "Johnny",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "phone": "+1123456789",
  "timezone": "America/New_York",
  "language": "es"
}
```

**Status Codes:**
- 200 OK: Profile updated successfully
- 400 Bad Request: Invalid input data
- 404 Not Found: User not found

---

### Update User Password

```http
PUT /api/v1/users/user_987654321/password
Content-Type: application/json

{
  "currentPassword": "oldPassword123!",
  "newPassword": "newSecurePassword456!",
  "confirmPassword": "newSecurePassword456!"
}
```

**Response:**
```json
{
  "message": "Password updated successfully",
  "updatedAt": "2023-12-07T03:28:10.000Z"
}
```

**Status Codes:**
- 200 OK: Password updated successfully
- 400 Bad Request: Invalid input data
- 401 Unauthorized: Current password incorrect
- 404 Not Found: User not found

---

### Get User Statistics

```http
GET /api/v1/users/stats
```

**Response:**
```json
{
  "totalUsers": 42,
  "activeUsers": 38,
  "inactiveUsers": 4,
  "usersByRole": {
    "ADMIN": 2,
    "MANAGER": 5,
    "USER": 35
  }
}
```

**Status Codes:**
- 200 OK: Success

---

### Get User Activity

```http
GET /api/v1/users/user_987654321/activity
```

**Response:**
```json
{
  "user": {
    "id": "user_987654321",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com"
  },
  "recentQuotes": [
    {
      "id": "quote_123456789",
      "quoteNumber": "QT-2023-001",
      "title": "Project Proposal",
      "status": "SENT",
      "createdAt": "2023-12-01T10:00:00.000Z"
    }
  ],
  "assignedQuotes": [
    {
      "id": "quote_987654321",
      "quoteNumber": "QT-2023-002",
      "title": "Service Agreement",
      "status": "DRAFT",
      "createdAt": "2023-12-05T14:30:00.000Z"
    }
  ]
}
```

**Status Codes:**
- 200 OK: Success
- 404 Not Found: User not found

---

## 👥 Teams API

### Create Team

```http
POST /api/v1/teams
Content-Type: application/json

{
  "name": "Marketing Team",
  "description": "Team responsible for marketing activities"
}
```

**Response:**
```json
{
  "id": "team_222222222",
  "name": "Marketing Team",
  "description": "Team responsible for marketing activities",
  "createdAt": "2023-12-07T03:28:15.000Z",
  "updatedAt": "2023-12-07T03:28:15.000Z"
}
```

**Status Codes:**
- 201 Created: Team created successfully
- 400 Bad Request: Invalid input data
- 409 Conflict: Team name already exists

---

### List All Teams

```http
GET /api/v1/teams
```

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `sort`: Sort field (default: createdAt)
- `order`: Sort order (asc/desc, default: desc)

**Response:**
```json
{
  "data": [
    {
      "id": "team_111111111",
      "name": "Sales Team",
      "description": "Sales department team",
      "userCount": 5,
      "createdAt": "2023-12-01T09:00:00.000Z",
      "updatedAt": "2023-12-01T09:00:00.000Z"
    }
  ],
  "total": 1,
  "page": 1,
  "limit": 10,
  "totalPages": 1
}
```

**Status Codes:**
- 200 OK: Success

---

### Get Team by ID

```http
GET /api/v1/teams/team_111111111
```

**Response:**
```json
{
  "id": "team_111111111",
  "name": "Sales Team",
  "description": "Sales department team",
  "users": [
    {
      "userId": "user_987654321",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@example.com",
      "role": "MEMBER",
      "joinedAt": "2023-12-01T10:00:00.000Z"
    }
  ],
  "createdAt": "2023-12-01T09:00:00.000Z",
  "updatedAt": "2023-12-01T09:00:00.000Z"
}
```

**Status Codes:**
- 200 OK: Success
- 404 Not Found: Team not found

---

### Update Team

```http
PUT /api/v1/teams/team_111111111
Content-Type: application/json

{
  "name": "Sales Department",
  "description": "Updated sales department team"
}
```

**Response:**
```json
{
  "id": "team_111111111",
  "name": "Sales Department",
  "description": "Updated sales department team",
  "updatedAt": "2023-12-07T03:28:20.000Z"
}
```

**Status Codes:**
- 200 OK: Team updated successfully
- 400 Bad Request: Invalid input data
- 404 Not Found: Team not found
- 409 Conflict: Team name already exists

---

### Delete Team

```http
DELETE /api/v1/teams/team_111111111
```

**Response:**
```json
{
  "id": "team_111111111",
  "name": "Sales Department",
  "deletedAt": "2023-12-07T03:28:25.000Z"
}
```

**Status Codes:**
- 200 OK: Team deleted successfully
- 404 Not Found: Team not found

---

### Add User to Team

```http
POST /api/v1/teams/team_111111111/users
Content-Type: application/json

{
  "userId": "user_987654321",
  "role": "MEMBER"
}
```

**Response:**
```json
{
  "teamId": "team_111111111",
  "userId": "user_987654321",
  "role": "MEMBER",
  "joinedAt": "2023-12-07T03:28:30.000Z"
}
```

**Status Codes:**
- 201 Created: User added to team successfully
- 400 Bad Request: Invalid input data
- 404 Not Found: Team or user not found
- 409 Conflict: User already in team

---

### Remove User from Team

```http
DELETE /api/v1/teams/team_111111111/users/user_987654321
```

**Response:**
```json
{
  "teamId": "team_111111111",
  "userId": "user_987654321",
  "removedAt": "2023-12-07T03:28:35.000Z"
}
```

**Status Codes:**
- 200 OK: User removed from team successfully
- 404 Not Found: Team, user, or membership not found

---

### Get Teams by User

```http
GET /api/v1/teams/user/user_987654321
```

**Response:**
```json
{
  "data": [
    {
      "id": "team_111111111",
      "name": "Sales Team",
      "description": "Sales department team",
      "role": "MEMBER",
      "joinedAt": "2023-12-01T10:00:00.000Z"
    }
  ],
  "total": 1
}
```

**Status Codes:**
- 200 OK: Success
- 404 Not Found: User not found

---

### Get Team Statistics

```http
GET /api/v1/teams/stats
```

**Response:**
```json
{
  "totalTeams": 5,
  "averageTeamSize": 3.2,
  "teamsBySize": {
    "1-5": 3,
    "6-10": 1,
    "11-20": 1
  },
  "userDistribution": {
    "noTeam": 5,
    "oneTeam": 20,
    "multipleTeams": 10
  }
}
```

**Status Codes:**
- 200 OK: Success

---

## 📊 Reports API

### Generate User Report

```http
GET /api/v1/reports/users
```

**Query Parameters:**
- `startDate`: Start date for report (ISO format)
- `endDate`: End date for report (ISO format)

**Response:**
```json
{
  "title": "User Activity Report",
  "generatedAt": "2023-12-07T03:28:40.000Z",
  "summary": {
    "totalUsers": 42,
    "activeUsers": 38,
    "inactiveUsers": 4,
    "usersByRole": {
      "ADMIN": 2,
      "MANAGER": 5,
      "USER": 35
    }
  },
  "users": [
    {
      "id": "user_987654321",
      "name": "John Doe",
      "email": "john.doe@example.com",
      "role": "USER",
      "status": "ACTIVE",
      "company": "Acme Corp",
      "createdAt": "2023-12-01T10:00:00.000Z"
    }
  ]
}
```

**Status Codes:**
- 200 OK: Success

---

### Generate Company Report

```http
GET /api/v1/reports/companies
```

**Query Parameters:**
- `startDate`: Start date for report (ISO format)
- `endDate`: End date for report (ISO format)

**Response:**
```json
{
  "title": "Company Activity Report",
  "generatedAt": "2023-12-07T03:28:45.000Z",
  "summary": {
    "totalCompanies": 15,
    "companiesByStatus": {
      "ACTIVE": 12,
      "INACTIVE": 2,
      "PROSPECT": 1
    }
  },
  "companies": [
    {
      "id": "comp_123456789",
      "name": "Acme Corp",
      "status": "ACTIVE",
      "contactCount": 8,
      "quoteCount": 12,
      "createdAt": "2023-11-01T09:00:00.000Z"
    }
  ]
}
```

**Status Codes:**
- 200 OK: Success

---

### Generate Sales Report

```http
GET /api/v1/reports/sales
```

**Query Parameters:**
- `startDate`: Start date for report (ISO format)
- `endDate`: End date for report (ISO format)

**Response:**
```json
{
  "title": "Sales Performance Report",
  "generatedAt": "2023-12-07T03:28:50.000Z",
  "summary": {
    "totalQuotes": 48,
    "totalValue": 125000.00,
    "averageQuoteValue": 2604.17
  },
  "quotesByStatus": {
    "DRAFT": 5,
    "SENT": 15,
    "VIEWED": 8,
    "ACCEPTED": 12,
    "REJECTED": 3,
    "EXPIRED": 4,
    "CANCELLED": 1
  },
  "recentQuotes": [
    {
      "id": "quote_123456789",
      "quoteNumber": "QT-2023-048",
      "title": "Enterprise Solution",
      "status": "SENT",
      "totalAmount": 15000.00,
      "client": "Acme Corp",
      "createdAt": "2023-12-05T14:30:00.000Z"
    }
  ]
}
```

**Status Codes:**
- 200 OK: Success

---

### Generate System Report

```http
GET /api/v1/reports/system
```

**Response:**
```json
{
  "title": "System Overview Report",
  "generatedAt": "2023-12-07T03:28:55.000Z",
  "summary": {
    "totalUsers": 42,
    "totalCompanies": 15,
    "totalQuotes": 48,
    "activeUsers": 38
  },
  "activity": {
    "recentUsers": [
      {
        "id": "user_987654321",
        "firstName": "John",
        "lastName": "Doe",
        "email": "john.doe@example.com",
        "createdAt": "2023-12-07T03:27:30.000Z"
      }
    ],
    "recentCompanies": [
      {
        "id": "comp_123456789",
        "name": "Acme Corp",
        "createdAt": "2023-11-01T09:00:00.000Z"
      }
    ],
    "recentQuotes": [
      {
        "id": "quote_123456789",
        "quoteNumber": "QT-2023-048",
        "title": "Enterprise Solution",
        "createdAt": "2023-12-05T14:30:00.000Z"
      }
    ]
  }
}
```

**Status Codes:**
- 200 OK: Success

---

### Generate Custom Report

```http
POST /api/v1/reports/custom
Content-Type: application/json

{
  "startDate": "2023-12-01",
  "endDate": "2023-12-07",
  "reportType": "users",
  "filters": {
    "role": "USER",
    "status": "ACTIVE"
  }
}
```

**Response:**
```json
{
  "title": "Custom User Report (2023-12-01 to 2023-12-07)",
  "generatedAt": "2023-12-07T03:29:00.000Z",
  "count": 8,
  "users": [
    {
      "id": "user_987654321",
      "name": "John Doe",
      "email": "john.doe@example.com",
      "role": "USER",
      "createdAt": "2023-12-01T10:00:00.000Z"
    }
  ]
}
```

**Status Codes:**
- 200 OK: Success
- 400 Bad Request: Invalid input data

---

## 📝 Error Responses

### Standard Error Format

```json
{
  "statusCode": 404,
  "message": "User not found",
  "error": "Not Found"
}
```

### Validation Error Format

```json
{
  "statusCode": 400,
  "message": [
    "email must be an email",
    "password must be stronger"
  ],
  "error": "Bad Request"
}
```

---

## 🔒 Authentication Errors

### Unauthorized

```json
{
  "statusCode": 401,
  "message": "Unauthorized",
  "error": "Unauthorized"
}
```

### Forbidden

```json
{
  "statusCode": 403,
  "message": "Forbidden resource",
  "error": "Forbidden"
}
```

---

## 📊 Rate Limiting

All API endpoints are subject to rate limiting:

- **Standard Endpoints**: 100 requests per minute
- **Search Endpoints**: 50 requests per minute
- **Report Endpoints**: 20 requests per minute

**Rate Limit Exceeded Response:**
```json
{
  "statusCode": 429,
  "message": "Too many requests, please try again later",
  "error": "Too Many Requests"
}
```

---

## 📝 API Versioning

The API uses URL-based versioning:

```
https://api.example.com/api/v1/{endpoint}
```

Current version: `v1`

---

## 🔄 Pagination

All list endpoints support pagination:

**Request:**
```
GET /api/v1/users?page=2&limit=25&sort=createdAt&order=desc
```

**Response:**
```json
{
  "data": [...],
  "total": 100,
  "page": 2,
  "limit": 25,
  "totalPages": 4
}
```

---

## 📱 Response Formats

All responses are in JSON format with appropriate HTTP status codes.

**Content-Type:** `application/json`

---

## 🔐 Security Headers

All responses include security headers:

```
Content-Security-Policy: default-src 'self'
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
```

---

This API reference document provides comprehensive details on all User Management endpoints, request/response formats, error handling, and security considerations for the Sprint 4 implementation.