export const RESERVED_SLUGS = [
  "api",
  "www",
  "app",
  "admin",
  "dashboard",
  "new",
  "sign-in",
  "sign-up",
  "settings",
  "billing",
  "support",
  "help",
  "docs",
  "blog",
  "status",
  "mail",
  "ftp",
  "cdn",
  "assets",
  "static",
];

export const SLUG_REGEX = /^[a-z0-9][a-z0-9-]{1,61}[a-z0-9]$/;

export const MAX_CODE_LENGTH = 500_000; // 500KB

export const MAX_SITES_FREE_TIER = 3;

export const SITES_DOMAIN =
  process.env.NEXT_PUBLIC_SITES_DOMAIN || "shipartifact.com";

export const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
