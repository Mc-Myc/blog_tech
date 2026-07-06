import type { Locale } from "@/shared/config";
import { DICTS, type Dict } from "./dictionaries";

export function t(locale: Locale): Dict {
  return DICTS[locale];
}
export type { Dict } from "./dictionaries";
