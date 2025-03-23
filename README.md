# FinBud Backend API Documentation

This document provides comprehensive documentation for the FinBud API, covering authentication, user management, and transaction operations.

## Table of Contents
- [Base URL](#base-url)
- [Authentication](#authentication)
- [Users](#users)
- [Transactions](#transactions)
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

### Create a Transaction

Creates a new financial transaction.

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

### Get All Transactions (Admin Only)

Retrieves a list of all transactions in the system.

**URL**: `/transactions`

**Method**: `GET`

**Auth required**: Yes (JWT token with admin privileges)

**Success Response**:

- **Code**: 200 OK
- **Content**: Array of transaction objects

**Error Response**:

- **Code**: 401 UNAUTHORIZED

### Get Current User's Transactions

Retrieves all transactions for the currently authenticated user.

**URL**: `/transactions/my`

**Method**: `GET`

**Auth required**: Yes (JWT token)

**Success Response**:

- **Code**: 200 OK
- **Content**: Array of transaction objects sorted by date (newest first)

**Error Response**:

- **Code**: 401 UNAUTHORIZED

### Get Specific User's Transactions

Retrieves all transactions for a specific user.

**URL**: `/transactions/u/:userId`

**Method**: `GET`

**Auth required**: Yes (JWT token, must be user themselves or admin)

**URL Parameters**: `userId=[string]` the ID of the user whose transactions to retrieve

**Success Response**:

- **Code**: 200 OK
- **Content**: Array of transaction objects sorted by date (newest first)

**Error Response**:

- **Code**: 404 NOT FOUND or 403 FORBIDDEN

### Get Transaction by ID

Retrieves a specific transaction by its ID.

**URL**: `/transactions/:id`

**Method**: `GET`

**Auth required**: Yes (JWT token, must be owner of transaction or admin)

**URL Parameters**: `id=[string]` the ID of the transaction to retrieve

**Success Response**:

- **Code**: 200 OK
- **Content**: Transaction object

**Error Response**:

- **Code**: 404 NOT FOUND

### Update Transaction

Updates a specific transaction.

**URL**: `/transactions/:id`

**Method**: `PATCH`

**Auth required**: Yes (JWT token, must be owner of transaction or admin)

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

- **Code**: 404 NOT FOUND or 400 BAD REQUEST

### Delete Transaction

Deletes a specific transaction.

**URL**: `/transactions/:id`

**Method**: `DELETE`

**Auth required**: Yes (JWT token, must be owner of transaction or admin)

**URL Parameters**: `id=[string]` the ID of the transaction to delete

**Success Response**:

- **Code**: 204 NO CONTENT

**Error Response**:

- **Code**: 404 NOT FOUND

### Delete All User's Transactions

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

### Delete All Transactions for a Specific User (Admin Only)

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

- **Code**: 401 UNAUTHORIZED or 404 NOT FOUND

### Delete All Transactions (Admin Only)

Deletes all transactions in the system.

**URL**: `/transactions/all`

**Method**: `DELETE`

**Auth required**: Yes (JWT token with admin privileges)

**Success Response**:

- **Code**: 204 NO CONTENT

**Error Response**:

- **Code**: 401 UNAUTHORIZED

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