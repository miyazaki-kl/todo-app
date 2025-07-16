# Design Document

## Overview

This design outlines the comprehensive testing strategy for the missing API endpoints in the Todo application. The focus is on creating robust, maintainable tests for authentication, user management, and label management APIs, while also enhancing existing todo API tests to cover new functionality like user assignments and label relationships.

## Architecture

### Test Structure Organization
```
app/api/
├── auth/login/route.test.ts          # New - Authentication API tests
├── users/route.test.ts               # New - Users API tests  
├── labels/route.test.ts              # New - Labels API tests
├── todos/route.test.ts               # Enhanced - Extended functionality tests
└── todos/[id]/route.test.ts          # Existing - No changes needed
```

### Testing Framework Integration
- **Jest**: Primary testing framework with ts-jest preset
- **Prisma Mocking**: Consistent mocking patterns across all API tests
- **TypeScript**: Full type safety for test code and mocks

## Components and Interfaces

### Mock Utilities Pattern
All tests will follow a consistent mocking pattern for Prisma client:

```typescript
// Standardized Prisma mock setup
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    user: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
    },
    label: {
      findMany: jest.fn(),
    },
    todo: {
      findMany: jest.fn(),
      create: jest.fn(),
    },
  })),
}));
```

### Authentication API Test Design
**File**: `app/api/auth/login/route.test.ts`

**Test Coverage**:
- Valid login scenarios with correct credentials
- Invalid email/password combinations
- Missing field validation (email, password)
- Database error handling
- Password verification failure scenarios
- Response format validation

**Mock Dependencies**:
- Prisma user.findUnique operations
- bcryptjs password verification via `verifyPassword` utility

### Users API Test Design
**File**: `app/api/users/route.test.ts`

**Test Coverage**:
- Successful user retrieval with proper field selection
- Alphabetical ordering by name
- Empty result handling
- Database error scenarios
- Password field exclusion verification

**Mock Dependencies**:
- Prisma user.findMany operations

### Labels API Test Design
**File**: `app/api/labels/route.test.ts`

**Test Coverage**:
- Successful label retrieval
- Alphabetical ordering by name
- Empty result handling
- Database error scenarios
- Complete label data structure validation

**Mock Dependencies**:
- Prisma label.findMany operations

### Enhanced Todo API Tests
**File**: `app/api/todos/route.test.ts` (Enhanced)

**Additional Test Coverage**:
- User prioritization with currentUserId parameter
- Label assignment during todo creation
- User assignment (createdBy, assignedTo) during creation
- Relationship data inclusion in responses
- Complex query parameter handling

## Data Models

### Test Data Structures

**User Test Data**:
```typescript
const mockUser = {
  id: 1,
  email: 'test@example.com',
  name: 'Test User',
  password: '$2a$12$hashedpassword', // bcrypt hash
  createdAt: new Date(),
  updatedAt: new Date(),
};
```

**Label Test Data**:
```typescript
const mockLabel = {
  id: 1,
  name: 'Important',
  color: 'red',
  createdAt: new Date(),
  updatedAt: new Date(),
};
```

**Enhanced Todo Test Data**:
```typescript
const mockTodoWithRelations = {
  id: 1,
  title: 'Test Todo',
  description: 'Test Description',
  completed: false,
  createdById: 1,
  assignedToId: 2,
  createdAt: new Date(),
  updatedAt: new Date(),
  createdBy: {
    id: 1,
    name: 'Creator',
    email: 'creator@example.com',
  },
  assignedTo: {
    id: 2,
    name: 'Assignee',
    email: 'assignee@example.com',
  },
  labels: [
    {
      label: {
        id: 1,
        name: 'Important',
        color: 'red',
      },
    },
  ],
};
```

## Error Handling

### Consistent Error Response Testing
All API tests will validate error responses follow the established patterns:

**Validation Errors (400)**:
```typescript
{ error: 'Specific validation message' }
```

**Authentication Errors (401)**:
```typescript
{ 
  success: false, 
  message: 'Authentication error message' 
}
```

**Not Found Errors (404)**:
```typescript
{ error: 'Resource not found message' }
```

**Server Errors (500)**:
```typescript
{ error: 'Generic server error message' }
```

### Database Error Simulation
Tests will simulate common Prisma errors:
- Connection failures
- Constraint violations
- Record not found (P2025)
- Unique constraint violations (P2002)

## Testing Strategy

### Test Organization Principles
1. **Describe blocks** for each HTTP method
2. **Individual test cases** for each scenario
3. **Consistent setup/teardown** with beforeEach hooks
4. **Mock isolation** to prevent test interference

### Mock Management
- Reset all mocks between tests using `jest.clearAllMocks()`
- Use `jest.resetModules()` for module-level isolation
- Maintain consistent mock return value patterns

### Assertion Patterns
- Verify response status codes
- Validate response data structure
- Confirm database method calls with correct parameters
- Check error message accuracy

### Coverage Goals
- 100% line coverage for new test files
- All error paths tested
- All success scenarios validated
- Edge cases covered (empty results, invalid inputs)

## Integration Considerations

### Existing Test Compatibility
- New tests follow the same patterns as existing todo tests
- Shared mock utilities can be extracted if needed
- Jest configuration remains unchanged

### Development Workflow
- Tests run with `npm test` or `npx jest`
- Individual test files can be run in isolation
- Tests are independent of actual database state

### Maintenance Strategy
- Test data factories for consistent mock data generation
- Shared assertion helpers for common validations
- Clear test naming conventions for easy identification