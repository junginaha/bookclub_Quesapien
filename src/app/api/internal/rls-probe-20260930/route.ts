import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

function shortBody(text: string) {
  return text.replace(/\s+/g, " ").slice(0, 400);
}

async function requestJson(
  url: string,
  apiKey: string,
  init: RequestInit = {},
) {
  try {
    const res = await fetch(url, {
      ...init,
      headers: {
        apikey: apiKey,
        Authorization: `Bearer ${apiKey}`,
        "Cache-Control": "no-store",
        ...(init.headers ?? {}),
      },
      cache: "no-store",
    });
    const text = await res.text();
    return { ok: res.ok, status: res.status, body: shortBody(text), raw: text };
  } catch (error) {
    return {
      ok: false,
      status: 0,
      body: error instanceof Error ? error.message : "request_failed",
      raw: "",
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

  const execSql = await requestJson(
    `${supabaseUrl}/rest/v1/rpc/exec_sql`,
    serviceKey,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sql: "select 1 as ok" }),
    },
  );

  const pgQuery = await requestJson(
    `${supabaseUrl}/pg/query`,
    serviceKey,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: "select 1 as ok" }),
    },
  );

  const giantsAnon = await requestJson(
    `${supabaseUrl}/rest/v1/giants_conversations?select=id&limit=1`,
    anonKey,
  );
  const giantsService = await requestJson(
    `${supabaseUrl}/rest/v1/giants_conversations?select=id&limit=1`,
    serviceKey,
  );

  const spatialAnonSelect = await requestJson(
    `${supabaseUrl}/rest/v1/spatial_ref_sys?select=srid&limit=1`,
    anonKey,
  );
  const spatialServiceSelect = await requestJson(
    `${supabaseUrl}/rest/v1/spatial_ref_sys?select=srid&limit=1`,
    serviceKey,
  );

  // Prove the sentinel SRID is absent before issuing no-op write probes.
  const sentinelSrid = 2147483647;
  const sentinelCheck = await requestJson(
    `${supabaseUrl}/rest/v1/spatial_ref_sys?select=srid&srid=eq.${sentinelSrid}`,
    serviceKey,
  );

  let sentinelAbsent = false;
  try {
    const parsed = JSON.parse(sentinelCheck.raw);
    sentinelAbsent =
      sentinelCheck.ok && Array.isArray(parsed) && parsed.length === 0;
  } catch {
    sentinelAbsent = false;
  }

  let spatialAnonPatch = {
    ok: false,
    status: 0,
    body: "sentinel_not_proven_absent",
  };
  let spatialAnonDelete = {
    ok: false,
    status: 0,
    body: "sentinel_not_proven_absent",
  };

  if (sentinelAbsent) {
    spatialAnonPatch = await requestJson(
      `${supabaseUrl}/rest/v1/spatial_ref_sys?srid=eq.${sentinelSrid}`,
      anonKey,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Prefer: "return=minimal",
        },
        body: JSON.stringify({ auth_name: "rls-probe-noop" }),
      },
    );

    spatialAnonDelete = await requestJson(
      `${supabaseUrl}/rest/v1/spatial_ref_sys?srid=eq.${sentinelSrid}`,
      anonKey,
      {
        method: "DELETE",
        headers: { Prefer: "return=minimal" },
      },
    );
  }

  return NextResponse.json({
    projectRef: new URL(supabaseUrl).hostname.split(".")[0],
    configured: {
      supabaseUrl: true,
      anonKey: true,
      serviceRole: true,
    },
    sqlPaths: {
      execSql: {
        ok: execSql.ok,
        status: execSql.status,
        body: execSql.body,
      },
      pgQuery: {
        ok: pgQuery.ok,
        status: pgQuery.status,
        body: pgQuery.body,
      },
    },
    giants_conversations: {
      anon: {
        ok: giantsAnon.ok,
        status: giantsAnon.status,
        body: giantsAnon.body,
      },
      service: {
        ok: giantsService.ok,
        status: giantsService.status,
        body: giantsService.body,
      },
    },
    spatial_ref_sys: {
      anonSelect: {
        ok: spatialAnonSelect.ok,
        status: spatialAnonSelect.status,
        body: spatialAnonSelect.body,
      },
      serviceSelect: {
        ok: spatialServiceSelect.ok,
        status: spatialServiceSelect.status,
        body: spatialServiceSelect.body,
      },
      sentinelSrid,
      sentinelAbsent,
      anonPatchNoop: spatialAnonPatch,
      anonDeleteNoop: spatialAnonDelete,
    },
  });
}
