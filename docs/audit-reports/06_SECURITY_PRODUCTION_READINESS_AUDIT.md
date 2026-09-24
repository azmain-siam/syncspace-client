# SyncSpace — Audit 6
# Frontend Security & Production Readiness Audit — Findings Report

**Scope:** Frontend-side security risks and production readiness only — secrets, authentication token handling, sensitive data exposure, XSS/unsafe rendering, URL handling, error exposure, production cleanup, dependency security, environment configuration, and production UX readiness.
**Out of scope:** Backend code changes, UI redesign, broad performance optimization. The frontend is never treated as the security boundary; actual authorization enforcement lives on the backend and is called out as needing verification where relevant.
**Method:** Static scan of the source and the built production client bundle for secret-shaped strings, `pnpm audit` against the npm advisory database plus registry metadata for suspicious packages, reading the frontend auth/URL/rendering code, checking response headers from the running dev server, and reusing the confirmed production-build findings from Audit 5 (no dev-overlay code ships to production). `.env` contents were not read. Backend source reads were not available for this audit, so every backend-side claim is explicitly marked as needing runtime/backend verification rather than asserted. No code was modified as part of this audit.

Labels: **Confirmed** means verified in code, the build, or tooling output. **Needs runtime/backend verification** means it depends on hosting, backend behavior, or conditions not observable from the frontend repo alone.

---

## 1. Executive Summary

**What's good:**
- **Secrets (Confirmed):** no secrets in the source, the git history, or the client bundle. `.env` is gitignored and was never committed.
- **Rendering (Confirmed):** no `dangerouslySetInnerHTML`, no markdown or HTML rendering, no iframes.
- **User links (Confirmed):**
  - normalized to `https://` in the UI;
  - React 19.2.8 blocks `javascript:` URLs at render time;
  - no redirect parameter handling that could be abused today.
- **Production output (Confirmed):** no console logging beyond two development-gated warnings, and no mock data or test accounts.

**What's wrong:**
1. **Next.js has two critical remote-code-execution advisories (Confirmed by `pnpm audit`).** Exploitability depends on advisory conditions that need checking against how the app is hosted.
2. **The OAuth callback carries both tokens in the query string (Confirmed).** The long-lived refresh token ends up anywhere URLs get logged.
3. **There are no security headers (Confirmed in the repo; host needs checking).** No CSP means nothing contains an XSS or a compromised dependency, and tokens in localStorage are exactly what an attacker would go after.
4. **Session teardown is incomplete (Confirmed).**
   - Several logout paths leave cached data behind.
   - One logout path never revokes the server session.
   - The second socket connection (Audit 4) stays authenticated after logout.
   - Tabs don't sync logout.
5. **The landing page (Confirmed)** lists real companies as customers, advertises plans and an SLA that don't exist, and its legal links are dead text.

---

## 2. Critical Security Issues

### C1. Next.js 16.2.12 has two critical advisories (Confirmed; exploitability needs verification)

`pnpm audit` reports:

