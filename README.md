# FinBud Backend API Documentation

This document provides comprehensive documentation for the FinBud API, covering authentication, user management, and transaction operations.

## Table of Contents
- [Base URL](#base-url)
- [Authentication](#authentication)
- [Users](#users)
- [Transactions](#transactions)
- [Goals](#goals)
- [Error Handling](#error-handling)
- [Getting Started](#getting-started)

## Base URL

All API requests should be prefixed with:

```
/api
```

## Authentication

### Register a New User

Creates a new user account.

**URL**: `/auth/register`

**Method**: `POST`

**Auth required**: No

**Request Body**:

```json
{
  "username": "user@example.com",
  "password": "securePassword123",
  "firstName": "John",
  "lastName": "Doe"
}
```

> Note: The `username` field must be a valid email address.

**Success Response**:

- **Code**: 201 CREATED
- **Content**:

```json
{
  "id": "60d21b4667d0d8992e610c85",
  "username": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "priviledge": "user"
}
```

**Error Response**:

- **Code**: 400 BAD REQUEST
- **Content**:

```json
{
  "statusCode": 400,
  "message": "Username already exists",
  "errorCode": "USERNAME_TAKEN",
  "timestamp": "2023-03-23T01:23:45.678Z"
}
```

### Login

Authenticates a user and returns a JWT token.

**URL**: `/auth/login`

**Method**: `POST`

**Auth required**: No

**Request Body**:

```json
{
  "username": "user@example.com",
  "password": "securePassword123"
}
```

> Note: The `username` field must be a valid email address.

**Success Response**:

- **Code**: 200 OK
- **Content**:

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "userId": "60d21b4667d0d8992e610c85",
    "username": "user@example.com",
    "priviledge": "user"
  }
}
```

**Error Response**:

- **Code**: 401 UNAUTHORIZED
- **Content**:

```json
{
  "statusCode": 401,
  "message": "Invalid username or password",
  "errorCode": "INVALID_CREDENTIALS",
  "timestamp": "2023-03-23T01:23:45.678Z"
}
```

### Logout

Logs out the current user by invalidating the client-side token.

**URL**: `/auth/logout`

**Method**: `POST`

**Auth required**: No

**Success Response**:

- **Code**: 200 OK
- **Content**:

```json
{
  "message": "Logout successful",
  "success": true
}
```

### Get Current User Profile

Retrieves the profile of the currently authenticated user.

**URL**: `/auth/profile`

**Method**: `GET`

**Auth required**: Yes (JWT token in Authorization header)

**Success Response**:

- **Code**: 200 OK
- **Content**:

```json
{
  "userId": "60d21b4667d0d8992e610c85",
  "username": "user@example.com",
  "accountData": {
    "username": "user@example.com",
    "priviledge": "user"
  },
  "role": "user"
}
```

**Error Response**:

- **Code**: 401 UNAUTHORIZED
- **Content**:

```json
{
  "statusCode": 401,
  "message": "Unauthorized",
  "errorCode": "UNAUTHORIZED_ACCESS",
  "timestamp": "2023-03-23T01:23:45.678Z"
}
```

## Users

### Get All Users (Admin Only)

Retrieves a list of all users in the system.

**URL**: `/users`

**Method**: `GET`

**Auth required**: Yes (JWT token with admin privileges)

**Success Response**:

- **Code**: 200 OK
- **Content**:

```json
[
  {
    "_id": "60d21b4667d0d8992e610c85",
    "accountData": {
      "username": "user1@example.com",
      "priviledge": "user"
    },
    "identityData": {
      "firstName": "John",
      "lastName": "Doe",
      "displayName": "John Doe"
    }
  },
  {
    "_id": "60d21b4667d0d8992e610c86",
    "accountData": {
      "username": "admin@example.com",
      "priviledge": "admin"
    },
    "identityData": {
      "firstName": "Jane",
      "lastName": "Doe",
      "displayName": "Jane Doe"
    }
  }
]
```

**Error Response**:

- **Code**: 403 FORBIDDEN
- **Content**:

```json
{
  "statusCode": 403,
  "message": "Access forbidden",
  "errorCode": "FORBIDDEN_RESOURCE",
  "timestamp": "2023-03-23T01:23:45.678Z"
}
```

### Get User by ID

Retrieves a specific user by their ID.

**URL**: `/users/:id`

**Method**: `GET`

**Auth required**: Yes (JWT token, must be user themselves or admin)

**URL Parameters**: `id=[string]` the ID of the user to retrieve

**Success Response**:

- **Code**: 200 OK
- **Content**:

```json
{
  "id": "60d21b4667d0d8992e610c85",
  "username": "johndoe",
  "firstName": "John",
  "lastName": "Doe",
  "displayName": "John Doe",
  "priviledge": "user"
}
```

**Error Response**:

- **Code**: 404 NOT FOUND
- **Content**:

```json
{
  "statusCode": 404,
  "message": "User not found"
}
```

### Update User

Updates a user's profile information.

**URL**: `/users/:id`

**Method**: `PUT`

**Auth required**: Yes (JWT token, must be user themselves or admin)

**URL Parameters**: `id=[string]` the ID of the user to update

**Request Body Examples**:

Example 1: Update identity information
```json
{
  "identityData": {
    "firstName": "Jonathan",
    "lastName": "Doe",
    "displayName": "Jon Doe"
  }
}
```

Example 2: Update account information
```json
{
  "accountData": {
    "password": "newSecurePassword123"
  }
}
```

Example 3: Update user settings
```json
{
  "settings": {
    "darkMode": true
  }
}
```

> Note: You can combine multiple sections in a single request.

**Success Response**:

- **Code**: 200 OK
- **Content**:

```json
{
  "message": "User updated successfully",
  "updatedUser": {
    "_id": "60d21b4667d0d8992e610c85",
    "accountData": {
      "username": "user@example.com",
      "priviledge": "user"
    },
    "identityData": {
      "firstName": "Jonathan",
      "lastName": "Doe",
      "displayName": "Jon Doe"
    }
  }
}
```

**Error Response**:

- **Code**: 404 NOT FOUND or 403 FORBIDDEN

### Delete User

Deletes a user account.

**URL**: `/users/:id`

**Method**: `DELETE`

**Auth required**: Yes (JWT token, must be user themselves or admin)

**URL Parameters**: `id=[string]` the ID of the user to delete

**Success Response**:

- **Code**: 204 NO CONTENT

**Error Response**:

- **Code**: 404 NOT FOUND or 403 FORBIDDEN

## Transactions

This section documents the transaction-related endpoints. The API provides separate endpoints for regular users and administrators.

### Frontend-Friendly Endpoints (Regular Users)

These endpoints are intended for use in user-facing applications:

#### Create a Transaction

Creates a new financial transaction for the current user.

**URL**: `/transactions`

**Method**: `POST`

**Auth required**: Yes (JWT token)

**Request Body**:

```json
{
  "description": "Grocery shopping",
  "amount": -120.50,
  "date": "2023-05-15T14:30:00Z"
}
```

> Note: 
> - Negative amounts represent expenses, positive amounts represent income.
> - The user ID is **automatically set** from your authentication token - do not include it in the request.
> - The transaction type (INCOME/EXPENSE) is automatically determined based on the amount if not specified.

**Success Response**:

- **Code**: 201 CREATED
- **Content**:

```json
{
  "_id": "60d21b4667d0d8992e610c85",
  "description": "Grocery shopping",
  "amount": -120.50,
  "balance": 879.50,
  "date": "2023-05-15T14:30:00Z",
  "type": "spending",
  "userId": "60d21b4667d0d8992e610c85"
}
```

**Error Response**:

- **Code**: 400 BAD REQUEST
- **Content**:

```json
{
  "statusCode": 400,
  "message": "Description and amount are required",
  "errorCode": "INVALID_TRANSACTION_DATA",
  "timestamp": "2023-03-23T01:23:45.678Z"
}
```

#### Get Current User's Transactions

Retrieves all transactions for the currently authenticated user.

**URL**: `/transactions/my`

**Method**: `GET`

**Auth required**: Yes (JWT token)

**Success Response**:

- **Code**: 200 OK
- **Content**: Array of transaction objects sorted by date (newest first)

**Error Response**:

- **Code**: 401 UNAUTHORIZED

#### Get Transaction by ID

Retrieves a specific transaction by its ID.

**URL**: `/transactions/:id`

**Method**: `GET`

**Auth required**: Yes (JWT token, must be owner of transaction)

**URL Parameters**: `id=[string]` the ID of the transaction to retrieve

**Success Response**:

- **Code**: 200 OK
- **Content**: Transaction object

**Error Response**:

- **Code**: 404 NOT FOUND or 403 FORBIDDEN if not owned by user

#### Update Transaction

Updates a specific transaction.

**URL**: `/transactions/:id`

**Method**: `PATCH`

**Auth required**: Yes (JWT token, must be owner of transaction)

**URL Parameters**: `id=[string]` the ID of the transaction to update

**Request Body**:

```json
{
  "description": "Updated grocery description",
  "amount": -150.75
}
```

**Success Response**:

- **Code**: 200 OK
- **Content**: Updated transaction object

**Error Response**:

- **Code**: 404 NOT FOUND, 400 BAD REQUEST, or 403 FORBIDDEN if not owned by user

#### Delete Transaction

Deletes a specific transaction.

**URL**: `/transactions/:id`

**Method**: `DELETE`

**Auth required**: Yes (JWT token, must be owner of transaction)

**URL Parameters**: `id=[string]` the ID of the transaction to delete

**Success Response**:

- **Code**: 204 NO CONTENT

**Error Response**:

- **Code**: 404 NOT FOUND or 403 FORBIDDEN if not owned by user

#### Delete All User's Transactions

Deletes all transactions for the currently authenticated user.

**URL**: `/transactions/my/all`

**Method**: `DELETE`

**Auth required**: Yes (JWT token)

**Success Response**:

- **Code**: 200 OK
- **Content**:

```json
{
  "message": "Successfully deleted 15 transactions"
}
```

**Error Response**:

- **Code**: 401 UNAUTHORIZED

### Admin-Only Endpoints

These endpoints are intended for use in administrator interfaces only:

#### Get All Transactions (Admin Only)

Retrieves a list of all transactions in the system.

**URL**: `/transactions`

**Method**: `GET`

**Auth required**: Yes (JWT token with admin privileges)

**Success Response**:

- **Code**: 200 OK
- **Content**: Array of transaction objects

**Error Response**:

- **Code**: 401 UNAUTHORIZED or 403 FORBIDDEN

#### Get Specific User's Transactions (Admin Only)

Retrieves all transactions for a specific user.

**URL**: `/transactions/u/:userId`

**Method**: `GET`

**Auth required**: Yes (JWT token with admin privileges)

**URL Parameters**: `userId=[string]` the ID of the user whose transactions to retrieve

**Success Response**:

- **Code**: 200 OK
- **Content**: Array of transaction objects sorted by date (newest first)

**Error Response**:

- **Code**: 404 NOT FOUND or 403 FORBIDDEN

#### Delete All Transactions for a Specific User (Admin Only)

Deletes all transactions for a specific user.

**URL**: `/transactions/u/:userId`

**Method**: `DELETE`

**Auth required**: Yes (JWT token with admin privileges)

**URL Parameters**: `userId=[string]` the ID of the user whose transactions to delete

**Success Response**:

- **Code**: 200 OK
- **Content**:

```json
{
  "message": "Successfully deleted 15 transactions"
}
```

**Error Response**:

- **Code**: 401 UNAUTHORIZED, 403 FORBIDDEN, or 404 NOT FOUND

#### Delete All Transactions (Admin Only)

Deletes all transactions in the system.

**URL**: `/transactions/all`

**Method**: `DELETE`

**Auth required**: Yes (JWT token with admin privileges)

**Success Response**:

- **Code**: 204 NO CONTENT

**Error Response**:

- **Code**: 401 UNAUTHORIZED or 403 FORBIDDEN

## Goals

This section documents the goal management endpoints. The API provides separate endpoints for regular users and administrators.

### Frontend-Friendly Endpoints

These endpoints are designed for use in frontend applications, allowing users to manage their own goals.

#### Create a New Goal

Creates a new goal for the authenticated user.

**URL**: `/goals`

**Method**: `POST`

**Auth required**: Yes (JWT token)

**Request Body**:
```json
{
  "title": "Save for vacation",
  "description": "Summer trip to Hawaii",
  "targetAmount": 5000,
  "currentAmount": 500,
  "startDate": "2023-01-01T00:00:00.000Z",
  "endDate": "2023-12-31T00:00:00.000Z",
  "category": "Travel"
}
```

**Required Fields**:
- `title` (string): Name of the goal
- `targetAmount` (number): Target amount to save
- `startDate` (Date): When the goal starts
- `endDate` (Date): Deadline for the goal
- `category` (string): Goal category

**Optional Fields**:
- `description` (string): Additional details about the goal
- `currentAmount` (number): Current progress (defaults to 0)
- `isAchieved` (boolean): Whether the goal is achieved (defaults to false)

**Success Response**:
- **Code**: 201 CREATED
- **Content**: The created goal object

#### Get All My Goals

Retrieves all goals for the authenticated user.

**URL**: `/goals/me`

**Method**: `GET`

**Auth required**: Yes (JWT token)

**Success Response**:
- **Code**: 200 OK
- **Content**: Array of goal objects, sorted by closest deadline first

#### Get My Achieved Goals

Retrieves all achieved goals for the authenticated user.

**URL**: `/goals/me/achieved`

**Method**: `GET`

**Auth required**: Yes (JWT token)

**Success Response**:
- **Code**: 200 OK
- **Content**: Array of goal objects where `isAchieved` is true

#### Get My In-Progress Goals

Retrieves all in-progress goals for the authenticated user.

**URL**: `/goals/me/in-progress`

**Method**: `GET`

**Auth required**: Yes (JWT token)

**Success Response**:
- **Code**: 200 OK
- **Content**: Array of goal objects where `isAchieved` is false

#### Get My Upcoming Goals

Retrieves goals with deadlines approaching within the specified number of days.

**URL**: `/goals/me/upcoming`

**Method**: `GET`

**Auth required**: Yes (JWT token)

**Query Parameters**:
- `days` (number, optional): Number of days to consider as "upcoming" (default: 30)

**Success Response**:
- **Code**: 200 OK
- **Content**: Array of goal objects with deadlines within the specified timeframe

#### Get a Specific Goal

Retrieves a specific goal by ID if it belongs to the authenticated user.

**URL**: `/goals/me/:id`

**Method**: `GET`

**Auth required**: Yes (JWT token)

**Path Parameters**:
- `id` (string): Goal ID

**Success Response**:
- **Code**: 200 OK
- **Content**: Goal object

**Error Response**:
- **Code**: 404 NOT FOUND
- **Content**: Error message indicating the goal was not found or doesn't belong to the user

#### Update a Goal

Updates a specific goal if it belongs to the authenticated user.

**URL**: `/goals/me/:id`

**Method**: `PATCH`

**Auth required**: Yes (JWT token)

**Path Parameters**:
- `id` (string): Goal ID

**Request Body**: Any combination of goal fields to update:
```json
{
  "title": "Updated title",
  "description": "Updated description",
  "targetAmount": 6000,
  "endDate": "2024-06-30T00:00:00.000Z",
  "category": "Updated category"
}
```

**Success Response**:
- **Code**: 200 OK
- **Content**: Updated goal object

**Error Response**:
- **Code**: 404 NOT FOUND
- **Content**: Error message indicating the goal was not found or doesn't belong to the user

#### Update Goal Progress

Updates the current amount of a goal and automatically updates the achievement status.

**URL**: `/goals/me/:id/progress`

**Method**: `PATCH`

**Auth required**: Yes (JWT token)

**Path Parameters**:
- `id` (string): Goal ID

**Request Body**:
```json
{
  "currentAmount": 3000
}
```

**Required Fields**:
- `currentAmount` (number): New current amount value

**Success Response**:
- **Code**: 200 OK
- **Content**: Updated goal object

**Error Response**:
- **Code**: 404 NOT FOUND
- **Content**: Error message indicating the goal was not found or doesn't belong to the user

#### Delete a Goal

Deletes a specific goal if it belongs to the authenticated user.

**URL**: `/goals/me/:id`

**Method**: `DELETE`

**Auth required**: Yes (JWT token)

**Path Parameters**:
- `id` (string): Goal ID

**Success Response**:
- **Code**: 204 NO CONTENT

**Error Response**:
- **Code**: 404 NOT FOUND
- **Content**: Error message indicating the goal was not found or doesn't belong to the user

#### Delete All My Goals

Deletes all goals belonging to the authenticated user.

**URL**: `/goals/me`

**Method**: `DELETE`

**Auth required**: Yes (JWT token)

**Success Response**:
- **Code**: 200 OK
- **Content**:
```json
{
  "message": "Successfully deleted X goals"
}
```

### Admin-Only Endpoints

These endpoints are restricted to users with admin privileges.

#### Get All Goals

Retrieves all goals in the system.

**URL**: `/goals`

**Method**: `GET`

**Auth required**: Yes (JWT token with admin privileges)

**Success Response**:
- **Code**: 200 OK
- **Content**: Array of all goal objects

#### Get Goals for a Specific User

Retrieves all goals for a specified user.

**URL**: `/goals/user/:userId`

**Method**: `GET`

**Auth required**: Yes (JWT token with admin privileges)

**Path Parameters**:
- `userId` (string): User ID

**Success Response**:
- **Code**: 200 OK
- **Content**: Array of goal objects for the specified user

#### Get a Specific Goal (Admin)

Retrieves a specific goal by ID (admin access).

**URL**: `/goals/:id`

**Method**: `GET`

**Auth required**: Yes (JWT token with admin privileges)

**Path Parameters**:
- `id` (string): Goal ID

**Success Response**:
- **Code**: 200 OK
- **Content**: Goal object

**Error Response**:
- **Code**: 404 NOT FOUND
- **Content**: Error message indicating the goal was not found

#### Update a Goal (Admin)

Updates a specific goal (admin access).

**URL**: `/goals/:id`

**Method**: `PATCH`

**Auth required**: Yes (JWT token with admin privileges)

**Path Parameters**:
- `id` (string): Goal ID

**Request Body**: Any combination of goal fields to update

**Success Response**:
- **Code**: 200 OK
- **Content**: Updated goal object

**Error Response**:
- **Code**: 404 NOT FOUND
- **Content**: Error message indicating the goal was not found

#### Delete a Goal (Admin)

Deletes a specific goal (admin access).

**URL**: `/goals/:id`

**Method**: `DELETE`

**Auth required**: Yes (JWT token with admin privileges)

**Path Parameters**:
- `id` (string): Goal ID

**Success Response**:
- **Code**: 204 NO CONTENT

**Error Response**:
- **Code**: 404 NOT FOUND
- **Content**: Error message indicating the goal was not found

#### Delete All Goals for a User

Deletes all goals for a specified user.

**URL**: `/goals/user/:userId`

**Method**: `DELETE`

**Auth required**: Yes (JWT token with admin privileges)

**Path Parameters**:
- `userId` (string): User ID

**Success Response**:
- **Code**: 200 OK
- **Content**:
```json
{
  "message": "Successfully deleted X goals"
}
```

### Goal Object Structure

```json
{
  "_id": "60d21b4667d0d8992e610c85",
  "userId": "60d21b4667d0d8992e610c80",
  "title": "Save for vacation",
  "description": "Summer trip to Hawaii",
  "targetAmount": 5000,
  "currentAmount": 500,
  "startDate": "2023-01-01T00:00:00.000Z",
  "endDate": "2023-12-31T00:00:00.000Z",
  "isAchieved": false,
  "category": "Travel",
  "createdAt": "2023-01-01T00:00:00.000Z",
  "updatedAt": "2023-01-10T00:00:00.000Z"
}
```

## Error Handling

The API uses a standardized error response format:

```json
{
  "statusCode": 400,
  "message": "Error message describing what went wrong",
  "errorCode": "ERROR_CODE_IDENTIFIER",
  "details": {}, // Optional additional error details
  "timestamp": "2023-03-23T01:23:45.678Z",
  "path": "/api/resource/path"
}
```

### Common Error Codes

| Error Code | Status Code | Description |
|------------|-------------|-------------|
| `UNAUTHORIZED_ACCESS` | 401 | The user is not authenticated |
| `INVALID_CREDENTIALS` | 401 | Invalid username or password |
| `FORBIDDEN_RESOURCE` | 403 | User doesn't have permission to access the resource |
| `USER_NOT_FOUND` | 404 | The requested user doesn't exist |
| `USERNAME_TAKEN` | 409 | The email address is already registered |
| `TRANSACTION_NOT_FOUND` | 404 | The requested transaction doesn't exist |
| `INVALID_TRANSACTION_DATA` | 400 | Transaction data validation failed |

## Getting Started

### Prerequisites

- Node.js (v16 or later)
- MongoDB (v4 or later)

### Environment Setup

Create a `.env` file in the project root with the following variables:

```
# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/finbud

# JWT Settings
JWT_SECRET=your-secret-key-here
JWT_EXPIRATION=1d

# Server Configuration
PORT=3000
```

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run start:dev

# Build for production
npm run build

# Start production server
npm run start:prod
``` 