import { HttpException, HttpStatus } from '@nestjs/common';

// Error codes enum
export enum ErrorCode {
  // Auth errors
  UNAUTHORIZED_ACCESS = 'UNAUTHORIZED_ACCESS',
  INVALID_TOKEN = 'INVALID_TOKEN',
  MISSING_TOKEN = 'MISSING_TOKEN',
  FORBIDDEN_RESOURCE = 'FORBIDDEN_RESOURCE',
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  
  // User errors
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  USERNAME_TAKEN = 'USERNAME_TAKEN',
  MISSING_USER_DATA = 'MISSING_USER_DATA',
  USER_UPDATE_FAILED = 'USER_UPDATE_FAILED',
  
  // Transaction errors
  TRANSACTION_NOT_FOUND = 'TRANSACTION_NOT_FOUND',
  TRANSACTION_CREATE_FAILED = 'TRANSACTION_CREATE_FAILED',
  TRANSACTION_UPDATE_FAILED = 'TRANSACTION_UPDATE_FAILED',
  TRANSACTION_DELETE_FAILED = 'TRANSACTION_DELETE_FAILED',
  INVALID_TRANSACTION_DATA = 'INVALID_TRANSACTION_DATA',
  TRANSACTION_BALANCE_RECALCULATION_FAILED = 'TRANSACTION_BALANCE_RECALCULATION_FAILED'
}

export class AppException extends HttpException {
  constructor(
    message: string,
    statusCode: HttpStatus,
    errorCode: ErrorCode | string,
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

// Factory for creating exceptions
export class ExceptionFactory {
  // Auth exceptions
  static unauthorized(message = 'Unauthorized access'): AppException {
    return new AppException(message, HttpStatus.UNAUTHORIZED, ErrorCode.UNAUTHORIZED_ACCESS);
  }
  
  static invalidToken(): AppException {
    return new AppException('Invalid or expired token', HttpStatus.UNAUTHORIZED, ErrorCode.INVALID_TOKEN);
  }
  
  static missingToken(): AppException {
    return new AppException('Authentication token is missing', HttpStatus.UNAUTHORIZED, ErrorCode.MISSING_TOKEN);
  }
  
  static forbidden(resource?: string): AppException {
    const message = resource ? `Access to ${resource} is forbidden` : 'Access forbidden';
    return new AppException(message, HttpStatus.FORBIDDEN, ErrorCode.FORBIDDEN_RESOURCE);
  }
  
  static invalidCredentials(): AppException {
    return new AppException('Invalid username or password', HttpStatus.UNAUTHORIZED, ErrorCode.INVALID_CREDENTIALS);
  }
  
  // User exceptions
  static userNotFound(userId?: string): AppException {
    const message = userId ? `User with ID ${userId} not found` : 'User not found';
    return new AppException(message, HttpStatus.NOT_FOUND, ErrorCode.USER_NOT_FOUND);
  }
  
  static usernameTaken(username: string): AppException {
    return new AppException(`Username ${username} is already taken`, HttpStatus.CONFLICT, ErrorCode.USERNAME_TAKEN);
  }
  
  static missingUserData(fieldName: string): AppException {
    return new AppException(`Missing required user data: ${fieldName}`, HttpStatus.BAD_REQUEST, ErrorCode.MISSING_USER_DATA);
  }
  
  static userUpdateFailed(userId: string, details?: any): AppException {
    return new AppException(`Failed to update user with ID ${userId}`, HttpStatus.INTERNAL_SERVER_ERROR, ErrorCode.USER_UPDATE_FAILED, details);
  }
  
  // Transaction exceptions
  static transactionNotFound(id: string): AppException {
    return new AppException(`Transaction with ID ${id} not found`, HttpStatus.NOT_FOUND, ErrorCode.TRANSACTION_NOT_FOUND);
  }
  
  static transactionCreateFailed(message = 'Failed to create transaction'): AppException {
    return new AppException(message, HttpStatus.BAD_REQUEST, ErrorCode.TRANSACTION_CREATE_FAILED);
  }
  
  static transactionUpdateFailed(id: string, message = 'Failed to update transaction'): AppException {
    return new AppException(`Failed to update transaction with ID ${id}: ${message}`, HttpStatus.BAD_REQUEST, ErrorCode.TRANSACTION_UPDATE_FAILED);
  }
  
  static transactionDeleteFailed(id: string, message = 'Failed to delete transaction'): AppException {
    return new AppException(`Failed to delete transaction with ID ${id}: ${message}`, HttpStatus.BAD_REQUEST, ErrorCode.TRANSACTION_DELETE_FAILED);
  }
  
  static invalidTransactionData(field: string): AppException {
    return new AppException(`Invalid transaction data: ${field} is required or has invalid format`, HttpStatus.BAD_REQUEST, ErrorCode.INVALID_TRANSACTION_DATA);
  }
  
  static transactionBalanceRecalculationFailed(userId: string, message = 'Failed to recalculate balances'): AppException {
    return new AppException(`Failed to recalculate balances for user ${userId}: ${message}`, HttpStatus.INTERNAL_SERVER_ERROR, ErrorCode.TRANSACTION_BALANCE_RECALCULATION_FAILED);
  }
} 