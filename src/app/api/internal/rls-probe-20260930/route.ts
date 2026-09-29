import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

function shortBody(text: string) {
  return text.replace(/\s+/g, " ").slice(0, 300);
}

async function probeSelect(
  supabaseUrl: string,
  apiKey: string,
  table: string,
) {
  try {
    const res = await fetch(
      `${supabaseUrl}/rest/v1/${table}?select=id&limit=1`,
      {
        headers: {
          apikey: apiKey,
          Authorization: `Bearer ${apiKey}`,
          "Cache-Control": "no-store",
        },
        cache: "no-store",
      },
    );
    const text = await res.text();
    return { ok: res.ok, status: res.status, body: shortBody(text) };
  } catch (error) {
    return {
      ok: false,
      status: 0,
      body: error instanceof Error ? error.message : "request_failed",
    };
  }
}

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !anonKey || !serviceKey) {
    return NextResponse.json(
      {
        configured: {
          supabaseUrl: Boolean(supabaseUrl),
          anonKey: Boolean(anonKey),
          serviceRole: Boolean(serviceKey),
        },
      },
      { status: 503 },
    );
  }

  const rpcRes = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      "Cache-Control": "no-store",
    },
    body: JSON.stringify({ sql: "select 1 as ok" }),
    cache: "no-store",
  });

  const rpcText = await rpcRes.text();

  const [anonGiants, serviceGiants, anonSpatial, serviceSpatial] =
    await Promise.all([
      probeSelect(supabaseUrl, anonKey, "giants_conversations"),
      probeSelect(supabaseUrl, serviceKey, "giants_conversations"),
      probeSelect(supabaseUrl, anonKey, "spatial_ref_sys"),
      probeSelect(supabaseUrl, serviceKey, "spatial_ref_sys"),
    ]);

  return NextResponse.json({
    projectRef: new URL(supabaseUrl).hostname.split(".")[0],
    configured: {
      supabaseUrl: true,
      anonKey: true,
      serviceRole: true,
    },
    execSql: {
      ok: rpcRes.ok,
      status: rpcRes.status,
      body: shortBody(rpcText),
    },
    directAccess: {
      giants_conversations: {
        anon: anonGiants,
        service: serviceGiants,
      },
      spatial_ref_sys: {
        anon: anonSpatial,
        service: serviceSpatial,
      },
    },
  });
}
