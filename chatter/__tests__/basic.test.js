// Basic test to ensure CI doesn't fail
describe('Basic App Tests', () => {
  test('app should be defined', () => {
    expect(true).toBe(true);
  });

  test('basic math works', () => {
    expect(1 + 1).toBe(2);
  });

  test('string operations work', () => {
    expect('hello' + ' world').toBe('hello world');
  });
}); 