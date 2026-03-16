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
