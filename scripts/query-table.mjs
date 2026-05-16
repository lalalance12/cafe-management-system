const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SUPABASE_TABLE = process.env.SUPABASE_TABLE || "profiles";

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.");
  process.exit(1);
}

const normalizedUrl = SUPABASE_URL.replace(/\/+$/, "");
const endpoint = `${normalizedUrl}/rest/v1/${encodeURIComponent(
    SUPABASE_TABLE
)}?select=id&limit=1`;

async function ping() {
  const response = await fetch(endpoint, {
    method: "GET",
    headers: {
      apikey: SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      Accept: "application/json",
    },
  });

  const bodyText = await response.text();

  if (!response.ok) {
    console.error(`Query failed: ${response.status} ${response.statusText}`);
    console.error(bodyText);
    process.exit(1);
  }

  console.log(
    `Supabase query success. table=${SUPABASE_TABLE} status=${response.status}`
  );
  console.log(`Response: ${bodyText}`);
}
    
ping().catch((error) => {
  console.error("Query script error:", error);
  process.exit(1);
});