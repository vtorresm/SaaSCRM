# 🏗️ User Management Architecture

## 📋 Overview

This document describes the architecture of the User Management system implemented in Sprint 4, including users, teams, and reporting modules.

## 🎯 Architecture Goals

1. **Modular Design**: Clear separation of concerns
2. **Scalability**: Designed to handle growth
3. **Maintainability**: Easy to understand and modify
4. **Security**: Robust security measures
5. **Performance**: Optimized for common operations

## 📦 Module Architecture

### 1. Users Module

```mermaid
classDiagram
    class UsersController {
        +create()
        +findAll()
        +findOne()
        +update()
        +remove()
        +findByEmail()
        +findByCompany()
        +findByRole()
        +search()
        +updateProfile()
        +updatePassword()
        +getUserStats()
        +getUserActivity()
    }

    class UsersService {
        +create()
        +findAll()
        +findOne()
        +update()
        +remove()
        +findByEmail()
        +findByCompany()
        +findByRole()
        +search()
        +updateProfile()
        +updatePassword()
        +getUserStats()
        +getUserActivity()
    }

    class PrismaService {
        +user
    }

    class AuthService {
        +hashPassword()
        +validatePassword()
    }

    class CompaniesService {
        +findAll()
    }

    UsersController --> UsersService
    UsersService --> PrismaService
    UsersService --> AuthService
    UsersService --> CompaniesService
```

### 2. Teams Module

```mermaid
classDiagram
    class TeamsController {
        +create()
        +findAll()
        +findOne()
        +update()
        +remove()
        +addUserToTeam()
        +removeUserFromTeam()
        +findTeamsByUser()
        +getTeamStats()
    }

    class TeamsService {
        +create()
        +findAll()
        +findOne()
        +update()
        +remove()
        +addUserToTeam()
        +removeUserFromTeam()
        +findTeamsByUser()
        +getTeamStats()
    }

    class PrismaService {
        +team
        +userTeam
    }

    class UsersService {
        +findOne()
    }

    TeamsController --> TeamsService
    TeamsService --> PrismaService
    TeamsService --> UsersService
```

### 3. Reports Module

```mermaid
classDiagram
    class ReportsController {
        +generateUserReport()
        +generateCompanyReport()
        +generateSalesReport()
        +generateSystemReport()
        +generateCustomReport()
    }

    class ReportsService {
        +generateUserReport()
        +generateCompanyReport()
        +generateSalesReport()
        +generateSystemReport()
        +generateCustomReport()
    }

    class UsersService {
        +findAll()
        +getUserStats()
    }

    class CompaniesService {
        +findAll()
        +findByStatus()
    }

    class QuotesService {
        +findAll()
        +findByStatus()
    }

    ReportsController --> ReportsService
    ReportsService --> UsersService
    ReportsService --> CompaniesService
    ReportsService --> QuotesService
```

## 🗃️ Database Schema

### User Table

```sql
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "phone" TEXT,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "emailVerifiedAt" TIMESTAMP,
    "lastLoginAt" TIMESTAMP,
    "failedLoginAttempts" INTEGER NOT NULL DEFAULT 0,
    "companyId" TEXT,
    "timezone" TEXT,
    "language" TEXT,
    "lockedUntil" TIMESTAMP,
    "refreshToken" TEXT,
    "refreshTokenExpiresAt" TIMESTAMP,
    "profilePicture" TEXT,
    "dataRetentionDate" TIMESTAMP NOT NULL,
    "twoFactorEnabled" BOOLEAN NOT NULL DEFAULT false,
    "twoFactorSecret" TEXT,
    "googleId" TEXT,
    "linkedinId" TEXT,
    "dataConsentGiven" BOOLEAN NOT NULL DEFAULT false,
    "dataConsentDate" TIMESTAMP,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP,
    FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL
);
```

### Team Table

```sql
CREATE TABLE "Team" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP
);
```

### UserTeam Table (Join Table)

```sql
CREATE TABLE "UserTeam" (
    "userId" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "joinedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY ("userId", "teamId"),
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE,
    FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE
);
```

## 🔄 Data Flow

### User Creation Flow

```mermaid
sequenceDiagram
    participant Client
    participant Controller
    participant Service
    participant AuthService
    participant PrismaService

    Client->>Controller: POST /users (CreateUserDto)
    Controller->>Service: create(createUserDto)
    Service->>AuthService: hashPassword(password)
    AuthService-->>Service: hashedPassword
    Service->>PrismaService: user.create({...})
    PrismaService-->>Service: createdUser
    Service-->>Controller: createdUser
    Controller-->>Client: 201 Created (User)
```

### Team User Assignment Flow

