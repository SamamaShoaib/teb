export const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

export function appPath(path: string): string {
  return `${basePath}${path}`;
}
