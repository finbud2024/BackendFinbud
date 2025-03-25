import { HttpException, HttpStatus, BadRequestException } from '@nestjs/common';

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
  TRANSACTION_BALANCE_RECALCULATION_FAILED = 'TRANSACTION_BALANCE_RECALCULATION_FAILED',
  
  // Goal errors
  GOAL_NOT_FOUND = 'GOAL_NOT_FOUND',
  GOAL_CREATE_FAILED = 'GOAL_CREATE_FAILED',
  GOAL_UPDATE_FAILED = 'GOAL_UPDATE_FAILED',
  GOAL_DELETE_FAILED = 'GOAL_DELETE_FAILED',
  INVALID_GOAL_DATA = 'INVALID_GOAL_DATA',
  GOAL_DEADLINE_PAST = 'GOAL_DEADLINE_PAST',
  
  // Crypto errors
  CRYPTO_NOT_FOUND = 'CRYPTO_NOT_FOUND',
  CRYPTO_CREATE_FAILED = 'CRYPTO_CREATE_FAILED',
  CRYPTO_UPDATE_FAILED = 'CRYPTO_UPDATE_FAILED',
  CRYPTO_DELETE_FAILED = 'CRYPTO_DELETE_FAILED',
  CRYPTO_DUPLICATE_ENTRY = 'CRYPTO_DUPLICATE_ENTRY',
  CRYPTO_INVALID_DATA = 'CRYPTO_INVALID_DATA',
  CRYPTO_SYMBOL_REQUIRED = 'CRYPTO_SYMBOL_REQUIRED',
  CRYPTO_DATE_REQUIRED = 'CRYPTO_DATE_REQUIRED',
  CRYPTO_API_ERROR = 'CRYPTO_API_ERROR',
  
  // Event errors
  EVENT_NOT_FOUND = 'EVENT_NOT_FOUND',
  EVENT_CREATE_FAILED = 'EVENT_CREATE_FAILED',
  EVENT_UPDATE_FAILED = 'EVENT_UPDATE_FAILED',
  EVENT_DELETE_FAILED = 'EVENT_DELETE_FAILED',
  EVENT_DUPLICATE_ENTRY = 'EVENT_DUPLICATE_ENTRY',
  EVENT_INVALID_DATA = 'EVENT_INVALID_DATA',
  EVENT_NAME_REQUIRED = 'EVENT_NAME_REQUIRED',
  EVENT_URL_REQUIRED = 'EVENT_URL_REQUIRED',
  EVENT_LOCATION_INVALID = 'EVENT_LOCATION_INVALID',
  EVENT_DATE_INVALID = 'EVENT_DATE_INVALID',
  EVENT_SCRAPER_ERROR = 'EVENT_SCRAPER_ERROR',
  EVENT_VALIDATION_ERROR = 'EVENT_VALIDATION_ERROR',

  // Chat errors
  CHAT_NOT_FOUND = 'CHAT_NOT_FOUND',
  CHAT_CREATE_FAILED = 'CHAT_CREATE_FAILED',
  CHAT_UPDATE_FAILED = 'CHAT_UPDATE_FAILED',
  CHAT_DELETE_FAILED = 'CHAT_DELETE_FAILED',
  CHAT_INVALID_DATA = 'CHAT_INVALID_DATA',
  CHAT_PROMPT_REQUIRED = 'CHAT_PROMPT_REQUIRED',
  CHAT_RESPONSE_REQUIRED = 'CHAT_RESPONSE_REQUIRED',
  THREAD_NOT_FOUND = 'THREAD_NOT_FOUND',
  THREAD_CREATE_FAILED = 'THREAD_CREATE_FAILED',
  THREAD_UPDATE_FAILED = 'THREAD_UPDATE_FAILED',
  THREAD_DELETE_FAILED = 'THREAD_DELETE_FAILED',
  THREAD_INVALID_DATA = 'THREAD_INVALID_DATA',
  THREAD_USER_REQUIRED = 'THREAD_USER_REQUIRED',
  CHAT_STOCK_NOT_FOUND = 'CHAT_STOCK_NOT_FOUND',
  CHAT_STOCK_CREATE_FAILED = 'CHAT_STOCK_CREATE_FAILED',
  CHAT_STOCK_UPDATE_FAILED = 'CHAT_STOCK_UPDATE_FAILED',
  CHAT_STOCK_DELETE_FAILED = 'CHAT_STOCK_DELETE_FAILED',
  AI_SERVICE_ERROR = 'AI_SERVICE_ERROR',
  SEARCH_SERVICE_ERROR = 'SEARCH_SERVICE_ERROR',
  FOLLOW_UP_SERVICE_ERROR = 'FOLLOW_UP_SERVICE_ERROR'
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
  
  // Goal exceptions
  static goalNotFound(id: string): AppException {
    return new AppException(`Goal with ID ${id} not found`, HttpStatus.NOT_FOUND, ErrorCode.GOAL_NOT_FOUND);
  }
  
  static goalCreateFailed(message = 'Failed to create goal'): AppException {
    return new AppException(message, HttpStatus.BAD_REQUEST, ErrorCode.GOAL_CREATE_FAILED);
  }
  
  static goalUpdateFailed(id: string, message = 'Failed to update goal'): AppException {
    return new AppException(`Failed to update goal with ID ${id}: ${message}`, HttpStatus.BAD_REQUEST, ErrorCode.GOAL_UPDATE_FAILED);
  }
  
  static goalDeleteFailed(id: string, message = 'Failed to delete goal'): AppException {
    return new AppException(`Failed to delete goal with ID ${id}: ${message}`, HttpStatus.BAD_REQUEST, ErrorCode.GOAL_DELETE_FAILED);
  }
  
  static invalidGoalData(field: string): AppException {
    return new AppException(`Invalid goal data: ${field} is required or has invalid format`, HttpStatus.BAD_REQUEST, ErrorCode.INVALID_GOAL_DATA);
  }
  
  static goalDeadlinePast(date: Date): AppException {
    return new AppException(`Goal deadline cannot be in the past: ${date.toISOString()}`, HttpStatus.BAD_REQUEST, ErrorCode.GOAL_DEADLINE_PAST);
  }

  // Crypto exceptions
  static cryptoNotFound(symbol?: string): AppException {
    const message = symbol 
      ? `No cryptocurrency data found for symbol: ${symbol}` 
      : 'No cryptocurrency data found';
    return new AppException(message, HttpStatus.NOT_FOUND, ErrorCode.CRYPTO_NOT_FOUND);
  }
  
  static cryptoCreateFailed(message = 'Failed to create cryptocurrency entry'): AppException {
    return new AppException(message, HttpStatus.BAD_REQUEST, ErrorCode.CRYPTO_CREATE_FAILED);
  }
  
  static cryptoUpdateFailed(message = 'Failed to update cryptocurrency data'): AppException {
    return new AppException(message, HttpStatus.BAD_REQUEST, ErrorCode.CRYPTO_UPDATE_FAILED);
  }
  
  static cryptoDuplicateEntry(symbol: string, date: Date): AppException {
    const dateStr = date instanceof Date ? date.toISOString().split('T')[0] : date;
    return new AppException(
      `Duplicate entry for cryptocurrency ${symbol} on ${dateStr}`, 
      HttpStatus.CONFLICT, 
      ErrorCode.CRYPTO_DUPLICATE_ENTRY
    );
  }
  
  static cryptoInvalidData(field?: string): AppException {
    const message = field 
      ? `Invalid cryptocurrency data: ${field}` 
      : 'Invalid cryptocurrency data';
    return new AppException(message, HttpStatus.BAD_REQUEST, ErrorCode.CRYPTO_INVALID_DATA);
  }
  
  static cryptoSymbolRequired(): AppException {
    return new AppException(
      'Cryptocurrency symbol is required', 
      HttpStatus.BAD_REQUEST, 
      ErrorCode.CRYPTO_SYMBOL_REQUIRED
    );
  }
  
  static cryptoDateRequired(): AppException {
    return new AppException(
      'Date is required for cryptocurrency data', 
      HttpStatus.BAD_REQUEST, 
      ErrorCode.CRYPTO_DATE_REQUIRED
    );
  }
  
  static cryptoApiError(message: string, details?: any): AppException {
    return new AppException(
      `Cryptocurrency API error: ${message}`, 
      HttpStatus.INTERNAL_SERVER_ERROR, 
      ErrorCode.CRYPTO_API_ERROR, 
      details
    );
  }

  // Event exceptions
  static eventNotFound(id?: string): AppException {
    const message = id 
      ? `Event with ID ${id} not found` 
      : 'Event not found';
    return new AppException(message, HttpStatus.NOT_FOUND, ErrorCode.EVENT_NOT_FOUND);
  }
  
  static eventCreateFailed(message = 'Failed to create event'): AppException {
    return new AppException(message, HttpStatus.BAD_REQUEST, ErrorCode.EVENT_CREATE_FAILED);
  }
  
  static eventUpdateFailed(id: string, message = 'Failed to update event'): AppException {
    return new AppException(`Failed to update event with ID ${id}: ${message}`, HttpStatus.BAD_REQUEST, ErrorCode.EVENT_UPDATE_FAILED);
  }
  
  static eventDeleteFailed(id: string, message = 'Failed to delete event'): AppException {
    return new AppException(`Failed to delete event with ID ${id}: ${message}`, HttpStatus.BAD_REQUEST, ErrorCode.EVENT_DELETE_FAILED);
  }
  
  static eventDuplicateEntry(url: string): AppException {
    return new AppException(
      `Duplicate event with URL: ${url}`, 
      HttpStatus.CONFLICT, 
      ErrorCode.EVENT_DUPLICATE_ENTRY
    );
  }
  
  static eventInvalidData(field?: string): AppException {
    const message = field 
      ? `Invalid event data: ${field}` 
      : 'Invalid event data';
    return new AppException(message, HttpStatus.BAD_REQUEST, ErrorCode.EVENT_INVALID_DATA);
  }
  
  static eventNameRequired(): AppException {
    return new AppException(
      'Event name is required', 
      HttpStatus.BAD_REQUEST, 
      ErrorCode.EVENT_NAME_REQUIRED
    );
  }
  
  static eventUrlRequired(): AppException {
    return new AppException(
      'Event URL is required', 
      HttpStatus.BAD_REQUEST, 
      ErrorCode.EVENT_URL_REQUIRED
    );
  }
  
  static eventLocationInvalid(details: any): AppException {
    return new AppException(
      `Invalid event location: ${details.message || ''}`,
      HttpStatus.BAD_REQUEST,
      ErrorCode.EVENT_LOCATION_INVALID,
      details
    );
  }
  
  static eventDateInvalid(dateString: string): AppException {
    return new AppException(
      `Invalid event date format: ${dateString}`,
      HttpStatus.BAD_REQUEST,
      ErrorCode.EVENT_DATE_INVALID
    );
  }
  
  static eventValidationError(message: string): AppException {
    return new AppException(
      message,
      HttpStatus.BAD_REQUEST,
      ErrorCode.EVENT_VALIDATION_ERROR,
    );
  }
  
  static eventScraperError(message: string, details?: any): AppException {
    return new AppException(
      `Event scraper error: ${message}`,
      HttpStatus.INTERNAL_SERVER_ERROR,
      ErrorCode.EVENT_SCRAPER_ERROR,
      details
    );
  }

  // Chat exceptions
  static chatNotFound() {
    return new BadRequestException({
      code: 'CHAT_NOT_FOUND',
      message: 'Chat not found',
    });
  }
  
  static chatCreateFailed(message = 'Failed to create chat'): AppException {
    return new AppException(message, HttpStatus.BAD_REQUEST, ErrorCode.CHAT_CREATE_FAILED);
  }
  
  static chatUpdateFailed(id: string, message = 'Failed to update chat'): AppException {
    return new AppException(`Failed to update chat with ID ${id}: ${message}`, HttpStatus.BAD_REQUEST, ErrorCode.CHAT_UPDATE_FAILED);
  }
  
  static chatDeleteFailed(id: string, message = 'Failed to delete chat'): AppException {
    return new AppException(`Failed to delete chat with ID ${id}: ${message}`, HttpStatus.BAD_REQUEST, ErrorCode.CHAT_DELETE_FAILED);
  }
  
  static chatInvalidData(field?: string): AppException {
    const message = field 
      ? `Invalid chat data: ${field}` 
      : 'Invalid chat data';
    return new AppException(message, HttpStatus.BAD_REQUEST, ErrorCode.CHAT_INVALID_DATA);
  }
  
  static chatPromptRequired(): AppException {
    return new AppException(
      'Chat prompt is required', 
      HttpStatus.BAD_REQUEST, 
      ErrorCode.CHAT_PROMPT_REQUIRED
    );
  }
  
  static chatResponseRequired(): AppException {
    return new AppException(
      'Chat response is required', 
      HttpStatus.BAD_REQUEST, 
      ErrorCode.CHAT_RESPONSE_REQUIRED
    );
  }

  // Thread exceptions
  static threadNotFound() {
    return new BadRequestException({
      code: 'THREAD_NOT_FOUND',
      message: 'Thread not found',
    });
  }
  
  static threadCreateFailed(message = 'Failed to create thread'): AppException {
    return new AppException(message, HttpStatus.BAD_REQUEST, ErrorCode.THREAD_CREATE_FAILED);
  }
  
  static threadUpdateFailed(id: string, message = 'Failed to update thread'): AppException {
    return new AppException(`Failed to update thread with ID ${id}: ${message}`, HttpStatus.BAD_REQUEST, ErrorCode.THREAD_UPDATE_FAILED);
  }
  
  static threadDeleteFailed(id: string, message = 'Failed to delete thread'): AppException {
    return new AppException(`Failed to delete thread with ID ${id}: ${message}`, HttpStatus.BAD_REQUEST, ErrorCode.THREAD_DELETE_FAILED);
  }
  
  static threadInvalidData(field?: string): AppException {
    const message = field 
      ? `Invalid thread data: ${field}` 
      : 'Invalid thread data';
    return new AppException(message, HttpStatus.BAD_REQUEST, ErrorCode.THREAD_INVALID_DATA);
  }
  
  static threadUserRequired(): AppException {
    return new AppException(
      'User ID is required for thread', 
      HttpStatus.BAD_REQUEST, 
      ErrorCode.THREAD_USER_REQUIRED
    );
  }

  // ChatStock exceptions
  static chatStockNotFound(id?: string): AppException {
    const message = id 
      ? `Chat stock simulation with ID ${id} not found` 
      : 'Chat stock simulation not found';
    return new AppException(message, HttpStatus.NOT_FOUND, ErrorCode.CHAT_STOCK_NOT_FOUND);
  }
  
  static chatStockCreateFailed(message = 'Failed to create chat stock simulation'): AppException {
    return new AppException(message, HttpStatus.BAD_REQUEST, ErrorCode.CHAT_STOCK_CREATE_FAILED);
  }
  
  static chatStockUpdateFailed(id: string, message = 'Failed to update chat stock simulation'): AppException {
    return new AppException(`Failed to update chat stock simulation with ID ${id}: ${message}`, HttpStatus.BAD_REQUEST, ErrorCode.CHAT_STOCK_UPDATE_FAILED);
  }
  
  static chatStockDeleteFailed(id: string, message = 'Failed to delete chat stock simulation'): AppException {
    return new AppException(`Failed to delete chat stock simulation with ID ${id}: ${message}`, HttpStatus.BAD_REQUEST, ErrorCode.CHAT_STOCK_DELETE_FAILED);
  }

  // AI Service exceptions
  static aiServiceError(message: string = 'AI service error') {
    return new BadRequestException({
      code: 'AI_SERVICE_ERROR',
      message,
    });
  }
  
  static searchServiceError(message: string, details?: any): AppException {
    return new AppException(
      `Search service error: ${message}`, 
      HttpStatus.SERVICE_UNAVAILABLE, 
      ErrorCode.SEARCH_SERVICE_ERROR,
      details
    );
  }
  
  static followUpServiceError(message: string, details?: any): AppException {
    return new AppException(
      `Follow-up generation error: ${message}`, 
      HttpStatus.INTERNAL_SERVER_ERROR, 
      ErrorCode.FOLLOW_UP_SERVICE_ERROR,
      details
    );
  }

  // Chat module additional exceptions
  static threadNotFoundSimple() {
    return new BadRequestException({
      code: 'THREAD_NOT_FOUND',
      message: 'Thread not found',
    });
  }

  static chatNotFoundSimple() {
    return new BadRequestException({
      code: 'CHAT_NOT_FOUND',
      message: 'Chat not found',
    });
  }

  static aiServiceErrorSimple(message: string = 'AI service error') {
    return new BadRequestException({
      code: 'AI_SERVICE_ERROR',
      message,
    });
  }
} 