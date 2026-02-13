const rawBaseUrl = import.meta.env.BASE_URL ?? "/";
const baseWithoutTrailingSlash = rawBaseUrl.replace(/\/+$/, "");

export function withBase(path: string): string {
  if (!path.startsWith("/")) {
    throw new Error(`Path must start with '/': ${path}`);
  }

  if (!baseWithoutTrailingSlash) {
    return path;
  }

  if (path === "/") {
    return `${baseWithoutTrailingSlash}/`;
  }

  return `${baseWithoutTrailingSlash}${path}`;
}
