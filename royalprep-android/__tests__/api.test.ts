import { ApiError, createApi, validateOrigin } from '../src/api';

afterEach(() => jest.restoreAllMocks());

test('requires a clean HTTPS origin outside development', () => {
  expect(() => validateOrigin('https://api.example.com', false)).not.toThrow();
  expect(() => validateOrigin('http://10.0.2.2:4000', true)).not.toThrow();
  expect(() => validateOrigin('http://10.0.2.2:4000', false)).toThrow();
  expect(() => validateOrigin('https://user:pass@example.com', true)).toThrow();
  expect(() => validateOrigin('https://example.com/api', true)).toThrow();
});

test('sends the student bearer token and surfaces server errors', async () => {
  const fetchMock = jest.spyOn(globalThis, 'fetch').mockResolvedValue({
    ok: false,
    status: 401,
    json: async () => ({ error: 'Sign in to your student account.' }),
  } as Response);
  const api = createApi('https://api.example.com/', 'session-token');
  await expect(api('/practice/questions')).rejects.toEqual(new ApiError('Sign in to your student account.', 401));
  expect(fetchMock).toHaveBeenCalledWith('https://api.example.com/api/practice/questions', {
    method: 'GET',
    headers: { Authorization: 'Bearer session-token' },
  });
});
