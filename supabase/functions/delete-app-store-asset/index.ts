import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Verify admin role
async function verifyAdminRole(req: Request) {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    throw new Error('No authorization header');
  }

  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    { global: { headers: { Authorization: authHeader } } }
  );

  const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
  if (userError || !user) {
    throw new Error('Unauthorized');
  }

  // Check admin role
  const { data: roleData, error: roleError } = await supabaseClient
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .eq('role', 'admin')
    .maybeSingle();

  if (roleError || !roleData) {
    throw new Error('Admin access required');
  }

  return user;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify admin
    await verifyAdminRole(req);

    const { asset_id, asset_type, delete_all_of_type } = await req.json();

    console.log('Delete request:', { asset_id, asset_type, delete_all_of_type });

    // Create service role client for storage operations
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    let assetsToDelete = [];

    if (delete_all_of_type && asset_type) {
      // Delete all assets of a specific type
      const { data: assets, error: fetchError } = await supabaseAdmin
        .from('app_store_assets')
        .select('*')
        .eq('asset_type', asset_type);

      if (fetchError) {
        throw new Error(`Failed to fetch assets: ${fetchError.message}`);
      }

      assetsToDelete = assets || [];
    } else if (asset_id) {
      // Delete a specific asset
      const { data: asset, error: fetchError } = await supabaseAdmin
        .from('app_store_assets')
        .select('*')
        .eq('id', asset_id)
        .single();

      if (fetchError) {
        throw new Error(`Failed to fetch asset: ${fetchError.message}`);
      }

      assetsToDelete = [asset];
    } else {
      throw new Error('Either asset_id or (asset_type + delete_all_of_type) is required');
    }

    console.log(`Found ${assetsToDelete.length} assets to delete`);

    const deletedIds: string[] = [];
    const errors: string[] = [];

    for (const asset of assetsToDelete) {
      try {
        // Delete from storage if file_path exists
        if (asset.file_path) {
          const { error: storageError } = await supabaseAdmin.storage
            .from('app-store-assets')
            .remove([asset.file_path]);

          if (storageError) {
            console.error(`Storage delete error for ${asset.file_path}:`, storageError);
            // Continue anyway - file might not exist
          } else {
            console.log(`Deleted from storage: ${asset.file_path}`);
          }
        }

        // Delete from database
        const { error: dbError } = await supabaseAdmin
          .from('app_store_assets')
          .delete()
          .eq('id', asset.id);

        if (dbError) {
          throw new Error(`DB delete failed: ${dbError.message}`);
        }

        deletedIds.push(asset.id);
        console.log(`Deleted asset record: ${asset.id}`);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        errors.push(`${asset.id}: ${errorMessage}`);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        deleted_count: deletedIds.length,
        deleted_ids: deletedIds,
        errors: errors.length > 0 ? errors : undefined,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Delete asset error:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    const isAuthError = errorMessage.includes('Unauthorized') || errorMessage.includes('Admin');
    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: isAuthError ? 403 : 500,
      }
    );
  }
});
