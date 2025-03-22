import { HttpException, HttpStatus } from '@nestjs/common';

// Base exception for all app exceptions
export class AppException extends HttpException {
  constructor(
    message: string, 
    statusCode: HttpStatus, 
    errorCode: string,
    details?: any
  ) {
    super(
      {
        statusCode,
        message,
        errorCode,
        details,
        timestamp: new Date().toISOString(),
      },
      statusCode
    );
  }
}

// User-specific exceptions
export class UserNotFoundException extends AppException {
  constructor(userId?: string) {
    super(
      userId 
        ? `User with ID ${userId} not found` 
        : 'User not found',
      HttpStatus.NOT_FOUND,
      'USER_NOT_FOUND'
    );
  }
}

export class UsernameTakenException extends AppException {
  constructor(username: string) {
    super(
      `Username ${username} is already taken`,
      HttpStatus.CONFLICT,
      'USERNAME_TAKEN'
    );
  }
}

export class InvalidCredentialsException extends AppException {
  constructor() {
    super(
      'Invalid username or password',
      HttpStatus.UNAUTHORIZED,
      'INVALID_CREDENTIALS'
    );
  }
}

export class MissingUserDataException extends AppException {
  constructor(fieldName: string) {
    super(
      `Missing required user data: ${fieldName}`,
      HttpStatus.BAD_REQUEST,
      'MISSING_USER_DATA'
    );
  }
}

export class UserUpdateFailedException extends AppException {
  constructor(userId: string, details?: any) {
    super(
      `Failed to update user with ID ${userId}`,
      HttpStatus.INTERNAL_SERVER_ERROR,
      'USER_UPDATE_FAILED',
      details
    );
  }
} 