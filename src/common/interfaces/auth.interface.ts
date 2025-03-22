/**
 * Interface for the JWT payload
 */
export interface JwtPayload {
  sub: string;
  username: string;
  iat?: number;
  exp?: number;
}

/**
 * Interface for the authenticated user
 */
export interface AuthenticatedUser {
  userId: string;
  username: string;
  accountData: {
    username: string;
    priviledge: string;
  };
} 