export class ApiError extends Error {
  constructor(message: string, public readonly status: number) {
    super(message);
  }
}

export function validateOrigin(origin: string, development: boolean) {
  const match = /^(https?):\/\/([a-z0-9.-]+|\[[0-9a-f:]+\])(?::(\d{1,5}))?\/?$/i.exec(origin);
  if (!match || (match[3] && (Number(match[3]) < 1 || Number(match[3]) > 65535))) {
    throw new Error('Enter a valid backend origin, such as https://example.com.');
  }
  let url: URL;
  try {
    url = new URL(origin);
  } catch {
    throw new Error('Enter a valid backend origin, such as https://example.com.');
  }
  if ((url.protocol !== 'https:' && !(development && url.protocol === 'http:')) ||
      url.username || url.password || url.pathname !== '/' || url.search || url.hash) {
    throw new Error('Use an HTTPS backend origin without a path or credentials. HTTP is allowed only in development.');
  }
}

export function createApi(origin: string, token?: string) {
  return async function request<T>(path: string, method = 'GET', body?: object): Promise<T> {
    const response = await fetch(origin.replace(/\/$/, '') + '/api' + path, {
      method,
      headers: {
        ...(body ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { Authorization: 'Bearer ' + token } : {}),
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
    const data: unknown = await response.json();
    if (!response.ok) {
      const message = typeof data === 'object' && data !== null && 'error' in data && typeof data.error === 'string'
        ? data.error : 'The request could not be completed.';
      throw new ApiError(message, response.status);
    }
    return data as T;
  };
}
