/**
 * Thrown when database access is attempted but Turso env vars are not set.
 * Callers should catch this and fall back to mock data.
 */
export class DatabaseNotConfiguredError extends Error {
  constructor(message = 'Turso database is not configured.') {
    super(message);
    this.name = 'DatabaseNotConfiguredError';
  }
}
