'use strict';

const { supabaseAnon } = require('../supabase');

// Verifies the Bearer token on the Authorization header against Supabase Auth.
// On success it attaches the authenticated user (req.user) and the raw token
// (req.accessToken, used to build a user-scoped DB client) and continues;
// otherwise it short-circuits with 401.
async function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return res
      .status(401)
      .json({ error: 'Missing or malformed Authorization header' });
  }

  const { data, error } = await supabaseAnon.auth.getUser(token);

  if (error || !data || !data.user) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }

  req.user = data.user;
  req.accessToken = token;
  next();
}

module.exports = { requireAuth };
