# 🧪 User Management Testing Guide

## 📋 Overview

This guide provides comprehensive testing instructions for the User Management system implemented in Sprint 4.

## 🧪 Testing Strategy

### 1. Unit Testing

**Objective:** Test individual components in isolation

**Coverage:**
- Service methods
- Utility functions
- Data transformation logic

**Tools:**
- Jest
- NestJS Testing Module

### 2. Integration Testing

**Objective:** Test interactions between components

**Coverage:**
- Service-service interactions
- Database operations
- External service integrations

**Tools:**
- Jest
- Supertest
- Test databases

### 3. End-to-End Testing

**Objective:** Test complete user flows

**Coverage:**
- API endpoints
- Authentication flows
- Complete user journeys

**Tools:**
- Supertest
- Postman/Newman
- Cypress (future)

### 4. Performance Testing

**Objective:** Ensure system performance under load

**Coverage:**
- Response times
- Concurrent user handling
- Database query performance

**Tools:**
- Artillery
- k6
- JMeter

## 🏗️ Test Environment Setup

### Prerequisites

1. Node.js v18+
2. PostgreSQL 14+
3. Redis (for caching)
4. Docker (for containerized testing)

### Setup Instructions

```bash
# Install dependencies
npm install

# Set up test database
npm run db:test:setup

# Run migrations
npm run db:test:migrate

# Seed test data
npm run db:test:seed
```

## 🧪 Running Tests

### Unit Tests

```bash
# Run all unit tests
npm run test:unit

# Run specific test file
npm run test:unit -- users.service.spec

# Run with coverage
npm run test:coverage
```

### Integration Tests

```bash
# Run integration tests
npm run test:integration

# Run specific integration test
npm run test:integration -- teams.integration.spec
```

### End-to-End Tests

```bash
# Run E2E tests
npm run test:e2e

# Run specific E2E test
npm run test:e2e -- users.e2e.spec
```

## 📋 Test Cases

### Users Module Tests

#### Create User Tests

**Test Case:** Successful user creation
```typescript
it('should create a user with valid data', async () => {
  const createUserDto = {
    firstName: 'Test',
    lastName: 'User',
    email: 'test.user@example.com',
    password: 'SecurePassword123!',
    role: 'USER'
  };

  const result = await service.create(createUserDto);

  expect(result).toBeDefined();
  expect(result.id).toBeDefined();
  expect(result.email).toBe(createUserDto.email);
  expect(result.password).not.toBe(createUserDto.password); // Should be hashed
});
```

**Test Case:** Duplicate email handling
```typescript
it('should throw error for duplicate email', async () => {
  const createUserDto = {
    firstName: 'Duplicate',
    lastName: 'User',
    email: 'existing.user@example.com', // Already exists
    password: 'Password123!',
    role: 'USER'
  };

  await expect(service.create(createUserDto))
    .rejects
    .toThrow(ConflictException);
});
```

#### User Retrieval Tests

**Test Case:** Get user by ID
```typescript
it('should return user by valid ID', async () => {
  const userId = 'user_123456789';
  const result = await service.findOne(userId);

  expect(result).toBeDefined();
  expect(result.id).toBe(userId);
});
```

**Test Case:** Handle non-existent user
```typescript
it('should throw error for non-existent user', async () => {
  const nonExistentId = 'user_nonexistent';

  await expect(service.findOne(nonExistentId))
    .rejects
    .toThrow(NotFoundException);
});
```

#### User Update Tests

**Test Case:** Successful user update
```typescript
it('should update user successfully', async () => {
  const userId = 'user_123456789';
  const updateDto = {
    firstName: 'Updated',
    lastName: 'Name'
  };

  const result = await service.update(userId, updateDto);

  expect(result.firstName).toBe(updateDto.firstName);
  expect(result.lastName).toBe(updateDto.lastName);
});
```

**Test Case:** Update non-existent user
```typescript
it('should throw error when updating non-existent user', async () => {
  const nonExistentId = 'user_nonexistent';
  const updateDto = { firstName: 'Test' };

  await expect(service.update(nonExistentId, updateDto))
    .rejects
    .toThrow(NotFoundException);
});
```

