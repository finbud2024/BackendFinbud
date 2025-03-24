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

Retrieves historical price data for a specific cryptocurrency within a date range.

**URL**: `/crypto/query`

**Method**: `GET`

**Auth required**: Yes (JWT token)

**Query Parameters**:
- `symbol` (required): Cryptocurrency symbol (e.g., BTC, ETH)
- `startDate` (optional): Start date in ISO format (defaults to 30 days ago)
- `endDate` (optional): End date in ISO format (defaults to current date)

**Example**:
```
GET /crypto/query?symbol=BTC&startDate=2024-02-01T00:00:00Z&endDate=2024-03-01T00:00:00Z
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
      "_id": "65fd839c1faec8a64cbf4a89",
      "cryptoName": "Bitcoin",
      "symbol": "BTC",
      "open": 52036.15000000,
      "low": 50933.75000000,
      "high": 52162.80000000,
      "close": 51258.94000000,
      "volume": 21485.96320000,
      "date": "2024-02-27T00:00:00.000Z",
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
  "message": "No data found for BTC in the specified date range"
}
```

#### Get Latest Cryptocurrency Entry

Retrieves the most recent data entry for a specific cryptocurrency or across all cryptocurrencies.

**URL**: `/crypto/latest`

**Method**: `GET`

**Auth required**: Yes (JWT token)

**Query Parameters**: 
- `symbol=[string]` (optional) the cryptocurrency symbol to retrieve

**Success Response**:

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

If no data is found, it returns an object with null data and a message:

```json
{
  "data": null,
  "message": "No latest data found for symbol BTC"
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