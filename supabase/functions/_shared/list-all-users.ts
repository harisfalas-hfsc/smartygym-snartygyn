/**
 * Paginated listUsers helper
 * supabase.auth.admin.listUsers() defaults to 50 per page.
 * This fetches ALL users across all pages.
 */
export async function listAllUsers(supabase: any): Promise<any[]> {
  const allUsers: any[] = [];
  let page = 1;
  const perPage = 100;

  while (true) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage });
    if (error) throw error;
    if (!data?.users?.length) break;
    allUsers.push(...data.users);
    if (data.users.length < perPage) break;
    page++;
  }

  return allUsers;
}

/**
 * Returns true if an email uses an IANA-reserved/unroutable domain that
 * Resend and most providers reject (example.com, .test, .invalid, etc.).
 */
export function isUnroutableEmail(email: string | null | undefined): boolean {
  if (!email) return true;
  const e = email.toLowerCase().trim();
  return (
    e.endsWith("@example.com") ||
    e.endsWith("@example.org") ||
    e.endsWith("@example.net") ||
    e.endsWith("@test.com") ||
    e.endsWith(".test") ||
    e.endsWith(".invalid") ||
    e.endsWith(".localhost") ||
    e.endsWith(".example")
  );
}
