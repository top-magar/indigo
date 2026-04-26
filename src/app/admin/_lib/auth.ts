import { requireUser } from "@/lib/auth";
import { redirect } from "next/navigation";

/** Defense-in-depth: verify platform_admin on every admin page, not just layout */
export async function requireAdmin() {
  const user = await requireUser();
  if (user.role !== "platform_admin") redirect("/dashboard");
  return user;
}
