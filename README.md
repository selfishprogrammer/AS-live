# Posts — Monorepo

A small full-stack project: a Node.js + Express + Supabase REST API, a
React Native (Expo) mobile app, and a GitHub Actions CI pipeline.

```
.
├── api/                      # Node.js + Express + Supabase backend
│   ├── migrations/
│   │   └── 001_create_posts.sql
│   └── src/
│       ├── index.js          # entrypoint
│       ├── app.js            # express app + middleware wiring
│       ├── supabase.js       # anon + service-role clients
│       ├── middleware/auth.js
│       └── routes/{auth,posts}.js
├── app/                      # React Native + Expo mobile app
│   ├── App.js
│   └── src/{api,config,storage}.js + screens/
└── .github/workflows/ci.yml  # CI: install + check both packages
```

## API

### Endpoints

| Method | Path             | Auth | Description                                       |
| ------ | ---------------- | ---- | ------------------------------------------------- |
| POST   | `/auth/register` | No   | Create a user via Supabase Auth                   |
| POST   | `/auth/login`    | No   | Authenticate, returns `access_token`              |
| POST   | `/posts`         | Yes  | Create a post for the authenticated user          |
| GET    | `/posts`         | Yes  | List the authenticated user's posts (newest first)|

Protected routes require an `Authorization: Bearer <access_token>` header.

### Database layer / safety notes

- `user_id` on insert is always taken from the **verified token**, never from
  the request body — a client cannot post as someone else.
- The service-role key lives **only** on the server. The mobile app never sees it.
- Row Level Security is enabled in the migration as defense in depth, so the
  database isolates rows by owner even independently of the API.
- `id` is a UUID PK; `title` and `user_id` are `NOT NULL`.

## Setup

### 1. Supabase

1. Create a free project at https://supabase.com.
2. Open the **SQL Editor** and run the contents of
   `api/migrations/001_create_posts.sql`.
3. From **Project Settings → API**, copy the project URL, the `anon` key, and
   the `service_role` key.
4. (Optional) Under **Authentication → Providers → Email**, disable
   "Confirm email" for the fastest test loop — otherwise registered users must
   confirm before they can log in.

### 2. Run the API locally

```bash
cd api
cp .env.example .env     # then fill in the three Supabase values
npm install
npm start                # http://localhost:3000
```

Quick smoke test:

```bash
curl -X POST localhost:3000/auth/register \
  -H 'content-type: application/json' \
  -d '{"email":"me@example.com","password":"password123"}'

curl -X POST localhost:3000/auth/login \
  -H 'content-type: application/json' \
  -d '{"email":"me@example.com","password":"password123"}'
# -> copy access_token

curl localhost:3000/posts -H "authorization: Bearer <access_token>"
```

### 3. Deploy the API (Railway / Render / Fly.io)

Any of the three works. Example with **Render**:

1. Push this repo to GitHub.
2. New → Web Service → point at the repo, set **Root Directory** to `api`.
3. Build command `npm install`, start command `npm start`.
4. Add env vars: `SUPABASE_URL`, `SUPABASE_ANON_KEY`,
   `SUPABASE_SERVICE_ROLE_KEY`. (`PORT` is provided automatically.)
5. Deploy — you'll get a public `https://...` URL.

### 4. Mobile app

```bash
cd app
npm install
```

Point the app at your deployed API — either edit `expo.extra.apiUrl` in
`app/app.json`, or start with an env var:

```bash
EXPO_PUBLIC_API_URL=https://your-deployed-api npx expo start
```

Then build an Android APK via EAS:

```bash
npm install -g eas-cli
eas login
eas build:configure
eas build --platform android --profile preview   # produces a downloadable APK
```

For iOS TestFlight: `eas build --platform ios --profile production` then
`eas submit --platform ios`.

> Set `EXPO_PUBLIC_API_URL` (or `app.json` `extra.apiUrl`) to the production API
> URL **before** building so the binary ships pointing at the live backend.

## CI

`.github/workflows/ci.yml` runs on every push/PR to `main`:

- installs dependencies for both `/api` and `/app`,
- runs `node --check`-based syntax verification on the API (`npm run check`).

## Deliverables checklist

- [x] Monorepo with `/api`, `/app`, `.github/workflows`
- [x] Raw SQL migration at `api/migrations/001_create_posts.sql`
- [x] Four REST endpoints with auth + per-user scoping
- [x] Two-screen Expo app with secure token storage, live list updates,
      loading/error states
- [x] GitHub Actions CI workflow
- [ ] Live API URL — *fill in after deploying*
- [ ] APK / TestFlight link — *fill in after EAS build*
```
