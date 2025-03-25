# FinBud Backend API Documentation

This document provides comprehensive documentation for the FinBud API, covering authentication, user management, and transaction operations.

## Table of Contents
- [Base URL](#base-url)
- [Authentication](#authentication)
- [Users](#users)
- [Transactions](#transactions)
- [Goals](#goals)
- [Stocks](#stocks)
- [Crypto](#crypto)
- [Portfolio](#portfolio)
- [Error Handling](#error-handling)
- [Getting Started](#getting-started)
- [Events Module](#events-module)
- [Chat Module](#chat-module)

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

## Stocks

The Stocks module allows you to retrieve stock market data, manage stock price entries, and interact with market information.

### Testing with Postman

#### Prerequisites
1. Ensure the FinBud backend server is running (`npm run start:dev`)
2. Make sure you have a valid authentication token (by logging in)
3. Import the Postman collection from the link provided below or create requests manually

#### Authentication Setup
For endpoints requiring authentication:
1. In your Postman request, go to the "Authorization" tab
2. Select "Bearer Token" from the Type dropdown
3. Paste your JWT token in the "Token" field

### Endpoints

#### Get Market Data

Retrieves stock market data from TradingView.

**URL**: `/stocks/market`

**Method**: `GET`

**Auth required**: No

**Query Parameters**:
- `page` (optional): Page number for pagination (default: 1)
- `pageSize` (optional): Number of results per page (default: 50)
- `search` (optional): Search for specific stocks
- `sortBy` (optional): Field to sort by (default: 'market_cap_basic')
- `sortOrder` (optional): Sort direction - 'asc' or 'desc' (default: 'desc')
- `markets` (optional): Market to search in (default: 'america')

**Example Request**:
```
GET /stocks/market?page=1&pageSize=10&sortBy=change&sortOrder=desc
```

**Success Response**:
- **Code**: 200 OK
- **Content**:
```json
{
  "data": [
    {
      "symbol": "AAPL",
      "name": "Apple Inc",
      "price": 172.4,
      "change": 3.51,
      "changePercent": 2.08,
      "volume": 65234512,
      "marketCap": 2718495744000,
      "exchange": "NASDAQ",
      "sector": "Technology",
      "industry": "Consumer Electronics"
    },
    // More stock entries...
  ],
  "totalCount": 8543,
  "page": 1,
  "pageSize": 10
}
```

#### Get All Stocks

Retrieves a list of all stock entries stored in the database (limited to 100 most recent entries).

**URL**: `/stocks`

**Method**: `GET`

**Auth required**: No

**Success Response**:
- **Code**: 200 OK
- **Content**:
```json
[
  {
    "_id": "60d21b4667d0d8992e610c85",
    "symbol": "AAPL",
    "open": 170.33,
    "high": 173.12,
    "low": 169.95,
    "close": 172.4,
    "volume": 65234512,
    "change": 2.07,
    "date": "2023-03-23T00:00:00.000Z"
  },
  // More stock entries...
]
```

#### Get Latest Stock Price

Retrieves the latest price data for a specific stock symbol.

**URL**: `/stocks/latest/:symbol`

**Method**: `GET`

**Auth required**: No

**URL Parameters**:
- `symbol`: Stock symbol (e.g., AAPL, MSFT, GOOGL)

**Example**:
```
GET /stocks/latest/AAPL
```

**Success Response**:
- **Code**: 200 OK
- **Content**:
```json
{
  "_id": "60d21b4667d0d8992e610c85",
  "symbol": "AAPL",
  "open": 170.33,
  "high": 173.12,
  "low": 169.95,
  "close": 172.4,
  "volume": 65234512,
  "change": 2.07,
  "date": "2023-03-23T00:00:00.000Z"
}
```

**Error Response**:
- **Code**: 404 NOT FOUND
- **Content**:
```json
{
  "statusCode": 404,
  "message": "No stock data found for symbol: AAPL",
  "error": "Not Found"
}
```

#### Get Historical Stock Data

Retrieves historical stock data for a specific symbol within a date range.

**URL**: `/stocks/historical/:symbol`

**Method**: `GET`

**Auth required**: No

**URL Parameters**:
- `symbol`: Stock symbol (e.g., AAPL, MSFT, GOOGL)

**Query Parameters**:
- `startDate`: Start date in ISO format (YYYY-MM-DD)
- `endDate`: End date in ISO format (YYYY-MM-DD)

**Example**:
```
GET /stocks/historical/AAPL?startDate=2023-01-01&endDate=2023-01-31
```

**Success Response**:
- **Code**: 200 OK
- **Content**:
```json
[
  {
    "_id": "60d21b4667d0d8992e610c85",
    "symbol": "AAPL",
    "open": 130.28,
    "high": 134.92,
    "low": 129.89,
    "close": 134.76,
    "volume": 80123456,
    "change": 4.48,
    "date": "2023-01-03T00:00:00.000Z"
  },
  // More stock entries...
]
```

#### Get Available Stock Symbols

Retrieves a list of all available stock symbols in the database.

**URL**: `/stocks/symbols`

**Method**: `GET`

**Auth required**: No

**Success Response**:
- **Code**: 200 OK
- **Content**:
```json
["AAPL", "MSFT", "GOOGL", "AMZN", "META"]
```

#### Add Stock Data (Admin Only)

Adds a new stock data entry.

**URL**: `/stocks`

**Method**: `POST`

**Auth required**: Yes (JWT token with admin privileges)

**Request Body**:
```json
{
  "symbol": "AAPL",
  "open": 170.33,
  "high": 173.12,
  "low": 169.95,
  "close": 172.4,
  "volume": 65234512,
  "change": 2.07,
  "date": "2023-03-23T00:00:00.000Z"
}
```

**Success Response**:
- **Code**: 201 CREATED
- **Content**: The created stock entry

#### Batch Update Stock Data (Admin Only)

Updates multiple stock data entries for a specific symbol.

**URL**: `/stocks/batch`

**Method**: `POST`

**Auth required**: Yes (JWT token with admin privileges)

**Request Body**:
```json
{
  "symbol": "AAPL",
  "data": [
    {
      "open": 170.33,
      "high": 173.12,
      "low": 169.95,
      "close": 172.4,
      "volume": 65234512,
      "date": "2023-03-23T00:00:00.000Z"
    },
    {
      "open": 172.41,
      "high": 174.30,
      "low": 171.09,
      "close": 173.75,
      "volume": 55123456,
      "date": "2023-03-24T00:00:00.000Z"
    }
  ]
}
```

**Success Response**:
- **Code**: 200 OK
- **Content**:
```json
{
  "message": "Successfully processed 2 entries for symbol AAPL",
  "saved": 2,
  "skipped": 0
}
```

### Testing Guide

1. **Testing Market Data**
   - Create a GET request to `/stocks/market?pageSize=10`
   - This should return current market data from TradingView

2. **Testing Historical Data**
   - First, add some stock data using the admin-only endpoints
   - Then create a GET request to `/stocks/historical/AAPL?startDate=2023-01-01&endDate=2023-12-31`
   - This should return the historical price data for Apple stock

3. **Testing Batch Update (Admin Only)**
   - Create a POST request to `/stocks/batch`
   - Include a JSON body with the sample format shown above
   - This will add multiple stock entries at once

4. **Testing Latest Price**
   - After adding data, create a GET request to `/stocks/latest/AAPL`
   - This should return the most recent price data for Apple stock

### Common Issues

1. **Authentication Errors**
   - Make sure your JWT token is valid and correctly formatted in the Authorization header
   - Admin-only endpoints will reject requests from non-admin users

2. **404 Not Found**
   - When querying stock data that doesn't exist in the database
   - Check that you've added data for the symbol you're querying

3. **Date Format Issues**
   - Make sure dates are in ISO format (YYYY-MM-DD)
   - The API includes a custom date parser to handle various formats 

## Crypto

The Crypto module provides endpoints for managing and accessing cryptocurrency data.

### Design Principles

The Crypto module follows the NestJS architecture with proper separation of concerns:

- **Controllers**: Handle HTTP requests/responses and delegation to the service layer. Controllers are kept minimal with no business logic, response formatting, or validation.
- **Services**: Contain the business logic, data validation, error handling, and response formatting. Services coordinate between different repositories and external services, and prepare the final responses.
- **Repositories**: Handle data access operations and database interactions.

This separation ensures code maintainability, testability, and a clear flow of data through the application. When a controller receives a request, it immediately delegates to the service layer, which handles all processing and returns a fully formatted response that the controller simply passes back to the client.

### Creating and Managing Cryptocurrency Data

#### Update Cryptocurrency Database

Updates the database with new cryptocurrency data from external API responses.

**URL**: `/crypto/update-db`

**Method**: `POST`

**Auth required**: Yes (JWT token)

**Request Body**:

```json
{
  "cryptoResponses": [
    {
      "Meta Data": {
        "1. Information": "Daily Prices and Volumes for Digital Currency",
        "2. Digital Currency Code": "BTC",
        "3. Digital Currency Name": "Bitcoin",
        "4. Market Code": "USD",
        "5. Market Name": "United States Dollar",
        "6. Last Refreshed": "2024-03-22 00:00:00",
        "7. Time Zone": "UTC"
      },
      "Time Series (Digital Currency Daily)": {
        "2024-03-22": {
          "1. open": "52356.78000000",
          "2. high": "53285.10000000",
          "3. low": "51987.44000000",
          "4. close": "52876.29000000",
          "5. volume": "28754.91230000"
        },
        "2024-03-21": {
          "1. open": "51874.33000000",
          "2. high": "52456.87000000",
          "3. low": "51245.22000000",
          "4. close": "52356.78000000",
          "5. volume": "24567.34560000"
        }
      }
    }
  ]
}
```

> Note: This endpoint is typically used to process data from cryptocurrency APIs like Alpha Vantage. It checks for new entries that are more recent than what's already in the database and saves them.

**Success Response**:

- **Code**: 200 OK
- **Content**:

```json
{
  "success": true,
  "count": 2
}
```

**Error Response**:

- **Code**: 500 INTERNAL SERVER ERROR
- **Content**:

```json
{
  "statusCode": 500,
  "message": "Error updating cryptocurrency database",
  "error": "Internal Server Error"
}
```

#### Create Cryptocurrency Entry

Creates a single cryptocurrency data entry.

**URL**: `/crypto`

**Method**: `POST`

**Auth required**: Yes (JWT token)

**Request Body**:

```json
{
  "cryptoName": "Bitcoin",
  "symbol": "BTC",
  "open": 52356.78000000,
  "high": 53285.10000000,
  "low": 51987.44000000,
  "close": 52876.29000000,
  "volume": 28754.91230000,
  "date": "2024-03-22T00:00:00Z"
}
```

**Success Response**:

- **Code**: 201 CREATED
- **Content**: The created cryptocurrency entry

**Error Response**:

- **Code**: 400 BAD REQUEST
- **Content**:

```json
{
  "statusCode": 400,
  "message": ["cryptoName must be a string", "symbol must be a string"],
  "error": "Bad Request"
}
```

#### Create Multiple Cryptocurrency Entries

Creates multiple cryptocurrency data entries at once.

**URL**: `/crypto/batch`

**Method**: `POST`

**Auth required**: Yes (JWT token)

**Request Body**:

```json
{
  "cryptos": [
    {
      "cryptoName": "Bitcoin",
      "symbol": "BTC",
      "open": 52356.78000000,
      "high": 53285.10000000,
      "low": 51987.44000000,
      "close": 52876.29000000,
      "volume": 28754.91230000,
      "date": "2024-03-22T00:00:00Z"
    },
    {
      "cryptoName": "Ethereum",
      "symbol": "ETH",
      "open": 3156.45000000,
      "high": 3198.72000000,
      "low": 3102.89000000,
      "close": 3187.50000000,
      "volume": 12453.67890000,
      "date": "2024-03-22T00:00:00Z"
    }
  ]
}
```

> Note: This endpoint handles duplicate entries gracefully. If you try to insert data for a cryptocurrency with a date that already exists in the database, it will skip that entry rather than failing the entire operation.

**Success Response**:

- **Code**: 201 CREATED
- **Content**:

```json
{
  "success": true,
  "count": 2,
  "skipped": 0
}
```

If some entries were duplicates and skipped:

```json
{
  "success": true,
  "count": 1,
  "skipped": 1
}
```

**Error Response**:

- **Code**: 400 BAD REQUEST
- **Content**:

```json
{
  "statusCode": 400,
  "message": "Invalid cryptocurrency data",
  "error": "Bad Request"
}
```

### Querying Cryptocurrency Data

#### Query Cryptocurrency Data

Retrieves historical price data for one or multiple cryptocurrencies within a date range.

**URL**: `/crypto/query`

**Method**: `GET`

**Auth required**: Yes (JWT token)

**Query Parameters**:
- `symbol` (optional): Single cryptocurrency symbol (e.g., BTC)
- `symbols` (optional): Multiple cryptocurrency symbols as comma-separated values (e.g., BTC,ETH,XRP)
- `startDate` (optional): Start date in ISO format (defaults to 30 days ago)
- `endDate` (optional): End date in ISO format (defaults to current date)

> Note: You must provide either `symbol` or `symbols`, but not both.

**Examples**:
```
GET /crypto/query?symbol=BTC&startDate=2024-02-01T00:00:00Z&endDate=2024-03-01T00:00:00Z
```

```
GET /crypto/query?symbols=BTC,ETH,SOL&startDate=2024-02-01T00:00:00Z&endDate=2024-03-01T00:00:00Z
```

**Success Response**:

- **Code**: 200 OK
- **Content**: An object containing data array, count and an optional message

```json
{
  "data": [
    {
      "_id": "65fd839c1faec8a64cbf4a8a",
      "cryptoName": "Bitcoin",
      "symbol": "BTC",
      "open": 51394.78000000,
      "low": 51082.08000000,
      "high": 52555.28000000,
      "close": 52145.26000000,
      "volume": 25413.12890000,
      "date": "2024-02-28T00:00:00.000Z",
      "createdAt": "2024-03-22T12:34:52.112Z",
      "updatedAt": "2024-03-22T12:34:52.112Z"
    },
    {
      "_id": "65fd839c1faec8a64cbf4b91",
      "cryptoName": "Ethereum",
      "symbol": "ETH",
      "open": 2951.45000000,
      "low": 2885.11000000,
      "high": 3011.25000000,
      "close": 2975.80000000,
      "volume": 12583.74521000,
      "date": "2024-02-28T00:00:00.000Z",
      "createdAt": "2024-03-22T12:34:52.112Z",
      "updatedAt": "2024-03-22T12:34:52.112Z"
    }
  ],
  "count": 2
}
```

If no data is found, it returns an empty array with a message:

```json
{
  "data": [],
  "count": 0,
  "message": "No data found for symbols [BTC, ETH, SOL] in the specified date range"
}
```

#### Get Latest Cryptocurrency Entry

Retrieves the most recent data entry for one or multiple cryptocurrencies.

**URL**: `/crypto/latest`

**Method**: `GET`

**Auth required**: Yes (JWT token)

**Query Parameters**: 
- `symbol` (optional): Single cryptocurrency symbol (e.g., BTC)
- `symbols` (optional): Multiple cryptocurrency symbols as comma-separated values (e.g., BTC,ETH,XRP)

> Note: You should provide either `symbol` or `symbols`, but not both.

**Examples**:
```
GET /crypto/latest?symbol=BTC
```

```
GET /crypto/latest?symbols=BTC,ETH,SOL
```

**Success Response (Single Symbol)**:

- **Code**: 200 OK
- **Content**:

```json
{
  "data": {
    "_id": "65fd839c1faec8a64cbf4a8a",
    "cryptoName": "Bitcoin",
    "symbol": "BTC",
    "open": 51394.78000000,
    "low": 51082.08000000,
    "high": 52555.28000000,
    "close": 52145.26000000,
    "volume": 25413.12890000,
    "date": "2024-02-28T00:00:00.000Z",
    "createdAt": "2024-03-22T12:34:52.112Z",
    "updatedAt": "2024-03-22T12:34:52.112Z"
  }
}
```

**Success Response (Multiple Symbols)**:

- **Code**: 200 OK
- **Content**:

```json
{
  "data": [
    {
      "_id": "65fd839c1faec8a64cbf4a8a",
      "cryptoName": "Bitcoin",
      "symbol": "BTC",
      "open": 51394.78000000,
      "low": 51082.08000000,
      "high": 52555.28000000,
      "close": 52145.26000000,
      "volume": 25413.12890000,
      "date": "2024-02-28T00:00:00.000Z",
      "createdAt": "2024-03-22T12:34:52.112Z",
      "updatedAt": "2024-03-22T12:34:52.112Z"
    },
    {
      "_id": "65fd839c1faec8a64cbf4b91",
      "cryptoName": "Ethereum",
      "symbol": "ETH",
      "open": 2951.45000000,
      "low": 2885.11000000,
      "high": 3011.25000000,
      "close": 2975.80000000,
      "volume": 12583.74521000,
      "date": "2024-02-28T00:00:00.000Z",
      "createdAt": "2024-03-22T12:34:52.112Z",
      "updatedAt": "2024-03-22T12:34:52.112Z"
    }
  ]
}
```

If no data is found for a single symbol:

```json
{
  "data": null,
  "message": "No latest data found for symbol BTC"
}
```

If no data is found for multiple symbols:

```json
{
  "data": [],
  "message": "No latest data found for symbols [BTC, ETH, SOL]"
}
```

#### Get Available Dates (Debug Endpoint)

Retrieves all available dates for a specific cryptocurrency symbol. Useful for debugging and determining what data exists.

**URL**: `/crypto/available-dates`

**Method**: `GET`

**Auth required**: Yes (JWT token)

**Query Parameters**: 
- `symbol` (required): Cryptocurrency symbol (e.g., BTC)

**Success Response**:

- **Code**: 200 OK
- **Content**:

```json
{
  "symbol": "BTC",
  "dates": [
    "2024-02-01",
    "2024-02-02",
    "2024-02-03"
  ],
  "count": 3
}
```

**Error Response**:

- **Code**: 200 OK with empty result
- **Content**:

```json
{
  "symbol": "XYZ",
  "dates": [],
  "count": 0
}
```

## Portfolio

The Portfolio module allows users to manage their investment portfolios and stock holdings.

### User Endpoints

These endpoints are designed for use in frontend applications, allowing users to manage their own portfolios.

#### Initialize Portfolio

Creates an empty portfolio and holdings for the current user.

**URL**: `/portfolios/me/initialize`

**Method**: `POST`

**Auth required**: Yes (JWT token)

**Success Response**:
- **Code**: 201 CREATED
- **Content**: Portfolio and holdings objects

#### Create Portfolio

Creates a new portfolio for the authenticated user.

**URL**: `/portfolios/me`

**Method**: `POST`

**Auth required**: Yes (JWT token)

**Request Body**:
```json
{
  "portfolio": [
    {
      "date": "2023-05-15T00:00:00.000Z",
      "totalValue": 0
    }
  ]
}
```

**Success Response**:
- **Code**: 201 CREATED
- **Content**: The created portfolio object

#### Get Current Portfolio

Retrieves the portfolio for the authenticated user.

**URL**: `/portfolios/me`

**Method**: `GET`

**Auth required**: Yes (JWT token)

**Success Response**:
- **Code**: 200 OK
- **Content**: Portfolio object including historical data

#### Get Portfolio History

Retrieves the portfolio value history between specified dates.

**URL**: `/portfolios/me/history`

**Method**: `GET`

**Auth required**: Yes (JWT token)

**Query Parameters**:
- `startDate` (Date, optional): Start date in ISO format
- `endDate` (Date, optional): End date in ISO format

**Success Response**:
- **Code**: 200 OK
- **Content**: Array of portfolio entries with dates and values

#### Get Stock Holdings

Retrieves all stock holdings for the authenticated user.

**URL**: `/portfolios/me/holdings`

**Method**: `GET`

**Auth required**: Yes (JWT token)

**Success Response**:
- **Code**: 200 OK
- **Content**: Holdings object with array of stocks

#### Add Portfolio Entry

Adds a historical portfolio value point.

**URL**: `/portfolios/me/entries`

**Method**: `POST`

**Auth required**: Yes (JWT token)

**Request Body**:
```json
{
  "date": "2023-07-15T00:00:00.000Z",
  "totalValue": 5500.25
}
```

**Success Response**:
- **Code**: 201 CREATED
- **Content**: Updated portfolio object

#### Update Portfolio

Updates the portfolio for the authenticated user.

**URL**: `/portfolios/me`

**Method**: `PUT`

**Auth required**: Yes (JWT token)

**Request Body**:
```json
{
  "portfolio": [
    {
      "date": "2023-08-01T00:00:00.000Z",
      "totalValue": 6000.50
    }
  ]
}
```

**Success Response**:
- **Code**: 200 OK
- **Content**: Updated portfolio object

#### Update Stock Holding

Updates or adds a stock holding.

**URL**: `/portfolios/me/holdings/:symbol`

**Method**: `PUT`

**Auth required**: Yes (JWT token)

**Path Parameters**:
- `symbol` (string): Stock symbol (e.g., AAPL, MSFT)

**Request Body**:
```json
{
  "quantity": 10,
  "purchasePrice": 175.50
}
```

**Note**: You can also use `shares` instead of `quantity` and `averagePrice` instead of `purchasePrice`.

**Success Response**:
- **Code**: 200 OK
- **Content**: Updated holdings object

#### Remove Stock Holding

Removes a stock from the user's holdings.

**URL**: `/portfolios/me/holdings/:symbol`

**Method**: `DELETE`

**Auth required**: Yes (JWT token)

**Path Parameters**:
- `symbol` (string): Stock symbol to remove (e.g., AAPL, MSFT)

**Success Response**:
- **Code**: 200 OK
- **Content**: Updated holdings object

### Admin Endpoints

These endpoints are restricted to users with admin privileges.

#### Get All Portfolios

Retrieves all portfolios in the system.

**URL**: `/portfolios`

**Method**: `GET`

**Auth required**: Yes (JWT token with admin privileges)

**Success Response**:
- **Code**: 200 OK
- **Content**: Array of all portfolio objects

#### Get a User's Portfolio

Retrieves a specific user's portfolio.

**URL**: `/portfolios/:userId`

**Method**: `GET`

**Auth required**: Yes (JWT token with admin privileges)

**Path Parameters**:
- `userId` (string): User ID

**Success Response**:
- **Code**: 200 OK
- **Content**: Portfolio object for the specified user

#### Get a User's Portfolio History

Retrieves a specific user's portfolio history.

**URL**: `/portfolios/:userId/history`

**Method**: `GET`

**Auth required**: Yes (JWT token with admin privileges)

**Path Parameters**:
- `userId` (string): User ID

**Query Parameters**:
- `startDate` (Date, optional): Start date in ISO format
- `endDate` (Date, optional): End date in ISO format

**Success Response**:
- **Code**: 200 OK
- **Content**: Array of portfolio entries for the specified user

#### Get a User's Holdings

Retrieves a specific user's stock holdings.

**URL**: `/portfolios/:userId/holdings`

**Method**: `GET`

**Auth required**: Yes (JWT token with admin privileges)

**Path Parameters**:
- `userId` (string): User ID

**Success Response**:
- **Code**: 200 OK
- **Content**: Holdings object for the specified user

#### Create a User's Portfolio

Creates a portfolio for a specific user.

**URL**: `/portfolios`

**Method**: `POST`

**Auth required**: Yes (JWT token with admin privileges)

**Request Body**:
```json
{
  "userId": "60d21b4667d0d8992e610c85",
  "portfolio": [
    {
      "date": "2023-05-15T00:00:00.000Z",
      "totalValue": 0
    }
  ]
}
```

**Success Response**:
- **Code**: 201 CREATED
- **Content**: The created portfolio object

#### Update a User's Portfolio

Updates a specific user's portfolio.

**URL**: `/portfolios/:userId`

**Method**: `PUT`

**Auth required**: Yes (JWT token with admin privileges)

**Path Parameters**:
- `userId` (string): User ID

**Request Body**:
```json
{
  "portfolio": [
    {
      "date": "2023-08-01T00:00:00.000Z",
      "totalValue": 6000.50
    }
  ]
}
```

**Success Response**:
- **Code**: 200 OK
- **Content**: Updated portfolio object

#### Initialize a User's Portfolio

Creates an empty portfolio and holdings for a specific user.

**URL**: `/portfolios/:userId/initialize`

**Method**: `POST`

**Auth required**: Yes (JWT token with admin privileges)

**Path Parameters**:
- `userId` (string): User ID

**Success Response**:
- **Code**: 201 CREATED
- **Content**: Portfolio and holdings objects

### Testing Flow

To test the portfolio functionality end-to-end, follow these steps:

1. **Log in** to obtain a JWT token
2. **Initialize your portfolio**:
   ```
   POST /api/portfolios/me/initialize
   ```
3. **Add stocks to your portfolio**:
   ```
   PUT /api/portfolios/me/holdings/AAPL
   Content-Type: application/json
   {
     "quantity": 10,
     "purchasePrice": 175.50
   }
   ```
4. **Add another stock**:
   ```
   PUT /api/portfolios/me/holdings/MSFT
   Content-Type: application/json
   {
     "quantity": 5,
     "purchasePrice": 325.75
   }
   ```
5. **Check your portfolio**:
   ```
   GET /api/portfolios/me
   ```
6. **View your holdings**:
   ```
   GET /api/portfolios/me/holdings
   ```
7. **Add a historical entry**:
   ```
   POST /api/portfolios/me/entries
   Content-Type: application/json
   {
     "date": "2023-07-15T00:00:00.000Z",
     "totalValue": 5500.25
   }
   ```
8. **Update a holding**:
   ```
   PUT /api/portfolios/me/holdings/AAPL
   Content-Type: application/json
   {
     "quantity": 15,
     "purchasePrice": 172.30
   }
   ```
9. **Remove a holding**:
   ```
   DELETE /api/portfolios/me/holdings/MSFT
   ```
10. **View portfolio history**:
    ```
    GET /api/portfolios/me/history?startDate=2023-01-01T00:00:00.000Z&endDate=2023-12-31T23:59:59.999Z
    ``` 

## Events Module

The Events Module provides access to financial events, workshops, and conferences, with functionality to search, filter, and manage events.

### Features

- Search and discover financial events
- Filter events by date, location, and category
- Get events near a specific location
- View events on a calendar or map
- Create and manage personal events

### Authentication

Some endpoints in the Events Module require JWT authentication. Include your JWT token in the Authorization header:

```
Authorization: Bearer your-jwt-token
```

### Search and Retrieve Events

#### GET /events

Get all events with pagination.

**URL**: `/events`

**Method**: `GET`

**Auth required**: No

**Query Parameters**:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `search`: Text to search for in event titles and descriptions
- `startDate`: Filter events starting from this date (ISO format)
- `endDate`: Filter events until this date (ISO format)
- `category`: Filter by event category

**Success Response**:
- **Code**: 200 OK
- **Content**:
```json
{
  "data": [
    {
      "_id": "60d21b4667d0d8992e610c85",
      "title": "Financial Planning Workshop",
      "description": "Learn the basics of financial planning and investment strategies",
      "location": {
        "address": "123 Main Street, New York, NY",
        "coordinates": {
          "latitude": 40.7128,
          "longitude": -74.0060
        }
      },
      "startDate": "2023-07-15T14:30:00Z",
      "endDate": "2023-07-15T17:30:00Z",
      "category": "workshop",
      "formattedStartDate": "Jul 15, 2023",
      "formattedEndDate": "Jul 15, 2023"
    }
  ],
  "meta": {
    "total": 1,
    "page": 1,
    "limit": 10,
    "pages": 1
  }
}
```

#### GET /events/nearby

Get events near a specific location.

**URL**: `/events/nearby`

**Method**: `GET`

**Auth required**: No

**Query Parameters**:
- `lat`: Latitude of the location (required)
- `lng`: Longitude of the location (required)
- `radius`: Search radius in kilometers (default: 10)
- `startDate`: Filter events starting from this date (ISO format)
- `endDate`: Filter events until this date (ISO format)
- `category`: Filter by event category

**Success Response**:
- **Code**: 200 OK
- **Content**:
```json
{
  "data": [
    {
      "_id": "60d21b4667d0d8992e610c85",
      "title": "Financial Planning Workshop",
      "description": "Learn the basics of financial planning and investment strategies",
      "location": {
        "address": "123 Main Street, New York, NY",
        "coordinates": {
          "latitude": 40.7128,
          "longitude": -74.0060
        }
      },
      "distance": 1.2,
      "startDate": "2023-07-15T14:30:00Z",
      "endDate": "2023-07-15T17:30:00Z",
      "category": "workshop",
      "formattedStartDate": "Jul 15, 2023",
      "formattedEndDate": "Jul 15, 2023"
    }
  ],
  "meta": {
    "total": 1,
    "page": 1,
    "limit": 10,
    "pages": 1
  }
}
```

**Error Response**:
- **Code**: 400 BAD REQUEST
- **Content**:
```json
{
  "code": "EVENT_INVALID_DATA",
  "message": "Both lat and lng parameters are required"
}
```

#### GET /events/calendar

Get events formatted for calendar view.

**URL**: `/events/calendar`

**Method**: `GET`

**Auth required**: No

**Query Parameters**:
- `startDate`: Start date for the calendar range (ISO format)
- `endDate`: End date for the calendar range (ISO format)
- `category`: Filter by event category

**Success Response**:
- **Code**: 200 OK
- **Content**:
```json
[
  {
    "_id": "60d21b4667d0d8992e610c85",
    "title": "Financial Planning Workshop",
    "start": "2023-07-15T14:30:00Z",
    "end": "2023-07-15T17:30:00Z",
    "category": "workshop",
    "formattedStartDate": "Jul 15, 2023",
    "formattedEndDate": "Jul 15, 2023"
  }
]
```

#### GET /events/map

Get events formatted for map view.

**URL**: `/events/map`

**Method**: `GET`

**Auth required**: No

**Query Parameters**:
- `category`: Filter by event category
- `startDate`: Filter events starting from this date (ISO format)
- `endDate`: Filter events until this date (ISO format)

**Success Response**:
- **Code**: 200 OK
- **Content**:
```json
[
  {
    "_id": "60d21b4667d0d8992e610c85",
    "title": "Financial Planning Workshop",
    "description": "Learn the basics of financial planning and investment strategies",
    "location": {
      "coordinates": {
        "latitude": 40.7128,
        "longitude": -74.0060
      },
      "address": "123 Main Street, New York, NY"
    },
    "startDate": "2023-07-15T14:30:00Z",
    "category": "workshop",
    "formattedStartDate": "Jul 15, 2023"
  }
]
```

### Managing Events

#### GET /events/:id

Get a specific event by ID.

**URL**: `/events/:id`

**Method**: `GET`

**Auth required**: No

**URL Parameters**: `id=[string]` the ID of the event to retrieve

**Success Response**:
- **Code**: 200 OK
- **Content**:
```json
{
  "_id": "60d21b4667d0d8992e610c85",
  "title": "Financial Planning Workshop",
  "description": "Learn the basics of financial planning and investment strategies",
  "location": {
    "address": "123 Main Street, New York, NY",
    "coordinates": {
      "latitude": 40.7128,
      "longitude": -74.0060
    }
  },
  "startDate": "2023-07-15T14:30:00Z",
  "endDate": "2023-07-15T17:30:00Z",
  "category": "workshop",
  "formattedStartDate": "Jul 15, 2023",
  "formattedEndDate": "Jul 15, 2023"
}
```

**Error Response**:
- **Code**: 404 NOT FOUND
- **Content**:
```json
{
  "code": "EVENT_NOT_FOUND",
  "message": "Event not found"
}
```

#### POST /events

Create a new event.

**URL**: `/events`

**Method**: `POST`

**Auth required**: Yes (JWT token)

**Request Body**:
```json
{
  "title": "Investment Strategies Seminar",
  "description": "A comprehensive seminar on investment strategies for beginners and experienced investors",
  "location": {
    "address": "456 Business Ave, Chicago, IL",
    "coordinates": {
      "latitude": 41.8781,
      "longitude": -87.6298
    }
  },
  "startDate": "2023-08-20T10:00:00Z",
  "endDate": "2023-08-20T16:00:00Z",
  "category": "seminar",
  "link": "https://example.com/events/investment-seminar",
  "isPublished": true
}
```

**Success Response**:
- **Code**: 201 CREATED
- **Content**:
```json
{
  "_id": "60d21b4667d0d8992e610c86",
  "title": "Investment Strategies Seminar",
  "description": "A comprehensive seminar on investment strategies for beginners and experienced investors",
  "location": {
    "address": "456 Business Ave, Chicago, IL",
    "coordinates": {
      "latitude": 41.8781,
      "longitude": -87.6298
    }
  },
  "startDate": "2023-08-20T10:00:00Z",
  "endDate": "2023-08-20T16:00:00Z",
  "category": "seminar",
  "link": "https://example.com/events/investment-seminar",
  "isPublished": true,
  "formattedStartDate": "Aug 20, 2023",
  "formattedEndDate": "Aug 20, 2023"
}
```

#### PUT /events/:id

Update an existing event.

**URL**: `/events/:id`

**Method**: `PUT`

**Auth required**: Yes (JWT token)

**URL Parameters**: `id=[string]` the ID of the event to update

**Request Body**:
```json
{
  "title": "Updated Investment Strategies Seminar",
  "description": "An updated comprehensive seminar on investment strategies",
  "location": {
    "address": "456 Business Ave, Chicago, IL",
    "coordinates": {
      "latitude": 41.8781,
      "longitude": -87.6298
    }
  },
  "startDate": "2023-08-21T10:00:00Z",
  "endDate": "2023-08-21T16:00:00Z",
  "category": "seminar",
  "isPublished": true
}
```

**Success Response**:
- **Code**: 200 OK
- **Content**:
```json
{
  "_id": "60d21b4667d0d8992e610c86",
  "title": "Updated Investment Strategies Seminar",
  "description": "An updated comprehensive seminar on investment strategies",
  "location": {
    "address": "456 Business Ave, Chicago, IL",
    "coordinates": {
      "latitude": 41.8781,
      "longitude": -87.6298
    }
  },
  "startDate": "2023-08-21T10:00:00Z",
  "endDate": "2023-08-21T16:00:00Z",
  "category": "seminar",
  "isPublished": true,
  "formattedStartDate": "Aug 21, 2023",
  "formattedEndDate": "Aug 21, 2023"
}
```

### Testing the Events Module

To test the Events Module as a regular user:

1. **Browse Events**:
   - Get a list of all events: `GET /events`
   - Search for specific events: `GET /events?search=finance`
   - Filter events by date: `GET /events?startDate=2023-06-01T00:00:00Z&endDate=2023-06-30T23:59:59Z`
   - Filter events by category: `GET /events?category=workshop`

2. **Find Nearby Events**:
   - Get events near your location: `GET /events/nearby?lat=40.7128&lng=-74.0060`
   - Specify search radius: `GET /events/nearby?lat=40.7128&lng=-74.0060&radius=5`
   - Filter nearby events by date: `GET /events/nearby?lat=40.7128&lng=-74.0060&startDate=2023-06-01T00:00:00Z&endDate=2023-06-30T23:59:59Z`

3. **View Events on Calendar or Map**:
   - Get events for calendar view: `GET /events/calendar?startDate=2023-06-01T00:00:00Z&endDate=2023-06-30T23:59:59Z`
   - Get events for map view: `GET /events/map`

4. **View Event Details**:
   - Get details for a specific event: `GET /events/60d21b4667d0d8992e610c85`

5. **Create and Manage Events** (requires authentication):
   - Create a new event: `POST /events` with event details
   - Update an existing event: `PUT /events/60d21b4667d0d8992e610c85` with updated details

**Sample Testing Flow**:

1. Get events near a location:
```bash
curl -X GET "http://localhost:3000/api/events/nearby?lat=40.7128&lng=-74.0060&radius=5" \
  -H "Content-Type: application/json"
```

2. Search for events with a specific keyword:
```bash
curl -X GET "http://localhost:3000/api/events?search=investment&page=1&limit=10" \
  -H "Content-Type: application/json"
```

3. Get events for a date range:
```bash
curl -X GET "http://localhost:3000/api/events/calendar?startDate=2023-06-01T00:00:00Z&endDate=2023-06-30T23:59:59Z" \
  -H "Content-Type: application/json"
```

4. Create a new event (requires authentication):
```bash
curl -X POST "http://localhost:3000/api/events" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Investment Strategies Seminar",
    "description": "A comprehensive seminar on investment strategies for beginners and experienced investors",
    "location": {
      "address": "456 Business Ave, Chicago, IL",
      "coordinates": {
        "latitude": 41.8781,
        "longitude": -87.6298
      }
    },
    "startDate": "2023-08-20T10:00:00Z",
    "endDate": "2023-08-20T16:00:00Z",
    "category": "seminar",
    "isPublished": true
  }'
```

## Chat Module

The Chat Module enables AI-powered conversations and financial advice through an intelligent chat interface. The module handles conversation threads, message history, and integration with AI services.

### Features

- AI-powered financial assistance
- Conversation threads management
- Web search integration for up-to-date information
- Generated follow-up questions
- Daily stock prediction simulations

### Authentication

All endpoints in the Chat Module require JWT authentication. Include your JWT token in the Authorization header:

```
Authorization: Bearer your-jwt-token
```

### Conversation Threads

Threads organize chats into conversations. Users can have multiple threads, each containing a series of messages.

#### GET /threads/me

Get all threads for the current authenticated user.

**URL**: `/threads/me`

**Method**: `GET`

**Auth required**: Yes (JWT token)

**Query Parameters**:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)

**Success Response**:
- **Code**: 200 OK
- **Content**:
```json
{
  "data": [
    {
      "_id": "60d21b4667d0d8992e610c85",
      "title": "Financial Planning Discussion",
      "userId": "60d21b4667d0d8992e610c85",
      "creationDate": "2023-05-15T14:30:00Z"
    },
    {
      "_id": "60d21b4667d0d8992e610c86",
      "title": "Retirement Planning",
      "userId": "60d21b4667d0d8992e610c85",
      "creationDate": "2023-05-16T10:15:00Z"
    }
  ],
  "meta": {
    "total": 2,
    "page": 1,
    "limit": 10,
    "pages": 1
  }
}
```

#### POST /threads/me

Create a new thread for the current user.

**URL**: `/threads/me`

**Method**: `POST`

**Auth required**: Yes (JWT token)

**Request Body**:
```json
{
  "title": "Investment Advice"
}
```

**Success Response**:
- **Code**: 201 CREATED
- **Content**:
```json
{
  "_id": "60d21b4667d0d8992e610c87",
  "userId": "60d21b4667d0d8992e610c85",
  "title": "Investment Advice",
  "creationDate": "2023-06-01T09:45:00Z"
}
```

#### GET /threads/:id

Retrieve a specific thread.

**URL**: `/threads/:id`

**Method**: `GET`

**Auth required**: Yes (JWT token)

**URL Parameters**: `id=[string]` the ID of the thread to retrieve

**Success Response**:
- **Code**: 200 OK
- **Content**:
```json
{
  "_id": "60d21b4667d0d8992e610c85",
  "title": "Financial Planning Discussion",
  "userId": "60d21b4667d0d8992e610c85",
  "creationDate": "2023-05-15T14:30:00Z"
}
```

**Error Response**:
- **Code**: 404 NOT FOUND
- **Content**:
```json
{
  "code": "THREAD_NOT_FOUND",
  "message": "Thread not found"
}
```

#### PUT /threads/:id

Update a thread's title.

**URL**: `/threads/:id`

**Method**: `PUT`

**Auth required**: Yes (JWT token)

**URL Parameters**: `id=[string]` the ID of the thread to update

**Request Body**:
```json
{
  "title": "Updated Financial Planning Discussion"
}
```

**Success Response**:
- **Code**: 200 OK
- **Content**:
```json
{
  "_id": "60d21b4667d0d8992e610c85",
  "title": "Updated Financial Planning Discussion",
  "userId": "60d21b4667d0d8992e610c85",
  "creationDate": "2023-05-15T14:30:00Z"
}
```

**Error Response**:
- **Code**: 404 NOT FOUND

#### DELETE /threads/:id

Delete a thread and all its associated chat messages.

**URL**: `/threads/:id`

**Method**: `DELETE`

**Auth required**: Yes (JWT token)

**URL Parameters**: `id=[string]` the ID of the thread to delete

**Success Response**:
- **Code**: 204 NO CONTENT

**Error Response**:
- **Code**: 404 NOT FOUND

### Chat Messages

Chat messages are individual exchanges within a thread.

#### POST /chats/query

Send a query to the AI assistant and receive a response.

**URL**: `/chats/query`

**Method**: `POST`

**Auth required**: Yes (JWT token)

**Request Body**:
```json
{
  "prompt": "What are some good strategies for retirement planning?",
  "returnSources": true,
  "numberOfPagesToScan": 4,
  "returnFollowUpQuestions": true,
  "threadId": "60d21b4667d0d8992e610c85"  // Optional, if omitted a new thread will be created
}
```

**Success Response**:
- **Code**: 200 OK
- **Content**:
```json
{
  "answer": "Retirement planning involves creating a comprehensive strategy to ensure financial security during your retirement years. Here are some effective strategies: 1) Start early to leverage compound interest, 2) Maximize employer-matched contributions to retirement accounts, 3) Diversify your investment portfolio, 4) Consider tax-advantaged accounts like IRAs and 401(k)s, 5) Regularly review and adjust your plan as you approach retirement age.",
  "sources": [
    {
      "title": "Retirement Planning: A Comprehensive Guide",
      "link": "https://example.com/retirement-planning",
      "snippet": "An overview of retirement planning strategies...",
      "favicon": "https://example.com/favicon.ico",
      "host": "example.com"
    }
  ],
  "followUpQuestions": [
    "What is the difference between a traditional IRA and a Roth IRA?",
    "How much should I be saving each month for retirement?",
    "When is the best time to start taking Social Security benefits?"
  ],
  "chatId": "60d21b4667d0d8992e610c88",
  "threadId": "60d21b4667d0d8992e610c85"
}
```

**Error Response**:
- **Code**: 400 BAD REQUEST
- **Content**:
```json
{
  "code": "AI_SERVICE_ERROR",
  "message": "Failed to process query"
}
```

#### GET /chats/thread/:threadId

Get all chat messages in a specific thread.

**URL**: `/chats/thread/:threadId`

**Method**: `GET`

**Auth required**: Yes (JWT token)

**URL Parameters**: `threadId=[string]` the ID of the thread

**Success Response**:
- **Code**: 200 OK
- **Content**:
```json
[
  {
    "_id": "60d21b4667d0d8992e610c88",
    "prompt": "What are some good strategies for retirement planning?",
    "response": ["Retirement planning involves creating a comprehensive strategy..."],
    "sources": [
      {
        "title": "Retirement Planning: A Comprehensive Guide",
        "link": "https://example.com/retirement-planning",
        "snippet": "An overview of retirement planning strategies..."
      }
    ],
    "followUpQuestions": [
      "What is the difference between a traditional IRA and a Roth IRA?",
      "How much should I be saving each month for retirement?",
      "When is the best time to start taking Social Security benefits?"
    ],
    "threadId": "60d21b4667d0d8992e610c85",
    "creationDate": "2023-05-15T14:35:00Z"
  }
]
```

**Error Response**:
- **Code**: 404 NOT FOUND
- **Content**:
```json
{
  "code": "THREAD_NOT_FOUND",
  "message": "Thread not found"
}
```

### Stock Chat Simulation

FinBud offers a stock prediction simulation feature where users can get AI-generated predictions on stock market trends.

#### POST /chat-stock/update-response

Create or update a stock prediction response.

**URL**: `/chat-stock/update-response`

**Method**: `POST`

**Auth required**: Yes (JWT token)

**Request Body**:
```json
{
  "userId": "60d21b4667d0d8992e610c85",
  "prompt": "What will happen to Tesla stock this week?",
  "response": "Based on current market trends and recent company announcements, Tesla stock might see moderate volatility this week. The upcoming earnings report and production numbers could create short-term price fluctuations. However, always remember that stock predictions are speculative and actual performance depends on numerous factors."
}
```

**Success Response**:
- **Code**: 201 CREATED
- **Content**:
```json
{
  "_id": "60d21b4667d0d8992e610c89",
  "userId": "60d21b4667d0d8992e610c85",
  "prompt": "What will happen to Tesla stock this week?",
  "response": "Based on current market trends and recent company announcements, Tesla stock might see moderate volatility this week...",
  "createdAt": "2023-06-01T09:45:00Z"
}
```

#### GET /chat-stock/responses/me

Get all stock chat responses for the current user.

**URL**: `/chat-stock/responses/me`

**Method**: `GET`

**Auth required**: Yes (JWT token)

**Query Parameters**:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 15)

**Success Response**:
- **Code**: 200 OK
- **Content**:
```json
{
  "data": [
    {
      "_id": "60d21b4667d0d8992e610c89",
      "userId": "60d21b4667d0d8992e610c85",
      "prompt": "What will happen to Tesla stock this week?",
      "response": "Based on current market trends and recent company announcements, Tesla stock might see moderate volatility this week...",
      "createdAt": "2023-06-01T09:45:00Z"
    }
  ],
  "meta": {
    "total": 1,
    "page": 1,
    "limit": 15,
    "pages": 1
  }
}
```

#### GET /chat-stock/responses/today/me

Get today's stock chat response for the current user.

**URL**: `/chat-stock/responses/today/me`

**Method**: `GET`

**Auth required**: Yes (JWT token)

**Success Response**:
- **Code**: 200 OK
- **Content**:
```json
{
  "_id": "60d21b4667d0d8992e610c89",
  "userId": "60d21b4667d0d8992e610c85",
  "prompt": "What will happen to Tesla stock this week?",
  "response": "Based on current market trends and recent company announcements, Tesla stock might see moderate volatility this week...",
  "createdAt": "2023-06-01T09:45:00Z"
}
```

**Success Response (if no response today)**:
- **Code**: 200 OK
- **Content**: `null`

### Testing the Chat Module

To test the Chat Module as a regular user:

1. **Authentication**:
   - First, register or log in using the authentication endpoints.
   - Save the JWT token from the response.
   - Include this token in all subsequent requests as an Authorization header.

2. **Starting a Conversation**:
   - Send a query using `POST /chats/query` without providing a threadId.
   - The system will create a new thread and return its ID along with the AI response.
   - Save this threadId for continuing the conversation.

3. **Continuing a Conversation**:
   - To continue the same conversation, send another query using `POST /chats/query` and include the saved threadId.
   - The system will add this as a new message in the existing thread.
   - You can view all messages in the thread using `GET /chats/thread/:threadId`.

4. **Managing Threads**:
   - View all your conversation threads using `GET /threads/me`.
   - Rename a thread using `PUT /threads/:id`.
   - Delete a thread using `DELETE /threads/:id`.

5. **Testing Stock Predictions**:
   - Create a stock prediction response using `POST /chat-stock/update-response`.
   - View today's response using `GET /chat-stock/responses/today/me`.
   - View all your past responses using `GET /chat-stock/responses/me`.

**Sample Testing Flow**:

1. Login and get token:
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "user@example.com", "password": "securePassword123"}'
```

2. Ask a financial question:
```bash
curl -X POST http://localhost:3000/api/chats/query \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "How can I start investing with a small budget?",
    "returnSources": true,
    "returnFollowUpQuestions": true
  }'
```

3. Continue the conversation using the returned threadId:
```bash
curl -X POST http://localhost:3000/api/chats/query \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "What are index funds?",
    "threadId": "THREAD_ID_FROM_PREVIOUS_RESPONSE"
  }'
```

4. View all messages in the thread:
```bash
curl -X GET http://localhost:3000/api/chats/thread/THREAD_ID_FROM_PREVIOUS_RESPONSE \
  -H "Authorization: Bearer YOUR_TOKEN"
```

5. Get today's stock prediction:
```bash
curl -X GET http://localhost:3000/api/chat-stock/responses/today/me \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### POST /chat-stock/responses/me

Create or update a stock prediction response for the current user.

**URL**: `/chat-stock/responses/me`

**Method**: `POST`

**Auth required**: Yes (JWT token)

**Request Body**:
```json
{
  "prompt": "What will happen to Tesla stock this week?",
  "response": "Based on current market trends and recent company announcements, Tesla stock might see moderate volatility this week. The upcoming earnings report and production numbers could create short-term price fluctuations. However, always remember that stock predictions are speculative and actual performance depends on numerous factors."
}
```

**Success Response**:
- **Code**: 201 CREATED
- **Content**:
```json
{
  "_id": "60d21b4667d0d8992e610c89",
  "userId": "60d21b4667d0d8992e610c85",
  "prompt": "What will happen to Tesla stock this week?",
  "response": "Based on current market trends and recent company announcements, Tesla stock might see moderate volatility this week...",
  "createdAt": "2023-06-01T09:45:00Z"
}
```