#### Password Update Tests

**Test Case:** Successful password update
```typescript
it('should update password successfully', async () => {
  const userId = 'user_123456789';
  const passwordDto = {
    currentPassword: 'OldPassword123!',
    newPassword: 'NewSecurePassword456!',
    confirmPassword: 'NewSecurePassword456!'
  };

  const result = await service.updatePassword(userId, passwordDto);

  expect(result).toBeDefined();
  // Verify password was actually changed
});
```

**Test Case:** Incorrect current password
```typescript
it('should throw error for incorrect current password', async () => {
  const userId = 'user_123456789';
  const passwordDto = {
    currentPassword: 'WrongPassword123!',
    newPassword: 'NewPassword456!',
    confirmPassword: 'NewPassword456!'
  };

  await expect(service.updatePassword(userId, passwordDto))
    .rejects
    .toThrow(UnauthorizedException);
});
```

### Teams Module Tests

#### Team Creation Tests

**Test Case:** Successful team creation
```typescript
it('should create a team successfully', async () => {
  const createTeamDto = {
    name: 'Test Team',
    description: 'Team for testing purposes'
  };

  const result = await service.create(createTeamDto);

  expect(result).toBeDefined();
  expect(result.id).toBeDefined();
  expect(result.name).toBe(createTeamDto.name);
});
```

**Test Case:** Duplicate team name
```typescript
it('should throw error for duplicate team name', async () => {
  const createTeamDto = {
    name: 'Existing Team', // Already exists
    description: 'Duplicate team'
  };

  await expect(service.create(createTeamDto))
    .rejects
    .toThrow(ConflictException);
});
```

#### Team User Management Tests

**Test Case:** Add user to team
```typescript
it('should add user to team successfully', async () => {
  const teamId = 'team_123456789';
  const userId = 'user_987654321';
  const addUserDto = {
    userId,
    role: 'MEMBER'
  };

  const result = await service.addUserToTeam(teamId, addUserDto);

  expect(result).toBeDefined();
  expect(result.userId).toBe(userId);
  expect(result.teamId).toBe(teamId);
});
```

**Test Case:** Add user to non-existent team
```typescript
it('should throw error when adding user to non-existent team', async () => {
  const nonExistentTeamId = 'team_nonexistent';
  const addUserDto = {
    userId: 'user_987654321',
    role: 'MEMBER'
  };

  await expect(service.addUserToTeam(nonExistentTeamId, addUserDto))
    .rejects
    .toThrow(NotFoundException);
});
```

**Test Case:** Add non-existent user to team
```typescript
it('should throw error when adding non-existent user to team', async () => {
  const teamId = 'team_123456789';
  const addUserDto = {
    userId: 'user_nonexistent',
    role: 'MEMBER'
  };

  await expect(service.addUserToTeam(teamId, addUserDto))
    .rejects
    .toThrow(NotFoundException);
});
```

### Reports Module Tests

#### User Report Tests

**Test Case:** Generate user report
```typescript
it('should generate user report successfully', async () => {
  const result = await service.generateUserReport();

  expect(result).toBeDefined();
  expect(result.title).toBe('User Activity Report');
  expect(result.summary).toBeDefined();
  expect(result.users).toBeInstanceOf(Array);
});
```

**Test Case:** Generate user report with date range
```typescript
it('should generate user report with date range', async () => {
  const startDate = '2023-12-01';
  const endDate = '2023-12-07';

  const result = await service.generateUserReport(startDate, endDate);

  expect(result).toBeDefined();
  // Verify date filtering was applied
});
```

#### Custom Report Tests

**Test Case:** Generate custom user report
```typescript
it('should generate custom report successfully', async () => {
  const customReportDto = {
    startDate: '2023-12-01',
    endDate: '2023-12-07',
    reportType: 'users',
    filters: {
      role: 'USER',
      status: 'ACTIVE'
    }
  };

  const result = await service.generateCustomReport(
    customReportDto.startDate,
    customReportDto.endDate,
    customReportDto.reportType
  );

  expect(result).toBeDefined();
  expect(result.title).toContain(customReportDto.startDate);
  expect(result.title).toContain(customReportDto.endDate);
});
```

