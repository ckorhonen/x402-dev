import { describe, it, expect } from 'vitest';

// Utility function tests
describe('Utility Functions', () => {
  it('should handle string operations', () => {
    const testStr = 'hello world';
    expect(testStr.toUpperCase()).toBe('HELLO WORLD');
    expect(testStr.split(' ')).toHaveLength(2);
  });

  it('should handle number operations', () => {
    expect(1 + 1).toBe(2);
    expect(10 - 5).toBe(5);
    expect(3 * 4).toBe(12);
    expect(15 / 3).toBe(5);
  });

  it('should handle array operations', () => {
    const arr = [1, 2, 3, 4, 5];
    expect(arr.filter(n => n > 3)).toEqual([4, 5]);
    expect(arr.map(n => n * 2)).toEqual([2, 4, 6, 8, 10]);
    expect(arr.reduce((a, b) => a + b, 0)).toBe(15);
  });

  it('should handle object operations', () => {
    const obj = { a: 1, b: 2, c: 3 };
    expect(Object.keys(obj)).toEqual(['a', 'b', 'c']);
    expect(Object.values(obj)).toEqual([1, 2, 3]);
    expect(Object.entries(obj)).toHaveLength(3);
  });
});

// Error handling tests
describe('Error Handling', () => {
  it('should catch thrown errors', () => {
    const throwError = () => {
      throw new Error('Test error');
    };

    expect(throwError).toThrow('Test error');
  });

  it('should handle async operations', async () => {
    const asyncFunction = async () => {
      return Promise.resolve('success');
    };

    await expect(asyncFunction()).resolves.toBe('success');
  });
});
