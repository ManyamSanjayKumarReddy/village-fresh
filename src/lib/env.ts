/**
 * ENV selects environment-specific infrastructure (DB driver, image storage).
 * Set to "Local" for docker-compose Postgres + local file storage; anything
 * else (Staging, Production, or unset) uses Neon + Vercel Blob.
 */
export const APP_ENV = process.env.ENV ?? "Production";
export const IS_LOCAL = APP_ENV.toLowerCase() === "local";
