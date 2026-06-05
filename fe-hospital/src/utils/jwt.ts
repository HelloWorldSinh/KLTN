/**
 * Interface representing the standard payload structure of a JWT token.
 */
interface JwtPayload {
  exp?: number;
  sub?: string;
  iat?: number;
  [key: string]: any;
}

/**
 * Decodes the payload portion of a base64url encoded JWT token.
 * Uses a safe base64url to base64 conversion and handles UTF-8 decode.
 * 
 * @param token - The raw JWT token string.
 * @returns The parsed payload object or null if invalid.
 */
export const parseJwt = (token: string): JwtPayload | null => {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }

    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    
    // Safely decode UTF-8 string from Base64
    const jsonPayload = decodeURIComponent(
      window.atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );

    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Failed to parse JWT token:', error);
    return null;
  }
};

/**
 * Checks if a JWT token has expired.
 * 
 * @param token - The JWT token string to check.
 * @returns True if the token is expired, false otherwise. If the token is empty or invalid, it is treated as expired.
 */
export const isTokenExpired = (token: string | null): boolean => {
  if (!token) {
    return true;
  }

  const payload = parseJwt(token);
  if (!payload || !payload.exp) {
    // If we can't parse it or there's no expiration claim, we assume it's invalid/expired
    return true;
  }

  const currentTimeSeconds = Math.floor(Date.now() / 1000);
  return payload.exp < currentTimeSeconds;
};
