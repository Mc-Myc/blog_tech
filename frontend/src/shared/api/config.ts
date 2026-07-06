import "server-only";

export function apiBase(): string {
  return process.env.API_URL ?? "http://127.0.0.1:8000/api/v1";
}
