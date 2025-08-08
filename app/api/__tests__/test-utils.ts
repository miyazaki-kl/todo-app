/**
 * Test utilities for API route testing
 * Provides consistent mocking patterns and helper functions
 */

import { PrismaClient } from '@prisma/client';

// Standard Prisma mock interface
export interface MockPrismaClient {
  user: {
    findUnique: jest.MockedFunction<any>;
    findMany: jest.MockedFunction<any>;
    create: jest.MockedFunction<any>;
    update: jest.MockedFunction<any>;
    delete: jest.MockedFunction<any>;
  };
  todo: {
    findMany: jest.MockedFunction<any>;
    findUnique: jest.MockedFunction<any>;
    create: jest.MockedFunction<any>;
    update: jest.MockedFunction<any>;
    delete: jest.MockedFunction<any>;
  };
  label: {
    findMany: jest.MockedFunction<any>;
    findUnique: jest.MockedFunction<any>;
    create: jest.MockedFunction<any>;
    update: jest.MockedFunction<any>;
    delete: jest.MockedFunction<any>;
  };
  todoLabel: {
    findMany: jest.MockedFunction<any>;
    findUnique: jest.MockedFunction<any>;
    create: jest.MockedFunction<any>;
    update: jest.MockedFunction<any>;
    delete: jest.MockedFunction<any>;
    deleteMany: jest.MockedFunction<any>;
  };
}

/**
 * Creates a standardized Prisma mock client
 * @returns MockPrismaClient with all methods mocked
 */
export function createMockPrismaClient(): MockPrismaClient {
  return {
    user: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    todo: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    label: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    todoLabel: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn(),
    },
  };
}

/**
 * Standard error response patterns for consistent testing
 */
export const ErrorResponses = {
  VALIDATION_ERROR: (message: string) => ({ error: message }),
  AUTH_ERROR: (message: string) => ({ success: false, message }),
  SERVER_ERROR: (message: string) => ({ error: message }),
  NOT_FOUND_ERROR: (message: string) => ({ error: message }),
} as const;

/**
 * Standard HTTP status codes for testing
 */
export const HttpStatus = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
} as const;

/**
 * Mock data factories for consistent test data
 */
export const MockData = {
  user: (overrides: Partial<any> = {}) => ({
    id: 1,
    email: 'test@example.com',
    name: 'Test User',
    password: '$2a$12$hashedpassword',
    createdAt: new Date('2024-01-01T00:00:00.000Z'),
    updatedAt: new Date('2024-01-01T00:00:00.000Z'),
    ...overrides,
  }),

  userWithoutPassword: (overrides: Partial<any> = {}) => ({
    id: 1,
    email: 'test@example.com',
    name: 'Test User',
    ...overrides,
  }),

  label: (overrides: Partial<any> = {}) => ({
    id: 1,
    name: 'Important',
    color: 'red',
    createdAt: new Date('2024-01-01T00:00:00.000Z'),
    updatedAt: new Date('2024-01-01T00:00:00.000Z'),
    ...overrides,
  }),

  todo: (overrides: Partial<any> = {}) => ({
    id: 1,
    title: 'Test Todo',
    description: 'Test Description',
    completed: false,
    createdById: 1,
    assignedToId: null,
    createdAt: new Date('2024-01-01T00:00:00.000Z'),
    updatedAt: new Date('2024-01-01T00:00:00.000Z'),
    createdBy: MockData.userWithoutPassword(),
    assignedTo: null,
    labels: [],
    ...overrides,
  }),

  todoWithRelations: (overrides: Partial<any> = {}) => ({
    id: 1,
    title: 'Todo with Relations',
    description: 'Todo with user and label relations',
    completed: false,
    createdById: 1,
    assignedToId: 2,
    createdAt: new Date('2024-01-01T00:00:00.000Z'),
    updatedAt: new Date('2024-01-01T00:00:00.000Z'),
    createdBy: MockData.userWithoutPassword({ id: 1, name: 'Creator' }),
    assignedTo: MockData.userWithoutPassword({ id: 2, name: 'Assignee' }),
    labels: [
      {
        label: MockData.label({ id: 1, name: 'Important', color: 'red' }),
      },
    ],
    ...overrides,
  }),
};

/**
 * Helper function to convert Date objects to ISO strings for response comparison
 * @param obj Object that may contain Date objects
 * @returns Object with Date objects converted to ISO strings
 */
export function convertDatesToISOStrings(obj: any): any {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (obj instanceof Date) {
    return obj.toISOString();
  }

  if (Array.isArray(obj)) {
    return obj.map(convertDatesToISOStrings);
  }

  if (typeof obj === 'object') {
    const converted: any = {};
    for (const [key, value] of Object.entries(obj)) {
      converted[key] = convertDatesToISOStrings(value);
    }
    return converted;
  }

  return obj;
}

/**
 * Standard test setup function for API route tests
 * @param mockPrisma The mock Prisma client to use
 */
export function setupApiTest(mockPrisma: MockPrismaClient) {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset all mock implementations
    Object.values(mockPrisma).forEach(model => {
      Object.values(model).forEach(method => {
        method.mockReset();
      });
    });
  });
}

/**
 * Helper to create a mock Request object for testing
 * @param url The request URL
 * @param options Request options (method, headers, body)
 * @returns Mock Request object
 */
export function createMockRequest(url: string, options: RequestInit = {}): Request {
  return new Request(url, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
}

/**
 * Helper to create a mock NextRequest object for testing
 * @param url The request URL
 * @param options Request options (method, headers, body)
 * @returns Mock NextRequest object
 */
export function createMockNextRequest(url: string, options: RequestInit = {}): any {
  // Import NextRequest dynamically to avoid module resolution issues in tests
  const { NextRequest } = require('next/server');
  return new NextRequest(url, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
}

/**
 * Helper to assert response properties consistently
 * @param response The response object to test
 * @param expectedStatus Expected HTTP status code
 * @param expectedData Expected response data
 */
export async function assertApiResponse(
  response: Response,
  expectedStatus: number,
  expectedData?: any
) {
  expect(response.constructor.name).toBe('NextResponse');
  expect(response.status).toBe(expectedStatus);
  
  if (expectedData !== undefined) {
    const data = await response.json();
    expect(data).toEqual(expectedData);
    return data;
  }
  
  return null;
}

/**
 * Database error simulation helpers
 */
export const DatabaseErrors = {
  CONNECTION_FAILED: new Error('Database connection failed'),
  RECORD_NOT_FOUND: new Error('Record not found'),
  CONSTRAINT_VIOLATION: new Error('Unique constraint violation'),
  TIMEOUT: new Error('Database timeout'),
} as const;

/**
 * Common Prisma query patterns for consistent mocking
 */
export const PrismaQueries = {
  USER_SELECT_SAFE: {
    select: {
      id: true,
      name: true,
      email: true,
    },
    orderBy: {
      name: 'asc' as const,
    },
  },

  USER_SELECT_WITH_PASSWORD: {
    select: {
      id: true,
      email: true,
      name: true,
      password: true,
    },
  },

  TODO_INCLUDE_RELATIONS: {
    include: {
      createdBy: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      assignedTo: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      labels: {
        include: {
          label: true,
        },
      },
      project: {
        select: {
          id: true,
          name: true,
          description: true,
          color: true,
          createdBy: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      },
    },
    orderBy: { createdAt: 'desc' as const },
    where: {},
  },

  LABEL_ORDER_BY_NAME: {
    orderBy: {
      name: 'asc' as const,
    },
  },
} as const;