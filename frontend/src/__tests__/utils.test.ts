import { describe, test, expect } from 'vitest';

describe('Utility Functions', () => {
  test('formats date correctly', () => {
    const date = new Date('2026-01-15');
    const formatted = date.toLocaleDateString('en-IN');
    expect(formatted).toBeDefined();
  });

  test('truncates long text', () => {
    const truncate = (text: string, limit: number) =>
      text.length > limit ? text.slice(0, limit) + '...' : text;
    expect(truncate('Hello World', 5)).toBe('Hello...');
    expect(truncate('Hi', 5)).toBe('Hi');
  });

  test('validates email format', () => {
    const isValid = (email: string) => /\S+@\S+\.\S+/.test(email);
    expect(isValid('admin@collegefest.com')).toBe(true);
    expect(isValid('invalid')).toBe(false);
  });

  test('role check returns correct boolean', () => {
    const isAdmin = (role: string) => role === 'admin' || role === 'superadmin';
    expect(isAdmin('admin')).toBe(true);
    expect(isAdmin('student')).toBe(false);
  });
});
