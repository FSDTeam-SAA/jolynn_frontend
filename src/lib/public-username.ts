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

export const createServiceSlug = (title: string) =>
  title
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export const buildPublicServiceUrl = (username: string, serviceTitle: string) => {
  const serviceSlug = createServiceSlug(serviceTitle);
  const profilePath = `/${encodeURIComponent(normalizePublicUsername(username))}`;

  return serviceSlug
    ? `${profilePath}?service=${encodeURIComponent(serviceSlug)}`
    : profilePath;
};
