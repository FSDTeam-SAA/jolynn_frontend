export const PUBLIC_USERNAME_PATTERN = /^[a-z0-9_-]{3,30}$/;

export const decodeRouteSegment = (value: string) => {
  let decoded = value;

  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      const nextValue = decodeURIComponent(decoded);
      if (nextValue === decoded) break;
      decoded = nextValue;
    } catch {
      break;
    }
  }

  return decoded;
};

export const normalizePublicUsername = (value: string) =>
  decodeRouteSegment(value).trim().toLowerCase();

export const isValidPublicUsername = (value: string) =>
  PUBLIC_USERNAME_PATTERN.test(normalizePublicUsername(value));