## 🔧 Test Data Setup

### Test Data Factory

```typescript
// test-data.factory.ts
export class TestDataFactory {
  static createUser(overrides: Partial<User> = {}): User {
    return {
      id: `user_${Math.random().toString(36).substring(2, 11)}`,
      firstName: 'Test',
      lastName: 'User',
      email: `${Math.random().toString(36).substring(2, 11)}@example.com`,
      password: 'hashed_password',
      role: 'USER',
      status: 'ACTIVE',
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides
    };
  }

  static createTeam(overrides: Partial<Team> = {}): Team {
    return {
      id: `team_${Math.random().toString(36).substring(2, 11)}`,
      name: 'Test Team',
      description: 'Test team description',
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides
    };
  }
}
```

### Database Seeding

```typescript
// test-seeder.service.ts
@Injectable()
export class TestSeederService {
  constructor(
    private prisma: PrismaService,
    private authService: AuthService
  ) {}

  async seedUsers(count: number = 10) {
    const users = [];
    for (let i = 0; i < count; i++) {
      const user = TestDataFactory.createUser({
        email: `test.user${i}@example.com`,
        password: await this.authService.hashPassword('TestPassword123!')
      });
      users.push(this.prisma.user.create({ data: user }));
    }
    return Promise.all(users);
  }

  async seedTeams(count: number = 3) {
    const teams = [];
    for (let i = 0; i < count; i++) {
      const team = TestDataFactory.createTeam({
        name: `Test Team ${i + 1}`
      });
      teams.push(this.prisma.team.create({ data: team }));
    }
    return Promise.all(teams);
  }
}
```

## 📊 Performance Testing

### Load Test Script

```javascript
// load-test.js
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 50 },  // Ramp-up
    { duration: '1m', target: 100 },  // Normal load
    { duration: '30s', target: 200 }, // Stress test
    { duration: '30s', target: 0 },   // Ramp-down
  ],
  thresholds: {
    http_req_duration: ['p95<500'], // 95% of requests should be below 500ms
    'http_req_duration{type:api}': ['p95<300'], // API requests should be faster
  },
};

export default function () {
  // User creation test
  const userPayload = JSON.stringify({
    firstName: 'Load',
    lastName: 'Test',
    email: `load.test${Math.floor(Math.random() * 10000)}@example.com`,
    password: 'TestPassword123!',
    role: 'USER'
  });

  const userHeaders = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${__ENV.ACCESS_TOKEN}`
  };

  const res = http.post(
    'http://localhost:3000/api/v1/users',
    userPayload,
    { headers: userHeaders, tags: { type: 'api' } }
  );

  check(res, {
    'User creation successful': (r) => r.status === 201,
    'Response time acceptable': (r) => r.timings.duration < 500,
  });

  sleep(1);
}
```

### Running Performance Tests

```bash
# Install k6
brew install k6

# Run basic load test
k6 run load-test.js

# Run with environment variables
ACCESS_TOKEN=your_jwt_token k6 run load-test.js

# Run with cloud execution
k6 cloud load-test.js
```

## 📝 Test Reporting

### Generating Test Reports

```bash
# Generate HTML report
npm run test:report

# Generate JUnit report
npm run test:junit

# Generate coverage report
npm run test:coverage
```

### Test Report Structure

```
test-reports/
├── html/
│   └── index.html          # HTML report
├── junit/
│   └── results.xml         # JUnit report
├── coverage/
│   └── lcov-report/        # Coverage HTML
│       └── index.html
└── json/
    └── results.json        # JSON report
