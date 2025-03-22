# FinBud Backend API Documentation

This document provides comprehensive documentation for the FinBud API, covering authentication, user management, and transaction operations.

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
  "username": "johndoe",
  "password": "securePassword123",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Success Response**:

- **Code**: 201 CREATED
- **Content**:

```json
{
  "id": "60d21b4667d0d8992e610c85",
  "username": "johndoe",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Error Response**:

- **Code**: 400 BAD REQUEST
- **Content**:

```json
{
  "statusCode": 400,
  "message": "Username already exists"
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
  "username": "johndoe",
  "password": "securePassword123"
}
```

**Success Response**:

- **Code**: 200 OK
- **Content**:

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "userId": "60d21b4667d0d8992e610c85",
  "username": "johndoe"
}
```

**Error Response**:

- **Code**: 401 UNAUTHORIZED
- **Content**:

```json
{
  "statusCode": 401,
  "message": "Invalid credentials"
}
```

### Get Current User

Retrieves the profile of the currently authenticated user.

**URL**: `/auth/profile`

**Method**: `GET`

**Auth required**: Yes (JWT token in Authorization header)

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

- **Code**: 401 UNAUTHORIZED
- **Content**:

```json
{
  "statusCode": 401,
  "message": "Unauthorized"
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
    "id": "60d21b4667d0d8992e610c85",
    "username": "johndoe",
    "firstName": "John",
    "lastName": "Doe",
    "displayName": "John Doe",
    "priviledge": "user"
  },
  {
    "id": "60d21b4667d0d8992e610c86",
    "username": "janedoe",
    "firstName": "Jane",
    "lastName": "Doe",
    "displayName": "Jane Doe",
    "priviledge": "admin"
  }
]
```

**Error Response**:

- **Code**: 401 UNAUTHORIZED
- **Content**:

```json
{
  "statusCode": 401,
  "message": "Unauthorized"
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

**Method**: `PATCH`

**Auth required**: Yes (JWT token, must be user themselves or admin)

**URL Parameters**: `id=[string]` the ID of the user to update

**Request Body**:

```json
{
  "firstName": "Jonathan",
  "lastName": "Doe",
  "displayName": "Jon Doe"
}
```

**Success Response**:

- **Code**: 200 OK
- **Content**:

```json
{
  "id": "60d21b4667d0d8992e610c85",
  "username": "johndoe",
  "firstName": "Jonathan",
  "lastName": "Doe",
  "displayName": "Jon Doe",
  "priviledge": "user"
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

> Note: Negative amounts represent expenses, positive amounts represent income.

**Success Response**:

- **Code**: 201 CREATED
- **Content**:

```json
{
  "id": "60d21b4667d0d8992e610c85",
  "description": "Grocery shopping",
  "amount": -120.50,
  "balance": 879.50,
  "date": "2023-05-15T14:30:00Z",
  "type": "EXPENSE",
  "userId": "60d21b4667d0d8992e610c85"
}
```

**Error Response**:

- **Code**: 400 BAD REQUEST
- **Content**:

```json
{
  "statusCode": 400,
  "message": "Description and amount are required"
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

## Error Responses

The API uses conventional HTTP response codes to indicate the success or failure of an API request:

- `200 OK`: The request was successful
- `201 Created`: A new resource was successfully created
- `204 No Content`: The request was successful but there's no content to return
- `400 Bad Request`: The request was malformed or invalid
- `401 Unauthorized`: Authentication failed or user doesn't have permissions
- `403 Forbidden`: The authenticated user doesn't have access to the requested resource
- `404 Not Found`: The requested resource doesn't exist
- `500 Internal Server Error`: Something went wrong on the server

## Authentication

Most endpoints require a valid JWT token for authentication. The token should be included in the Authorization header of your HTTP requests:

```
Authorization: Bearer your-token-here
```

You can obtain a token by using the login endpoint.

## Testing the API

To test the API, you can use tools like Postman, curl, or any HTTP client that allows you to send requests with headers and a request body.

### Example: Register a User

```bash
curl -X POST http://yourserver.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "johndoe",
    "password": "securePassword123",
    "firstName": "John",
    "lastName": "Doe"
  }'
```

### Example: Login

```bash
curl -X POST http://yourserver.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "johndoe",
    "password": "securePassword123"
  }'
```

### Example: Create a Transaction (with JWT token)

```bash
curl -X POST http://yourserver.com/api/transactions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-token-here" \
  -d '{
    "description": "Grocery shopping",
    "amount": -120.50,
    "date": "2023-05-15T14:30:00Z"
  }'
``` 