```mermaid
sequenceDiagram
    participant Client
    participant TeamsController
    participant TeamsService
    participant UsersService
    participant PrismaService

    Client->>TeamsController: POST /teams/{id}/users (AddUserToTeamDto)
    TeamsController->>TeamsService: addUserToTeam(teamId, addUserToTeamDto)
    TeamsService->>UsersService: findOne(userId)
    UsersService-->>TeamsService: user
    alt User exists
        TeamsService->>PrismaService: userTeam.findFirst({userId, teamId})
        PrismaService-->>TeamsService: existingMembership
        alt Not already member
            TeamsService->>PrismaService: userTeam.create({userId, teamId, role})
            PrismaService-->>TeamsService: userTeam
            TeamsService-->>TeamsController: userTeam
            TeamsController-->>Client: 201 Created (UserTeam)
        else Already member
            TeamsService-->>TeamsController: ConflictException
            TeamsController-->>Client: 409 Conflict
        end
    else User not found
        TeamsService-->>TeamsController: NotFoundException
        TeamsController-->>Client: 404 Not Found
    end
```

## 📊 Reporting Architecture

```mermaid
flowchart TD
    A[Client Request] --> B[ReportsController]
    B --> C[ReportsService]
    C --> D[UsersService.getUserStats()]
    C --> E[CompaniesService.findAll()]
    C --> F[QuotesService.findAll()]
    D --> G[User Statistics]
    E --> H[Company Data]
    F --> I[Sales Data]
    G --> J[Report Aggregation]
    H --> J
    I --> J
    J --> K[Report Generation]
    K --> L[Response Formatting]
    L --> M[Client Response]
```

## 🔒 Security Architecture

### Authentication Flow

```mermaid
sequenceDiagram
    participant Client
    participant AuthController
    participant AuthService
    participant UsersService
    participant JwtService

    Client->>AuthController: POST /auth/login (LoginDto)
    AuthController->>AuthService: validateUser(email, password)
    AuthService->>UsersService: findByEmail(email)
    UsersService-->>AuthService: user
    alt User found
        AuthService->>AuthService: comparePasswords(password, user.password)
        alt Password valid
            AuthService->>JwtService: signAsync(payload)
            JwtService-->>AuthService: accessToken
            AuthService-->>AuthController: {accessToken, user}
            AuthController-->>Client: 200 OK (AuthResponse)
        else Password invalid
            AuthService-->>AuthController: UnauthorizedException
            AuthController-->>Client: 401 Unauthorized
        end
    else User not found
        AuthService-->>AuthController: UnauthorizedException
        AuthController-->>Client: 401 Unauthorized
    end
```

## 🧪 Testing Architecture

```mermaid
classDiagram
    class TestModule {
        +compile()
    }

    class UsersServiceTest {
        +should be defined()
        +should create a user()
        +should return an array of users()
        +should return a single user()
        +should update a user()
        +should soft delete a user()
        +should find user by email()
        +should find users by company()
        +should find users by role()
        +should search users by query()
        +should update user profile()
        +should update user password()
        +should return user statistics()
        +should return user activity()
    }

    class TeamsServiceTest {
        +should be defined()
        +should create a team()
        +should return an array of teams()
        +should add user to team()
        +should return team statistics()
    }

    TestModule <|-- UsersServiceTest
    TestModule <|-- TeamsServiceTest
```

## 📈 Performance Considerations

1. **Database Indexing**: Proper indexing on frequently queried fields
2. **Caching**: Potential caching for user statistics and reports
3. **Batch Operations**: Support for bulk user operations
4. **Pagination**: All list endpoints support pagination
5. **Query Optimization**: Efficient database queries

## 🔄 Integration Points

### Dashboard Integration

```mermaid
flowchart TD
    A[DashboardController] --> B[DashboardService.getMetrics()]
    B --> C[UsersService.getUserStats()]
    B --> D[CompaniesService.count()]
    B --> E[ContactsService.count()]
    B --> F[QuotesService.count()]
    C --> G[User Statistics]
    D --> H[Company Count]
    E --> I[Contact Count]
    F --> J[Quote Count]
    G --> K[Metrics Aggregation]
    H --> K
    I --> K
    J --> K
    K --> L[Dashboard Data]
```

### Company Integration

```mermaid
flowchart TD
    A[UsersService] --> B[Company Association]
    B --> C[companyId field]
    C --> D[Company validation]
    D --> E[Company queries]
    E --> F[Company-specific user operations]
```

## 📝 API Documentation

All endpoints are documented with Swagger/OpenAPI:

```typescript
@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  @Post()
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({ status: 201, description: 'User created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async create(@Body() createUserDto: CreateUserDto) {
    // Implementation
  }
}
```

## 🚀 Deployment Architecture

```mermaid
flowchart TD
    A[Development] --> B[Staging]
    B --> C[Production]
    A --> D[CI/CD Pipeline]
    D --> E[Automated Testing]
    E --> F[Build Process]
    F --> G[Containerization]
    G --> H[Deployment]
    H --> B
    H --> C
```

This architecture document provides a comprehensive overview of the User Management system's design, data flow, security measures, and integration points, serving as a reference for developers and architects.