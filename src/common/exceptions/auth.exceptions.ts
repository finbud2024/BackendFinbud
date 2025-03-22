import { HttpStatus } from '@nestjs/common';
import { AppException } from './app.exception';

export class UnauthorizedException extends AppException {
  constructor(message = 'Unauthorized access') {
    super(
      message,
      HttpStatus.UNAUTHORIZED,
      'UNAUTHORIZED_ACCESS'
    );
  }
}

export class InvalidTokenException extends AppException {
  constructor() {
    super(
      'Invalid or expired token',
      HttpStatus.UNAUTHORIZED,
      'INVALID_TOKEN'
    );
  }
}

export class MissingTokenException extends AppException {
  constructor() {
    super(
      'Authentication token is missing',
      HttpStatus.UNAUTHORIZED,
      'MISSING_TOKEN'
    );
  }
}

export class ForbiddenResourceException extends AppException {
  constructor(resource?: string) {
    super(
      resource ? `Access to ${resource} is forbidden` : 'Access forbidden',
      HttpStatus.FORBIDDEN,
      'FORBIDDEN_RESOURCE'
    );
  }
} 