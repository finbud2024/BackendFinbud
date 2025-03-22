import { HttpStatus } from '@nestjs/common';
import { AppException } from './app.exception';

export class TransactionNotFoundException extends AppException {
  constructor(id: string) {
    super(
      `Transaction with ID ${id} not found`,
      HttpStatus.NOT_FOUND,
      'TRANSACTION_NOT_FOUND'
    );
  }
}

export class TransactionCreateFailedException extends AppException {
  constructor(message: string = 'Failed to create transaction') {
    super(
      message,
      HttpStatus.BAD_REQUEST,
      'TRANSACTION_CREATE_FAILED'
    );
  }
}

export class TransactionUpdateFailedException extends AppException {
  constructor(id: string, message: string = 'Failed to update transaction') {
    super(
      `Failed to update transaction with ID ${id}: ${message}`,
      HttpStatus.BAD_REQUEST,
      'TRANSACTION_UPDATE_FAILED'
    );
  }
}

export class TransactionDeleteFailedException extends AppException {
  constructor(id: string, message: string = 'Failed to delete transaction') {
    super(
      `Failed to delete transaction with ID ${id}: ${message}`,
      HttpStatus.BAD_REQUEST,
      'TRANSACTION_DELETE_FAILED'
    );
  }
}

export class InvalidTransactionDataException extends AppException {
  constructor(field: string) {
    super(
      `Invalid transaction data: ${field} is required or has invalid format`,
      HttpStatus.BAD_REQUEST,
      'INVALID_TRANSACTION_DATA'
    );
  }
}

export class TransactionBalanceRecalculationException extends AppException {
  constructor(userId: string, message: string = 'Failed to recalculate balances') {
    super(
      `Failed to recalculate balances for user ${userId}: ${message}`,
      HttpStatus.INTERNAL_SERVER_ERROR,
      'TRANSACTION_BALANCE_RECALCULATION_FAILED'
    );
  }
} 