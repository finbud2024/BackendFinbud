# Exception Handling Migration Plan

## The Problem

The original approach to exception handling involved creating multiple exception classes for different error scenarios, which led to:
1. A lot of boilerplate code
2. Multiple files with similar error handling patterns
3. Increased complexity when adding new error types

## The Solution

We've implemented a centralized exception handling pattern using:
1. A base `AppException` class
2. An `ErrorCode` enum for standardized error codes
3. An `ExceptionFactory` class with static methods for creating common exceptions

## Migration Steps

To migrate from the old exception handling to the new pattern:

1. **Replace all exception usages with ExceptionFactory**:
   
   Before:
   ```typescript
   throw new InvalidCredentialsException();
   ```
   
   After:
   ```typescript
   throw ExceptionFactory.invalidCredentials();
   ```

2. **Update imports**:
   
   Before:
   ```typescript
   import { InvalidCredentialsException } from '../../common/exceptions/user.exceptions';
   ```
   
   After:
   ```typescript
   import { ExceptionFactory } from '../../common/exceptions/app.exception';
   ```

3. **Remove all unused exception files**:
   Once all code has been migrated to use the `ExceptionFactory`, the following files can be safely removed:
   - `src/common/exceptions/auth.exceptions.ts`
   - `src/common/exceptions/transaction.exceptions.ts` 
   - `src/common/exceptions/user.exceptions.ts`

## Benefits of the New Pattern

1. **Reduced code duplication**: All exception creation is handled by a single factory class
2. **Consistent error format**: All errors follow the same structure
3. **Easier maintenance**: Adding new error types is as simple as adding a new factory method
4. **Better type safety**: Using an enum for error codes prevents typos
5. **Improved readability**: Method names like `ExceptionFactory.userNotFound()` clearly indicate the error type

## Example Usage

```typescript
// Creating a user-related exception
throw ExceptionFactory.userNotFound(userId);

// Creating a transaction-related exception
throw ExceptionFactory.transactionNotFound(id);

// Creating an auth-related exception
throw ExceptionFactory.invalidCredentials();
``` 