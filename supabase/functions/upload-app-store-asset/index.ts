import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const BUCKET = "app-store-assets";

function sanitizeFileName(name: string) {
  return name
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-zA-Z0-9._-]/g, "")
    .replace(/-+/g, "-")
    .slice(0, 180);
}

function extractBase64(dataUrlOrBase64: string) {
  const idx = dataUrlOrBase64.indexOf("base64,");
  return idx >= 0 ? dataUrlOrBase64.slice(idx + "base64,".length) : dataUrlOrBase64;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";

    if (!supabaseUrl || !serviceKey || !anonKey) {
      throw new Error("Backend is missing required configuration.");
    }

    const authHeader = req.headers.get("Authorization") ?? "";

    // 1) Identify caller (must be logged in)
    const userClient = createClient(supabaseUrl, anonKey, {
      global: {
        headers: authHeader ? { Authorization: authHeader } : {},
      },
    });

    const { data: userRes, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userRes?.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = userRes.user.id;

    // 2) Admin-only
    const adminClient = createClient(supabaseUrl, serviceKey);
    const { data: isAdmin, error: roleErr } = await adminClient.rpc("has_role", {
      _user_id: userId,
      _role: "admin",
    });

    if (roleErr) {
      console.error("[UPLOAD-APP-STORE-ASSET] role check error:", roleErr);
      return new Response(JSON.stringify({ error: "Role check failed" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!isAdmin) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 3) Parse payload
    const body = await req.json();
    const asset_type = String(body.asset_type ?? "");
    const platform = String(body.platform ?? "");
    const file_name = String(body.file_name ?? "");
    const content_type = String(body.content_type ?? "image/png");
    const data_url = String(body.data_url ?? "");
    const width = typeof body.width === "number" ? body.width : null;
    const height = typeof body.height === "number" ? body.height : null;

    if (!asset_type || !platform || !file_name || !data_url) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: asset_type, platform, file_name, data_url" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const safeFileName = sanitizeFileName(file_name) || `asset-${Date.now()}.png`;
    const timestamp = Date.now();
    const filePath = `${asset_type}/${platform}/${timestamp}-${safeFileName}`;

    const base64 = extractBase64(data_url);
    const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));

    console.log("[UPLOAD-APP-STORE-ASSET] Uploading", { asset_type, platform, filePath, size: bytes.length });

    const { error: uploadError } = await adminClient.storage.from(BUCKET).upload(filePath, bytes, {
      contentType: content_type,
      upsert: true,
    });

    if (uploadError) {
      console.error("[UPLOAD-APP-STORE-ASSET] storage upload error:", uploadError);
      throw new Error(uploadError.message);
    }

    const { data: urlData } = adminClient.storage.from(BUCKET).getPublicUrl(filePath);
    const publicUrl = urlData.publicUrl;

    const insertPayload = {
      asset_type,
      platform,
      file_name: safeFileName,
      file_path: filePath,
      file_size: bytes.length,
      width,
      height,
      storage_url: publicUrl,
    };

    const { data: inserted, error: dbError } = await adminClient
      .from("app_store_assets")
      .insert(insertPayload)
      .select("*")
      .single();

    if (dbError) {
      console.error("[UPLOAD-APP-STORE-ASSET] db insert error:", dbError);
      throw new Error(dbError.message);
    }

    return new Response(
      JSON.stringify({ success: true, asset: inserted, publicUrl }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error) {
    console.error("[UPLOAD-APP-STORE-ASSET] Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
