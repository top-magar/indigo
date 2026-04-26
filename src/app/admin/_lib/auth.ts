import { getPlatformUser } from "./permissions";

/** Defense-in-depth: verify platform_admin on every admin page */
export async function requireAdmin() {
  return getPlatformUser();
}
