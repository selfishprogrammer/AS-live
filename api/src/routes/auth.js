'use strict';

const express = require('express');
const { supabaseAnon } = require('../supabase');

const router = express.Router();

function readCredentials(body) {
  const email = typeof body.email === 'string' ? body.email.trim() : '';
  const password = typeof body.password === 'string' ? body.password : '';
  return { email, password };
}

// POST /auth/register — create a new user via Supabase Auth.
router.post('/register', async (req, res, next) => {
  try {
    const { email, password } = readCredentials(req.body || {});

    if (!email || !password) {
      return res
        .status(400)
        .json({ error: 'email and password are required' });
    }

    const { data, error } = await supabaseAnon.auth.signUp({
      email,
      password,
    });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    // If email confirmation is enabled in Supabase, session will be null and
    // the user must confirm before logging in. We surface both shapes clearly.
    return res.status(201).json({
      user: data.user,
      session: data.session,
    });
  } catch (err) {
    next(err);
  }
});

// POST /auth/login — authenticate and return a session token.
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = readCredentials(req.body || {});

    if (!email || !password) {
      return res
        .status(400)
        .json({ error: 'email and password are required' });
    }

    const { data, error } = await supabaseAnon.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return res.status(401).json({ error: error.message });
    }

    return res.status(200).json({
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
      expires_at: data.session.expires_at,
      user: data.user,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
