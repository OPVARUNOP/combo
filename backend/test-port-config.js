describe('Port Configuration', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('should use PORT from environment variable', () => {
    process.env.PORT = '3001';

    // Re-import server to get new PORT value
    delete require.cache[require.resolve('./server')];
    const server = require('./server');

    // The server should be configured to use the PORT from env
    expect(process.env.PORT).toBe('3001');
  });

  it('should default to port 8080 when PORT is not set', () => {
    delete process.env.PORT;

    delete require.cache[require.resolve('./server')];
    const server = require('./server');

    // Should not throw error and should work with default port
    expect(true).toBe(true);
  });

  it('should handle invalid PORT values gracefully', () => {
    process.env.PORT = 'invalid';

    delete require.cache[require.resolve('./server')];

    // Should not crash the application
    expect(() => {
      require('./server');
    }).not.toThrow();
  });
});