| Severity | Advisory | Fixed in |
|---|---|---|
| Critical | [GHSA-p293-qw3h-jr36](https://github.com/advisories/GHSA-p293-qw3h-jr36): unauthenticated RCE on Windows-hosted servers | `next` ≥ 16.3.3 |
| Critical | [GHSA-2xp9-vwfh-vxw4](https://github.com/advisories/GHSA-2xp9-vwfh-vxw4): unauthenticated RCE in the Image Optimization API when AVIF files are used | `next` ≥ 16.3.3 |
| High | Two `sharp` advisories (libvips, libheif), pulled in by Next's image optimizer | `sharp` ≥ 0.35.4 |

- The app renders images with `unoptimized`, but the `/_next/image` endpoint still exists under `next start` by default.
- Only advisory titles were available, not the full technical conditions, so exploitability against this specific deployment can't be asserted here.
- Latest is 16.3.6 — a patch-level move within 16.x, low migration risk.

**Why it's critical:** unauthenticated RCE on the frontend server. The upgrade is low-risk compared with the exposure. Re-run `pnpm audit` afterward to confirm the `sharp` and `postcss` advisories resolve with it.

### C2. The OAuth callback puts tokens in the URL (Confirmed)

`app/auth/google/callback/page.tsx` reads `?accessToken=…&refreshToken=…` from the query string. It only navigates away with `router.replace('/dashboard')` after awaiting `/user/me`.

**The real risk:** a query string is part of the request sent to whatever serves the frontend, so both tokens — including the long-lived refresh token — can land in:
- CDN, proxy, and hosting access logs;
- browser history, until `replace` runs;
- browser extensions that read URLs;
- screenshots or screen shares taken during the redirect.

Anyone with access to those logs can mint new sessions until the refresh token expires or rotates. OAuth 2.0 security best-practice guidance specifically warns against tokens in query strings for this reason.

**What the frontend can do alone:**
- strip the URL synchronously, before any `await`, with `window.history.replaceState`;
- serve that route with `Referrer-Policy: no-referrer`;
- map error codes to fixed messages (see M4).

**The real fix is a backend change:** a short-lived one-time code exchanged via POST, or tokens in the URL fragment (`#`), which browsers never send to servers.

---

## 3. High Priority Production Issues

### H1. No security headers (Confirmed in the repo; host behavior needs verification)

`next.config.ts` is empty, and there's no `proxy.ts`, `vercel.json`, or server config in the repo. The dev server's response to `/login` includes only `Cache-Control` and `X-Powered-By: Next.js`. Missing:

| Header | What it prevents |
|---|---|
| `Content-Security-Policy` | Limits what an XSS or a compromised dependency can load and where it can send data. This is the main containment for localStorage tokens (H2). |
| `frame-ancestors 'none'` / `X-Frame-Options: DENY` | Clickjacking, where the app is framed invisibly to trick clicks such as "Delete workspace" or "Transfer ownership". |
| `Referrer-Policy` | Browsers default to `strict-origin-when-cross-origin`, which is acceptable, but it should be explicit — and `no-referrer` on token-bearing routes. |
| `X-Content-Type-Options: nosniff` | MIME sniffing. |
| `Strict-Transport-Security` | Usually set by the host; needs verification. |

**Why:** without a CSP, one injection anywhere (a future markdown feature, a dependency, a browser extension) has unrestricted access to the tokens. Next supports a nonce-based CSP through `proxy.ts`; a stricter allowlist CSP is simpler if nonces are too much.

### H2. Tokens in localStorage, stored twice (Confirmed; risk explained)

Access and refresh tokens are persisted in `syncspace-auth-storage` and also mirrored to `syncspace_access_token` and `syncspace_refresh_token`.

**The actual risk:** localStorage is readable by any script running on the origin, including:
- an XSS;
- a compromised npm package;
- a malicious browser extension.

Stealing the refresh token means a persistent account takeover, not just a single stolen request.

**What reduces the risk today:**
- no HTML rendering sinks exist;
- React escapes output;
- `javascript:` URLs are blocked.

**What's missing:** nothing contains the damage if one of those defenses fails.

Tokens are sent as `Bearer` headers rather than cookies, so CSRF is not a concern for this API.

**What to do:**
- **Now:** store tokens once (Audit 4, M1) and add a CSP (H1).
- **With the backend:** keep refresh tokens short-lived and rotate them.
- **Longer term:** move the refresh token to an `HttpOnly; Secure; SameSite` cookie and keep the access token in memory only — needs backend support.

### H3. Session teardown is incomplete (Confirmed)

- **Leftover data on forced logout.** The three refresh-failure paths in `api-client.ts` and the invitation "Switch account" button call `useAuthStore.logout()` only. The query cache and the persisted workspace survive, leaking one user's data to the next person on a shared device (Audit 4, C3).
- **No server revocation on account switch.** The invitation page logs out locally, then navigates away. The server session, and the refresh token, is never revoked.
- **Second socket survives logout.** The socket from `lib/socket/socket-client.ts` is never disconnected, so it stays connected and joined to the previous user's rooms (Audit 4, C1).
- **No cross-tab sync.** There's no `storage` event listener or `BroadcastChannel`. Logging out in one tab leaves other tabs working with in-memory tokens. Worse, a stale tab that later refreshes calls `setTokens()` and writes the **old user's** tokens back into localStorage, overwriting a newer login in another tab.
- **Silent expiry.** Session expiry sends the user to `/login` with no message and no way back to the page they were on.

**Why:** these are data-exposure and account-mix-up problems, not just UX problems. One `endSession()` (Audit 4, P0-3) plus a storage-event listener fixes all of them.

### H4. The landing page makes false or placeholder claims and lacks legal pages (Confirmed)

- "Trusted by high-performing teams at" lists **Acme Corp, Vercel, Supabase, Linear…** — real companies presented as customers.
- "Join thousands of high-performing teams" and "99.9% SLA Uptime" are claims with nothing behind them.
- Pro and Enterprise plans with "Start Free Trial" and "Contact Sales" exist, but there's no billing: the buttons lead to `/register` and `#company`. "Book a demo" leads to `#pricing`.
- **Privacy Policy, Terms of Service, Privacy and Terms are non-interactive `<span>`s**, as are "Status Page", "Security", "Careers", and others.

**Why:** implying endorsement by real companies is a legal risk. A working privacy policy URL is required for Google OAuth consent-screen verification, and data-protection law expects one for any product collecting emails.

### H5. Environment configuration can silently point production at localhost (Confirmed)

- `NEXT_PUBLIC_API_URL` falls back to `http://localhost:5000/api/v1`, but the socket falls back to `http://localhost:5005/realtime` — the two fallbacks have already drifted apart.
- `NEXT_PUBLIC_*` values are inlined at build time. The production build run for this audit baked `http://localhost:5005/api/v1` from the local `.env` into the shipped JavaScript.
- A production build without the variable set would ship pointing at each user's own machine, over HTTP, with no build error.
- `.gitignore` uses `.env*`, which also ignores `.env.example`. It exists locally but isn't committed, so new developers and CI get no template.

**Why:** a misconfigured deploy fails silently for every user. Validate required variables at build time and fail when they're missing in production. Remove the localhost fallbacks from production builds and commit `.env.example`.

### H6. No error boundaries and no client error monitoring (Confirmed)

- No `error.tsx`, `global-error.tsx`, or `not-found.tsx` files exist. A render error shows Next's generic "Application error: a client-side exception has occurred" screen.
- Unknown routes get the default 404.
- No error reporting (Sentry or similar) exists, so production failures are invisible to the team.

**Why:** users hit dead ends with no way to recover, and failures go undetected.

---

## 4. Medium Priority Issues

- **M1. Authorization UX fails open (Confirmed, Audit 4 H5).**
  - Six components default to `canManage = true`, and `my-tasks` passes `true` outright.
  - Guards trust the persisted `isAuthenticated` flag, which anyone can set in localStorage.
  - Both only reveal UI; the real control is the backend (section 11). They should still fail closed.
- **M2. Workspace logo accepts any URL (Confirmed).**
  - `logo: z.string().optional()` is rendered as `<img src>` for every member, including invited guests.
  - Any admin can point it at a server they control and log every member's IP address, browser, and visit times.
  - An `http://` URL causes mixed-content warnings.
  - Fix: require `https://`, or better, upload logos to Cloudinary the way avatars are. Backend-side validation needs verifying.
- **M3. Error messages expose technical details (Confirmed).**
  - `formatApiErrorMessage` shows the backend's `message` as-is.
  - It falls back to the backend's `error` field, which is an exception class name such as `NotFoundException`.
  - It then falls back to axios's `Request failed with status code 500`.
  - Whether 5xx `message` values contain internals (e.g. Prisma errors) depends on the backend.
  - Fix: map 5xx responses and network failures to a generic message on the frontend.
- **M4. OAuth error text is reflected (Confirmed, low).** The callback toasts `Google sign-in failed: ${errorParam}` straight from the URL. Sonner renders it as text, so it isn't XSS, but anyone can craft a link that shows arbitrary text inside the app, such as a fake "account suspended, call…" message. Map known error codes to fixed messages.
- **M5. Personal data in URLs (Confirmed).**
  - Invitation links send `?email=` to `/login` and `/register`.
  - `verify-email` takes `?email=`.
  - Emails end up in logs and history.
  - Tokens in reset, verify, and invite links are the normal emailed-link pattern and acceptable, since those pages load no third-party resources.
- **M6. The invitation `redirect` parameter is ignored (Confirmed).** Login and register never read it, so invited users land on `/dashboard`. This is a functional bug, and also why there's no open redirect today. When implemented, accept only relative paths that start with a single `/`.
- **M7. Unhandled promise rejections (Confirmed).** Comment delete and reaction toggling call `mutateAsync` with no `catch`. A failed request shows the toast and also logs "Uncaught (in promise)".
- **M8. `target="_blank"` without `rel` (Confirmed, low).** Task links and attachment links open this way. Modern browsers already imply `noopener`; add `rel="noopener noreferrer"` explicitly for older browsers.
- **M9. Full profile persisted (Confirmed, low).** The auth store has no `partialize`, so it persists the whole user object (email, phone, bio, timezone) alongside the tokens. It's cleared on logout, but it isn't needed there once the user comes from the query (Audit 4, M5).
- **M10. No offline or network indicator (Confirmed, low).** TanStack Query pauses when offline, but the UI gives no signal.

---

## 5. Authentication Findings

| Area | Finding | Status |
|---|---|---|
| Login | Email/password through `setAuth`; Google through a backend redirect | Confirmed |
| Token storage | localStorage, stored twice (H2) | Confirmed |
| OAuth callback | Tokens in the query string (C2) | Confirmed |
| Token refresh | Single-flight refresh with a queue, refresh token as `Bearer`, logout on failure — the flow itself is sound | Confirmed |
| Refresh-token rotation and lifetime | Unknown | Needs backend verification |
| Logout (`useLogout`) | Calls `/auth/logout`, then clears the store, workspace, and cache | Confirmed |
| Forced logout paths | Partial teardown, and no server revocation on account switch (H3) | Confirmed |
| Server-side revocation on `/auth/logout` | Unknown | Needs backend verification |
| Session expiry | Silent redirect to `/login`, no return path (H3) | Confirmed |
| Protected routes | Client-only `AuthGuard`/`GuestGuard`, trusting the persisted flag — acceptable as UX, since the API is the boundary | Confirmed |
| Multi-tab | No sync; a stale tab can overwrite a newer login (H3) | Confirmed |
| Redirects | No redirect parameter is processed, so there's no open redirect today (M6) | Confirmed |
| `withCredentials: true` | Set, although auth uses headers. Harmless unless the backend also relies on cookies. | Needs backend verification |

## 6. Data Exposure Findings

- **localStorage:**
  - both tokens, stored twice;
  - the full user profile;
  - the entire `activeWorkspace` object;
  - it all survives forced logout except the auth fields (H3).
- **URLs:**
  - OAuth tokens (C2);
  - invitee email and verify-email address (M5);
  - reset, verify, and invite tokens (acceptable);
  - `?task=KEY` (fine).
- **Console:** no logging of personal data. Only two development-gated `console.warn` calls exist.
- **Public pages:**
  - the invitation landing page shows the invitee's email and the workspace name to anyone holding the link, expected for invitation links;
  - the "email mismatch" view shows the signed-in user's email to themselves only.
- **Analytics:** none installed, so nothing is sent to third parties.
- **Cached server data:** survives forced logout on a shared device (H3, Audit 4 C3).

## 7. XSS / Unsafe Rendering Findings (Confirmed)

- **HTML sinks:** none. No `dangerouslySetInnerHTML`, `innerHTML`, `eval`, `new Function`, iframes, `srcDoc`, or markdown/HTML renderer.
- **User text** (comments, task descriptions, names, mentions) renders as React text nodes, which React escapes.
- **Task link URLs:**
  - the UI prepends `https://` to anything not already starting with `http(s)://`;
  - React DOM 19.2.8 replaces `javascript:` URLs with a blocked placeholder (confirmed in `react-dom-client.production.js`);
  - server-side scheme validation needs backend verification.
- **Attachment URLs** come from the server (Cloudinary). Used as `img src` (not executable) and as a link target (M8).
- **Workspace logo:** an arbitrary `img src` — a privacy problem (M2), not XSS.
- **Future risk:** the landing page advertises "rich markdown detail views". If markdown rendering is ever added, it needs a sanitizer (e.g. `rehype-sanitize` or DOMPurify) and a CSP (H1).

## 8. Environment / Secrets Findings

- **Secrets:** none found in the source, the git history (`.env*` never committed), or the built client chunks. Scanned for AWS, Stripe, GitHub, Google, Cloudinary, and database connection strings, private keys, and JWT-shaped strings.
- **Public config:** `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_WS_URL`, and `NEXT_PUBLIC_SOCKET_URL` are expected to be public — endpoints, not secrets.
- **Coupling:**
  - localhost fallbacks, with different ports for the API and the socket;
  - build-time inlining without validation (H5);
  - two alternative socket variables (`WS_URL`, `SOCKET_URL`) for the same thing;
  - the socket URL is derived by rewriting `/api/v1` to `/realtime`, silently breaking if the API path changes.
- **`.env.example`:** not committed, because of the `.env*` ignore rule (H5).
- **Reminder:** anything that becomes `NEXT_PUBLIC_*` ships to every browser. The Cloudinary API secret and similar values must stay backend-only, and currently they do.

## 9. Development Artifact Findings

- **The Next.js dev tools indicator** seen in development is development-only: none of the dev-overlay markers (`nextjs-portal`, dev-tools code) appear in the production HTML or client chunks. If it interferes with screenshots or demos in dev, set `devIndicators: false`; it's never part of production.
- **Console:** clean.
- **Debug panels, test accounts, mock data, temporary routes:** none.
- **TODOs/FIXMEs:** none affecting production. Every "TODO" match is the task status value.
- **Placeholder content:**
  - the landing page claims and dead links (H4);
  - the default Next SVGs in `public/`, unused;
  - the package name `temp-app`;
  - the GitHub sign-in button labeled "Soon", disabled and acceptable, but consider hiding it for launch.

## 10. Dependency Findings

`pnpm audit` found 2 critical, 10 high, and 2 moderate advisories:

| Package | Severity | Where it runs | Real exposure |
|---|---|---|---|
| `next@16.2.12` | 2 critical (RCE) | Production server | Upgrade to ≥ 16.3.3 (C1) |
| `sharp@0.34.5` | 2 high (libvips, libheif) | Production server (image optimizer) | Resolved by the Next upgrade; verify with a re-run |
| `postcss@8.4.31` (bundled by Next) | 2 high, 2 moderate | Build time (CSS processing) | Needs attacker-controlled CSS at build, so low real risk; clears with Next |
| `nanoid@3.3.16` (via `postcss`) | High | Build time | Low real risk |
| `brace-expansion`, `js-yaml` (via ESLint) | High | Dev and CI only | Denial of service on developer machines only; update the ESLint toolchain |

**Suspicious or unnecessary packages** (from registry metadata):
- **`babel-preset-next@1.4.0`:** described by its own author as "babel preset used by myself", published by an individual, last modified in 2022. No install scripts, but pulls in a Babel 7 plugin tree, and nothing in the app uses it. **Remove it.**
- **`@babel/core` 8:** unused. Remove it.
- **`@next/swc-linux-x64-gnu` and `@next/swc-wasm-nodejs`:** unnecessary platform pins (Audit 4). Remove them.
- **Duplicates:** no duplicate versions of runtime packages beyond what the audit paths show.

## 11. Production Readiness Checklist

| Item | Status |
|---|---|
| No secrets in repo or bundle | ✅ Confirmed |
| Dependencies free of critical advisories | ❌ Next.js critical (C1) |
| Security headers / CSP / clickjacking protection | ❌ None in repo; ⚠️ verify host |
| Tokens kept out of URLs | ❌ OAuth callback (C2) |
| Complete logout on every path, including other tabs | ❌ (H3) |
| No unsafe HTML rendering | ✅ Confirmed |
| User URLs safe | ✅ UI normalization and React blocking; ⚠️ verify backend validation |
| Custom 404 page | ❌ Default only |
| Error boundaries | ❌ None |
| Client error monitoring | ❌ None |
| Offline / network feedback | ❌ None |
| No broken links | ❌ Landing footer, CTAs, sidebar fallbacks (Audit 4, H6) |
| No placeholder or false claims | ❌ (H4) |
| Privacy Policy / Terms | ❌ Missing |
| Production env validated at build | ❌ Localhost fallbacks (H5) |
| `.env.example` committed | ❌ |
| Console clean in production | ✅ Confirmed (source); ⚠️ runtime console on authenticated routes not observed |
| Dev overlay excluded from production | ✅ Confirmed |
| Source maps not public | ✅ Confirmed |
| `X-Powered-By` removed | ❌ Set `poweredByHeader: false` |

### Security boundaries

| Layer | What it does here | Is it a security control? |
|---|---|---|
| Frontend validation | zod forms, `https://` normalization on links | **No.** UX only; the API can be called directly. |
| Frontend authorization UX | `canManage`, `AuthGuard`/`GuestGuard`, the persisted `isAuthenticated` flag | **No.** It hides UI and can be bypassed by editing localStorage. It should fail closed so the UI doesn't mislead (M1). |
| Backend authorization | Backend controllers were observed declaring `JwtAuthGuard` plus `WorkspaceRoleGuard` with role lists before this audit's backend access was blocked | **Yes, but not verified by this audit.** Correct enforcement per endpoint must be confirmed on the backend. |

Items to confirm on the backend:
- role enforcement on every mutation, including admin-only actions such as member removal and ownership transfer;
- server-side URL scheme validation for task links and workspace logos;
- refresh-token rotation and revocation on `/auth/logout`;
- token lifetimes;
- a CORS origin allowlist, given `withCredentials: true`;
- that 5xx responses don't leak internals.

## 12. Prioritized Remediation Plan

### P0 — Must Fix Before Production

1. **Upgrade `next` to ≥ 16.3.3** (latest is 16.3.6) and re-run `pnpm audit` to confirm `sharp` and `postcss` clear. *Why:* two critical unauthenticated RCE advisories (C1).
2. **OAuth callback hardening.**
   - Strip tokens from the URL synchronously as the first thing the page does.
   - Add `Referrer-Policy: no-referrer` on that route.
   - Map error codes to fixed messages.
   - Open a backend ticket for a one-time-code or fragment-based handoff.

   *Why:* a long-lived refresh token in access logs and history (C2, M4).
3. **Security headers:** a CSP (nonce-based through `proxy.ts`, or an allowlist), `frame-ancestors 'none'`, `nosniff`, an explicit `Referrer-Policy`, `poweredByHeader: false`, and HSTS confirmed at the host. *Why:* no containment for XSS or dependency compromise, and no clickjacking protection (H1).
4. **A single `endSession()`** (Audit 4, P0-3) used by every logout path, including the invitation account switch (which must call `/auth/logout`). Add a `storage`-event listener so logout and login stay in sync across tabs, and disconnect every socket. *Why:* data exposure on shared devices and account mixing between tabs (H3).
5. **Landing page content.** Remove the real-company "trusted by" list, the unsupported numbers, and the SLA. Either remove the paid plans or clearly mark them "coming soon". Add real Privacy Policy and Terms pages and link them. *Why:* legal risk and an OAuth verification requirement (H4).
6. **Environment validation.** Fail the production build when `NEXT_PUBLIC_API_URL` or the socket URL is missing, remove the localhost fallbacks from production, and commit `.env.example` (adjust `.gitignore`). *Why:* a silent broken deploy (H5).

### P1 — Should Fix

7. **Root `error.tsx`, `global-error.tsx`, `not-found.tsx`, and a dashboard-level `error.tsx`, plus client error monitoring.** *Why:* dead ends invisible to the team (H6).
8. **Store tokens once** (Audit 4, M1). Agree a plan with the backend for short-lived rotating refresh tokens, and eventually an `HttpOnly`-cookie refresh token. *Why:* shrinks the damage if an XSS ever happens (H2).
9. **Make permission defaults fail closed** (`canManage = false`) with a single `useWorkspacePermissions()`. *Why:* the UI shouldn't advertise actions the user can't take (M1).
10. **Validate workspace logos as `https://` or move them to upload.** *Why:* stops admins tracking members through the logo image (M2).
11. **Map 5xx and unknown errors to a generic message,** and stop showing exception class names. *Why:* less internal detail exposed (M3).
12. **Remove `babel-preset-next`, `@babel/core`, and the SWC platform pins,** update the ESLint toolchain, and rename the package. *Why:* supply-chain hygiene (section 10).

### P2 — Later

13. **Implement the invitation `redirect`,** accepting only relative same-origin paths. Stop putting the email in URLs where it isn't needed. *Why:* fixes the invite flow without creating an open redirect (M5, M6).
14. **Add `catch` to the comment `mutateAsync` calls,** and `rel="noopener noreferrer"` to external links (M7, M8).
15. **`partialize` the auth store** down to tokens only, once the user comes from the query (M9).
16. **An offline banner** driven by TanStack's `onlineManager` (M10).
17. **A sanitizer plus CSP review** before any markdown or rich-text feature ships (section 7).

Before P0 goes live, the backend items in section 11 (role enforcement, revocation, URL validation, CORS) need confirming. Per `.ai/WORKFLOW.md`, P0-2 and P0-4 touch the auth contract and should go through the contract and edge-case review first.

---

*This document records findings only. No code was modified. Implementation should proceed phase by phase, per `.ai/WORKFLOW.md` (PM assessment → sub-phased implementation plan → approval gate → execution → quality gates → walkthrough), starting with P0.*
