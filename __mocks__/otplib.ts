export const authenticator = {
  generateSecret: jest.fn().mockReturnValue('MOCK_SECRET'),
  generate: jest.fn().mockReturnValue('123456'),
  check: jest.fn().mockReturnValue(true),
  keyuri: jest.fn().mockReturnValue('otpauth://totp/mock'),
}
