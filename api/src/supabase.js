'use strict';

const { createClient } = require('@supabase/supabase-js');

const { SUPABASE_URL, SUPABASE_ANON_KEY } = process.env;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error(
    'Missing Supabase configuration. Set SUPABASE_URL and SUPABASE_ANON_KEY ' +
      '(see api/.env.example).'
  );
}

const noPersist = {
  auth: { autoRefreshToken: false, persistSession: false },
};

// Anon client: used for the auth flows (sign up / sign in) and for verifying
// access tokens. It only ever holds the public/publishable key.
const supabaseAnon = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, noPersist);

// Per-request client bound to a user's access token. Every DB query made with
// this client runs *as that user*, so the Row Level Security policies on the
// posts table enforce ownership at the database layer. The server never holds
// an admin/service-role key.
function supabaseForUser(accessToken) {
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    ...noPersist,
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
  });
}

module.exports = { supabaseAnon, supabaseForUser };
