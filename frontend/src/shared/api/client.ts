import { z, type ZodType } from "zod";
import { apiBase } from "./config";

export class ApiError extends Error {
  constructor(message: string, readonly status?: number) {
    super(message);
    this.name = "ApiError";
  }
}

export async function apiGet<T>(path: string, schema: ZodType<T>): Promise<T> {
  const url = `${apiBase()}${path}`;
  let res: Response;
  try {
    res = await fetch(url);
  } catch (e) {
    throw new ApiError(`réseau: ${(e as Error).message}`);
  }
  if (!res.ok) throw new ApiError(`HTTP ${res.status} sur ${path}`, res.status);
  let json: unknown;
  try {
    json = await res.json();
  } catch {
    throw new ApiError(`réponse non-JSON sur ${path}`);
  }
  const parsed = schema.safeParse(json);
  if (!parsed.success) throw new ApiError(`schéma invalide sur ${path}: ${parsed.error.message}`);
  return parsed.data;
}

export function paginated<T>(item: ZodType<T>) {
  return z.object({
    count: z.number(),
    next: z.string().nullable(),
    previous: z.string().nullable(),
    results: z.array(item),
  });
}
