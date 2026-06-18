'use strict';

const express = require('express');
const { supabaseForUser } = require('../supabase');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// All post routes are protected.
router.use(requireAuth);

// POST /posts — create a post for the authenticated user.
router.post('/', async (req, res, next) => {
  try {
    const title =
      typeof req.body?.title === 'string' ? req.body.title.trim() : '';

    if (!title) {
      return res.status(400).json({ error: 'title is required' });
    }

    // Runs as the authenticated user; RLS' WITH CHECK guarantees user_id can
    // only ever be this user's id. We still set it explicitly from the token,
    // never from the request body.
    const db = supabaseForUser(req.accessToken);
    const { data, error } = await db
      .from('posts')
      .insert({ title, user_id: req.user.id })
      .select()
      .single();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.status(201).json(data);
  } catch (err) {
    next(err);
  }
});

// GET /posts — return only the authenticated user's posts, newest first.
// RLS already restricts rows to the owner; the explicit filter is belt-and-
// suspenders and keeps the intent obvious.
router.get('/', async (req, res, next) => {
  try {
    const db = supabaseForUser(req.accessToken);
    const { data, error } = await db
      .from('posts')
      .select('*')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json(data);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