```

## 🔄 Continuous Integration

### CI Pipeline Configuration

```yaml
# .github/workflows/test.yml
name: Test Pipeline

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:14
        env:
          POSTGRES_USER: test
          POSTGRES_PASSWORD: test
          POSTGRES_DB: test
        ports:
          - 5432:5432
        options: --health-cmd pg_isready --health-interval 10s --health-timeout 5s --health-retries 5

    steps:
    - uses: actions/checkout@v3

    - name: Set up Node.js
      uses: actions/setup-node@v3
      with:
        node-version: 18

    - name: Install dependencies
      run: npm ci

    - name: Run database migrations
      run: npm run db:test:migrate
      env:
        DATABASE_URL: postgres://test:test@localhost:5432/test

    - name: Run unit tests
      run: npm run test:unit

    - name: Run integration tests
      run: npm run test:integration

    - name: Generate coverage report
      run: npm run test:coverage

    - name: Upload coverage to Codecov
      uses: codecov/codecov-action@v3
      with:
        token: ${{ secrets.CODECOV_TOKEN }}
        files: ./coverage/lcov.info
```

## 🧪 Test Best Practices

### 1. Test Isolation

- Each test should be independent
- Use `beforeEach` and `afterEach` for setup/teardown
- Avoid shared state between tests

### 2. Test Naming

- Use descriptive names: `should create user when data is valid`
- Follow the pattern: `should [expected behavior] when [condition]`

### 3. Assertions

- Test behavior, not implementation
- Use appropriate matchers
- Test both happy paths and edge cases

### 4. Mocking

- Mock external dependencies
- Use realistic test data
- Verify mock interactions

### 5. Error Handling

- Test error conditions
- Verify error types and messages
- Test edge cases and boundaries

## 📋 Test Checklist

### Pre-Test Checklist

- [ ] Database is properly configured
- [ ] Test data is seeded
- [ ] Environment variables are set
- [ ] Dependencies are installed
- [ ] No running processes on test ports

### Test Execution Checklist

- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] E2E tests pass
- [ ] Performance tests meet thresholds
- [ ] Coverage meets minimum requirements (80%)

### Post-Test Checklist

- [ ] Test reports are generated
- [ ] Coverage reports are uploaded
- [ ] Test environment is cleaned up
- [ ] Test results are documented
- [ ] Any failures are investigated and fixed

## 🔧 Troubleshooting

### Common Test Issues

**Issue:** Database connection failures
**Solution:**
- Verify database is running
- Check connection strings
- Ensure proper network access

**Issue:** Test timeouts
**Solution:**
- Increase timeout settings
- Optimize test queries
- Reduce test data size

**Issue:** Flaky tests
**Solution:**
- Add proper cleanup
- Use test transactions
- Implement retry logic

**Issue:** Mock not working
**Solution:**
- Verify mock setup
- Check mock expectations
- Ensure proper module configuration

## 📊 Test Metrics

### Key Metrics to Track

1. **Test Coverage**: Minimum 80% coverage
2. **Test Duration**: Should complete within reasonable time
3. **Test Stability**: No flaky tests
4. **Performance**: Response times under thresholds
5. **Resource Usage**: Memory and CPU usage during tests

### Coverage Goals

| Component | Minimum Coverage |
|-----------|------------------|
| Services | 90% |
| Controllers | 85% |
| Utilities | 80% |
| Overall | 85% |

## 📝 Test Documentation

### Test Case Template

```markdown
## Test Case: [Test Case Name]

**Module:** [Module Name]
**Function:** [Function Name]
**Test Type:** [Unit/Integration/E2E]

### Description
[Brief description of what is being tested]

### Preconditions
- [Condition 1]
- [Condition 2]

### Test Steps
1. [Step 1]
2. [Step 2]
3. [Step 3]

### Expected Results
- [Expected Result 1]
- [Expected Result 2]

### Actual Results
- [Actual Result 1]
- [Actual Result 2]

### Status
- ✅ Pass
- ❌ Fail
- ⚠️ Pending

### Notes
[Any additional notes or observations]
```

## 🚀 Continuous Testing

### Test Automation

1. **Pre-commit Hooks**: Run unit tests before commit
2. **CI Pipeline**: Run full test suite on push
3. **Nightly Tests**: Run performance tests nightly
4. **Regression Tests**: Run on critical changes

### Test Monitoring

1. **Test Duration**: Monitor for performance degradation
2. **Test Failures**: Alert on test failures
3. **Coverage Trends**: Track coverage over time
4. **Flaky Tests**: Identify and fix unstable tests

This testing guide provides a comprehensive framework for ensuring the quality and reliability of the User Management system implemented in Sprint 4.