export const apiBaseUrl = (
  process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001'
).replace(/\/$/, '');

export function getApiAssetUrl(path: string) {
  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  return `${apiBaseUrl}${path.startsWith('/') ? path : `/${path}`}`;
}
