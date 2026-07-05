import { redirect } from "next/navigation";
import { DEFAULT_LOCALE } from "@/shared/config";

export default function RootPage() {
  redirect(`/${DEFAULT_LOCALE}`);
}
